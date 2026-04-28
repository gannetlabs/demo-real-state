import sharp from "sharp";
import type { ContentPlatform } from "@/types/content";
import { platformDimensions } from "@/data/platform-dimensions";

export async function resizeForPlatform(
  source: Buffer,
  platform: ContentPlatform
): Promise<Buffer> {
  const { width, height } = platformDimensions[platform];
  return sharp(source)
    .resize(width, height, { fit: "cover", position: "attention" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}
