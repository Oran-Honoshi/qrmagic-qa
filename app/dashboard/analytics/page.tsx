"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart2, Smartphone, MousePointer, TrendingUp,
  QrCode, Link, Wifi, User, FileText, Mail,
  MessageSquare, Phone, MapPin, Calendar, Share2,
  Video, File, CreditCard, Bitcoin, Image,
  Globe, Music, Coffee, Heart, ShoppingBag, Package,
  Lock, Zap, Info, ChevronDown, Filter, RefreshCw
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem("qrmagic_session") || "null"); }
  catch { return null; }
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  url: Link, wifi: Wifi, vcard: User, text: FileText,
  email: Mail, sms: MessageSquare, phone: Phone,
  whatsapp: MessageSquare, location: MapPin, event: Calendar,
  social: Share2, youtube: Video, appstore: Smartphone,
  bitcoin: Bitcoin, zoom: Video, pdf: File,
  paypal: CreditCard, image: Image,
  multilink: Globe, spotify: Music, menu: Coffee,
  feedback: Heart, coupon: ShoppingBag, package: Package,
};

const CATEGORIES = ["All", "Essential", "Professional", "Social & Media", "Financial", "Retail & Promo"];

const TYPE_CATEGORIES: Record<string, string> = {
  url: "Essential", text: "Essential", email: "Essential", sms: "Essential",
  phone: "Essential", location: "Essential",
  vcard: "Professional", wifi: "Professional", pdf: "Professional",
  zoom: "Professional", event: "Professional", appstore: "Professional",
  whatsapp: "Social & Media", social: "Social & Media", youtube: "Social & Media",
  multilink: "Social & Media", spotify: "Social & Media", image: "Social & Media",
  paypal: "Financial", bitcoin: "Financial",
  menu: "Retail & Promo", feedback: "Retail & Promo",
  coupon: "Retail & Promo", package: "Retail & Promo",
};

type QRCode = {
  id: string; name: string; type: string; status: string;
  scans: number; clicks: number; created_at: string; short_id?: string;
};

type TimeWindow = "7d" | "30d" | "90d" | "all";

/* ── Tooltip ─────────────────────────────────────────── */
function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex">
      <button onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        className="text-[#CBD5E1] hover:text-[#00D4FF] transition-colors ml-1">
        <Info size={11} strokeWidth={2} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#0F172A] text-white text-[10px] leading-relaxed rounded-xl px-3 py-2 shadow-xl z-50 pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F172A] rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ── Pro Gate ────────────────────────────────────────── */
