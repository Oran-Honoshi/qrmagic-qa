"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, PlusCircle, Grid, BarChart2, Settings, LogOut, ChevronLeft, ChevronRight, Layers
} from "lucide-react";

const SESSION_KEY = "qrmagic_session";

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}

const NAV_ITEMS = [
  { href: "/dashboard",            icon: Home,       label: "Dashboard" },
  { href: "/dashboard/create",     icon: PlusCircle, label: "Create QR" },
  { href: "/dashboard/codes",      icon: Grid,       label: "My Codes" },
  { href: "/dashboard/bulk",       icon: Layers,     label: "Bulk Import" },
  { href: "/dashboard/analytics",  icon: BarChart2,  label: "Analytics" },
  { href: "/dashboard/settings",   icon: Settings,   label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session?.id) { router.replace("/auth"); return; }
    setUser(session);
    // Collapse sidebar on mobile by default
    if (window.innerWidth < 900) setCollapsed(true);
  }, [router]);

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    router.replace("/auth");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[rgba(6,182,212,0.2)] border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarW = collapsed ? "64px" : "220px";

  return (
    <div className="min-h-screen bg-[#0A0E14] flex">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none z-0" />

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-all duration-300"
        style={{
          width: sidebarW,
          background: "#0F1520",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-[rgba(255,255,255,0.07)] flex-shrink-0">
          <img
            src="/mascot.png"
            alt="QR Magic"
            className="w-7 h-7 object-contain rounded-md flex-shrink-0"
          />
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-[#F0F4F8] whitespace-nowrap">
              <span className="text-[#06B6D4]">QR</span> Magic
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left w-full ${
                  active
                    ? "bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] text-[#06B6D4]"
                    : "text-[#4A5568] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
                style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              >
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          className="p-3 border-t border-[rgba(255,255,255,0.07)] flex flex-col gap-2 flex-shrink-0"
        >
          {/* Plan badge */}
          {!collapsed && (
            <div className="bg-[rgba(6,182,212,0.07)] border border-[rgba(6,182,212,0.15)] rounded-lg p-2.5">
              <div className="text-[10px] font-semibold text-[#4A5568] uppercase tracking-wider mb-1.5">
                Free Plan
              </div>
              <div className="h-1 bg-[rgba(255,255,255,0.06)] rounded-full mb-1.5">
                <div className="h-full w-0 bg-[#06B6D4] rounded-full" />
              </div>
              <div className="text-[10px] text-[#4A5568]">0/1 dynamic used</div>
            </div>
          )}

          {/* Upgrade */}
          <button
            onClick={() => router.push("/#pricing")}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg bg-[#06B6D4] text-[#0A0E14] text-xs font-bold transition-all hover:bg-[#22D3EE] ${
              collapsed ? "px-0" : "px-3"
            }`}
          >
            {collapsed ? "↑" : "Upgrade Plan"}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            title={collapsed ? "Log Out" : undefined}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#4A5568] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)] transition-all w-full"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <LogOut size={15} className="flex-shrink-0" />
            {!collapsed && <span className="text-xs font-medium">Log Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1A2436] border border-[rgba(255,255,255,0.1)] rounded-full flex items-center justify-center text-[#4A5568] hover:text-[#06B6D4] transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <main
        className="relative z-10 flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarW }}
      >
        {/* Top bar */}
        <header className="h-16 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between px-6 bg-[rgba(10,14,20,0.8)] backdrop-blur-xl sticky top-0 z-40 flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-[#F0F4F8]">
              {NAV_ITEMS.find((n) => pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[#F0F4F8]">
                {user.name || "User"}
              </div>
              <div className="text-[10px] text-[#4A5568]">{user.email}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center text-[#06B6D4] text-sm font-bold">
              {(user.name || "U")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}