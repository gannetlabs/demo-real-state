"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Camera,
  X,
  MapPin,
  Sparkles,
  Upload,
  Home,
  DollarSign,
  Ruler,
  BedDouble,
  Bath,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePropertyStore } from "@/store/use-property-store";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LocalPhoto {
  id: string;
  url: string;
  file: File;
}

interface FormData {
  title: string;
  location: string;
  price: string;
  sqm: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
}

interface FormErrors {
  title?: string;
  location?: string;
  price?: string;
  sqm?: string;
  bedrooms?: string;
  bathrooms?: string;
  description?: string;
  photos?: string;
}

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
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
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function validateForm(data: FormData, photos: LocalPhoto[]): FormErrors {
  const errors: FormErrors = {};

  if (!data.title.trim()) errors.title = "El titulo es obligatorio";
  if (!data.location.trim()) errors.location = "La ubicacion es obligatoria";
  if (!data.description.trim()) errors.description = "La descripcion es obligatoria";

  const price = Number(data.price);
  if (!data.price || isNaN(price) || price <= 0) {
    errors.price = "Ingresa un precio valido mayor a 0";
  }

  const sqm = Number(data.sqm);
  if (!data.sqm || isNaN(sqm) || sqm <= 0) {
    errors.sqm = "Ingresa una superficie valida mayor a 0";
  }

  const bedrooms = Number(data.bedrooms);
  if (!data.bedrooms || isNaN(bedrooms) || bedrooms < 1 || bedrooms > 10) {
    errors.bedrooms = "Entre 1 y 10 dormitorios";
  }

  const bathrooms = Number(data.bathrooms);
  if (!data.bathrooms || isNaN(bathrooms) || bathrooms < 1 || bathrooms > 6) {
    errors.bathrooms = "Entre 1 y 6 banos";
  }

  if (photos.length === 0) errors.photos = "Agrega al menos una foto";

  return errors;
}

