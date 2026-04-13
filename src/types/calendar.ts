import { ContentPlatform } from "./content";

export type DayOfWeek = "lunes" | "martes" | "miércoles" | "jueves" | "viernes";

export interface ScheduledPublication {
  id: string;
  propertyId: string;
  contentId: string;
  platform: ContentPlatform;
  dayOfWeek: DayOfWeek;
  timeSlot: string;
  status: "scheduled" | "confirmed" | "published";
}

export interface WeeklySchedule {
  propertyId: string;
  publications: ScheduledPublication[];
}
