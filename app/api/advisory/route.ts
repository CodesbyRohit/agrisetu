import { NextRequest, NextResponse } from "next/server";
import { generateAdvisory } from "@/lib/advisory";
import { getCrop, getDistrict, SEASONS } from "@/lib/data";
import type { Season } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { districtId?: string; cropId?: string; season?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { districtId, cropId, season } = body;

  if (!districtId || !getDistrict(districtId)) {
    return NextResponse.json({ error: "Please choose a valid location" }, { status: 400 });
  }
  if (!cropId || !getCrop(cropId)) {
    return NextResponse.json({ error: "Please choose a valid crop" }, { status: 400 });
  }
  if (!season || !(season in SEASONS)) {
    return NextResponse.json({ error: "Please choose a valid season" }, { status: 400 });
  }

  try {
    const { advisory, source, provenance } = await generateAdvisory(
      districtId,
      cropId,
      season as Season
    );
    return NextResponse.json({ advisory, source, provenance });
  } catch (err) {
    console.error("Advisory endpoint error:", err);
    return NextResponse.json(
      { error: "Sorry, we could not generate the advisory right now. Please try again." },
      { status: 500 }
    );
  }
}
