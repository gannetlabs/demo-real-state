import { ContentPlatform } from "@/types/content";

export interface PlatformInfo {
  id: ContentPlatform;
  name: string;
  icon: string;
  color: string;
  shortName: string;
}

export const platforms: PlatformInfo[] = [
  { id: "web_listing", name: "Publicación Web", icon: "Globe", color: "#1a2332", shortName: "Web" },
  { id: "blog_article", name: "Artículo de Blog", icon: "FileText", color: "#6366f1", shortName: "Blog" },
  { id: "instagram_carousel", name: "Carrusel Instagram", icon: "Instagram", color: "#E4405F", shortName: "Instagram" },
  { id: "instagram_story", name: "Story Instagram", icon: "Smartphone", color: "#833AB4", shortName: "Story" },
  { id: "facebook_post", name: "Post Facebook", icon: "Facebook", color: "#1877F2", shortName: "Facebook" },
  { id: "linkedin_post", name: "Post LinkedIn", icon: "Linkedin", color: "#0A66C2", shortName: "LinkedIn" },
  { id: "tiktok_script", name: "Guión TikTok/Reels", icon: "Video", color: "#ff0050", shortName: "TikTok" },
];

export const getPlatform = (id: ContentPlatform): PlatformInfo =>
  platforms.find((p) => p.id === id)!;
