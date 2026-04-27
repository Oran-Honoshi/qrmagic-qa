"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart2, Smartphone, MousePointer, TrendingUp,
  QrCode, Link, Wifi, User, FileText, Mail,
  MessageSquare, Phone, MapPin, Calendar, Share2,
  Video, File, CreditCard, Bitcoin, Image,
  Globe, Clock, RefreshCw, Megaphone, Lock
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

type QRCode = {
  id: string; name: string; type: string; status: string;
  scans: number; clicks: number; created_at: string;
};

function StatCard({ icon: Icon, value, label, sub, color }: {
  icon: React.ElementType; value: string | number; label: string; sub?: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 hover:border-[rgba(6,182,212,0.15)] transition-all"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div className="text-2xl font-black text-[#F0F4F8] tracking-tight mb-0.5">{value}</div>
      <div className="text-xs font-medium text-[#4A5568]">{label}</div>
      {sub && <div className="text-[10px] text-[#4A5568] mt-0.5">{sub}</div>}
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
            style={{ background: "linear-gradient(180deg, #06B6D4, #0891B2)" }}
          />
          <span className="text-[9px] font-medium text-[#4A5568]">{d.label}</span>
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

  const totalScans  = codes.reduce((s, c) => s + (c.scans || 0), 0);
  const totalClicks = codes.reduce((s, c) => s + (c.clicks || 0), 0);
  const avgCTR = totalScans > 0 ? Math.round((totalClicks / totalScans) * 100) : 0;
  const topCode = codes[0];

  /* Weekly mock data based on real total */
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weeklyData = days.map((label, i) => ({
    label,
    value: totalScans > 0
      ? Math.max(Math.floor((totalScans / 7) * (0.4 + Math.sin(i * 1.3) * 0.4 + 0.3)), 0)
      : 0,
  }));
  const weekMax = Math.max(...weeklyData.map(d => d.value), 1);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-black text-[#F0F4F8] tracking-tight">Analytics</h1>
        <p className="text-xs text-[#4A5568] mt-0.5">
          Real-time scan and click data across all your QR codes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Smartphone}   value={totalScans}  label="Total Scans"  color="#06B6D4" />
        <StatCard icon={MousePointer} value={totalClicks} label="Total Clicks"  color="#F472B6" />
        <StatCard icon={TrendingUp}   value={`${avgCTR}%`} label="Avg CTR"     color="#4ADE80" />
        <StatCard icon={QrCode}       value={codes.length} label="Active Codes" color="#8B5CF6" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Weekly chart */}
        <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#F0F4F8]">Weekly Scans</h3>
              <p className="text-[10px] text-[#4A5568] mt-0.5">Estimated daily distribution</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#4A5568]">
              <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />
              Scans
            </div>
          </div>
          {loading ? (
            <div className="h-32 shimmer rounded-lg" />
          ) : (
            <BarChart data={weeklyData} max={weekMax} />
          )}
        </div>

        {/* Top codes */}
        <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Top Performing Codes</h3>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-10 shimmer rounded-lg" />)}
            </div>
          ) : codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <BarChart2 size={32} className="text-[#1A2436]" />
              <p className="text-sm text-[#4A5568]">No data yet. Create and share QR codes.</p>
              <button onClick={() => router.push("/dashboard/create")}
                className="text-xs text-[#06B6D4] hover:text-[#22D3EE] transition-colors">
                Create your first →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {codes.slice(0, 5).map((code, i) => {
                const Icon = TYPE_ICONS[code.type] || QrCode;
                const maxScans = codes[0]?.scans || 1;
                const pct = Math.max((code.scans / maxScans) * 100, code.scans > 0 ? 3 : 0);
                return (
                  <div key={code.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-[#4A5568] w-4 text-right">{i + 1}</span>
                    <div className="w-7 h-7 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-[#06B6D4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#F0F4F8] truncate">{code.name}</span>
                        <span className="text-xs font-bold text-[#06B6D4] ml-2 flex-shrink-0">
                          {code.scans || 0}
                        </span>
                      </div>
                      <div className="h-1 bg-[#1A2436] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#0891B2] to-[#06B6D4]"
                        />
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
        <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">QR Type Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(
              codes.reduce((acc, c) => {
                acc[c.type] = (acc[c.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, count]) => {
              const Icon = TYPE_ICONS[type] || QrCode;
              return (
                <div key={type} className="bg-[#141C2B] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-[#06B6D4]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#F0F4F8]">{count}</div>
                    <div className="text-[10px] text-[#4A5568] capitalize">{type}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pro features */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-[#F0F4F8]">Advanced Analytics</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#FCD34D]">PRO</span>
        </div>
        {[
          { icon: Globe,     title: "Geographic Heatmap",    desc: "See where in the world your codes are scanned." },
          { icon: Clock,     title: "Time-of-Day Analysis",  desc: "Discover peak scanning hours for each code." },
          { icon: RefreshCw, title: "Return Visitor Tracking",desc: "Track unique vs repeat scanners per code." },
          { icon: Megaphone, title: "Campaign Comparison",   desc: "Compare performance across multiple campaigns." },
        ].map(f => (
          <div key={f.title}
            className="flex items-center justify-between p-3.5 bg-[#0F1520] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[rgba(245,158,11,0.2)] transition-all cursor-pointer"
            onClick={() => router.push("/#pricing")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.08)] flex items-center justify-center">
                <f.icon size={15} className="text-[#FCD34D]" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#F0F4F8]">{f.title}</div>
                <div className="text-xs text-[#4A5568]">{f.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FCD34D]">
              <Lock size={10} /> Unlock
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}