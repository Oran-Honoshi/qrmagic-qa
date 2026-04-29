"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  QrCode, Smartphone, Zap, Lock, Link, Wifi, User,
  FileText, Mail, MessageSquare, Phone, MapPin,
  Calendar, Share2, Video, File, CreditCard,
  Bitcoin, Image, PlusCircle, ArrowRight, TrendingUp
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { WelcomeOffer, FirstQRCelebration } from "@/components/WelcomeOffer";

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
};

const QUICK_TYPES = [
  { id: "url",      icon: Link,          label: "URL",       color: "#00D4FF" },
  { id: "wifi",     icon: Wifi,          label: "Wi-Fi",     color: "#00FF88" },
  { id: "vcard",    icon: User,          label: "vCard",     color: "#8B5CF6" },
  { id: "whatsapp", icon: MessageSquare, label: "WhatsApp",  color: "#00FF88" },
  { id: "location", icon: MapPin,        label: "Location",  color: "#FB923C" },
  { id: "email",    icon: Mail,          label: "Email",     color: "#00D4FF" },
  { id: "event",    icon: Calendar,      label: "Event",     color: "#F472B6" },
  { id: "social",   icon: Share2,        label: "Social",    color: "#8B5CF6" },
  { id: "pdf",      icon: File,          label: "PDF",       color: "#FB923C" },
  { id: "phone",    icon: Phone,         label: "Phone",     color: "#00D4FF" },
  { id: "sms",      icon: MessageSquare, label: "SMS",       color: "#00FF88" },
  { id: "bitcoin",  icon: Bitcoin,       label: "Bitcoin",   color: "#F59E0B" },
];

function BarChart({ codes }: { codes: Array<{ scans?: number }> }) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const total = codes.reduce((s, c) => s + (c.scans || 0), 0);
  const vals = days.map((_, i) =>
    total > 0 ? Math.max(Math.floor((total / 7) * (0.4 + Math.sin(i * 1.3) * 0.4 + 0.3)), 0) : 0
  );
  const max = Math.max(...vals, 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {days.map((d, i) => (
        <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((vals[i] / max) * 100, 3)}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="w-full rounded-t min-h-[3px]"
            style={{ background: "linear-gradient(180deg, #00D4FF, #0891B2)" }}
          />
          <span className="text-[9px] font-medium text-[#94A3B8]">{d}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, bg }: {
  icon: React.ElementType; value: string | number; label: string; color: string; bg: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-[#00D4FF]/30 transition-all duration-300"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: bg, border: `1px solid ${color}25` }}>
        <Icon size={17} style={{ color }} strokeWidth={1.5} />
      </div>
      <div className="text-2xl font-black text-[#0F172A] tracking-tight mb-0.5">{value}</div>
      <div className="text-xs font-medium text-[#94A3B8]">{label}</div>
    </motion.div>
  );
}

type QRCodeRow = Record<string, unknown>;
type UserData = Record<string, unknown>;

export default function DashboardPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<QRCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Record<string, string> | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setSession(s);
    supabase.from("qr_codes").select("*").eq("user_id", s.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setCodes(data || []); setLoading(false); });
    supabase.from("users").select("*").eq("id", s.id).single()
      .then(({ data }) => { if (data) setUserData(data); });
  }, []);

  const totalScans = codes.reduce((s, c) => s + ((c.scans as number) || 0), 0);
  const dynamic = codes.filter(c => c.status === "dynamic").length;
  const firstName = (session?.name || "there").split(" ")[0];

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Welcome banner */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6"
          style={{ boxShadow: "0 8px 32px rgba(15,23,42,0.15)" }}>
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute top-0 right-32 w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)" }} />
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Welcome back</p>
              <h2 className="text-xl font-black text-white tracking-tight mb-2">Hey, {firstName}</h2>
              <p className="text-sm text-white/50 mb-4">
                {codes.length === 0
                  ? "Create your first QR code to get started."
                  : `${codes.length} QR code${codes.length !== 1 ? "s" : ""} · ${totalScans} total scans`}
              </p>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/create")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.35)]">
                <PlusCircle size={14} /> Create QR Code
              </motion.button>
            </div>
            <img src="/mascot.png" alt="" className="w-24 h-24 object-contain hidden sm:block"
              style={{ animation: "float 3.5s ease-in-out infinite" }} />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={QrCode}     value={codes.length} label="Total Codes"   color="#00D4FF" bg="rgba(0,212,255,0.08)" />
          <StatCard icon={Smartphone} value={totalScans}   label="Total Scans"   color="#F472B6" bg="rgba(244,114,182,0.08)" />
          <StatCard icon={Zap}        value={dynamic}      label="Dynamic Codes" color="#00FF88" bg="rgba(0,255,136,0.08)" />
          <StatCard icon={Lock}       value={codes.filter(c => c.status === "static").length} label="Static Codes" color="#8B5CF6" bg="rgba(139,92,246,0.08)" />
        </div>

        {/* Two column */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Recent */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Recent Codes</h3>
              <button onClick={() => router.push("/dashboard/codes")}
                className="text-xs text-[#00D4FF] hover:text-[#0891B2] transition-colors flex items-center gap-1 font-medium">
                View all <ArrowRight size={11} />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl shimmer" />)}</div>
            ) : codes.length === 0 ? (
              <div className="text-center py-8">
                <QrCode size={32} className="mx-auto mb-3 text-slate-200" strokeWidth={1} />
                <p className="text-sm text-[#94A3B8]">No codes yet</p>
                <button onClick={() => router.push("/dashboard/create")}
                  className="mt-3 text-xs text-[#00D4FF] hover:text-[#0891B2] transition-colors">
                  Create your first →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {codes.slice(0, 5).map(code => {
                  const Icon = TYPE_ICONS[code.type as string] || QrCode;
                  return (
                    <div key={code.id as string}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-[#0891B2]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#0F172A] truncate">{code.name as string || "—"}</div>
                        <div className="text-[11px] text-[#94A3B8]">{(code.scans as number) || 0} scans</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        code.status === "dynamic"
                          ? "bg-[#00D4FF]/08 border-[#00D4FF]/20 text-[#0891B2]"
                          : "bg-slate-50 border-slate-200 text-[#94A3B8]"
                      }`}>{code.status as string}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Weekly Scans</h3>
              <button onClick={() => router.push("/dashboard/analytics")}
                className="text-xs text-[#00D4FF] hover:text-[#0891B2] transition-colors flex items-center gap-1 font-medium">
                Analytics <TrendingUp size={11} />
              </button>
            </div>
            {loading ? <div className="h-28 shimmer rounded-xl" /> : <BarChart codes={codes} />}
          </div>
        </div>

        {/* Quick create */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4">Quick Create</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
            {QUICK_TYPES.map(({ id, icon: Icon, label, color }) => (
              <motion.button key={id} whileTap={{ scale: 0.95 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                onClick={() => router.push(`/dashboard/create?type=${id}`)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00D4FF] hover:bg-white hover:shadow-lg transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 group-hover:border-[#00D4FF]/30 flex items-center justify-center transition-colors shadow-sm">
                  <Icon size={15} className="text-[#475569] group-hover:text-[#00D4FF] transition-colors" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] font-semibold text-[#475569] group-hover:text-[#0891B2] transition-colors text-center leading-tight">
                  {label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {userData && !userData.first_qr_celebrated && (
        <FirstQRCelebration userId={session?.id || ""} />
      )}
      {userData && !userData.welcome_shown && userData.created_at && (
        <WelcomeOffer userId={session?.id || ""} createdAt={userData.created_at as string} />
      )}
    </>
  );
}