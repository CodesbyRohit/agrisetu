import { NextRequest, NextResponse } from "next/server";
import { diagnoseUnavailable, diagnoseWithAI, validateImage } from "@/lib/diagnose";
import { hasApiKey } from "@/lib/llm";
import type { DiagnoseRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  let body: Partial<DiagnoseRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.imageBase64) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const mimeType = body.mimeType || "image/jpeg";
  if (!ALLOWED_MIME.includes(mimeType)) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPEG, PNG, WEBP or GIF." },
      { status: 400 }
    );
  }

  const validationError = validateImage({ imageBase64: body.imageBase64, mimeType });
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (!hasApiKey()) {
    return NextResponse.json({ diagnosis: diagnoseUnavailable() });
  }

  try {
    const diagnosis = await diagnoseWithAI({
      imageBase64: body.imageBase64,
      mimeType,
      cropHint: body.cropHint,
    });
    return NextResponse.json({ diagnosis });
  } catch (err) {
    console.error("Diagnose endpoint error:", err);
    return NextResponse.json(
      { error: "Sorry, we could not analyse the photo right now. Please try again." },
      { status: 500 }
    );
  }
}
