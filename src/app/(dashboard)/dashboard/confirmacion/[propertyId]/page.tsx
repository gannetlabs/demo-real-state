"use client";

import { useState, use, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarCheck,
  MapPin,
  ArrowRight,
  Building2,
  Clock,
  CheckCircle2,
  Globe,
  FileText,
  Smartphone,
  Video,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import {
  IconInstagram,
  IconFacebook,
  IconLinkedin,
} from "@/components/icons/brand-icons";
import { useCalendarStore } from "@/store/use-calendar-store";
import { usePropertyStore } from "@/store/use-property-store";
import { useContentStore } from "@/store/use-content-store";
import { getPlatform } from "@/data/platforms";
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
/*  Platform Icon                                                       */
/* ------------------------------------------------------------------ */
function PlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
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
    default:
      return <Globe className={className} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const dayLabels: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  "miercoles": "Miercoles",
  "miércoles": "Miercoles",
  jueves: "Jueves",
  viernes: "Viernes",
};

const platformColors: Record<string, string> = {
  facebook_post: "#1877F2",
  instagram_carousel: "#E4405F",
  instagram_story: "#833AB4",
  linkedin_post: "#0A66C2",
  tiktok_script: "#ff0050",
};

/* ------------------------------------------------------------------ */
/*  Confetti Pieces                                                     */
/* ------------------------------------------------------------------ */
const confettiColors = ["#d4a853", "#2dd4bf", "#6366f1", "#f43f5e", "#f59e0b"];

