import type { Advisory } from "./types";
import { claudeJson, hasApiKey } from "./llm";
import { buildContext, getDistricts, SEASONS, type AgroContext } from "./data";
import { getLiveWeather } from "./weather";
import { getLiveSoil, regionalSoil } from "./soil";

// ---------------------------------------------------------------------------
// Module A: Localized Agro-Advisory
// ---------------------------------------------------------------------------

function buildAdvisorySystemPrompt(): string {
  return `You are "AgriSetu", a senior agronomist advisor serving small and marginal farmers in India.
You give practical, plain-language farming advice. Avoid jargon; explain any technical term in one short phrase.
Base every recommendation strictly on the location, soil, weather, season and crop provided — never generic boilerplate.
Always include 2-3 regenerative agriculture tips (crop rotation, cover cropping, soil health, composting, water conservation).
Answer ONLY with a single valid JSON object, no markdown, no extra text, matching exactly this schema:
{
  "summary": string,
  "irrigation": string,
  "fertilizer": string,
  "sowingWindow": string,
  "harvestWindow": string,
  "risks": string[],
  "regenerativeTips": string[],
  "soilHealth": { "score": number (0-100), "note": string }
}`;
}

function buildAdvisoryUserPrompt(ctx: AgroContext): string {
  const { district, crop, season, weather, soil } = ctx;
  const seasonInfo = SEASONS[season];
  return `Generate a localized agro-advisory for the following farmer:

LOCATION
- District: ${district.name}, ${district.state} (lat ${district.lat}, lng ${district.lng})

SOIL
- Type: ${soil.type}
- pH: ${soil.ph}
- Organic carbon: ${soil.organicCarbonPct}%

CROP
- Crop: ${crop.name} (${crop.type})

SEASON
- Season: ${seasonInfo.label} (${seasonInfo.months})

WEATHER FORECAST (season-adjusted estimate)
- Temperature: ${weather.tempC}°C
- Rainfall: ${weather.rainfallMm} mm expected
- Humidity: ${weather.humidityPct}%

Give advice covering: irrigation timing, fertilizer/dose guidance, sowing window, harvest window, top 3 risks for this crop in this region, and 2-3 regenerative practices. Keep each field under 3 sentences.`;
}

/**
 * Baseline context enriched with live data for the district coordinate:
 * current temperature/humidity + seasonal rainfall (Open-Meteo) and regional
 * soil (SoilGrids, falling back to the state-level ICAR layer). Any live
 * source that fails (network, service down) keeps its baseline value, so the
 * advisory never blocks on an unreachable API.
 */
async function buildLiveContext(
  districtId: string,
  cropId: string,
  season: "kharif" | "rabi" | "zaid"
): Promise<AgroContext> {
  const base = buildContext(districtId, cropId, season);
  const { lat, lng } = base.district;
  if (!lat || !lng) return base; // no coordinate — use the baseline as-is

  const isCurated = getDistricts().some((d) => d.id === districtId);
  const [weather, soil] = await Promise.allSettled([
    getLiveWeather(lat, lng, season, base.weather),
    getLiveSoil(lat, lng),
  ]);

  return {
    ...base,
    weather: weather.status === "fulfilled" ? weather.value : base.weather,
    soil:
      soil.status === "fulfilled"
        ? soil.value
        : isCurated
          ? base.soil
          : regionalSoil(base.district.state),
  };
}

/** Generate an advisory from a live context using Claude. */
async function generateAdvisoryWithAI(ctx: AgroContext): Promise<Advisory> {
  return claudeJson<Advisory>({
    system: buildAdvisorySystemPrompt(),
    user: buildAdvisoryUserPrompt(ctx),
    maxTokens: 1200,
  });
}

/**
 * Deterministic demo fallback so the app still demos end-to-end without
 * an API key. Generates a structured advisory from the local datasets.
 */
export function generateAdvisoryMock(ctx: AgroContext): Advisory {
  const { district, crop, weather, soil, season } = ctx;

  const waterStress = weather.rainfallMm < 600;
  const heatStress = weather.tempC > 35;
  const phLow = soil.ph < 6.5;
  const phHigh = soil.ph > 7.8;

  const risks: string[] = [];
  if (waterStress) risks.push(`Low rainfall (~${weather.rainfallMm} mm) — plan supplemental irrigation`);
  if (heatStress) risks.push(`High temperatures (~${weather.tempC}°C) — watch for heat stress at flowering`);
  if (soil.organicCarbonPct < 0.45) risks.push("Low soil organic carbon — add compost or green manure");
  if (risks.length === 0) risks.push("Seasonal pest pressure — scout fields weekly");

  const soilScore = Math.max(
    30,
    Math.min(
      90,
      55 +
        (soil.organicCarbonPct - 0.5) * 40 +
        (soil.ph >= 6.5 && soil.ph <= 7.8 ? 10 : -15) +
        (district.ndvi - 0.55) * 30
    )
  );

  return {
    summary: `For ${crop.name} in ${district.name}, ${district.state} this ${season} season, expect about ${weather.tempC}°C with roughly ${weather.rainfallMm} mm rain. The ${soil.type} soil needs balanced care; overall conditions favour a moderate, well-planned crop.`,
    irrigation: waterStress
      ? `Rainfall is low (~${weather.rainfallMm} mm). Irrigate every 5-7 days during vegetative growth and every 7-10 days at maturity; avoid waterlogging on ${soil.type.toLowerCase()}.`
      : `Rainfall (~${weather.rainfallMm} mm) should cover most needs. Irrigate only during dry spells, 2-3 times, and stop watering ~2 weeks before harvest.`,
    fertilizer: `Apply 50-60% of nitrogen at sowing/planting and the rest in 2 splits at 30 and 60 days. Use compost or farmyard manure (2-3 t/ha) to lift soil carbon from ${soil.organicCarbonPct}%. ${
      phLow ? "Soil pH is low — add agricultural lime (1-2 t/ha)." : ""
    }${phHigh ? "Soil pH is high — prefer ammonium-based fertilisers and add organic matter." : ""}`,
    sowingWindow: `Sow during the ${SEASONS[season].months} window. Ideal window: first half of the season for ${crop.name} in this region.`,
    harvestWindow: `Expect to harvest about 100-140 days after sowing; monitor grain/vegetable maturity and moisture before harvest.`,
    risks,
    regenerativeTips: [
      `Rotate ${crop.name} with legumes next season to fix nitrogen and break pest cycles.`,
      "Grow a cover crop or leave crop residue on the field to protect soil and build organic carbon.",
      "Practise drip or furrow irrigation and mulching to conserve water.",
    ],
    soilHealth: {
      score: Math.round(soilScore),
      note: `${soil.type} with pH ${soil.ph} and ${soil.organicCarbonPct}% organic carbon${district.ndvi >= 0.6 ? "; healthy green cover in the region" : "; low vegetation cover — consider green manuring"}.`,
    },
  };
}

export async function generateAdvisory(
  districtId: string,
  cropId: string,
  season: "kharif" | "rabi" | "zaid"
): Promise<{ advisory: Advisory; source: "ai" | "demo" }> {
  const ctx = await buildLiveContext(districtId, cropId, season);
  if (hasApiKey()) {
    try {
      const advisory = await generateAdvisoryWithAI(ctx);
      return { advisory, source: "ai" };
    } catch (err) {
      console.error("Advisory AI call failed, falling back to demo:", err);
    }
  }
  return { advisory: generateAdvisoryMock(ctx), source: "demo" };
}
