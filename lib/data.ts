import { readFileSync } from "fs";
import path from "path";
import type { Crop, District, Season, SoilInfo, WeatherInfo } from "./types";

// ---- Static data loading (server-side only) ----

function loadJson<T>(file: string): T {
  const p = path.join(process.cwd(), "data", file);
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

let districtsCache: District[] | null = null;
let cropsCache: Crop[] | null = null;

export function getDistricts(): District[] {
  if (!districtsCache) districtsCache = loadJson<District[]>("districts.json");
  return districtsCache;
}

export function getCrops(): Crop[] {
  if (!cropsCache) cropsCache = loadJson<Crop[]>("crops.json");
  return cropsCache;
}

export function getDistrict(id: string): District | undefined {
  return getDistricts().find((d) => d.id === id);
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
