"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Globe,
  FileText,
  Smartphone,
  Video,
  Check,
  Loader2,
  Sparkles,
  Minus,
} from "lucide-react";
import { IconInstagram, IconFacebook, IconLinkedin } from "@/components/icons/brand-icons";
import { usePropertyStore } from "@/store/use-property-store";
import { useContentStore } from "@/store/use-content-store";
import { generateMockContent } from "@/data/mock-content";
import { cn } from "@/lib/utils";
import type { ContentPlatform } from "@/types/content";
import type { GenerateImagesResponse } from "@/app/api/generate-images/route";

/* -------------------------------------------------------------------------- */
/*  Step Indicator (inline, consistent with property form)                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Generation steps definition                                               */
/* -------------------------------------------------------------------------- */

type StepState = "waiting" | "generating" | "done";

interface GenerationStep {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GENERATION_STEPS: GenerationStep[] = [
  { label: "Analizando propiedad e imagenes...", icon: Brain },
  { label: "Generando publicacion para web...", icon: Globe },
  { label: "Redactando articulo para blog...", icon: FileText },
  { label: "Creando carrusel de Instagram...", icon: IconInstagram },
  { label: "Disenando Story para redes...", icon: Smartphone },
  { label: "Escribiendo post de Facebook...", icon: IconFacebook },
  { label: "Preparando post de LinkedIn...", icon: IconLinkedin },
  { label: "Escribiendo guion de TikTok/Reels...", icon: Video },
];

const STEP_DURATION = 600; // ms per step
const TYPEWRITER_TEXT =
  "Exclusivo departamento de 2 ambientes en el corazon de Puerto Madero. Vista panoramica al rio, amenities de primer nivel y cochera incluida. Pisos de porcelanato, cocina integrada con mesada de granito y balcon terraza con parrilla propia. Edificio con seguridad 24hs, pileta climatizada, gym y SUM...";

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default function GenerarContenidoPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const router = useRouter();

  /* -- Zustand stores -- */
  const getProperty = usePropertyStore((s) => s.getProperty);
  const updatePropertyStatus = usePropertyStore((s) => s.updatePropertyStatus);
  const setContent = useContentStore((s) => s.setContent);

  /* -- Step states -- */
  const [stepStates, setStepStates] = useState<StepState[]>(
    GENERATION_STEPS.map(() => "waiting")
  );
  const [allDone, setAllDone] = useState(false);

  /* -- Image generation -- */
  type ImagesStatus = "loading" | "ready" | "error";
  const [imagesStatus, setImagesStatus] = useState<ImagesStatus>("loading");
  const imagesRef = useRef<Partial<Record<ContentPlatform, string>>>({});
  const imagesRequestedRef = useRef(false);

  /* -- Typewriter -- */
  const [displayedText, setDisplayedText] = useState("");
  const typewriterIndexRef = useRef(0);
  const typewriterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* -- Overall progress -- */
  const doneCount = stepStates.filter((s) => s === "done").length;
  const generatingCount = stepStates.filter((s) => s === "generating").length;
  const progress = Math.round(
    ((doneCount + generatingCount * 0.5) / GENERATION_STEPS.length) * 100
  );

  /* -------------------------------------------------------------------------- */
  /*  Typewriter effect                                                         */
  /* -------------------------------------------------------------------------- */