function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: 6 + Math.random() * 6,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    isCircle: Math.random() > 0.5,
    rotation: Math.floor(Math.random() * 360),
  }));
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                      */
/* ------------------------------------------------------------------ */
export default function ConfirmacionPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const [confirming, setConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getProperty = usePropertyStore((s) => s.getProperty);
  const updatePropertyStatus = usePropertyStore((s) => s.updatePropertyStatus);
  const getSchedule = useCalendarStore((s) => s.getSchedule);
  const confirmSchedule = useCalendarStore((s) => s.confirmSchedule);
  const getContent = useContentStore((s) => s.getContent);

  const property = getProperty(propertyId);
  const schedule = getSchedule(propertyId);
  const contents = getContent(propertyId);

  const confettiPieces = useMemo(() => generateConfetti(30), []);

  // Unique platforms
  const uniquePlatforms = useMemo(
    () => [...new Set(schedule.map((p) => p.platform))],
    [schedule]
  );

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getContentSnippet = (contentId: string) => {
    const content = contents.find((c) => c.id === contentId);
    if (!content) return "Contenido generado";
    const text = content.body || content.title;
    return text.length > 80 ? text.slice(0, 80) + "..." : text;
  };

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      confirmSchedule(propertyId);
      updatePropertyStatus(propertyId, "scheduled");
      setConfirming(false);
      setShowSuccess(true);
    }, 1500);
  };

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Propiedad no encontrada.</p>
      </div>
    );
  }

  return (
    <>
      {/* Keyframes for SVG checkmark animation */}
      <style>{`
        @keyframes checkmark-circle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes checkmark-check {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto py-8 px-4">
        <StepIndicator currentStep={5} />

        {/* ---- Header ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-[#d4a853]/10 rounded-full">
            <CalendarCheck className="w-4 h-4 text-[#d4a853]" />
            <span className="text-sm font-medium text-[#d4a853]">
              Paso final
            </span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-[#1a2332] mb-2">
            Resumen de Publicaciones
          </h1>
          <p className="text-slate-500">
            Revis&aacute; y confirm&aacute; tu calendario de publicaciones
          </p>
        </motion.div>

        {/* ---- Property Card ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#1a2332] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-[#d4a853]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[#1a2332] truncate">
                {property.title}
              </h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {property.location}
                </span>
                <span className="font-semibold text-[#1a2332]">
                  {formatPrice(property.price, property.currency)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---- Publication List ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6"
        >
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-[#1a2332] flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Publicaciones programadas
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {schedule.map((pub, index) => {
              const platformInfo = getPlatform(pub.platform);
              const color = platformColors[pub.platform] || "#64748b";

              return (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                  className="flex items-center gap-4 px-5 py-4 relative"
                >
                  {/* Left colored stripe */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ backgroundColor: color }}
                  />

                  {/* Day & time */}
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-semibold text-[#1a2332]">
                      {dayLabels[pub.dayOfWeek] || pub.dayOfWeek}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {pub.timeSlot} hs
                    </p>
                  </div>

                  {/* Platform icon + name */}
                  <div className="flex items-center gap-2 w-36 shrink-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: color + "18" }}
                    >
                      <PlatformIcon
                        platform={pub.platform}
                        className="w-4 h-4"
                      />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color }}
                    >
                      {platformInfo.shortName}
                    </span>
                  </div>

                  {/* Content snippet */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 truncate">
                      {getContentSnippet(pub.contentId)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Listo
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ---- Summary Stats ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-3.5 mb-8 flex items-center justify-center gap-2 text-sm"
        >
          <Sparkles className="w-4 h-4 text-[#d4a853]" />
          <span className="text-slate-600">
            <strong className="text-[#1a2332]">
              {schedule.length} publicaciones
            </strong>{" "}
            en{" "}
            <strong className="text-[#1a2332]">
              {uniquePlatforms.length} plataformas diferentes
            </strong>
          </span>
        </motion.div>

        {/* ---- Confirm Button ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={handleConfirm}
            disabled={confirming || showSuccess}
            className={cn(
              "btn-shimmer glow-gold inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-[#1a2332] font-bold text-lg transition-all",
              "hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            {confirming ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Programando publicaciones...
              </>
            ) : (
              <>
                <CalendarCheck className="w-5 h-5" />
                Confirmar y Programar Publicaciones
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* ================================================================ */}
      {/*  SUCCESS MODAL                                                    */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Confetti */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confettiPieces.map((piece) => (
                <div
                  key={piece.id}
                  className={cn(
                    "absolute confetti-piece",
                    piece.isCircle ? "rounded-full" : "rounded-none"
                  )}
                  style={{
                    left: `${piece.left}%`,
                    top: "-20px",
                    width: `${piece.size}px`,
                    height: `${piece.size}px`,
                    backgroundColor: piece.color,
                    animationDelay: `${piece.delay}s`,
                    animationDuration: `${piece.duration}s`,
                    transform: `rotate(${piece.rotation}deg)`,
                  }}
                />
              ))}
            </div>

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                delay: 0.1,
              }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center z-10"
            >
              {/* Animated SVG Checkmark */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg viewBox="0 0 52 52" className="w-20 h-20">
                    <circle
                      cx="26"
                      cy="26"
                      r="25"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      style={{
                        strokeDasharray: 166,
                        strokeDashoffset: 166,
                        animation:
                          "checkmark-circle 0.6s ease-in-out forwards",
                      }}
                    />
                    <path
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.1 27.2l7.1 7.2 16.7-16.8"
                      style={{
                        strokeDasharray: 48,
                        strokeDashoffset: 48,
                        animation:
                          "checkmark-check 0.3s 0.6s ease-in-out forwards",
                      }}
                    />
                  </svg>

                  {/* Glow ring behind checkmark */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{
                      duration: 1,
                      delay: 0.5,
                      ease: "easeOut",
                    }}
                    className="absolute inset-0 rounded-full border-2 border-[#10b981]"
                  />
                </div>
              </div>

              {/* Party Popper Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.7, damping: 10 }}
                className="flex justify-center mb-4"
              >
                <PartyPopper className="w-8 h-8 text-[#d4a853]" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-2xl font-heading font-bold text-[#1a2332] mb-3"
              >
                &iexcl;Publicaciones Programadas!
              </motion.h2>

              {/* Subtitle 1 */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-slate-600 font-medium mb-2"
              >
                {schedule.length} publicaciones ser&aacute;n enviadas
                autom&aacute;ticamente esta semana
              </motion.p>

              {/* Subtitle 2 */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-sm text-slate-400 mb-8 leading-relaxed"
              >
                Tu contenido ser&aacute; publicado en{" "}
                {uniquePlatforms
                  .map((p) => getPlatform(p).shortName)
                  .join(", ")}{" "}
                seg&uacute;n el calendario establecido.
              </motion.p>

              {/* Divider with sparkle */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="flex-1 h-px bg-slate-200" />
                <Sparkles className="w-4 h-4 text-[#d4a853]" />
                <div className="flex-1 h-px bg-slate-200" />
              </motion.div>

              {/* Dashboard Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Link
                  href="/dashboard"
                  className="btn-shimmer glow-gold inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[#1a2332] font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Volver al Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
