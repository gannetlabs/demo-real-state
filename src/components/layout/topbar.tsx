"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

const pathNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/propiedades/nueva": "Nueva Propiedad",
};

export function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const getPageTitle = () => {
    if (pathNames[pathname]) return pathNames[pathname];
    if (pathname.includes("/generar/")) return "Generando Contenido";
    if (pathname.includes("/contenido/")) return "Preview de Contenido";
    if (pathname.includes("/calendario/")) return "Calendario de Publicaciones";
    if (pathname.includes("/confirmacion/")) return "Confirmación";
    return "Dashboard";
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-[#1a2332]">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d4a853] rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1a2332] flex items-center justify-center text-white text-xs font-semibold">
            {user?.name?.split(" ").map((n) => n[0]).join("") || "MG"}
          </div>
        </div>
      </div>
    </header>
  );
}
