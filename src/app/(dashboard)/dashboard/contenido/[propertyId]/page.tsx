"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Pencil,
  RefreshCw,
  Globe,
  FileText,
  Smartphone,
  Video,
  Home,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Send,
  Bookmark,
  ArrowRight,
  Clock,
  MoreHorizontal,
  Play,
} from "lucide-react";
import { IconInstagram, IconFacebook, IconLinkedin } from "@/components/icons/brand-icons";
import { useContentStore } from "@/store/use-content-store";
import { usePropertyStore } from "@/store/use-property-store";
import { alternateContent } from "@/data/mock-content";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { GeneratedContent, ContentPlatform } from "@/types/content";

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
/*  Platform tab config                                                 */
/* ------------------------------------------------------------------ */
const platformTabs: {
  platform: ContentPlatform;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { platform: "web_listing", label: "Web", icon: Globe },
  { platform: "blog_article", label: "Blog", icon: FileText },
  { platform: "instagram_carousel", label: "Instagram", icon: IconInstagram },
  { platform: "instagram_story", label: "Story", icon: Smartphone },
  { platform: "facebook_post", label: "Facebook", icon: IconFacebook },
  { platform: "linkedin_post", label: "LinkedIn", icon: IconLinkedin },
  { platform: "tiktok_script", label: "TikTok", icon: Video },
];

