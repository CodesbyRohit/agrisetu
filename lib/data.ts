import { readFileSync } from "fs";
import path from "path";
import type { Crop, District, DistrictRef, Season, SoilInfo, WeatherInfo } from "./types";

// ---- Static data loading (server-side only) ----

function loadJson<T>(file: string): T {
  const p = path.join(process.cwd(), "data", file);
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

let districtsCache: District[] | null = null;
let cropsCache: Crop[] | null = null;
let allDistrictsCache: DistrictRef[] | null = null;

/** Curated districts that carry demo soil/weather/NDVI layers (soil-health page). */
export function getDistricts(): District[] {
  if (!districtsCache) districtsCache = loadJson<District[]>("districts.json");
  return districtsCache;
}

export function getCrops(): Crop[] {
  if (!cropsCache) cropsCache = loadJson<Crop[]>("crops.json");
  return cropsCache;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Complete India districts dataset — all 762 districts across 36 states/UTs,
 * derived from the govt-sourced data-for-india dataset. Entries that match a
 * curated district keep its short id so existing lookups keep working.
 */
export function getAllDistricts(): DistrictRef[] {
  if (!allDistrictsCache) {
    const curated = getDistricts();
    const curatedKeyToId = new Map(
      curated.map((d) => [`${d.name}|${d.state}`.toLowerCase(), d.id])
    );
    const list = loadJson<{ state: string; district: string }[]>("india-districts.json");
    allDistrictsCache = list.map((d) => {
      const key = `${d.district}|${d.state}`.toLowerCase();
      const id = curatedKeyToId.get(key) ?? slugify(`${d.district} ${d.state}`);
      return { ...d, id };
    });
  }
  return allDistrictsCache;
}

/** Default demo values for districts without a curated soil/weather layer. */
const DEFAULT_SOIL: SoilInfo = { type: "Alluvial", ph: 6.8, organicCarbonPct: 0.5 };
const DEFAULT_WEATHER: WeatherInfo = { tempC: 32, rainfallMm: 900, humidityPct: 60 };

export function getDistrict(id: string): District | undefined {
  const curated = getDistricts().find((d) => d.id === id);
  if (curated) return curated;
  const ref = getAllDistricts().find((d) => d.id === id);
  if (!ref) return undefined;
  // Deterministic demo context so any district in the complete dataset works
  // end-to-end (weather/soil layers remain the documented demo layer).
  return {
    id: ref.id,
    name: ref.district,
    state: ref.state,
    lat: 0,
    lng: 0,
    soil: { ...DEFAULT_SOIL },
    weather: { ...DEFAULT_WEATHER },
    ndvi: 0.55,
  };
}

export function getCrop(id: string): Crop | undefined {
  return getCrops().find((c) => c.id === id);
}

export const SEASONS: Record<
  Season,
  { label: string; months: string; tempBias: number; rainBias: number }
> = {
  kharif: {
    label: "Kharif (Monsoon)",
    months: "June - October",
    tempBias: 2,
    rainBias: 1.2,
  },
  rabi: {
    label: "Rabi (Winter)",
    months: "November - March",
    tempBias: -6,
    rainBias: 0.4,
  },
  zaid: {
    label: "Zaid (Summer)",
    months: "April - May",
    tempBias: 5,
    rainBias: 0.2,
  },
};

/** Season-adjusted weather estimate for a district. */
export function seasonWeather(district: District, season: Season): WeatherInfo {
  const s = SEASONS[season];
  return {
    tempC: Math.round(district.weather.tempC + s.tempBias),
    rainfallMm: Math.round(district.weather.rainfallMm * s.rainBias),
    humidityPct: district.weather.humidityPct,
  };
}

export interface AgroContext {
  district: District;
  crop: Crop;
  season: Season;
  weather: WeatherInfo;
  soil: SoilInfo;
}

export function buildContext(
  districtId: string,
  cropId: string,
  season: Season
): AgroContext {
  const district = getDistrict(districtId);
  const crop = getCrop(cropId);
  if (!district || !crop) {
    throw new Error("Unknown district or crop id");
  }
  return {
    district,
    crop,
    season,
    weather: seasonWeather(district, season),
    soil: district.soil,
  };
}