function isFormValid(data: FormData, photos: LocalPhoto[]): boolean {
  return Object.keys(validateForm(data, photos)).length === 0;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function NuevaPropiedad() {
  const router = useRouter();
  const addProperty = usePropertyStore((s) => s.addProperty);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    location: "",
    price: "",
    sqm: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
  });

  const errors = submitted ? validateForm(formData, photos) : {};
  const valid = isFormValid(formData, photos);

  /* ---- Field update helper ---- */
  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /* ---- Photo handlers ---- */
  const addPhotos = useCallback((files: FileList | File[]) => {
    const newPhotos: LocalPhoto[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        url: URL.createObjectURL(file),
        file,
      }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addPhotos(e.target.files);
      }
      // Reset so re-selecting same file triggers change
      e.target.value = "";
    },
    [addPhotos]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addPhotos(e.dataTransfer.files);
      }
    },
    [addPhotos]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);

      if (!isFormValid(formData, photos)) return;

      setIsSubmitting(true);

      const propertyId = addProperty({
        title: formData.title.trim(),
        location: formData.location.trim(),
        price: Number(formData.price),
        currency: "USD",
        sqm: Number(formData.sqm),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        description: formData.description.trim(),
        photos: photos.map((p, idx) => ({
          id: p.id,
          url: p.url,
          alt: `${formData.title.trim()} - Foto ${idx + 1}`,
          order: idx,
        })),
      });

      router.push(`/dashboard/generar/${propertyId}`);
    },
    [formData, photos, addProperty, router]
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <StepIndicator currentStep={1} />

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1a2332] flex items-center gap-2">
            <Home className="h-6 w-6 text-[#d4a853]" />
            Nueva Propiedad
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Completa los datos de la propiedad para generar contenido con IA.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ---- Photo Dropzone ---- */}
          <div className="mb-8">
            <Label className="mb-2 text-sm font-semibold text-[#1a2332]">
              <Camera className="h-4 w-4" />
              Fotos de la propiedad
            </Label>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative mt-2 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200",
                isDragOver
                  ? "border-[#d4a853] bg-[#d4a853]/5"
                  : "border-slate-300 bg-slate-50 hover:border-[#d4a853] hover:bg-[#d4a853]/5",
                errors.photos && "border-red-400 bg-red-50/50"
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d4a853]/10">
                <Upload className="h-6 w-6 text-[#d4a853]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  Arrastra fotos o hace clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG o WebP
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {errors.photos && (
              <p className="mt-1.5 text-xs text-red-500">{errors.photos}</p>
            )}

            {/* Photo Previews */}
            {photos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 grid grid-cols-4 gap-3"
              >
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative aspect-square overflow-hidden rounded-lg shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                      }}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* ---- Form Fields ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Titulo - full width */}
            <div className="md:col-span-2">
              <Label htmlFor="title" className="mb-1.5 text-sm font-semibold text-[#1a2332]">
                <Home className="h-4 w-4" />
                Titulo
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Ej: Departamento 3 ambientes en Palermo"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
                className={cn(
                  "h-11 bg-slate-50 focus:border-[#d4a853] focus:ring-[#d4a853]/20",
                  errors.title && "border-red-400"
                )}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Ubicacion */}
            <div>
              <Label htmlFor="location" className="mb-1.5 text-sm font-semibold text-[#1a2332]">
                <MapPin className="h-4 w-4" />
                Ubicacion
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="Ej: Palermo, CABA"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                required
                className={cn(
                  "h-11 bg-slate-50 focus:border-[#d4a853] focus:ring-[#d4a853]/20",
                  errors.location && "border-red-400"
                )}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Precio */}
            <div>
              <Label htmlFor="price" className="mb-1.5 text-sm font-semibold text-[#1a2332]">
                <DollarSign className="h-4 w-4" />
                Precio
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
                  USD
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="150000"
                  min={1}
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                  className={cn(
                    "h-11 bg-slate-50 pl-12 focus:border-[#d4a853] focus:ring-[#d4a853]/20",
                    errors.price && "border-red-400"
                  )}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Superficie */}
            <div>
              <Label htmlFor="sqm" className="mb-1.5 text-sm font-semibold text-[#1a2332]">
                <Ruler className="h-4 w-4" />
                Superficie m2
              </Label>
              <div className="relative">
                <Input
                  id="sqm"
                  type="number"
                  placeholder="85"
                  min={1}
                  value={formData.sqm}
                  onChange={(e) => updateField("sqm", e.target.value)}
                  required
                  className={cn(
                    "h-11 bg-slate-50 pr-10 focus:border-[#d4a853] focus:ring-[#d4a853]/20",
                    errors.sqm && "border-red-400"
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
                  m2
                </span>
              </div>
              {errors.sqm && (
                <p className="mt-1 text-xs text-red-500">{errors.sqm}</p>
              )}
            </div>

            {/* Dormitorios */}
            <div>
              <Label htmlFor="bedrooms" className="mb-1.5 text-sm font-semibold text-[#1a2332]">
                <BedDouble className="h-4 w-4" />
                Dormitorios
              </Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="3"
                min={1}
                max={10}
                value={formData.bedrooms}
                onChange={(e) => updateField("bedrooms", e.target.value)}
                required
                className={cn(
                  "h-11 bg-slate-50 focus:border-[#d4a853] focus:ring-[#d4a853]/20",
                  errors.bedrooms && "border-red-400"
                )}
              />
              {errors.bedrooms && (
                <p className="mt-1 text-xs text-red-500">{errors.bedrooms}</p>
              )}
            </div>

            {/* Banos */}
            <div>
              <Label htmlFor="bathrooms" className="mb-1.5 text-sm font-semibold text-[#1a2332]">
                <Bath className="h-4 w-4" />
                Banos
              </Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="2"
                min={1}
                max={6}
                value={formData.bathrooms}
                onChange={(e) => updateField("bathrooms", e.target.value)}
                required
                className={cn(
                  "h-11 bg-slate-50 focus:border-[#d4a853] focus:ring-[#d4a853]/20",
                  errors.bathrooms && "border-red-400"
                )}
              />
              {errors.bathrooms && (
                <p className="mt-1 text-xs text-red-500">{errors.bathrooms}</p>
              )}
            </div>

            {/* Descripcion - full width */}
            <div className="md:col-span-2">
              <Label htmlFor="description" className="mb-1.5 text-sm font-semibold text-[#1a2332]">
                Descripcion
              </Label>
              <Textarea
                id="description"
                placeholder="Describe la propiedad: caracteristicas principales, estado, amenities, etc."
                rows={4}
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
                className={cn(
                  "bg-slate-50 focus:border-[#d4a853] focus:ring-[#d4a853]/20 resize-none",
                  errors.description && "border-red-400"
                )}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>
          </div>

          {/* ---- Submit Button ---- */}
          <div className="mt-8 flex justify-end">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={valid && !isSubmitting ? { scale: 1.02 } : {}}
              whileTap={valid && !isSubmitting ? { scale: 0.98 } : {}}
              className={cn(
                "inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-200",
                valid
                  ? "btn-shimmer text-[#1a2332] shadow-lg hover:shadow-xl cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a2332]/30 border-t-[#1a2332]" />
                  Procesando...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generar Contenido con IA
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
