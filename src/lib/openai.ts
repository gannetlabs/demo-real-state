import OpenAI from "openai";
import { toFile } from "openai/uploads";
import type { Property } from "@/types/property";

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function buildPrompt(property: Property): string {
  return [
    `Real estate listing photograph for ${property.title}, located in ${property.location}.`,
    `${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.sqm} square meters.`,
    `Style: cinematic, magazine quality, soft natural light, wide angle, professional architectural photography.`,
    `Highlight the property's atmosphere and finishes. Avoid text, logos, watermarks, and people.`,
    property.description ? `Context: ${property.description}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) throw new Error("Invalid data URL");
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  return { buffer, mimeType };
}

export async function generateHeroImage(
  property: Property,
  referenceImageDataUrl: string | undefined
): Promise<Buffer> {
  const client = getClient();
  const prompt = buildPrompt(property);

  if (referenceImageDataUrl) {
    const { buffer, mimeType } = dataUrlToBuffer(referenceImageDataUrl);
    const extension = mimeType.split("/")[1] ?? "png";
    const file = await toFile(buffer, `reference.${extension}`, { type: mimeType });
    const response = await client.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt,
      size: "1536x1024",
    });
    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI image edit returned no data");
    return Buffer.from(b64, "base64");
  }

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1536x1024",
  });
  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI image generate returned no data");
  return Buffer.from(b64, "base64");
}
