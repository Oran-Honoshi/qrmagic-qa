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
  { id: "url",      icon: Link,          label: "URL" },
  { id: "wifi",     icon: Wifi,          label: "Wi-Fi" },
  { id: "vcard",    icon: User,          label: "vCard" },
  { id: "whatsapp", icon: MessageSquare, label: "WhatsApp" },
  { id: "location", icon: MapPin,        label: "Location" },
  { id: "email",    icon: Mail,          label: "Email" },
  { id: "event",    icon: Calendar,      label: "Event" },
  { id: "social",   icon: Share2,        label: "Social" },
  { id: "pdf",      icon: File,          label: "PDF" },
  { id: "phone",    icon: Phone,         label: "Phone" },
  { id: "sms",      icon: MessageSquare, label: "SMS" },
  { id: "bitcoin",  icon: Bitcoin,       label: "Bitcoin" },
];

/* Bar chart */
function BarChart({ codes }: { codes: Array<{ scans?: number }> }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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
            className="w-full rounded-t bg-gradient-to-t from-[#0891B2] to-[#06B6D4] min-h-[3px]"
          />
          <span className="text-[9px] font-medium text-[#4A5568]">{d}</span>
        </div>
      ))}
    </div>

      {/* Celebrations & Offers */}
      {userData && !userData.first_qr_celebrated && (
        <FirstQRCelebration userId={user?.id || ""} />
      )}
      {userData && !userData.welcome_shown && userData.created_at && (
        <WelcomeOffer userId={user?.id || ""} createdAt={userData.created_at as string} />
      )}
  );
}

/* Stat card */
function StatCard({
  icon: Icon, value, label, color,
}: {
  icon: React.ElementType; value: string | number; label: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 hover:border-[rgba(6,182,212,0.2)] transition-all"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: `${color}14`, border: `1px solid ${color}25` }}
      >
        <Icon size={17} style={{ color }} />
      </div>
      <div className="text-2xl font-black text-[#F0F4F8] tracking-tight mb-0.5">{value}</div>
      <div className="text-xs font-medium text-[#4A5568]">{label}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    setUser(session);
    loadData(session.id);
    // Fetch full user data for offer modal
    supabase.from("users").select("*").eq("id", session.id).single()
      .then(({ data }) => setUserData(data));
  }, []);

  async function loadData(userId: string) {
    const { data } = await supabase
      .from("qr_codes").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false });
    setCodes(data || []);
    setLoading(false);
  }

  const totalScans = codes.reduce((s, c) => s + ((c.scans as number) || 0), 0);
  const dynamic = codes.filter((c) => c.status === "dynamic").length;
  const recent = codes.slice(0, 5);
  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0F1520 0%, #141C2B 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute right-0 top-0 w-64 h-64 pointer-events-none"
          style={{ background: "radial-gradient(circle at 100% 0%, rgba(6,182,212,0.08) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 flex items-center justify-between p-6 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-1">
              Welcome back
            </p>
            <h2 className="text-xl font-black text-[#F0F4F8] tracking-tight mb-2">
              Hey, {firstName}
            </h2>
            <p className="text-sm text-[#4A5568] mb-4">
              {codes.length === 0
                ? "Create your first QR code to get started."
                : `${codes.length} QR code${codes.length !== 1 ? "s" : ""} · ${totalScans} total scans`}
            </p>
            <button
              onClick={() => router.push("/dashboard/create")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(6,182,212,0.3)]"
            >
              <PlusCircle size={14} /> Create QR Code
            </button>
          </div>
          <img
            src="/mascot.png"
            alt="mascot"
            className="w-24 h-24 object-contain opacity-90 hidden sm:block"
            style={{ animation: "float 3.5s ease-in-out infinite" }}
          />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={QrCode}     value={codes.length} label="Total Codes"   color="#06B6D4" />
        <StatCard icon={Smartphone} value={totalScans}   label="Total Scans"   color="#F472B6" />
        <StatCard icon={Zap}        value={dynamic}      label="Dynamic Codes" color="#4ADE80" />
        <StatCard icon={Lock}       value={codes.filter(c => c.status === "static").length} label="Static Codes" color="#8B5CF6" />
      </div>

      {/* Two column */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Recent codes */}
        <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#F0F4F8]">Recent Codes</h3>
            <button
              onClick={() => router.push("/dashboard/codes")}
              className="text-xs text-[#06B6D4] hover:text-[#22D3EE] transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 rounded-lg shimmer" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8">
              <QrCode size={32} className="mx-auto mb-3 text-[#1A2436]" />
              <p className="text-sm text-[#4A5568]">No codes yet</p>
              <button
                onClick={() => router.push("/dashboard/create")}
                className="mt-3 text-xs text-[#06B6D4] hover:text-[#22D3EE] transition-colors"
              >
                Create your first →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((code) => {
                const Icon = TYPE_ICONS[code.type as string] || QrCode;
                return (
                  <div
                    key={code.id as string}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-[#06B6D4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#F0F4F8] truncate">
                        {code.name as string || "—"}
                      </div>
                      <div className="text-[11px] text-[#4A5568]">
                        {(code.scans as number) || 0} scans
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        code.status === "dynamic"
                          ? "bg-[rgba(6,182,212,0.08)] border-[rgba(6,182,212,0.2)] text-[#06B6D4]"
                          : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#4A5568]"
                      }`}
                    >
                      {code.status as string}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#F0F4F8]">Weekly Scans</h3>
            <button
              onClick={() => router.push("/dashboard/analytics")}
              className="text-xs text-[#06B6D4] hover:text-[#22D3EE] transition-colors flex items-center gap-1"
            >
              Analytics <TrendingUp size={11} />
            </button>
          </div>
          {loading ? (
            <div className="h-28 shimmer rounded-lg" />
          ) : (
            <BarChart codes={codes} />
          )}
        </div>
      </div>

      {/* Quick create */}
      <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Quick Create</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {QUICK_TYPES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => router.push(`/dashboard/create?type=${id}`)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#141C2B] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(6,182,212,0.3)] hover:bg-[rgba(6,182,212,0.06)] transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1A2436] flex items-center justify-center group-hover:bg-[rgba(6,182,212,0.1)] transition-colors">
                <Icon size={15} className="text-[#4A5568] group-hover:text-[#06B6D4] transition-colors" />
              </div>
              <span className="text-[9px] font-medium text-[#4A5568] group-hover:text-[#06B6D4] transition-colors text-center leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>

      {/* Celebrations & Offers */}
      {userData && !userData.first_qr_celebrated && (
        <FirstQRCelebration userId={user?.id || ""} />
      )}
      {userData && !userData.welcome_shown && userData.created_at && (
        <WelcomeOffer userId={user?.id || ""} createdAt={userData.created_at as string} />
      )}
  );
}