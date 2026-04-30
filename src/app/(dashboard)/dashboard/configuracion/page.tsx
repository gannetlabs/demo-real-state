"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyStore } from "@/store/use-property-store";
import { useContentStore } from "@/store/use-content-store";
import { useCalendarStore } from "@/store/use-calendar-store";
import type { ResetDemoResponse } from "@/app/api/reset-demo/route";

type Phase =
  | { kind: "idle" }
  | { kind: "confirming" }
  | { kind: "loading" }
  | { kind: "success"; result: ResetDemoResponse }
  | { kind: "error"; message: string };

export default function ConfiguracionPage() {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  async function handleConfirm() {
    setPhase({ kind: "loading" });
    try {
      const res = await fetch("/api/reset-demo", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const result = (await res.json()) as ResetDemoResponse;

      usePropertyStore.getState().reset();
      useContentStore.getState().reset();
      useCalendarStore.getState().reset();

      setPhase({ kind: "success", result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setPhase({ kind: "error", message });
    }
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight lg:text-4xl">
          Configuración
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ajustes de la demo. Esta sección es para uso interno durante presentaciones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Restaura las 3 propiedades de ejemplo (Puerto Madero, Nordelta, Palermo) y elimina
            las propiedades, contenidos y calendarios creados durante esta sesión de demo.
            También limpia el bucket de imágenes generadas en Supabase Storage, conservando
            únicamente el último set completo para reutilizar en futuras demos sin gastar
            tokens de OpenAI.
          </p>

          {phase.kind === "idle" && (
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setPhase({ kind: "confirming" })}
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar datos de demo
            </Button>
          )}

          {phase.kind === "confirming" && (
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Esta acción no se puede deshacer. ¿Confirmás el reset?</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" onClick={() => setPhase({ kind: "idle" })}>
                  Cancelar
                </Button>
                <Button variant="destructive" size="lg" onClick={handleConfirm}>
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {phase.kind === "loading" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Limpiando datos…
            </div>
          )}

          {phase.kind === "success" && (
            <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-2 text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Datos restaurados</p>
                  <p>
                    {phase.result.deleted > 0
                      ? `Se eliminaron ${phase.result.deleted} archivos del bucket.`
                      : "El bucket ya estaba limpio."}
                    {phase.result.kept ? ` Set conservado: ${phase.result.kept}.` : ""}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
              >
                Volver al dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {phase.kind === "error" && (
            <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">No se pudo limpiar el storage</p>
                  <p className="font-mono text-xs">{phase.message}</p>
                  <p>El estado del navegador no se modificó.</p>
                </div>
              </div>
              <Button variant="outline" size="lg" onClick={() => setPhase({ kind: "idle" })}>
                Reintentar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
