import type { ContentPlatform } from "@/types/content";

export interface PlatformDimensions {
  width: number;
  height: number;
  label: string;
}

export const platformDimensions: Record<ContentPlatform, PlatformDimensions> = {
  web_listing: { width: 1200, height: 800, label: "3:2 hero" },
  blog_article: { width: 1200, height: 630, label: "1.91:1 featured" },
  instagram_carousel: { width: 1080, height: 1080, label: "1:1 square" },
  instagram_story: { width: 1080, height: 1920, label: "9:16 vertical" },
  facebook_post: { width: 1200, height: 630, label: "1.91:1 link card" },
  linkedin_post: { width: 1200, height: 627, label: "1.91:1 share" },
  tiktok_script: { width: 1080, height: 1920, label: "9:16 cover" },
};
