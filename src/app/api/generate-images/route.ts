import { NextRequest, NextResponse } from "next/server";
import { generateHeroImage } from "@/lib/openai";
import { resizeForPlatform } from "@/lib/image-resize";
import { uploadGeneratedImage, listLatestDemoImages } from "@/lib/supabase";
import { platforms } from "@/data/platforms";
import type { ContentPlatform } from "@/types/content";
import type { Property } from "@/types/property";

export const runtime = "nodejs";
export const maxDuration = 120;

interface GenerateImagesRequest {
  property: Property;
  referenceImageDataUrl?: string;
}

export type GenerateImagesResponse = {
  images: Record<ContentPlatform, string>;
};

export async function POST(req: NextRequest) {
  let body: GenerateImagesRequest;
  try {
    body = (await req.json()) as GenerateImagesRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.property?.id) {
    return NextResponse.json({ error: "Missing property" }, { status: 400 });
  }

  try {
    if (process.env.USE_DEMO_IMAGES === "true") {
      const images = await listLatestDemoImages();
      return NextResponse.json({ images } satisfies GenerateImagesResponse);
    }

    const heroBuffer = await generateHeroImage(body.property, body.referenceImageDataUrl);
    const timestamp = Date.now();

    const uploads = await Promise.all(
      platforms.map(async (p) => {
        const resized = await resizeForPlatform(heroBuffer, p.id);
        const path = `${body.property.id}/${timestamp}/${p.id}.jpg`;
        const url = await uploadGeneratedImage(resized, path, "image/jpeg");
        return [p.id, url] as const;
      })
    );

    const images = Object.fromEntries(uploads) as Record<ContentPlatform, string>;
    return NextResponse.json({ images } satisfies GenerateImagesResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-images]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
