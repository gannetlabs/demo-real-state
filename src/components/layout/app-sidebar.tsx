"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Building2,
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { usePropertyStore } from "@/store/use-property-store";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const properties = usePropertyStore((s) => s.properties);

  const calendarPropertyId =
    properties.find((p) => p.status === "scheduled" || p.status === "content_generated")?.id ||
    properties[0]?.id;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, disabled: false },
    { href: "/dashboard/propiedades/nueva", label: "Nueva Propiedad", icon: Building2, disabled: false },
    {
      href: calendarPropertyId ? `/dashboard/calendario/${calendarPropertyId}` : "#",
      label: "Calendario",
      icon: Calendar,
      disabled: !calendarPropertyId,
    },
    { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, disabled: false },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-[260px] flex-shrink-0 bg-[#1a2332] flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#d4a853] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#1a2332]" />
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">PropIA</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10 mb-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            !item.disabled &&
            item.href !== "#" &&
            (pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href)));
          const active = isActive;

          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                active
                  ? "bg-[#d4a853]/15 text-[#d4a853]"
                  : item.disabled
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#d4a853]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {!item.disabled && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#d4a853]/20 flex items-center justify-center text-[#d4a853] text-sm font-semibold">
            {user?.name?.split(" ").map((n) => n[0]).join("") || "MG"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{user?.name || "Usuario"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.agency || ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
