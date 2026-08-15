// Regional soil for any district coordinate.
//  - Primary: ISRIC SoilGrids 2.0 REST API — global 250 m predictions of
//    pH, organic carbon and texture at the district centroid. Free and open,
//    but the service has been temporarily paused by ISRIC, so every call is
//    time-boxed and treated as best-effort.
//  - Fallback: a state-level soil profile built from the published ICAR
//    "major soil groups of India" geography (alluvial Gangetic plains, black
//    cotton Deccan trap, red soils of the Peninsula, laterite coasts,
//    desert Rajasthan, mountain/forest Himalaya & NE, coastal deltaic).
//    pH/organic-carbon are class-typical values; SoilGrids replaces them
//    with true 250 m estimates whenever it responds.
import type { SoilInfo } from "./types";

const SOILGRIDS_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query";
const SOIL_TTL_MS = 30 * 24 * 60 * 60 * 1000; // soil is effectively static

const cache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await fn();
  cache.set(key, { at: Date.now(), value });
  return value;
}

interface Layer {
  name?: string;
  depths?: { values?: Record<string, number | null> }[];
}
interface SoilResponse {
  properties?: { layers?: Layer[] };
}

/** USDA soil-texture triangle → class name (standard algorithm). */
function textureClass(sandPct: number, siltPct: number, clayPct: number): string {
  const s = sandPct, z = siltPct, c = clayPct;
  if (s >= 85 && z + 1.5 * c <= 15) return "Sandy";
  if (s >= 70 && z + 2 * c <= 30) return "Loamy Sand";
  if (c >= 40 && s <= 20) return "Silty Clay";
  if (c >= 40 && s > 45) return "Sandy Clay";
  if (c >= 40) return "Clay";
  if (c >= 27 && s <= 20) return "Silty Clay Loam";
  if (c >= 27 && s > 45) return "Sandy Clay Loam";
  if (c >= 27) return "Clay Loam";
  if (z >= 80) return "Silt";
  if (z >= 50 && c <= 27) return "Silt Loam";
  if (s >= 55 && c <= 15) return "Sandy Loam";
  if (s >= 55) return "Sandy Clay Loam";
  if (z >= 50) return "Silty Clay Loam";
  if (c >= 20) return "Clay Loam";
  if (s >= 30) return "Loam";
  if (c >= 12) return "Silt Loam";
  return "Loam";
}

function avg(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * SoilGrids 2.0 point estimate (mean of the 0-30 cm depths).
 * Throws if the API is unavailable or returns nulls (its current degraded
 * state), so callers fall back to the regional layer.
 */
export async function getLiveSoil(lat: number, lng: number): Promise<SoilInfo> {
  const key = `soil:${lat.toFixed(3)},${lng.toFixed(3)}`;
  const url =
    `${SOILGRIDS_URL}?lon=${lng}&lat=${lat}` +
    `&property=phh2o&property=soc&property=sand&property=silt&property=clay` +
    `&depth=0-5cm&depth=5-15cm&depth=15-30cm&value=Q0.5`;
  const j = await cached(key, SOIL_TTL_MS, async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as SoilResponse;
    } finally {
      clearTimeout(t);
    }
  });

  const layers = j.properties?.layers || [];
  const read = (name: string) => {
    const layer = layers.find((l) => l.name === name);
    return avg((layer?.depths || []).map((d) => d.values?.["Q0.5"] ?? d.values?.mean));
  };

  const phRaw = read("phh2o"); // pH*10  → /10 = pH
  const ocRaw = read("soc"); // dg/kg → /10 = g/kg → /10 = % (ISRIC conversion table)
  const sand = read("sand"); // g/kg  → /10 = %
  const silt = read("silt"); // g/kg  → /10 = %
  const clay = read("clay"); // g/kg  → /10 = %
  if (phRaw == null || ocRaw == null || sand == null || silt == null || clay == null) {
    throw new Error("soilgrids returned nulls");
  }
  const ph = phRaw / 10;
  const oc = ocRaw / 100;
  const sandPct = sand / 10;
  const siltPct = silt / 10;
  const clayPct = clay / 10;
  const type = `${textureClass(sandPct, siltPct, clayPct)} (${ph >= 7.5 ? "alkaline" : ph >= 6.5 ? "neutral" : "acidic"})`;
  return {
    type,
    ph: Math.round(ph * 10) / 10,
    organicCarbonPct: Math.round(oc * 100) / 100,
  };
}

/**
 * Regional fallback: state-level dominant soil group (ICAR "major soils of
 * India" classification). Used when SoilGrids is unavailable.
 */
