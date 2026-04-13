export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  sqm: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  photos: PropertyPhoto[];
  status: "draft" | "content_generated" | "scheduled" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  alt: string;
  order: number;
}
