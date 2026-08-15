import { NextRequest, NextResponse } from "next/server";
import { getDistricts } from "@/lib/data";
import { getLiveWeather } from "@/lib/weather";
import { getLiveSoil, regionalSoil } from "@/lib/soil";
import type { DataProvenance } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Live weather + soil for a curated district, with provenance labels so the
 * soil-health page can show "Live weather" / "Live soil data" or
 * "Regional estimate" honestly instead of presenting static values as real.
 */
export async function GET(req: NextRequest) {
  const districtId = req.nextUrl.searchParams.get("districtId");
  const district = getDistricts().find((d) => d.id === districtId);
  if (!district?.lat || !district.lng) {
    return NextResponse.json({ error: "Unknown district" }, { status: 400 });
  }

  const [weather, soil] = await Promise.allSettled([
    getLiveWeather(district.lat, district.lng, "kharif", district.weather),
    getLiveSoil(district.lat, district.lng),
  ]);

  const provenance: DataProvenance = {
    weather: weather.status === "fulfilled" ? "live" : "estimated",
    soil: soil.status === "fulfilled" ? "live" : "regional",
  };

  return NextResponse.json({
    weather: weather.status === "fulfilled" ? weather.value : district.weather,
    soil:
      soil.status === "fulfilled"
        ? soil.value
        : regionalSoil(district.state),
    provenance,
  });
}