const REGIONAL_SOIL: Record<string, SoilInfo> = {
  // Gangetic alluvium belt
  Punjab: { type: "Alluvial Loam", ph: 7.3, organicCarbonPct: 0.5 },
  Haryana: { type: "Alluvial Loam", ph: 7.4, organicCarbonPct: 0.45 },
  "Uttar Pradesh": { type: "Alluvial Loam", ph: 7.5, organicCarbonPct: 0.45 },
  Bihar: { type: "Alluvial Loam", ph: 7.3, organicCarbonPct: 0.5 },
  "West Bengal": { type: "Alluvial Loam", ph: 6.9, organicCarbonPct: 0.55 },
  Assam: { type: "Alluvial Loam", ph: 5.8, organicCarbonPct: 0.7 },
  // Deccan black cotton region
  Maharashtra: { type: "Black Cotton Soil", ph: 7.8, organicCarbonPct: 0.55 },
  "Madhya Pradesh": { type: "Black Cotton Soil", ph: 7.6, organicCarbonPct: 0.55 },
  Gujarat: { type: "Black Cotton Soil", ph: 7.8, organicCarbonPct: 0.5 },
  "Andhra Pradesh": { type: "Red Sandy Soil", ph: 6.7, organicCarbonPct: 0.45 },
  Telangana: { type: "Red Sandy Loam", ph: 6.9, organicCarbonPct: 0.45 },
  Karnataka: { type: "Red Loamy Soil", ph: 6.5, organicCarbonPct: 0.45 },
  "Tamil Nadu": { type: "Red Loamy Soil", ph: 6.6, organicCarbonPct: 0.45 },
  // Laterite / coastal
  Kerala: { type: "Laterite Soil", ph: 5.5, organicCarbonPct: 0.6 },
  Goa: { type: "Laterite Soil", ph: 5.8, organicCarbonPct: 0.55 },
  Odisha: { type: "Lateritic Red Soil", ph: 6.2, organicCarbonPct: 0.5 },
  "Chhattisgarh": { type: "Red-Yellow Soil", ph: 6.5, organicCarbonPct: 0.45 },
  Jharkhand: { type: "Red Laterite Soil", ph: 6.2, organicCarbonPct: 0.4 },
  Puducherry: { type: "Coastal Alluvial Soil", ph: 6.9, organicCarbonPct: 0.45 },
  "Andaman and Nicobar": { type: "Coastal Laterite Soil", ph: 6.3, organicCarbonPct: 0.65 },
  Lakshadweep: { type: "Coastal Sandy Soil", ph: 7.5, organicCarbonPct: 0.6 },
  "Dadra and Nagar Haveli and Daman and Diu": { type: "Laterite Soil", ph: 6.6, organicCarbonPct: 0.5 },
  // Arid
  Rajasthan: { type: "Desert Sandy Soil", ph: 8.0, organicCarbonPct: 0.25 },
  // Mountain & forest (Himalaya + North East)
  "Himachal Pradesh": { type: "Mountain Soil", ph: 6.4, organicCarbonPct: 0.65 },
  Uttarakhand: { type: "Mountain Soil", ph: 6.2, organicCarbonPct: 0.7 },
  "Jammu and Kashmir": { type: "Mountain Soil", ph: 6.6, organicCarbonPct: 0.6 },
  Ladakh: { type: "Arid Mountain Soil", ph: 7.6, organicCarbonPct: 0.3 },
  Sikkim: { type: "Mountain Soil", ph: 5.5, organicCarbonPct: 0.8 },
  "Arunachal Pradesh": { type: "Mountain Alluvial Soil", ph: 5.8, organicCarbonPct: 0.75 },
  Meghalaya: { type: "Laterite Mountain Soil", ph: 5.6, organicCarbonPct: 0.7 },
  Mizoram: { type: "Mountain Soil", ph: 5.6, organicCarbonPct: 0.7 },
  Manipur: { type: "Mountain Soil", ph: 5.8, organicCarbonPct: 0.7 },
  Nagaland: { type: "Mountain Soil", ph: 5.7, organicCarbonPct: 0.7 },
  Tripura: { type: "Laterite Soil", ph: 5.6, organicCarbonPct: 0.7 },
  // Union territories
  "National Capital Territory of Delhi": { type: "Alluvial Loam", ph: 7.5, organicCarbonPct: 0.4 },
  Chandigarh: { type: "Alluvial Loam", ph: 7.2, organicCarbonPct: 0.4 },
};

export function regionalSoil(state: string): SoilInfo {
  return (
    REGIONAL_SOIL[state] ?? { type: "Alluvial Loam", ph: 6.8, organicCarbonPct: 0.5 }
  );
}