/* ------------------------------------------------------------------ */
/*  Actions Bar                                                         */
/* ------------------------------------------------------------------ */
function ActionsBar({
  content,
  propertyId,
  onEdit,
}: {
  content: GeneratedContent;
  propertyId: string;
  onEdit: () => void;
}) {
  const { updateContentStatus, replaceContent } = useContentStore();
  const [regenerating, setRegenerating] = useState(false);

  const handleApprove = () => {
    updateContentStatus(propertyId, content.id, "approved");
    toast.success("Contenido aprobado");
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      const alt = alternateContent[content.platform];
      replaceContent(propertyId, content.id, alt.title, alt.body);
      setRegenerating(false);
      toast.info("Contenido regenerado");
    }, 1000);
  };

  return (
    <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
      {content.status === "approved" ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1.5 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Aprobado
        </span>
      ) : (
        <button
          onClick={handleApprove}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          Aprobar
        </button>
      )}
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <Pencil className="h-4 w-4" />
        Editar
      </button>
      <button
        onClick={handleRegenerate}
        disabled={regenerating}
        className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} />
        {regenerating ? "Regenerando..." : "Regenerar"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Content Card Wrapper                                                */
/* ------------------------------------------------------------------ */
function ContentCardWrapper({
  content,
  propertyId,
  children,
}: {
  content: GeneratedContent;
  propertyId: string;
  children: React.ReactNode;
}) {
  const { updateContentBody } = useContentStore();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content.body);

  const handleSave = () => {
    updateContentBody(propertyId, content.id, editText);
    setEditing(false);
    toast.success("Contenido actualizado");
  };

  const handleCancel = () => {
    setEditText(content.body);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {editing ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-heading text-lg font-semibold text-slate-800">
            Editando contenido
          </h3>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[200px] text-sm"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2332] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a2332]/90 transition-colors cursor-pointer"
            >
              Guardar
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {children}
          <ActionsBar
            content={content}
            propertyId={propertyId}
            onEdit={() => {
              setEditText(content.body);
              setEditing(true);
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Web Listing Tab                                                     */
/* ------------------------------------------------------------------ */
function WebListingContent({
  content,
  property,
}: {
  content: GeneratedContent;
  property: { title: string; price: number; currency: string; sqm: number; bedrooms: number; bathrooms: number; location: string };
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Hero image */}
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-64 flex items-center justify-center overflow-hidden">
        {content.imageUrl ? (
          <Image
            src={content.imageUrl}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 1024px, 100vw"
            unoptimized
          />
        ) : (
          <Home className="h-16 w-16 text-slate-300" />
        )}
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-[#d4a853] text-[#1a2332] px-3 py-1 rounded-full text-sm font-bold">
            Destacada
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Title and price */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-[#1a2332] leading-tight">
            {content.title}
          </h2>
          <span className="text-2xl font-bold text-[#d4a853] whitespace-nowrap">
            {property.currency} {property.price.toLocaleString("es-AR")}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <MapPin className="h-4 w-4" />
          {property.location}
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <Ruler className="h-5 w-5 text-[#d4a853]" />
            <div>
              <p className="text-lg font-bold text-[#1a2332]">{property.sqm}</p>
              <p className="text-xs text-slate-400">m²</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <BedDouble className="h-5 w-5 text-[#d4a853]" />
            <div>
              <p className="text-lg font-bold text-[#1a2332]">{property.bedrooms}</p>
              <p className="text-xs text-slate-400">Dormitorios</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Bath className="h-5 w-5 text-[#d4a853]" />
            <div>
              <p className="text-lg font-bold text-[#1a2332]">{property.bathrooms}</p>
              <p className="text-xs text-slate-400">Banos</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
          {content.body}
        </div>

        {/* CTA */}
        {content.callToAction && (
          <button className="w-full bg-[#1a2332] text-white py-3 rounded-xl font-semibold hover:bg-[#1a2332]/90 transition-colors cursor-pointer">
            {content.callToAction}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Blog Article Tab                                                    */
/* ------------------------------------------------------------------ */
function BlogArticleContent({ content }: { content: GeneratedContent }) {
  const renderBlogBody = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h3 key={i} className="text-xl font-bold text-[#1a2332] mt-6 mb-2">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-[#1a2332] mt-3">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-slate-600 leading-relaxed">
          {line.replace(/\*\*(.*?)\*\*/g, "$1")}
        </p>
      );
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {content.imageUrl && (
        <div className="relative w-full aspect-1200/630 bg-slate-100">
          <Image
            src={content.imageUrl}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 1024px, 100vw"
            unoptimized
          />
        </div>
      )}
      <div className="border-l-4 border-[#d4a853] p-8 space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs font-medium">
              <Clock className="h-3 w-3" />
              5 min de lectura
            </span>
            {content.hashtags && content.hashtags.length > 0 && (
              <span className="text-xs text-[#d4a853] font-medium">
                {content.hashtags[0]}
              </span>
            )}
          </div>
          <h2 className="font-heading text-3xl font-bold text-[#1a2332] leading-tight">
            {content.title}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-8 h-8 rounded-full bg-[#1a2332] flex items-center justify-center">
              <span className="text-white text-xs font-bold">GA</span>
            </div>
            <div>
              <p className="text-slate-600 font-medium">Garcia & Asociados</p>
              <p className="text-slate-400 text-xs">Inmobiliaria Premium</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Body */}
        <div className="prose-sm max-w-none">{renderBlogBody(content.body)}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Instagram Carousel Tab                                              */
/* ------------------------------------------------------------------ */
function InstagramCarouselContent({ content }: { content: GeneratedContent }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = content.slides || [];

  return (
    <div className="flex justify-center">
      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl max-w-sm w-full">
        {/* Instagram chrome - top */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E4405F] to-[#FCAF45] p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-[8px] font-bold text-slate-700">GA</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">garcia_asociados</p>
              <p className="text-[10px] text-slate-400">Patrocinado</p>
            </div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-slate-400" />
        </div>

        {/* Image area */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
          {content.imageUrl ? (
            <Image
              src={content.imageUrl}
              alt={content.title}
              fill
              className="object-cover"
              sizes="400px"
              unoptimized
            />
          ) : (
            <Home className="h-16 w-16 text-slate-300" />
          )}
          {slides[activeSlide] && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 z-10">
              <p className="text-white text-sm font-medium">
                {slides[activeSlide].caption}
              </p>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="h-6 w-6 text-slate-800 cursor-pointer hover:text-red-500 transition-colors" />
              <MessageCircle className="h-6 w-6 text-slate-800 cursor-pointer" />
              <Send className="h-6 w-6 text-slate-800 cursor-pointer" />
            </div>
            <Bookmark className="h-6 w-6 text-slate-800 cursor-pointer" />
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-1.5 py-3">
          {(slides.length > 0 ? slides : [0, 1, 2, 3]).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all cursor-pointer",
                i === activeSlide
                  ? "bg-blue-500 w-2 h-2"
                  : "bg-slate-300"
              )}
            />
          ))}
        </div>

        {/* Caption area */}
        <div className="px-4 pb-4 space-y-1">
          <p className="text-xs text-slate-800">
            <span className="font-semibold">garcia_asociados</span>{" "}
            {content.body.substring(0, 120)}...
          </p>
          {content.hashtags && (
            <p className="text-xs text-blue-500">
              {content.hashtags.slice(0, 5).join(" ")}
            </p>
          )}
          <p className="text-[10px] text-slate-400 pt-1">HACE 2 HORAS</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Instagram Story Tab                                                 */
/* ------------------------------------------------------------------ */
function InstagramStoryContent({
  content,
  property,
}: {
  content: GeneratedContent;
  property: { price: number; currency: string; location: string };
}) {
  return (
    <div className="flex justify-center">
      <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xl max-w-[280px] w-full">
        <div className="relative aspect-[9/16] bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 flex flex-col">
          {/* Story progress bars */}
          <div className="flex gap-1 px-3 pt-3">
            <div className="flex-1 h-0.5 bg-white/80 rounded-full" />
            <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
            <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
          </div>

          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 pt-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833AB4] to-[#E4405F] p-0.5">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">GA</span>
              </div>
            </div>
            <p className="text-white text-xs font-semibold">garcia_asociados</p>
            <p className="text-white/50 text-xs">2h</p>
          </div>

          {/* Background image */}
          {content.imageUrl ? (
            <>
              <Image
                src={content.imageUrl}
                alt={content.title}
                fill
                className="object-cover"
                sizes="280px"
                unoptimized
              />
              <div className="absolute inset-0 bg-linear-to-b from-slate-900/60 via-slate-900/30 to-slate-900/80" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Home className="h-32 w-32 text-white" />
            </div>
          )}

          {/* Content overlay */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 gap-4">
            <span className="bg-[#E4405F] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Nueva Propiedad
            </span>
            <h3 className="text-white text-2xl font-bold text-center leading-tight">
              {property.currency} {property.price.toLocaleString("es-AR")}
            </h3>
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <MapPin className="h-4 w-4" />
              {property.location.split(",")[0]}
            </div>
            <p className="text-white/70 text-xs text-center mt-2 whitespace-pre-line leading-relaxed">
              {content.body}
            </p>
          </div>

          {/* Swipe up indicator */}
          <div className="flex flex-col items-center pb-6 relative z-10 gap-1">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="h-5 w-5 text-white/80 rotate-[-90deg]" />
            </motion.div>
            <span className="text-white/60 text-xs font-medium">Desliza hacia arriba</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Facebook Post Tab                                                   */
/* ------------------------------------------------------------------ */
function FacebookPostContent({ content }: { content: GeneratedContent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">GA</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            Garcia & Asociados Propiedades
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Hace 2 horas</span>
            <span>.</span>
            <Globe className="h-3 w-3" />
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-slate-400" />
      </div>

      {/* Post text */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {content.body}
        </p>
      </div>

      {/* Image */}
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-video flex items-center justify-center overflow-hidden">
        {content.imageUrl ? (
          <Image
            src={content.imageUrl}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 512px, 100vw"
            unoptimized
          />
        ) : (
          <Home className="h-16 w-16 text-slate-300" />
        )}
      </div>

      {/* Reactions bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-1">
          <span className="text-sm">&#128077; &#10084;&#65039; &#128558;</span>
          <span className="text-xs text-slate-500 ml-1">124</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>18 comentarios</span>
          <span>7 compartidos</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        <button className="flex items-center justify-center gap-2 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          <ThumbsUp className="h-4 w-4" />
          Me gusta
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          <MessageCircle className="h-4 w-4" />
          Comentar
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LinkedIn Post Tab                                                   */
/* ------------------------------------------------------------------ */
function LinkedInPostContent({ content }: { content: GeneratedContent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">GA</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            Garcia & Asociados
          </p>
          <p className="text-xs text-slate-500">Broker inmobiliario</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>2h</span>
            <span>.</span>
            <Globe className="h-3 w-3" />
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-slate-400" />
      </div>

      {/* Post text */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {content.body}
        </p>
      </div>

      {/* Image */}
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-video flex items-center justify-center overflow-hidden">
        {content.imageUrl ? (
          <Image
            src={content.imageUrl}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 512px, 100vw"
            unoptimized
          />
        ) : (
          <Home className="h-16 w-16 text-slate-300" />
        )}
      </div>

      {/* Engagement stats */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center text-[8px] text-white">&#128077;</span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">&#10084;</span>
            <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white">&#128079;</span>
          </div>
          <span className="text-xs text-slate-500 ml-1">87</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>12 comentarios</span>
          <span>3 reposteos</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 divide-x divide-slate-100">
        <button className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          <ThumbsUp className="h-4 w-4" />
          Recomendar
        </button>
        <button className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          <MessageCircle className="h-4 w-4" />
          Comentar
        </button>
        <button className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          <Share2 className="h-4 w-4" />
          Repostear
        </button>
        <button className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          <Send className="h-4 w-4" />
          Enviar
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TikTok Script Tab                                                   */
/* ------------------------------------------------------------------ */
function TikTokScriptContent({ content }: { content: GeneratedContent }) {
  const sections = content.scriptSections || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff0050] to-[#00f2ea] flex items-center justify-center">
            <Play className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Guion de Video - 30 seg</h3>
            <p className="text-slate-400 text-xs">{content.title}</p>
          </div>
        </div>
        <Video className="h-5 w-5 text-[#ff0050]" />
      </div>

      {/* Video cover preview */}
      {content.imageUrl && (
        <div className="relative mx-6 mt-6 rounded-xl overflow-hidden border border-slate-700">
          <div className="relative aspect-9/16 max-h-80 mx-auto bg-slate-800">
            <Image
              src={content.imageUrl}
              alt={`${content.title} - cover`}
              fill
              className="object-cover"
              sizes="240px"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <span className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">
                Cover preview
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Script sections */}
      <div className="p-6 space-y-1">
        {sections.map((section, i) => (
          <div key={section.id}>
            <div className="flex gap-4 py-4">
              {/* Timestamp */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 bg-[#ff0050]/20 text-[#ff0050] px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                  <Clock className="h-3 w-3" />
                  {section.timestamp}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <p className="text-slate-400 text-sm italic">
                  {section.instruction}
                </p>
                <p className="text-white font-semibold text-sm">
                  &quot;{section.narration}&quot;
                </p>
              </div>
            </div>

            {/* Scene transition */}
            {i < sections.length - 1 && (
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                  Corte
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00f2ea] animate-pulse" />
            <span className="text-slate-400 text-xs">
              {sections.length} escenas | 30 segundos
            </span>
          </div>
          {content.callToAction && (
            <span className="text-[#00f2ea] text-xs font-medium">
              CTA: {content.callToAction}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function ContentPreviewPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);

  const allContent = useContentStore((s) => s.getContent(propertyId));
  const approvedCount = useContentStore((s) => s.getApprovedCount(propertyId));
  const property = usePropertyStore((s) => s.getProperty(propertyId));

  const getContentForPlatform = (platform: ContentPlatform) =>
    allContent.find((c) => c.platform === platform);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-slate-700">Propiedad no encontrada</h2>
        <p className="text-slate-500 mt-2">Verifica el ID de la propiedad e intenta nuevamente.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 text-[#d4a853] font-medium hover:underline"
        >
          Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 max-w-5xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Step indicator */}
      <StepIndicator currentStep={3} />

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1a2332] lg:text-3xl">
            Vista previa del contenido
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Revisa, edita y aprueba el contenido generado para{" "}
            <span className="font-medium text-slate-700">{property.title}</span>
          </p>
        </div>
        <Badge
          className={cn(
            "text-sm px-3 py-1",
            approvedCount === 7
              ? "bg-emerald-100 text-emerald-700 border-0"
              : "bg-[#d4a853]/10 text-[#d4a853] border-0"
          )}
        >
          {approvedCount} de 7 aprobados
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={0}>
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-slate-100/80 p-1 rounded-xl">
          {platformTabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.platform}
                value={index}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-lg data-active:bg-white data-active:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab panels */}
        {platformTabs.map((tab, index) => {
          const content = getContentForPlatform(tab.platform);
          if (!content) return (
            <TabsContent key={tab.platform} value={index}>
              <div className="py-12 text-center text-slate-400">
                No hay contenido generado para {tab.label}. Vuelve al paso anterior para generarlo.
              </div>
            </TabsContent>
          );

          return (
            <TabsContent key={tab.platform} value={index}>
              <div className="pt-4">
                <ContentCardWrapper content={content} propertyId={propertyId}>
                  {tab.platform === "web_listing" && (
                    <WebListingContent content={content} property={property} />
                  )}
                  {tab.platform === "blog_article" && (
                    <BlogArticleContent content={content} />
                  )}
                  {tab.platform === "instagram_carousel" && (
                    <InstagramCarouselContent content={content} />
                  )}
                  {tab.platform === "instagram_story" && (
                    <InstagramStoryContent content={content} property={property} />
                  )}
                  {tab.platform === "facebook_post" && (
                    <FacebookPostContent content={content} />
                  )}
                  {tab.platform === "linkedin_post" && (
                    <LinkedInPostContent content={content} />
                  )}
                  {tab.platform === "tiktok_script" && (
                    <TikTokScriptContent content={content} />
                  )}
                </ContentCardWrapper>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Bottom CTA */}
      <motion.div
        className="flex justify-center pt-4 pb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Link href={`/dashboard/calendario/${propertyId}`}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold shadow-lg cursor-pointer transition-all",
              approvedCount === 7
                ? "btn-shimmer glow-gold text-[#1a2332]"
                : "bg-[#1a2332] text-white hover:bg-[#1a2332]/90"
            )}
          >
            Continuar al Calendario
            <ArrowRight className="h-5 w-5" />
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
