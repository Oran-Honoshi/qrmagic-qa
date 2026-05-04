"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, PlusCircle, Grid, BarChart2, Settings,
  LogOut, ChevronLeft, ChevronRight, Layers, Zap, Menu, Image
} from "lucide-react";
import { LangSwitcher } from "@/components/LangContext";

const SESSION_KEY = "qrmagic_session";

function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null")
      || JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    // Restore to sessionStorage if found in localStorage
    if (!sessionStorage.getItem(SESSION_KEY) && s) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
    return s;
  }
  catch { return null; }
}

const NAV_ITEMS = [
  { href: "/dashboard",           icon: Home,       label: "Dashboard" },
  { href: "/dashboard/create",    icon: PlusCircle, label: "Create QR" },
  { href: "/dashboard/codes",     icon: Grid,       label: "My Codes" },
  { href: "/dashboard/bulk",      icon: Layers,     label: "Bulk Import" },
  { href: "/dashboard/assets",    icon: Image,      label: "Asset Library" },
  { href: "/dashboard/analytics", icon: BarChart2,  label: "Analytics" },
  { href: "/dashboard/settings",  icon: Settings,   label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Small delay to allow localStorage restore after Paddle redirect
    const session = getSession();

    if (!session?.id) {
      // Check if coming back from Paddle (upgraded=1 in URL)
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgraded")) {
        setTimeout(() => {
          const s2 = getSession();
          if (!s2?.id) router.replace("/auth");
          else { setUser(s2); if (window.innerWidth < 900) setCollapsed(true); }
        }, 500);
      } else {
        router.replace("/auth");
      }
      return;
    }

    setUser(session);
    if (window.innerWidth < 900) setCollapsed(true);

    // Always refresh plan from Supabase — if changed, reload so all pages get fresh session
    import("@supabase/supabase-js").then(({ createClient }) => {
      const db = createClient(
        "https://igbbfjushjmiafohvgdt.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
      );
      // Always look up by email — most reliable since email never changes
      db.from("users").select("id, plan")
        .eq("email", session.email).maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          const planChanged = data.plan !== session.plan;
          const idChanged = data.id !== session.id;
          if (planChanged || idChanged) {
            // Update session with correct id and plan, then reload
            const updated = { ...session, id: data.id, plan: data.plan };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
            window.location.reload();
          }
        });
    });
  }, [router]);

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    router.replace("/auth");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarW = collapsed ? "64px" : "224px";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />

      {/* Sidebar */}
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-all duration-300 bg-white border-r border-slate-200 shadow-sm
          md:translate-x-0 ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
        style={{ width: mobileOpen ? "224px" : sidebarW }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-slate-100 flex-shrink-0">
          <img src="/mascot.png" alt="Sqrly" className="w-7 h-7 object-contain rounded-lg flex-shrink-0" />
          {(!collapsed || mobileOpen) && (
            <span className="text-base font-black tracking-tight text-[#0F172A] whitespace-nowrap">
              Sq<span className="text-[#00D4FF]">r</span>ly
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <button key={href} onClick={() => router.push(href)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left w-full ${
                  active
                    ? "bg-[#00D4FF]/10 text-[#0891B2] border border-[#00D4FF]/20"
                    : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-50"
                }`}
                style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              >
                <Icon size={18} className="flex-shrink-0" strokeWidth={1.5} />
                {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-100 flex flex-col gap-2 flex-shrink-0">
          {!collapsed && (
            <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#00D4FF]/10 border border-[#00FF88]/20 rounded-xl p-3">
              <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-1.5 capitalize">
                {user.plan === "plus" ? "Plus Plan" : user.plan === "basic" ? "Basic Plan" : "Free Plan"}
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full mb-1.5">
                <div className={`h-full rounded-full bg-gradient-to-r from-[#00FF88] to-[#00D4FF] ${
                  user.plan === "plus" ? "w-full" : user.plan === "basic" ? "w-2/3" : "w-0"
                }`} />
              </div>
              <div className="text-[10px] text-[#94A3B8]">
                {user.plan === "plus" ? "100 dynamic codes" : user.plan === "basic" ? "10 dynamic codes" : "1 dynamic code"}
              </div>
            </div>
          )}

          {user.plan !== "plus" && (
            <button onClick={() => router.push("/pricing")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)] ${
                (user as any).subscription_status === "trialing"
                  ? "bg-[#00FF88] text-[#0F172A] hover:bg-[#00CC6E] animate-pulse"
                  : "bg-[#00FF88] text-[#0F172A] hover:bg-[#00CC6E]"
              } ${collapsed ? "px-0" : "px-3"}`}>
              {!collapsed && <>
                <Zap size={13} />
                {(user as any).subscription_status === "trialing"
                  ? "Purchase Now"
                  : user.plan === "basic" ? "Upgrade to Plus" : "Upgrade"}
              </>}
              {collapsed && <Zap size={15} />}
            </button>
          )}

          <button onClick={logout}
            title={collapsed ? "Log Out" : undefined}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#94A3B8] hover:text-[#475569] hover:bg-slate-50 transition-all w-full"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
            <LogOut size={15} className="flex-shrink-0" strokeWidth={1.5} />
            {!collapsed && <span className="text-xs font-medium">Log Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-colors shadow-sm z-10">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col min-h-screen transition-all duration-300 ml-0 md:ml-[var(--sidebar-w)]"
        style={{ "--sidebar-w": sidebarW } as React.CSSProperties}>
        {/* Top bar */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-xl sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#475569] hover:bg-slate-100 transition-colors">
              <Menu size={18} strokeWidth={1.5} />
            </button>
            <h1 className="text-sm font-bold text-[#0F172A]">
              {NAV_ITEMS.find(n => pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher compact />
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-[#0F172A]">{user.name || "User"}</div>
              <div className="text-[10px] text-[#94A3B8]">{user.email}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FF88] to-[#00D4FF] flex items-center justify-center text-[#0F172A] text-sm font-black shadow-sm">
              {(user.name || "U")[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}