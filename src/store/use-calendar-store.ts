"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ScheduledPublication, DayOfWeek } from "@/types/calendar";
import { GeneratedContent } from "@/types/content";

interface CalendarState {
  scheduleByProperty: Record<string, ScheduledPublication[]>;
  createDefaultSchedule: (propertyId: string, contents: GeneratedContent[]) => void;
  movePublication: (propertyId: string, publicationId: string, newDay: DayOfWeek) => void;
  movePublicationSlot: (
    propertyId: string,
    publicationId: string,
    newDay: DayOfWeek,
    newTime: string
  ) => void;
  confirmSchedule: (propertyId: string) => void;
  getSchedule: (propertyId: string) => ScheduledPublication[];
  reset: () => void;
}

const defaultDayMapping: { platform: string; day: DayOfWeek; time: string }[] = [
  { platform: "facebook_post", day: "lunes", time: "10:00" },
  { platform: "instagram_story", day: "martes", time: "12:00" },
  { platform: "instagram_carousel", day: "miércoles", time: "18:00" },
  { platform: "linkedin_post", day: "jueves", time: "09:00" },
  { platform: "tiktok_script", day: "viernes", time: "17:00" },
];

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      scheduleByProperty: {},
      createDefaultSchedule: (propertyId, contents) => {
        const publications: ScheduledPublication[] = defaultDayMapping
          .map((mapping) => {
            const content = contents.find((c) => c.platform === mapping.platform);
            if (!content) return null;
            return {
              id: `pub-${propertyId}-${mapping.platform}`,
              propertyId,
              contentId: content.id,
              platform: content.platform,
              dayOfWeek: mapping.day,
              timeSlot: mapping.time,
              status: "scheduled" as const,
            };
          })
          .filter(Boolean) as ScheduledPublication[];

        set((state) => ({
          scheduleByProperty: { ...state.scheduleByProperty, [propertyId]: publications },
        }));
      },
      movePublication: (propertyId, publicationId, newDay) => {
        set((state) => ({
          scheduleByProperty: {
            ...state.scheduleByProperty,
            [propertyId]: (state.scheduleByProperty[propertyId] || []).map((p) =>
              p.id === publicationId ? { ...p, dayOfWeek: newDay } : p
            ),
          },
        }));
      },
      movePublicationSlot: (propertyId, publicationId, newDay, newTime) => {
        set((state) => ({
          scheduleByProperty: {
            ...state.scheduleByProperty,
            [propertyId]: (state.scheduleByProperty[propertyId] || []).map((p) =>
              p.id === publicationId
                ? { ...p, dayOfWeek: newDay, timeSlot: newTime }
                : p
            ),
          },
        }));
      },
      confirmSchedule: (propertyId) => {
        set((state) => ({
          scheduleByProperty: {
            ...state.scheduleByProperty,
            [propertyId]: (state.scheduleByProperty[propertyId] || []).map((p) => ({
              ...p,
              status: "confirmed" as const,
            })),
          },
        }));
      },
      getSchedule: (propertyId) => get().scheduleByProperty[propertyId] || [],
      reset: () => set({ scheduleByProperty: {} }),
    }),
    { name: "propia-calendar" }
  )
);
