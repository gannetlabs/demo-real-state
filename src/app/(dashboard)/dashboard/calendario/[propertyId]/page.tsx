"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Clock,
  ArrowRight,
  Globe,
  FileText,
  Smartphone,
  Video,
  GripVertical,
  CalendarDays,
} from "lucide-react";
import { IconInstagram, IconFacebook, IconLinkedin } from "@/components/icons/brand-icons";
import { useCalendarStore } from "@/store/use-calendar-store";
import { useContentStore } from "@/store/use-content-store";
import { usePropertyStore } from "@/store/use-property-store";
import { getPlatform } from "@/data/platforms";
import { DayOfWeek } from "@/types/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                      */
/* ------------------------------------------------------------------ */
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["Datos", "Generacion", "Contenido", "Calendario", "Confirmacion"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                i + 1 === currentStep
                  ? "bg-[#d4a853] border-[#d4a853] text-[#1a2332]"
                  : i + 1 < currentStep
                    ? "bg-[#10b981] border-[#10b981] text-white"
                    : "bg-white border-slate-300 text-slate-400"
              )}
            >
              {i + 1 < currentStep ? "\u2713" : i + 1}
            </div>
            <span
              className={cn(
                "text-xs mt-1.5 font-medium",
                i + 1 === currentStep ? "text-[#d4a853]" : "text-slate-400"
              )}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-2 mb-5",
                i + 1 < currentStep ? "bg-[#10b981]" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform icon helper                                                */
