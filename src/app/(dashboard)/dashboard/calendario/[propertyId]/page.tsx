"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Clock,
  ArrowRight,
  Globe,
  FileText,
  Video,
  GripVertical,
  CalendarDays,
} from "lucide-react";
import { IconInstagram, IconFacebook, IconLinkedin } from "@/components/icons/brand-icons";
import { useCalendarStore } from "@/store/use-calendar-store";
import { useContentStore } from "@/store/use-content-store";
import { usePropertyStore } from "@/store/use-property-store";
import { getPlatform } from "@/data/platforms";
import { DayOfWeek, ScheduledPublication } from "@/types/calendar";
import { GeneratedContent } from "@/types/content";
import { cn } from "@/lib/utils";

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
              {i + 1 < currentStep ? "✓" : i + 1}
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

const HOUR_START = 8;
const HOUR_END = 20;
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
const HOUR_HEIGHT = 60; // px per hour

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

const parseHour = (timeSlot: string) => {
  const h = parseInt(timeSlot.split(":")[0] ?? "8", 10);
  if (Number.isNaN(h)) return HOUR_START;
  return Math.min(Math.max(h, HOUR_START), HOUR_END);
};

const slotId = (day: DayOfWeek, hour: number) => `${day}__${hour}`;

const EMPTY_SCHEDULE: ScheduledPublication[] = [];

/* ------------------------------------------------------------------ */
/*  Timeline Slot (droppable)                                            */
/* ------------------------------------------------------------------ */
function TimelineSlot({
  day,
  hour,
  isLast,
}: {
  day: DayOfWeek;
  hour: number;
  isLast: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId(day, hour) });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute left-0 right-0 transition-colors",
        !isLast && "border-b border-dashed border-slate-100",
        isOver && "bg-[#d4a853]/15"
      )}
      style={{
        top: (hour - HOUR_START) * HOUR_HEIGHT,
        height: HOUR_HEIGHT,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Draggable publication card                                           */
/* ------------------------------------------------------------------ */
function DraggableCard({
  pub,
  content,
  stackIndex,
}: {
  pub: ScheduledPublication;
  content: GeneratedContent | undefined;
  stackIndex: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: pub.id,
  });

  const platformInfo = getPlatform(pub.platform);
  const color = platformColors[pub.platform] || "#64748b";
  const snippet = content
    ? content.body.slice(0, 60) + (content.body.length > 60 ? "..." : "")
    : "Sin contenido";

  const hour = parseHour(pub.timeSlot);
  const baseTop = (hour - HOUR_START) * HOUR_HEIGHT;
  const offsetY = stackIndex * 6;
  const offsetX = stackIndex * 10;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        position: "absolute",
        top: baseTop + offsetY + 2,
        left: 4 + offsetX,
        right: 4,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 10 + stackIndex,
        touchAction: "none",
      }}
      className={cn(
        "group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow",
        isDragging
          ? "cursor-grabbing shadow-xl ring-2 ring-[#d4a853]/40"
          : "cursor-grab hover:shadow-md"
      )}
    >
      {/* Left color stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: color }}
      />

      <div className="pl-3 pr-2 py-2">
        {/* Platform header */}
        <div className="flex items-center gap-1.5 mb-1">
          <GripVertical className="w-3 h-3 text-slate-300 shrink-0" />
          <div
            className="flex items-center justify-center w-5 h-5 rounded-md shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <span style={{ color }}>
              <PlatformIcon platform={pub.platform} className="w-3 h-3" />
            </span>
          </div>
          <span
            className="text-[11px] font-semibold truncate"
            style={{ color }}
          >
            {platformInfo.shortName}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
          <Clock className="w-2.5 h-2.5" />
          <span>{pub.timeSlot} hs</span>
        </div>

        {/* Content preview */}
        <p className="text-[10px] leading-tight text-slate-500 line-clamp-2">
          {snippet}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                       */
