export type ContentPlatform =
  | "web_listing"
  | "blog_article"
  | "instagram_carousel"
  | "instagram_story"
  | "facebook_post"
  | "linkedin_post"
  | "tiktok_script";

export type ContentStatus = "generating" | "generated" | "approved" | "edited" | "rejected";

export interface GeneratedContent {
  id: string;
  propertyId: string;
  platform: ContentPlatform;
  status: ContentStatus;
  title: string;
  body: string;
  hashtags?: string[];
  callToAction?: string;
  slides?: CarouselSlide[];
  scriptSections?: ScriptSection[];
  imageUrl?: string;
  createdAt: string;
}

export interface CarouselSlide {
  id: string;
  imageIndex: number;
  caption: string;
  order: number;
}

export interface ScriptSection {
  id: string;
  timestamp: string;
  instruction: string;
  narration: string;
}
