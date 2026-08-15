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

export interface DiagnoseRequest {
  imageBase64: string; // raw base64 (no data: prefix)
  mimeType: string;
  cropHint?: string;
}