/* ------------------------------------------------------------------ */
export default function CalendarioPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);

  const schedule =
    useCalendarStore((s) => s.scheduleByProperty[propertyId]) ?? EMPTY_SCHEDULE;
  const createDefaultSchedule = useCalendarStore((s) => s.createDefaultSchedule);
  const movePublicationSlot = useCalendarStore((s) => s.movePublicationSlot);

  const getContent = useContentStore((s) => s.getContent);
  const getProperty = usePropertyStore((s) => s.getProperty);

  const contents = getContent(propertyId);
  const property = getProperty(propertyId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  /* Create default schedule on first mount if none exists */
  useEffect(() => {
    if (schedule.length === 0 && contents.length > 0) {
      createDefaultSchedule(propertyId, contents);
    }
  }, [schedule.length, contents.length, propertyId, createDefaultSchedule]);

  const getContentForPublication = (contentId: string) =>
    contents.find((c) => c.id === contentId);

  /* Group publications by day+hour to compute stack offsets for collisions */
  const stackIndexById = new Map<string, number>();
  {
    const buckets = new Map<string, ScheduledPublication[]>();
    schedule.forEach((pub) => {
      const key = `${pub.dayOfWeek}__${parseHour(pub.timeSlot)}`;
      const list = buckets.get(key) ?? [];
      list.push(pub);
      buckets.set(key, list);
    });
    buckets.forEach((list) => {
      list
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id))
        .forEach((pub, idx) => stackIndexById.set(pub.id, idx));
    });
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const [day, hourStr] = overId.split("__");
    if (!day || !hourStr) return;
    const hour = parseInt(hourStr, 10);
    if (Number.isNaN(hour)) return;
    const newTime = `${String(hour).padStart(2, "0")}:00`;
    movePublicationSlot(propertyId, String(active.id), day as DayOfWeek, newTime);
  };

  const timelineHeight = HOURS.length * HOUR_HEIGHT;

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
          className="text-center mb-8"
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
          <p className="text-slate-400 text-xs mt-2">
            Arrastrá las publicaciones a cualquier día y horario para reorganizarlas.
          </p>
        </motion.div>

        {/* Weekly Calendar Grid with Timeline */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-12"
          >
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "56px repeat(5, minmax(0, 1fr))" }}
            >
              {/* Hours column header (empty placeholder) */}
              <div className="h-15" />

              {/* Day column headers */}
              {days.map((day, dayIndex) => (
                <div
                  key={day.key}
                  className={cn(
                    "rounded-t-xl border-t-4 bg-linear-to-b px-3 py-3 text-center",
                    columnBorderColors[dayIndex],
                    columnGradients[dayIndex]
                  )}
                >
                  <p className="text-sm font-semibold text-slate-700">
                    {day.label}
                  </p>
                  <p className="text-xs text-slate-400">{day.date}</p>
                </div>
              ))}

              {/* Hours axis */}
              <div className="relative" style={{ height: timelineHeight }}>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute right-2 text-[11px] font-medium text-slate-400 -translate-y-1/2"
                    style={{ top: (h - HOUR_START) * HOUR_HEIGHT }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* Day columns body */}
              {days.map((day) => {
                const pubs = schedule.filter((p) => p.dayOfWeek === day.key);
                return (
                  <div
                    key={day.key}
                    className="relative rounded-b-xl border border-t-0 border-slate-200 bg-white"
                    style={{ height: timelineHeight }}
                  >
                    {/* Droppable hour slots */}
                    {HOURS.map((h, idx) => (
                      <TimelineSlot
                        key={h}
                        day={day.key}
                        hour={h}
                        isLast={idx === HOURS.length - 1}
                      />
                    ))}

                    {/* Draggable publication cards */}
                    {pubs.map((pub) => (
                      <DraggableCard
                        key={pub.id}
                        pub={pub}
                        content={getContentForPublication(pub.contentId)}
                        stackIndex={stackIndexById.get(pub.id) ?? 0}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </DndContext>

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
