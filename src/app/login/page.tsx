"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Building2, Sparkles, ArrowRight, Zap, BarChart3, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("martin@garciaasociados.com");
  const [password, setPassword] = useState("demo2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Completá todos los campos");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login(email, password);
    router.push("/dashboard");
  };

  const features = [
    { icon: Zap, text: "Generación automática de contenido con IA" },
    { icon: Share2, text: "Publicación multicanal desde un solo lugar" },
    { icon: BarChart3, text: "Calendario inteligente de publicaciones" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <motion.div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(135deg, #1a2332 0%, #243447 40%, #1a2332 100%)",
        }}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#d4a853]/10 blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-[#2dd4bf]/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5" />
        </div>

        {/* Logo */}
        <motion.div
          className="relative z-10 flex items-center gap-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-lg bg-[#d4a853] flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[#1a2332]" />
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">PropIA</span>
        </motion.div>

        {/* Hero text */}
        <div className="relative z-10 max-w-lg">
          <motion.h1
            className="font-heading text-5xl leading-tight text-white mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Inteligencia Artificial
            <br />
            <span className="text-[#d4a853]">para tu Inmobiliaria</span>
          </motion.h1>
          <motion.p
            className="text-slate-400 text-lg leading-relaxed mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Cargá una propiedad, generá contenido para todos tus canales y
            programá publicaciones. Todo desde un solo lugar.
          </motion.p>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              >
                <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-[#d4a853]" />
                </div>
                <span className="text-slate-300 text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <motion.p
          className="relative z-10 text-slate-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Ahorrá hasta 12 horas semanales en creación de contenido
        </motion.p>
      </motion.div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          className="w-full max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#d4a853] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#1a2332]" />
            </div>
            <span className="text-xl font-semibold tracking-tight">PropIA</span>
          </div>

          <h2
            className="text-2xl font-semibold text-[#1a2332] mb-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Bienvenido
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Ingresá a tu cuenta para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@inmobiliaria.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#d4a853] focus:ring-[#d4a853]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#d4a853] focus:ring-[#d4a853]/20 transition-all"
              />
            </div>

            {error && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#1a2332] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#243447] transition-colors disabled:opacity-70"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>Potenciado por inteligencia artificial</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
