"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart2, Smartphone, MousePointer, TrendingUp,
  QrCode, Link, Wifi, User, FileText, Mail,
  MessageSquare, Phone, MapPin, Calendar, Share2,
  Video, File, CreditCard, Bitcoin, Image,
  Globe, Clock, RefreshCw, Megaphone, Lock, Zap
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
  social: Share2, youtube: Video, appstore: Phone,
  bitcoin: Bitcoin, zoom: Video, pdf: File,
  paypal: CreditCard, image: Image,
};

type QRCode = { id: string; name: string; type: string; status: string; scans: number; clicks: number; created_at: string; };

function StatCard({ icon: Icon, value, label, color, bg }: {
  icon: React.ElementType; value: string | number; label: string; color: string; bg: string;
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
      <div className="text-xs font-medium text-[#94A3B8]">{label}</div>
    </motion.div>
  );
}

function BarChart({ data, max }: { data: { label: string; value: number }[]; max: number }) {
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d.value / Math.max(max, 1)) * 100, d.value > 0 ? 4 : 0)}%` }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            className="w-full rounded-t min-h-0"
            style={{ background: "linear-gradient(180deg, #00D4FF, #0891B2)" }}
          />
          <span className="text-[9px] font-medium text-[#94A3B8]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    supabase.from("qr_codes").select("*").eq("user_id", session.id)
      .order("scans", { ascending: false })
      .then(({ data }) => { setCodes(data || []); setLoading(false); });
  }, []);

  const totalScans = codes.reduce((s, c) => s + (c.scans || 0), 0);
  const totalClicks = codes.reduce((s, c) => s + (c.clicks || 0), 0);
  const avgCTR = totalScans > 0 ? Math.round((totalClicks / totalScans) * 100) : 0;

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weeklyData = days.map((label, i) => ({
    label,
    value: totalScans > 0 ? Math.max(Math.floor((totalScans / 7) * (0.4 + Math.sin(i * 1.3) * 0.4 + 0.3)), 0) : 0,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-black text-[#0F172A] tracking-tight">Analytics</h1>
        <p className="text-xs text-[#94A3B8] mt-0.5">Real-time scan and click data across all your QR codes.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Smartphone}   value={totalScans}   label="Total Scans"  color="#00D4FF" bg="rgba(0,212,255,0.08)" />
        <StatCard icon={MousePointer} value={totalClicks}  label="Total Clicks" color="#F472B6" bg="rgba(244,114,182,0.08)" />
        <StatCard icon={TrendingUp}   value={`${avgCTR}%`} label="Avg CTR"      color="#00FF88" bg="rgba(0,255,136,0.08)" />
        <StatCard icon={QrCode}       value={codes.length} label="Active Codes" color="#8B5CF6" bg="rgba(139,92,246,0.08)" />
      </div>

      <div className="grid lg:grid-cols-2 gap-3 md:gap-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Weekly Scans</h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Estimated daily distribution</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
              <div className="w-2 h-2 rounded-full bg-[#00D4FF]" /> Scans
            </div>
          </div>
          {loading ? <div className="h-32 shimmer rounded-xl" /> : <BarChart data={weeklyData} max={Math.max(...weeklyData.map(d => d.value), 1)} />}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4">Top Performing Codes</h3>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 shimmer rounded-xl" />)}</div>
          ) : codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <BarChart2 size={32} className="text-slate-200" strokeWidth={1} />
              <p className="text-sm text-[#94A3B8]">No data yet. Create and share QR codes.</p>
              <button onClick={() => router.push("/dashboard/create")}
                className="text-xs text-[#00D4FF] hover:text-[#0891B2] transition-colors">Create your first →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {codes.slice(0, 5).map((code, i) => {
                const Icon = TYPE_ICONS[code.type] || QrCode;
                const maxScans = codes[0]?.scans || 1;
                const pct = Math.max((code.scans / maxScans) * 100, code.scans > 0 ? 3 : 0);
                return (
                  <div key={code.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-[#CBD5E1] w-4 text-right">{i+1}</span>
                    <div className="w-7 h-7 rounded-lg bg-[#00D4FF]/08 border border-[#00D4FF]/15 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-[#0891B2]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#0F172A] truncate">{code.name}</span>
                        <span className="text-xs font-bold text-[#00D4FF] ml-2 flex-shrink-0">{code.scans || 0}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#0891B2]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Type breakdown */}
      {!loading && codes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-4">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4">QR Type Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {Object.entries(codes.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {} as Record<string,number>))
              .map(([type, count]) => {
                const Icon = TYPE_ICONS[type] || QrCode;
                return (
                  <div key={type} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:border-[#00D4FF]/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/08 border border-[#00D4FF]/15 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-[#0891B2]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">{count}</div>
                      <div className="text-[10px] text-[#94A3B8] capitalize">{type}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Pro gates */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-bold text-[#0F172A]">Advanced Analytics</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600">PRO</span>
        </div>
        {[
          { icon: Globe,     title: "Geographic Heatmap",     desc: "See where in the world your codes are scanned." },
          { icon: Clock,     title: "Time-of-Day Analysis",   desc: "Discover peak scanning hours for each code." },
          { icon: RefreshCw, title: "Return Visitor Tracking",desc: "Track unique vs repeat scanners per code." },
          { icon: Megaphone, title: "Campaign Comparison",    desc: "Compare performance across campaigns." },
        ].map(f => (
          <div key={f.title}
            className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer group"
            onClick={() => router.push("/pricing")}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <f.icon size={15} className="text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-sm font-medium text-[#0F172A]">{f.title}</div>
                <div className="text-xs text-[#94A3B8]">{f.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500">
              <Lock size={10} strokeWidth={2} /> Unlock
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}