  const startTypewriter = useCallback(() => {
    typewriterIndexRef.current = 0;
    setDisplayedText("");
    typewriterIntervalRef.current = setInterval(() => {
      if (typewriterIndexRef.current < TYPEWRITER_TEXT.length) {
        setDisplayedText(TYPEWRITER_TEXT.slice(0, typewriterIndexRef.current + 1));
        typewriterIndexRef.current++;
      } else if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }
    }, 18);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*  Kick off image generation as soon as we have the property                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (imagesRequestedRef.current) return;
    const property = getProperty(propertyId);
    if (!property) return;
    imagesRequestedRef.current = true;

    const referenceImageDataUrl = property.photos[0]?.url;

    fetch("/api/generate-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property, referenceImageDataUrl }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const detail = await res.text();
          throw new Error(`API ${res.status}: ${detail}`);
        }
        return res.json() as Promise<GenerateImagesResponse>;
      })
      .then((data) => {
        imagesRef.current = data.images;
        setImagesStatus("ready");
      })
      .catch((err) => {
        console.error("[generar] image generation failed", err);
        setImagesStatus("error");
      });
  }, [propertyId, getProperty]);

  /* -------------------------------------------------------------------------- */
  /*  Sequential step animation                                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Start typewriter right away
    startTypewriter();

    GENERATION_STEPS.forEach((_, i) => {
      // Set step to "generating"
      const genTimeout = setTimeout(() => {
        setStepStates((prev) => {
          const next = [...prev];
          next[i] = "generating";
          return next;
        });
      }, i * STEP_DURATION);
      timeouts.push(genTimeout);

      // Set step to "done"
      const doneTimeout = setTimeout(() => {
        setStepStates((prev) => {
          const next = [...prev];
          next[i] = "done";
          return next;
        });

        // After the last step is done
        if (i === GENERATION_STEPS.length - 1) {
          const finalTimeout = setTimeout(() => {
            setAllDone(true);
          }, 400);
          timeouts.push(finalTimeout);
        }
      }, i * STEP_DURATION + STEP_DURATION);
      timeouts.push(doneTimeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }
    };
  }, [startTypewriter]);

  /* -------------------------------------------------------------------------- */
  /*  Navigate after completion                                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!allDone) return;
    if (imagesStatus === "loading") return;

    const navTimeout = setTimeout(() => {
      const property = getProperty(propertyId);
      if (property) {
        const baseContent = generateMockContent(property);
        const images = imagesRef.current;
        const enriched = baseContent.map((c) => {
          const url = images[c.platform];
          return url ? { ...c, imageUrl: url } : c;
        });
        setContent(propertyId, enriched);
        updatePropertyStatus(propertyId, "content_generated");
      }
      router.push(`/dashboard/contenido/${propertyId}`);
    }, 1000);

    return () => clearTimeout(navTimeout);
  }, [allDone, imagesStatus, propertyId, getProperty, setContent, updatePropertyStatus, router]);

  /* -------------------------------------------------------------------------- */
  /*  Render helpers                                                            */
  /* -------------------------------------------------------------------------- */

  function renderStepIcon(state: StepState, StepIcon: React.ComponentType<{ className?: string }>) {
    switch (state) {
      case "waiting":
        return <Minus className="w-4 h-4 text-slate-400" />;
      case "generating":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "done":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Check className="w-4 h-4 text-emerald-500" />
          </motion.div>
        );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*  Render                                                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="gradient-mesh min-h-[calc(100vh-3.5rem)] flex flex-col items-center pt-8 pb-16 px-4">
      {/* Step indicator */}
      <StepIndicator currentStep={2} />

      {/* Main content card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        {/* ---------- AI Brain / Sparkles Icon ---------- */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6">
            {/* Outer glow ring */}
            <motion.div
              className="absolute -inset-4 rounded-full bg-[#d4a853]/10"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Inner glow ring */}
            <motion.div
              className="absolute -inset-2 rounded-full bg-[#d4a853]/15"
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            {/* Icon container */}
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#d4a853] to-[#b8912e] flex items-center justify-center glow-gold animate-float">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            {/* Orbiting particles */}
            <motion.div
              className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-[#d4a853]"
              animate={{
                rotate: 360,
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "0 40px" }}
            />
            <motion.div
              className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full bg-[#e8c874]"
              animate={{
                rotate: -360,
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "0 -40px" }}
            />
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-[#1a2332] mb-2 text-center">
            Generando contenido con IA...
          </h1>
          <p className="text-sm text-slate-500 text-center max-w-md">
            Nuestro motor de inteligencia artificial esta creando contenido optimizado para cada plataforma
          </p>
        </div>

        {/* ---------- Steps list ---------- */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 mb-6">
          <div className="space-y-1">
            <AnimatePresence mode="sync">
              {GENERATION_STEPS.map((step, i) => {
                const state = stepStates[i];
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className={cn(
                      "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-300",
                      state === "generating" && "bg-blue-50/80",
                      state === "done" && "bg-emerald-50/50",
                      state === "waiting" && "opacity-50"
                    )}
                  >
                    {/* Platform icon */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300",
                        state === "generating"
                          ? "bg-blue-100 text-blue-600"
                          : state === "done"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium transition-colors duration-300",
                        state === "generating"
                          ? "text-blue-700"
                          : state === "done"
                            ? "text-emerald-700"
                            : "text-slate-400"
                      )}
                    >
                      {step.label}
                    </span>

                    {/* Status icon */}
                    <div className="w-6 h-6 flex items-center justify-center">
                      {state === "generating" && (
                        <motion.div
                          className="relative flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <motion.div
                            className="absolute w-5 h-5 rounded-full bg-blue-400/20"
                            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        </motion.div>
                      )}
                      {state === "done" && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                      {state === "waiting" && (
                        <Minus className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- Typewriter preview ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-slate-900 rounded-2xl border border-slate-700/50 p-5 mb-6 shadow-xl shadow-slate-900/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-slate-500 ml-2 font-mono">ai-output.txt</span>
          </div>
          <div className="font-mono text-sm text-green-400 leading-relaxed min-h-[4.5rem]">
            <span className="text-slate-600 select-none">$ </span>
            {displayedText}
            <span className="cursor-blink text-green-400 ml-0.5 font-bold">|</span>
          </div>
        </motion.div>

        {/* ---------- Overall progress bar ---------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Progreso general</span>
            <motion.span
              key={progress}
              initial={{ scale: 1.3, color: "#d4a853" }}
              animate={{ scale: 1, color: progress === 100 ? "#10b981" : "#64748b" }}
              className="font-bold tabular-nums"
            >
              {progress}%
            </motion.span>
          </div>
          <div className="h-2.5 bg-slate-200/80 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                background:
                  progress === 100
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #d4a853, #e8c874, #d4a853)",
              }}
            >
              {/* Shimmer overlay on progress bar */}
              {progress < 100 && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ---------- Completion flash ---------- */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold",
                  imagesStatus === "loading"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : imagesStatus === "error"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                )}
              >
                {imagesStatus === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Renderizando imagenes para cada red social...
                  </>
                ) : imagesStatus === "error" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Contenido listo (imagenes no disponibles)
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Contenido generado exitosamente
                  </>
                )}
              </motion.div>
              <p className="text-xs text-slate-400 mt-2">
                {imagesStatus === "loading"
                  ? "Esperando imagenes de OpenAI antes de continuar..."
                  : "Redirigiendo al editor de contenido..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
