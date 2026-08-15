import Anthropic from "@anthropic-ai/sdk";

export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export function getModel(): string {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local");
  }
  return new Anthropic({ apiKey: key });
}

export interface ClaudeTextOptions {
  system: string;
  user: string;
  maxTokens?: number;
}

/**
 * Call Claude with a text prompt and get the raw text back.
 */
export async function claudeText({
  system,
  user,
  maxTokens = 1200,
}: ClaudeTextOptions): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: getModel(),
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

export interface ClaudeVisionOptions {
  system: string;
  user: string;
  imageBase64: string;
  mimeType: string;
  maxTokens?: number;
}

/**
 * Call Claude with an image (base64) plus text instructions — used for
 * crop disease diagnosis from a farmer's photo.
 */
export async function claudeVision({
  system,
  user,
  imageBase64,
  mimeType,
  maxTokens = 1200,
}: ClaudeVisionOptions): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: getModel(),
    max_tokens: maxTokens,
    system,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text", text: user },
        ],
      },
    ],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/**
 * Ask Claude for strict JSON and parse it robustly, even if the model
 * wraps the answer in markdown code fences or adds stray prose.
 */
export async function claudeJson<T>(
  options: ClaudeTextOptions | ClaudeVisionOptions
): Promise<T> {
  const raw =
    "imageBase64" in options
      ? await claudeVision(options)
      : await claudeText(options);

  return parseJsonLoose<T>(raw);
}

export function parseJsonLoose<T>(raw: string): T {
  // Strip markdown fences if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;

  // Find the first { ... } block
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model response");
  }

  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
