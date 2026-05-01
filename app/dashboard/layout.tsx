"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, PlusCircle, Grid, BarChart2, Settings,
  LogOut, ChevronLeft, ChevronRight, Layers, Zap, Menu, Image
} from "lucide-react";

const SESSION_KEY = "qrmagic_session";

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
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
    const session = getSession();
    if (!session?.id) { router.replace("/auth"); return; }
    setUser(session);
    if (window.innerWidth < 900) setCollapsed(true);
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
              <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">Free Plan</div>
              <div className="h-1.5 bg-slate-100 rounded-full mb-1.5">
                <div className="h-full w-0 bg-gradient-to-r from-[#00FF88] to-[#00D4FF] rounded-full" />
              </div>
              <div className="text-[10px] text-[#94A3B8]">0/1 dynamic used</div>
            </div>
          )}

          <button onClick={() => router.push("/pricing")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#00FF88] text-[#0F172A] text-xs font-bold hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)] ${collapsed ? "px-0" : "px-3"}`}>
            {!collapsed && <><Zap size={13} /> Upgrade</>}
            {collapsed && <Zap size={15} />}
          </button>

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