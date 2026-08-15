// Live weather for any district coordinate, via Open-Meteo (free, no API key;
// non-commercial use). Two sources combined:
//  - Forecast API: current temperature + humidity (live, refreshed hourly-ish)
//  - Climate API (ERA5): average total rainfall for the season over the last
//    ~5 full years, as the "expected rain this season" figure.
// All calls are time-boxed so a patchy network degrades to the caller's
// baseline instead of hanging the advisory.
import type { Season, WeatherInfo } from "./types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CLIMATE_URL = "https://climate-api.open-meteo.com/v1/climate";

const FORECAST_TTL_MS = 30 * 60 * 1000; // current conditions
const CLIMATE_TTL_MS = 24 * 60 * 60 * 1000; // seasonal normals are stable

const cache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await fn();
  cache.set(key, { at: Date.now(), value });
  return value;
}

async function fetchJson<T>(url: string, timeoutMs: number): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

interface ForecastResponse {
  current?: { temperature_2m?: number; relative_humidity_2m?: number };
}

interface ClimateResponse {
  daily?: { time?: string[]; precipitation_sum?: number[] };
}

/** Months (1-12) that belong to each season. */
const SEASON_MONTHS: Record<Season, number[]> = {
  kharif: [6, 7, 8, 9, 10],
  rabi: [11, 12, 1, 2, 3],
  zaid: [4, 5],
};

/** Average of the last ~5 years' total rainfall over the season's months. */
function seasonalRainfall(days: ClimateResponse["daily"], months: number[]): number {
  if (!days?.time?.length || !days.precipitation_sum?.length) return 0;
  const bySeason = new Map<number, number>();
  for (let i = 0; i < days.time.length; i++) {
    const [y, m] = days.time[i].split("-").map(Number);
    if (!months.includes(m)) continue;
    // A season spans calendar years (rabi: Nov-Mar). Attribute months Jan-Mar
    // to the season that started in the previous calendar year.
    const seasonYear = m < 4 ? y - 1 : y;
    bySeason.set(seasonYear, (bySeason.get(seasonYear) || 0) + (days.precipitation_sum[i] || 0));
  }
  const totals = [...bySeason.values()].filter((v) => v > 0);
  if (!totals.length) return 0;
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
}

async function currentConditions(lat: number, lng: number): Promise<{ tempC: number; humidityPct: number }> {
  const url =
    `${FORECAST_URL}?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m&forecast_days=1`;
  const j = await cached(`fc:${lat.toFixed(3)},${lng.toFixed(3)}`, FORECAST_TTL_MS, () =>
    fetchJson<ForecastResponse>(url, 6000)
  );
  const cur = j.current;
  if (cur?.temperature_2m == null || cur.relative_humidity_2m == null) {
    throw new Error("no current weather");
  }
  return { tempC: Math.round(cur.temperature_2m), humidityPct: Math.round(cur.relative_humidity_2m) };
}

async function seasonalRain(lat: number, lng: number, season: Season): Promise<number> {
  const now = new Date();
  const start = `${now.getFullYear() - 5}-01-01`;
  const end = `${now.getFullYear() - 1}-12-31`;
  const url =
    `${CLIMATE_URL}?latitude=${lat}&longitude=${lng}` +
    `&start_date=${start}&end_date=${end}&daily=precipitation_sum`;
  const j = await cached(`cl:${lat.toFixed(3)},${lng.toFixed(3)}:${season}`, CLIMATE_TTL_MS, () =>
    fetchJson<ClimateResponse>(url, 8000)
  );
  const mm = seasonalRainfall(j.daily, SEASON_MONTHS[season]);
  if (mm <= 0) throw new Error("no rainfall normal");
  return mm;
}

/**
 * Live weather for a district. Every value that can be fetched live replaces
 * the caller-provided baseline; only if both sources fail does it throw (and
 * the caller falls back to its baseline entirely).
 */
export async function getLiveWeather(
  lat: number,
  lng: number,
  season: Season,
  fallback: WeatherInfo
): Promise<WeatherInfo> {
  const [fc, cl] = await Promise.allSettled([
    currentConditions(lat, lng),
    seasonalRain(lat, lng, season),
  ]);
  if (fc.status === "rejected" && cl.status === "rejected") {
    throw new Error("weather unavailable");
  }
  return {
    tempC: fc.status === "fulfilled" ? fc.value.tempC : fallback.tempC,
    humidityPct: fc.status === "fulfilled" ? fc.value.humidityPct : fallback.humidityPct,
    rainfallMm: cl.status === "fulfilled" ? cl.value : fallback.rainfallMm,
  };
}
