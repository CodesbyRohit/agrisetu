// Shared types for AgriSetu

export interface SoilInfo {
  type: string;
  ph: number;
  organicCarbonPct: number;
}

export interface WeatherInfo {
  tempC: number;
  rainfallMm: number;
  humidityPct: number;
}

export interface District {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  soil: SoilInfo;
  weather: WeatherInfo;
  ndvi: number; // 0-1 vegetation/health indicator
}

/** A district from the complete India districts dataset, with official
 * coordinates (Survey of India district-boundary centroid). */
export interface DistrictRef {
  state: string;
  district: string;
  id: string;
  lat: number;
  lng: number;
}

export type Season = "kharif" | "rabi" | "zaid";

export interface Crop {
  id: string;
  name: string;
  seasons: Season[];
  type: string;
}

export interface Advisory {
  summary: string;
  irrigation: string;
  fertilizer: string;
  sowingWindow: string;
  harvestWindow: string;
  risks: string[];
  regenerativeTips: string[];
  soilHealth: { score: number; note: string };
}

export interface Diagnosis {
  identified: boolean;
  disease?: string;
  crop?: string;
  confidence?: number; // 0-100
  symptoms?: string;
  treatment?: string;
  prevention?: string;
  message?: string; // fallback message when not identified
}

export interface AdvisoryRequest {
  districtId: string;
  cropId: string;
  season: Season;
}

/**
 * Where each data point in a result came from — used for small transparency
 * badges so farmers know whether they're seeing live readings or estimates.
 *  - weather: "live" = current conditions fetched from Open-Meteo; "estimated" = fell back to a baseline
 *  - soil:    "live" = SoilGrids 250 m estimate at the district centroid; "regional" = state-level ICAR layer
 */
export interface DataProvenance {
  weather: "live" | "estimated";
  /** live = SoilGrids 250 m estimate; regional = state-level ICAR layer;
   * reference = curated per-district demo layer (only for the 15 curated districts). */
  soil: "live" | "regional" | "reference";
}

export interface DiagnoseRequest {
  imageBase64: string; // raw base64 (no data: prefix)
  mimeType: string;
  cropHint?: string;
}
