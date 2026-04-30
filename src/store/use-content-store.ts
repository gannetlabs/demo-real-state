"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GeneratedContent, ContentPlatform, ContentStatus } from "@/types/content";

interface ContentState {
  contentByProperty: Record<string, GeneratedContent[]>;
  setContent: (propertyId: string, content: GeneratedContent[]) => void;
  updateContentStatus: (propertyId: string, contentId: string, status: ContentStatus) => void;
  updateContentBody: (propertyId: string, contentId: string, body: string) => void;
  replaceContent: (propertyId: string, contentId: string, newTitle: string, newBody: string) => void;
  updateContentImage: (propertyId: string, contentId: string, imageUrl: string) => void;
  applyImagesByPlatform: (propertyId: string, images: Partial<Record<ContentPlatform, string>>) => void;
  getContent: (propertyId: string) => GeneratedContent[];
  getContentByPlatform: (propertyId: string, platform: ContentPlatform) => GeneratedContent | undefined;
  getApprovedCount: (propertyId: string) => number;
  reset: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      contentByProperty: {},
      setContent: (propertyId, content) => {
        set((state) => ({
          contentByProperty: { ...state.contentByProperty, [propertyId]: content },
        }));
      },
      updateContentStatus: (propertyId, contentId, status) => {
        set((state) => ({
          contentByProperty: {
            ...state.contentByProperty,
            [propertyId]: (state.contentByProperty[propertyId] || []).map((c) =>
              c.id === contentId ? { ...c, status } : c
            ),
          },
        }));
      },
      updateContentBody: (propertyId, contentId, body) => {
        set((state) => ({
          contentByProperty: {
            ...state.contentByProperty,
            [propertyId]: (state.contentByProperty[propertyId] || []).map((c) =>
              c.id === contentId ? { ...c, body, status: "edited" as ContentStatus } : c
            ),
          },
        }));
      },
      replaceContent: (propertyId, contentId, newTitle, newBody) => {
        set((state) => ({
          contentByProperty: {
            ...state.contentByProperty,
            [propertyId]: (state.contentByProperty[propertyId] || []).map((c) =>
              c.id === contentId ? { ...c, title: newTitle, body: newBody, status: "generated" as ContentStatus } : c
            ),
          },
        }));
      },
      updateContentImage: (propertyId, contentId, imageUrl) => {
        set((state) => ({
          contentByProperty: {
            ...state.contentByProperty,
            [propertyId]: (state.contentByProperty[propertyId] || []).map((c) =>
              c.id === contentId ? { ...c, imageUrl } : c
            ),
          },
        }));
      },
      applyImagesByPlatform: (propertyId, images) => {
        set((state) => ({
          contentByProperty: {
            ...state.contentByProperty,
            [propertyId]: (state.contentByProperty[propertyId] || []).map((c) => {
              const url = images[c.platform];
              return url ? { ...c, imageUrl: url } : c;
            }),
          },
        }));
      },
      getContent: (propertyId) => get().contentByProperty[propertyId] || [],
      getContentByPlatform: (propertyId, platform) =>
        (get().contentByProperty[propertyId] || []).find((c) => c.platform === platform),
      getApprovedCount: (propertyId) =>
        (get().contentByProperty[propertyId] || []).filter(
          (c) => c.status === "approved" || c.status === "edited"
        ).length,
      reset: () => set({ contentByProperty: {} }),
    }),
    { name: "propia-content" }
  )
);
