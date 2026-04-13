"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Building2,
  FileText,
  CalendarCheck,
  Clock,
  Plus,
  Sparkles,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { usePropertyStore } from "@/store/use-property-store";
import { useAuthStore } from "@/store/use-auth-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    let start: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: "Borrador",
    className: "bg-gray-100 text-gray-700",
  },
  content_generated: {
    label: "Contenido generado",
    className: "bg-blue-100 text-blue-700",
  },
  scheduled: {
    label: "Programada",
    className: "bg-green-100 text-green-700",
  },
  published: {
    label: "Publicada",
    className: "bg-emerald-100 text-emerald-800",
  },
};

/* ------------------------------------------------------------------ */
/*  Stagger animation variants                                         */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

/* ------------------------------------------------------------------ */
/*  Stats card data builder                                            */
/* ------------------------------------------------------------------ */
function useStats() {
  const properties = usePropertyStore((s) => s.properties);

  const total = properties.length;

  const withContent = properties.filter(
    (p) => p.status === "content_generated" || p.status === "scheduled"
  ).length;
  const contentGenerated = withContent * 7;

  const scheduled = properties.filter(
    (p) => p.status === "scheduled"
  ).length;
  const scheduledPosts = scheduled * 5;

  return [
    {
      label: "Propiedades Cargadas",
      value: total,
      suffix: "",
      icon: Building2,
      color: "text-navy",
      bg: "bg-[#1a2332]/10",
    },
    {
      label: "Contenido Generado",
      value: contentGenerated,
      suffix: "",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      label: "Publicaciones Programadas",
      value: scheduledPosts,
      suffix: "",
      icon: CalendarCheck,
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
    {
      label: "Tiempo Ahorrado",
      value: 12.5,
      suffix: " hs",
      icon: Clock,
      color: "text-gold",
      bg: "bg-[#d4a853]/10",
      fixed: true,
    },
  ] as const;
}

/* ------------------------------------------------------------------ */
/*  Stat Card component                                                */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  color,
  bg,
  fixed,
}: {
  label: string;
  value: number;
  suffix: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  fixed?: boolean;
}) {
  const animatedValue = useCountUp(fixed ? 125 : value);

  return (
    <motion.div variants={itemVariants}>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="flex items-center gap-4">
          <div className={`${bg} rounded-xl p-3`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">{label}</p>
            <p className="text-3xl font-bold tracking-tight">
              {fixed
                ? `${(animatedValue / 10).toFixed(1)}${suffix}`
                : `${animatedValue}${suffix}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Currency formatter                                                 */
/* ------------------------------------------------------------------ */
function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const properties = usePropertyStore((s) => s.properties);
  const stats = useStats();

  const firstName = user?.name?.split(" ")[0] ?? "Usuario";

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ---- Welcome Banner ---- */}
      <motion.div variants={itemVariants}>
        <div className="gradient-mesh rounded-2xl border border-border/60 px-8 py-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight lg:text-4xl">
            Bienvenido, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Tu asistente de contenido inmobiliario con IA. Cargá una propiedad y
            generá publicaciones listas para redes en minutos.
          </p>
        </div>
      </motion.div>

      {/* ---- Stats Grid ---- */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </motion.div>

      {/* ---- CTA Button ---- */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <Link href="/dashboard/propiedades/nueva">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-shimmer glow-gold inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-[#1a2332] shadow-lg cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Nueva Propiedad
            <Sparkles className="h-5 w-5" />
          </motion.div>
        </Link>
      </motion.div>

      {/* ---- Recent Properties Table ---- */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Propiedades recientes</span>
              <Link
                href="/dashboard/propiedades"
                className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
              >
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Aún no cargaste propiedades. Empezá creando una nueva.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Propiedad</th>
                      <th className="pb-3 pr-4 font-medium">Ubicación</th>
                      <th className="pb-3 pr-4 font-medium">Precio</th>
                      <th className="pb-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property, idx) => {
                      const status =
                        statusConfig[property.status] ?? statusConfig.draft;

                      return (
                        <motion.tr
                          key={property.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.3 + idx * 0.08,
                            duration: 0.35,
                          }}
                          className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-3 pr-4 font-medium">
                            {property.title}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {property.location}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-medium">
                            {formatPrice(property.price, property.currency)}
                          </td>
                          <td className="py-3">
                            <Badge
                              className={`${status.className} border-0`}
                            >
                              {status.label}
                            </Badge>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