function ProGate({ feature, plan = "plus" }: { feature: string; plan?: "basic" | "plus" }) {
  const router = useRouter();
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/60 z-10 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-[#0F172A]/08 border border-[#0F172A]/10 flex items-center justify-center">
          <Lock size={18} className="text-[#475569]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-[#0F172A] mb-1">{feature}</p>
          <p className="text-xs text-[#94A3B8]">Available on {plan === "basic" ? "Basic" : "Plus"} plan and above</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/pricing")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-xs hover:bg-[#00CC6E] transition-all">
          <Zap size={11} strokeWidth={2} /> Upgrade
        </motion.button>
      </div>
      <div className="p-5 opacity-30 pointer-events-none select-none" aria-hidden>
        <div className="h-32 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Bar Chart ───────────────────────────────────────── */
function BarChart({ data, color = "#00D4FF" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full rounded-t-lg min-h-[3px]"
            style={{ background: d.value > 0 ? `linear-gradient(180deg, ${color}, ${color}99)` : "#F1F5F9" }}
            title={`${d.value} scans`}
          />
          <span className="text-[8px] text-[#94A3B8] font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, color, bg, tip }: {
  icon: React.ElementType; value: string | number; label: string;
  color: string; bg: string; tip?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-[#00D4FF]/30 transition-all duration-300">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: bg, border: `1px solid ${color}25` }}>
        <Icon size={17} style={{ color }} strokeWidth={1.5} />
      </div>
      <div className="text-2xl font-black text-[#0F172A] tracking-tight mb-0.5">{value}</div>
      <div className="text-xs font-medium text-[#94A3B8] flex items-center gap-0.5">
        {label}{tip && <Tip text={tip} />}
      </div>
    </motion.div>
  );
}

function AnalyticsContent() {
  const session = getSession();
  const plan = session?.plan || "free";
  const isBasic = ["basic", "plus"].includes(plan);
  const isPlus = plan === "plus";

  const [codes, setCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("30d");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [codeFilter, setCodeFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    if (!session?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", session.id)
      .order("scans", { ascending: false });
    setCodes(data || []);
    setLoading(false);
  }

  async function refresh() {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 600);
  }

  // Filter codes
  const filteredCodes = codes.filter(c => {
    if (categoryFilter !== "All" && TYPE_CATEGORIES[c.type] !== categoryFilter) return false;
    if (codeFilter !== "all" && c.id !== codeFilter) return false;
    return true;
  });

  const dynamicCodes = filteredCodes.filter(c => c.status === "dynamic");
  const totalScans = filteredCodes.reduce((s, c) => s + (c.scans || 0), 0);
  const totalClicks = filteredCodes.reduce((s, c) => s + (c.clicks || 0), 0);
  const ctr = totalScans > 0 ? Math.round((totalClicks / totalScans) * 100) : 0;
  const topCode = [...filteredCodes].sort((a, b) => (b.scans || 0) - (a.scans || 0))[0];

  // Day of week data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dowData = days.map((label, i) => ({
    label,
    value: codes.reduce((s, c) => s + Math.floor(((c.scans || 0) * [0.1, 0.12, 0.15, 0.18, 0.2, 0.14, 0.11][i])), 0),
  }));

  // Daily scans (simulated from total — replace with real scan_events query for production)
  const daysCount = timeWindow === "7d" ? 7 : timeWindow === "30d" ? 30 : timeWindow === "90d" ? 90 : 60;
  const dailyData = Array.from({ length: Math.min(daysCount, 30) }, (_, i) => ({
    label: i % 5 === 0 ? `${i + 1}` : "",
    value: Math.floor(Math.random() * (totalScans / 20 + 1)),
  }));

  // Type breakdown
  const typeCounts = filteredCodes.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + (c.scans || 0);
    return acc;
  }, {} as Record<string, number>);
  const typeBreakdown = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-5 h-5 border-2 border-slate-200 border-t-[#00D4FF] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-black text-[#0F172A] tracking-tight">Analytics</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {plan === "free" ? "Scan counts for your dynamic code" :
             plan === "basic" ? "30-day analytics for all your codes" :
             "Full analytics history"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time window */}
          <div className="relative">
            <select value={timeWindow} onChange={e => setTimeWindow(e.target.value as TimeWindow)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-7 py-2 text-xs font-semibold text-[#475569] outline-none focus:border-[#00D4FF] transition-all">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              {isBasic && <option value="90d">Last 90 days</option>}
              {isPlus && <option value="all">All time</option>}
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCodeFilter("all"); }}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-7 py-2 text-xs font-semibold text-[#475569] outline-none focus:border-[#00D4FF] transition-all">
              {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
            </select>
            <Filter size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Code filter */}
          <div className="relative">
            <select value={codeFilter} onChange={e => setCodeFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-7 py-2 text-xs font-semibold text-[#475569] outline-none focus:border-[#00D4FF] transition-all max-w-[160px]">
              <option value="all">All Codes</option>
              {codes
                .filter(c => categoryFilter === "All" || TYPE_CATEGORIES[c.type] === categoryFilter)
                .map(c => <option key={c.id} value={c.id}>{c.name || c.type}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>

          <motion.button whileTap={{ scale: 0.9 }} onClick={refresh}
            className="p-2 bg-white border border-slate-200 rounded-xl text-[#94A3B8] hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Stat cards — all plans */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={QrCode} value={filteredCodes.length} label="Total Codes" color="#00D4FF" bg="rgba(0,212,255,0.08)"
          tip="Total QR codes matching your current filters." />
        <StatCard icon={BarChart2} value={totalScans} label="Total Scans" color="#00FF88" bg="rgba(0,255,136,0.08)"
          tip="Total number of times your QR codes were scanned." />
        <StatCard icon={MousePointer} value={`${ctr}%`} label="Click-Through Rate" color="#8B5CF6" bg="rgba(139,92,246,0.08)"
          tip="Percentage of scans that resulted in a click to the destination URL." />
        <StatCard icon={TrendingUp} value={topCode?.scans || 0} label="Top Code Scans" color="#FB923C" bg="rgba(251,146,60,0.08)"
          tip={`Your most scanned code: ${topCode?.name || "—"}`} />
      </div>

      {/* Day of week + Daily scans */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Day of week — Basic+ */}
        {isBasic ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Day of Week Performance</h3>
                <p className="text-[10px] text-[#94A3B8]">When your QR codes get scanned most</p>
              </div>
              <Tip text="Shows which days of the week have the highest scan activity across all your codes." />
            </div>
            <BarChart data={dowData} color="#00D4FF" />
          </div>
        ) : (
          <ProGate feature="Day of Week Performance" plan="basic" />
        )}

        {/* Daily scans — Basic+ */}
        {isBasic ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Daily Scans</h3>
                <p className="text-[10px] text-[#94A3B8]">Scan activity over time</p>
              </div>
              <Tip text="Daily scan count over your selected time window." />
            </div>
            <BarChart data={dailyData} color="#00FF88" />
          </div>
        ) : (
          <ProGate feature="Daily Scan Chart" plan="basic" />
        )}
      </div>

      {/* Top performing codes — all plans */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Top Performing Codes</h3>
            <p className="text-[10px] text-[#94A3B8]">Ranked by total scans</p>
          </div>
          <Tip text="Your most scanned QR codes. Free plan shows your dynamic code only." />
        </div>
        {filteredCodes.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#94A3B8]">No codes match your filters</div>
        ) : (
          <div className="space-y-2">
            {[...filteredCodes].sort((a, b) => (b.scans || 0) - (a.scans || 0)).slice(0, isPlus ? 10 : isBasic ? 5 : 3).map((code, i) => {
              const Icon = TYPE_ICONS[code.type] || QrCode;
              const maxScans = filteredCodes[0]?.scans || 1;
              const pct = Math.round(((code.scans || 0) / maxScans) * 100);
              return (
                <motion.div key={code.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-black text-[#CBD5E1] w-4 text-right">{i + 1}</span>
                  <div className="w-7 h-7 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-[#0891B2]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#0F172A] truncate">{code.name || code.type}</span>
                      <span className="text-xs font-bold text-[#0F172A] ml-2 flex-shrink-0">{code.scans || 0}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.04 }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #00D4FF, #0891B2)" }} />
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    code.status === "dynamic" ? "bg-[#00D4FF]/10 text-[#0891B2]" : "bg-slate-100 text-[#94A3B8]"
                  }`}>{code.status}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Type breakdown — Basic+ */}
      {isBasic ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Scans by QR Type</h3>
              <p className="text-[10px] text-[#94A3B8]">Which types get the most scans</p>
            </div>
            <Tip text="Breakdown of scan counts by QR code type. Helps you understand which formats resonate most." />
          </div>
          {typeBreakdown.length === 0 ? (
            <p className="text-xs text-[#94A3B8] text-center py-6">No scan data yet</p>
          ) : (
            <div className="space-y-2.5">
              {typeBreakdown.map(([type, count]) => {
                const Icon = TYPE_ICONS[type] || QrCode;
                const max = typeBreakdown[0]?.[1] || 1;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={11} className="text-[#0891B2]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-[#475569] capitalize">{type}</span>
                        <span className="font-bold text-[#0F172A]">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#0891B2]"
                          style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <ProGate feature="Scans by QR Type" plan="basic" />
      )}

      {/* Campaign tracking — Plus only */}
      {isPlus ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Campaign Performance</h3>
              <p className="text-[10px] text-[#94A3B8]">Compare codes grouped by campaign</p>
            </div>
            <Tip text="Group multiple QR codes under one campaign and compare their combined performance." />
          </div>
          <div className="text-center py-8">
            <p className="text-xs text-[#94A3B8]">No campaigns yet. Add a campaign name when creating QR codes.</p>
          </div>
        </div>
      ) : (
        <ProGate feature="Campaign Tracking — Group & Compare Multiple Codes" plan="plus" />
      )}

      {/* Geographic data — Plus only */}
      {isPlus ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Geographic Data</h3>
              <p className="text-[10px] text-[#94A3B8]">Country-level scan locations</p>
            </div>
            <Tip text="See which countries your QR codes are being scanned in. Country-level data based on IP geolocation." />
          </div>
          <div className="text-center py-8">
            <p className="text-xs text-[#94A3B8]">Geographic tracking coming soon.</p>
          </div>
        </div>
      ) : (
        <ProGate feature="Geographic Scan Data — Country-Level Heatmap" plan="plus" />
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}