/* ------------------------------------------------------------------ */
function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  switch (platform) {
    case "facebook_post":
      return <IconFacebook className={className} />;
    case "instagram_carousel":
      return <IconInstagram className={className} />;
    case "instagram_story":
      return <IconInstagram className={className} />;
    case "linkedin_post":
      return <IconLinkedin className={className} />;
    case "tiktok_script":
      return <Video className={className} />;
    case "web_listing":
      return <Globe className={className} />;
    case "blog_article":
      return <FileText className={className} />;
    default:
      return <Globe className={className} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Constants                                                            */
/* ------------------------------------------------------------------ */
const platformColors: Record<string, string> = {
  facebook_post: "#1877F2",
  instagram_carousel: "#E4405F",
  instagram_story: "#833AB4",
  linkedin_post: "#0A66C2",
  tiktok_script: "#ff0050",
  web_listing: "#1a2332",
  blog_article: "#6366f1",
};

const days: { key: DayOfWeek; label: string; date: string }[] = [
  { key: "lunes", label: "Lunes", date: "14/04" },
  { key: "martes", label: "Martes", date: "15/04" },
  { key: "miércoles", label: "Miércoles", date: "16/04" },
  { key: "jueves", label: "Jueves", date: "17/04" },
  { key: "viernes", label: "Viernes", date: "18/04" },
];

const timePresets = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const columnGradients = [
  "from-blue-500/10 to-blue-500/5",
  "from-purple-500/10 to-purple-500/5",
  "from-rose-500/10 to-rose-500/5",
  "from-amber-500/10 to-amber-500/5",
  "from-emerald-500/10 to-emerald-500/5",
];

const columnBorderColors = [
  "border-t-blue-500",
  "border-t-purple-500",
  "border-t-rose-500",
  "border-t-amber-500",
  "border-t-emerald-500",
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                       */
/* ------------------------------------------------------------------ */
export default function CalendarioPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);

  const getSchedule = useCalendarStore((s) => s.getSchedule);
  const createDefaultSchedule = useCalendarStore((s) => s.createDefaultSchedule);
  const movePublication = useCalendarStore((s) => s.movePublication);

  const getContent = useContentStore((s) => s.getContent);
  const getProperty = usePropertyStore((s) => s.getProperty);

  const schedule = getSchedule(propertyId);
  const contents = getContent(propertyId);
  const property = getProperty(propertyId);

  const [editingTime, setEditingTime] = useState<string | null>(null);

  /* Create default schedule on first mount if none exists */
  useEffect(() => {
    if (schedule.length === 0 && contents.length > 0) {
      createDefaultSchedule(propertyId, contents);
    }
  }, [schedule.length, contents.length, propertyId, createDefaultSchedule]);

  /* Helpers */
  const getPublicationsForDay = (day: DayOfWeek) =>
    schedule.filter((pub) => pub.dayOfWeek === day);

  const getContentForPublication = (contentId: string) =>
    contents.find((c) => c.id === contentId);

  const handleDayChange = (publicationId: string, newDay: DayOfWeek) => {
    movePublication(propertyId, publicationId, newDay);
  };

  const handleTimeChange = (publicationId: string, newTime: string) => {
    // Update time via store - we modify the schedule directly
    useCalendarStore.setState((state) => ({
      scheduleByProperty: {
        ...state.scheduleByProperty,
        [propertyId]: (state.scheduleByProperty[propertyId] || []).map((p) =>
          p.id === publicationId ? { ...p, timeSlot: newTime } : p
        ),
      },
    }));
    setEditingTime(null);
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Step Indicator */}
        <StepIndicator currentStep={4} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#d4a853]/10">
              <CalendarDays className="h-7 w-7 text-[#d4a853]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">
              Calendario de Publicaciones
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Semana del 14/04 al 18/04
            {property && (
              <span className="text-slate-400">
                {" "}
                &mdash; {property.title}
              </span>
            )}
          </p>
        </motion.div>

        {/* Weekly Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-5 gap-4 mb-12"
        >
          {days.map((day, dayIndex) => {
            const pubs = getPublicationsForDay(day.key);

            return (
              <div key={day.key} className="flex flex-col">
                {/* Column Header */}
                <div
                  className={cn(
                    "rounded-t-xl border-t-4 bg-gradient-to-b px-3 py-3 text-center",
                    columnBorderColors[dayIndex],
                    columnGradients[dayIndex]
                  )}
                >
                  <p className="text-sm font-semibold text-slate-700">
                    {day.label}
                  </p>
                  <p className="text-xs text-slate-400">{day.date}</p>
                </div>

                {/* Column Body */}
                <div
                  className={cn(
                    "flex-1 rounded-b-xl border border-t-0 border-slate-200 bg-white p-3 min-h-[280px]",
                    pubs.length === 0 && "flex items-center justify-center"
                  )}
                >
                  {pubs.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center w-full">
                      <p className="text-xs text-slate-400">Sin publicaciones</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pubs.map((pub, pubIndex) => {
                        const content = getContentForPublication(pub.contentId);
                        const platformInfo = getPlatform(pub.platform);
                        const color =
                          platformColors[pub.platform] || "#64748b";
                        const snippet = content
                          ? content.body.slice(0, 60) +
                            (content.body.length > 60 ? "..." : "")
                          : "Sin contenido";

                        return (
                          <motion.div
                            key={pub.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.35,
                              delay: dayIndex * 0.08 + pubIndex * 0.06,
                            }}
                            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                          >
                            {/* Left color stripe */}
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1"
                              style={{ backgroundColor: color }}
                            />

                            <div className="pl-3.5 pr-2.5 py-3">
                              {/* Platform header */}
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className="flex items-center justify-center w-6 h-6 rounded-md"
                                  style={{
                                    backgroundColor: `${color}15`,
                                  }}
                                >
                                  <span style={{ color }}>
                                    <PlatformIcon
                                      platform={pub.platform}
                                      className="w-3.5 h-3.5"
                                    />
                                  </span>
                                </div>
                                <span
                                  className="text-xs font-semibold"
                                  style={{ color }}
                                >
                                  {platformInfo.shortName}
                                </span>
                              </div>

                              {/* Time */}
                              <div className="mb-2">
                                {editingTime === pub.id ? (
                                  <Select
                                    value={pub.timeSlot}
                                    onValueChange={(val) =>
                                      handleTimeChange(pub.id, val as string)
                                    }
                                  >
                                    <SelectTrigger size="sm" className="h-6 text-xs w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {timePresets.map((t) => (
                                        <SelectItem key={t} value={t}>
                                          {t}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <button
                                    onClick={() => setEditingTime(pub.id)}
                                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#d4a853] transition-colors cursor-pointer"
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>{pub.timeSlot} hs</span>
                                  </button>
                                )}
                              </div>

                              {/* Content preview */}
                              <p className="text-[11px] leading-relaxed text-slate-500 mb-3 line-clamp-2">
                                {snippet}
                              </p>

                              {/* Day selector */}
                              <Select
                                value={pub.dayOfWeek}
                                onValueChange={(val) =>
                                  handleDayChange(pub.id, val as DayOfWeek)
                                }
                              >
                                <SelectTrigger size="sm" className="h-7 text-xs w-full">
                                  <GripVertical className="w-3 h-3 text-slate-400 mr-1" />
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {days.map((d) => (
                                    <SelectItem key={d.key} value={d.key}>
                                      {d.label} {d.date}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Bottom Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Link href={`/dashboard/confirmacion/${propertyId}`}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-shimmer glow-gold inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-[#1a2332] shadow-lg cursor-pointer"
            >
              Confirmar Calendario
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
