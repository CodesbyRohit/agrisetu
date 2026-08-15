import { claudeJson, hasApiKey } from "./llm";
import type { DiagnoseRequest, Diagnosis } from "./types";

// ---------------------------------------------------------------------------
// Module B: Crop Disease Diagnostic (vision LLM)
// ---------------------------------------------------------------------------

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB

export function validateImage(req: DiagnoseRequest): string | null {
  if (!req.imageBase64 || req.imageBase64.length === 0) {
    return "No image received. Please take or upload a clear photo of the affected leaf or plant part.";
  }
  const bytes = Math.round((req.imageBase64.length * 3) / 4);
  if (bytes > MAX_IMAGE_BYTES) {
    return "Image is too large (max 6 MB). Please upload a smaller photo.";
  }
  return null;
}

function buildDiagnosisSystemPrompt(): string {
  return `You are a plant pathologist working with "AgriSetu", advising small and marginal farmers in India.
Analyze the uploaded crop/leaf photo.
- If you can identify a plant disease or pest problem, respond with "identified": true and include the disease name, the crop it affects, a confidence score (0-100), short symptoms, a practical treatment (prefer affordable, locally available options like fungicides, neem oil, or cultural control), and a prevention tip.
- If the image is unclear, not a plant, or you cannot identify a disease, respond with "identified": false and a short, helpful message explaining what to do (e.g., retake the photo in daylight, closer to the affected part).
Answer ONLY with a single valid JSON object, no markdown, no extra text, matching exactly this schema:
{
  "identified": boolean,
  "disease": string,
  "crop": string,
  "confidence": number,
  "symptoms": string,
  "treatment": string,
  "prevention": string,
  "message": string
}`;
}

function buildDiagnosisUserPrompt(cropHint?: string): string {
  const hint = cropHint?.trim()
    ? ` The farmer says this is a ${cropHint} plant. Use that as context but verify from the image.`
    : "";
  return `Diagnose the problem shown in this photo.${hint} Give plain-language advice a small farmer can follow.`;
}

/**
 * Diagnose a crop photo using Claude's vision capability.
 * The prompt asks for strict JSON, which we parse into a Diagnosis.
 */
export async function diagnoseWithAI(
  req: DiagnoseRequest
): Promise<Diagnosis> {
  const system = buildDiagnosisSystemPrompt();
  const result = await claudeJson<Diagnosis>({
    system,
    user: buildDiagnosisUserPrompt(req.cropHint),
    imageBase64: req.imageBase64,
    mimeType: req.mimeType,
    maxTokens: 900,
  });
  // Normalize: if not identified, drop disease fields
  if (!result.identified) {
    return {
      identified: false,
      message:
        result.message ||
        "We could not identify a clear disease in this photo. Please retake it in good daylight, close to the affected part, and try again.",
    };
  }
  return result;
}

/**
 * Fallback used when no API key is configured — the diagnostic endpoint
 * still returns a clear, structured message so the UI never breaks.
 */
export function diagnoseUnavailable(): Diagnosis {
  return {
    identified: false,
    message:
      "Live diagnosis needs the ANTHROPIC_API_KEY to be set. Add it to .env.local and restart the server to enable photo-based disease detection.",
  };
}
