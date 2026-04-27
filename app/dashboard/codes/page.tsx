"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Link, Wifi, User, FileText, Mail, MessageSquare, Phone,
  MapPin, Calendar, Share2, Video, File, CreditCard,
  Bitcoin, Image, QrCode, Eye, Pencil, Trash2,
  Download, X, Check, Search, Filter, PlusCircle,
  Folder, Megaphone, Globe
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import QRCodeStyling from "qr-code-styling";

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
  value: string; color: string; bg_color: string;
  scans: number; clicks: number; created_at: string;
};

/* Mini QR renderer for preview */
function MiniQR({ code, size = 180 }: { code: QRCode; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const qr = new QRCodeStyling({
      width: size, height: size, type: "svg",
      data: code.value || "https://qrmagic.io",
      dotsOptions: { color: code.color || "#06B6D4", type: "rounded" },
      cornersSquareOptions: { color: code.color || "#06B6D4", type: "extra-rounded" },
      cornersDotOptions: { color: code.color || "#06B6D4" },
      backgroundOptions: { color: code.bg_color || "#ffffff" },
      qrOptions: { errorCorrectionLevel: "H" },
    });
    ref.current.innerHTML = "";
    qr.append(ref.current);
  }, [code, size]);

  return <div ref={ref} />;
}

/* Preview Modal */
function PreviewModal({ code, onClose }: { code: QRCode; onClose: () => void }) {
  const qrRef = useRef<QRCodeStyling | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctr = code.scans > 0 ? Math.round((code.clicks / code.scans) * 100) : 0;

  useEffect(() => {
    if (!containerRef.current) return;
    const qr = new QRCodeStyling({
      width: 200, height: 200, type: "svg",
      data: code.value || "https://qrmagic.io",
      dotsOptions: { color: code.color || "#06B6D4", type: "rounded" },
      cornersSquareOptions: { color: code.color || "#06B6D4", type: "extra-rounded" },
      cornersDotOptions: { color: code.color || "#06B6D4" },
      backgroundOptions: { color: code.bg_color || "#ffffff" },
      qrOptions: { errorCorrectionLevel: "H" },
    });
    containerRef.current.innerHTML = "";
    qr.append(containerRef.current);
    qrRef.current = qr;
  }, [code]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0F1520] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#F0F4F8]">{code.name}</h3>
            <p className="text-xs text-[#4A5568] mt-0.5 break-all line-clamp-1">{code.value}</p>
          </div>
          <button onClick={onClose} className="text-[#4A5568] hover:text-[#94A3B8] transition-colors ml-2 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div
            className="p-[1.5px] rounded-xl"
            style={{ background: `linear-gradient(135deg, ${code.color || "#06B6D4"}, ${code.color || "#06B6D4"}60)` }}
          >
            <div className="bg-[#0F1520] rounded-[11px] p-3">
              <div ref={containerRef} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Scans", value: code.scans || 0, color: "#06B6D4" },
            { label: "Clicks", value: code.clicks || 0, color: "#F472B6" },
            { label: "CTR", value: `${ctr}%`, color: "#4ADE80" },
          ].map(s => (
            <div key={s.label} className="bg-[#141C2B] rounded-xl p-2.5 text-center border border-[rgba(255,255,255,0.06)]">
              <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-[#4A5568] font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => qrRef.current?.download({ name: code.name, extension: "png" })}
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-[#141C2B] border border-[rgba(255,255,255,0.07)] rounded-xl text-[#94A3B8] hover:border-[rgba(6,182,212,0.3)] hover:text-[#06B6D4] transition-all"
          >
            <Download size={12} /> Download PNG
          </button>
          <button
            onClick={() => qrRef.current?.download({ name: code.name, extension: "svg" })}
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-xl text-[#06B6D4] hover:bg-[#06B6D4] hover:text-[#0A0E14] transition-all"
          >
            <Download size={12} /> Download SVG
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* Edit Modal */
function EditModal({ code, onClose, onSave }: {
  code: QRCode; onClose: () => void; onSave: (updated: QRCode) => void;
}) {
  const [name, setName] = useState(code.name);
  const [url, setUrl] = useState(code.type === "url" ? code.value : "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const updates: Record<string, string> = { name };
    if (code.type === "url" && code.status === "dynamic" && url) updates.value = url;
    await supabase.from("qr_codes").update(updates).eq("id", code.id);
    onSave({ ...code, ...updates });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0F1520] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#F0F4F8]">Edit QR Code</h3>
          <button onClick={onClose} className="text-[#4A5568] hover:text-[#94A3B8] transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#141C2B] border border-[rgba(255,255,255,0.07)] focus:border-[rgba(6,182,212,0.4)] rounded-xl px-4 py-2.5 text-sm text-[#F0F4F8] outline-none transition-all" />
          </div>
          {code.type === "url" && code.status === "dynamic" && (
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">
                Destination URL
              </label>
              <input value={url} onChange={e => setUrl(e.target.value)} type="url"
                className="w-full bg-[#141C2B] border border-[rgba(255,255,255,0.07)] focus:border-[rgba(6,182,212,0.4)] rounded-xl px-4 py-2.5 text-sm text-[#F0F4F8] outline-none transition-all" />
              <p className="text-[10px] text-[#4A5568] mt-1.5">Dynamic — changing URL won&apos;t break existing printed codes.</p>
            </div>
          )}
          {code.type === "url" && code.status === "static" && (
            <div className="bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.15)] rounded-xl px-4 py-3 text-xs text-[#4A5568]">
              Static QR — URL cannot be changed after creation.
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold border border-[rgba(255,255,255,0.07)] rounded-full text-[#4A5568] hover:text-[#94A3B8] transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 text-sm font-bold bg-[#06B6D4] text-[#0A0E14] rounded-full hover:bg-[#22D3EE] transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* Delete Confirm */
function DeleteModal({ code, onClose, onConfirm }: {
  code: QRCode; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0F1520] border border-[rgba(248,113,113,0.2)] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        style={{ borderTop: "2px solid rgba(248,113,113,0.4)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#F0F4F8]">Delete QR Code?</h3>
          <button onClick={onClose} className="text-[#4A5568] hover:text-[#94A3B8]"><X size={18} /></button>
        </div>
        <p className="text-sm text-[#4A5568] mb-6 leading-relaxed">
          <span className="text-[#F0F4F8] font-medium">&ldquo;{code.name}&rdquo;</span> will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold border border-[rgba(255,255,255,0.07)] rounded-full text-[#4A5568] hover:text-[#94A3B8] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-all">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* Main Page */
export default function CodesPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [previewCode, setPreviewCode] = useState<QRCode | null>(null);
  const [editCode, setEditCode] = useState<QRCode | null>(null);
  const [deleteCode, setDeleteCode] = useState<QRCode | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    loadCodes(session.id);
  }, []);

  async function loadCodes(userId: string) {
    const { data } = await supabase
      .from("qr_codes").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false });
    setCodes(data || []);
    setLoading(false);
  }

  async function confirmDelete() {
    if (!deleteCode) return;
    await supabase.from("qr_codes").delete().eq("id", deleteCode.id);
    setCodes(codes.filter(c => c.id !== deleteCode.id));
    setDeleteCode(null);
  }

  const filtered = codes.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || (c.name || "").toLowerCase().includes(q) || (c.type || "").toLowerCase().includes(q);
    const matchT = !typeFilter || c.type === typeFilter;
    return matchQ && matchT;
  });

  const typeIcon = (t: string) => {
    const Icon = TYPE_ICONS[t] || QrCode;
    return Icon;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-black text-[#F0F4F8] tracking-tight">My QR Codes</h1>
          <p className="text-xs text-[#4A5568] mt-0.5">
            {loading ? "Loading..." : `${codes.length} code${codes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/create")}
          className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all shadow-[0_4px_16px_rgba(6,182,212,0.3)]"
        >
          <PlusCircle size={14} /> Create New
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search codes..."
            className="w-full bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F0F4F8] placeholder:text-[#4A5568] outline-none focus:border-[rgba(6,182,212,0.4)] transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
          <select
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl pl-8 pr-8 py-2.5 text-sm text-[#F0F4F8] outline-none appearance-none focus:border-[rgba(6,182,212,0.4)] transition-all"
          >
            <option value="">All types</option>
            {["url","wifi","vcard","text","email","whatsapp","location","event","social","bitcoin"].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#4A5568]">
          <div className="w-2 h-2 rounded-full bg-[#06B6D4] shadow-[0_0_6px_#06B6D4]" />
          Live from Supabase
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 rounded-xl shimmer" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && codes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-12 text-center"
        >
          <img src="/mascot.png" alt="mascot" className="w-16 h-16 object-contain mx-auto mb-4 opacity-60"
            style={{ animation: "float 3.5s ease-in-out infinite" }} />
          <h3 className="text-base font-bold text-[#F0F4F8] mb-2">No QR codes yet</h3>
          <p className="text-sm text-[#4A5568] mb-5">Create your first QR code to see it here.</p>
          <button
            onClick={() => router.push("/dashboard/create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all"
          >
            <PlusCircle size={14} /> Create Your First QR Code
          </button>
        </motion.div>
      )}

      {/* Table */}
      {!loading && codes.length > 0 && (
        <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden mb-5">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_80px_80px_80px_100px] gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
            {["QR Code","Type","Status","Scans","Clicks","CTR","Actions"].map(h => (
              <div key={h} className="text-[10px] font-semibold text-[#4A5568] uppercase tracking-wider">{h}</div>
            ))}
          </div>

          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            <AnimatePresence>
              {filtered.map((code, i) => {
                const Icon = typeIcon(code.type);
                const ctr = code.scans > 0 ? Math.round((code.clicks / code.scans) * 100) : 0;
                return (
                  <motion.div
                    key={code.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-[2fr_1fr_1fr_80px_80px_80px_100px] gap-3 px-4 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors items-center"
                  >
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-[#06B6D4]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#F0F4F8] truncate">{code.name}</div>
                        <div className="text-[10px] text-[#4A5568] truncate">{code.value}</div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="text-xs text-[#4A5568] capitalize">{code.type}</div>

                    {/* Status */}
                    <div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        code.status === "dynamic"
                          ? "bg-[rgba(6,182,212,0.08)] border-[rgba(6,182,212,0.2)] text-[#06B6D4]"
                          : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#4A5568]"
                      }`}>
                        {code.status}
                      </span>
                    </div>

                    {/* Scans */}
                    <div className="text-sm font-bold text-[#06B6D4]">{code.scans || 0}</div>

                    {/* Clicks */}
                    <div className="text-sm font-bold text-[#F472B6]">{code.clicks || 0}</div>

                    {/* CTR */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1 bg-[#1A2436] rounded-full overflow-hidden max-w-[32px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${ctr}%`,
                            background: ctr > 60 ? "#4ADE80" : ctr > 30 ? "#06B6D4" : "#F472B6"
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#4A5568]">{ctr}%</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPreviewCode(code)}
                        title="Preview"
                        className="w-7 h-7 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center text-[#06B6D4] hover:bg-[rgba(6,182,212,0.15)] transition-all">
                        <Eye size={12} />
                      </button>
                      <button onClick={() => setEditCode(code)}
                        title="Edit"
                        className="w-7 h-7 rounded-lg bg-[rgba(244,114,182,0.08)] border border-[rgba(244,114,182,0.15)] flex items-center justify-center text-[#F472B6] hover:bg-[rgba(244,114,182,0.15)] transition-all">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setDeleteCode(code)}
                        title="Delete"
                        className="w-7 h-7 rounded-lg bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.15)] flex items-center justify-center text-[#F87171] hover:bg-[rgba(248,113,113,0.15)] transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && search && (
            <div className="py-10 text-center text-sm text-[#4A5568]">
              No codes match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Pro features */}
      {!loading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-[#F0F4F8]">Advanced Features</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#FCD34D]">
              PRO
            </span>
          </div>
          {[
            { icon: Folder,    title: "Folder Organization", desc: "Group codes by project, client, or campaign." },
            { icon: Megaphone, title: "Campaign Tracking",   desc: "Bundle codes and track combined performance." },
            { icon: Globe,     title: "Custom Short Domain", desc: "Use your own domain for dynamic QR redirects." },
          ].map(f => (
            <div key={f.title}
              className="flex items-center justify-between p-3.5 bg-[#0F1520] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[rgba(245,158,11,0.2)] transition-all cursor-pointer group"
              onClick={() => setShowUpgrade(true)}
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
              <button className="text-[10px] font-bold px-3 py-1 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#FCD34D] hover:bg-[rgba(245,158,11,0.2)] transition-all">
                Unlock
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {previewCode && <PreviewModal code={previewCode} onClose={() => setPreviewCode(null)} />}
        {editCode && (
          <EditModal code={editCode} onClose={() => setEditCode(null)}
            onSave={updated => setCodes(codes.map(c => c.id === updated.id ? updated : c))} />
        )}
        {deleteCode && <DeleteModal code={deleteCode} onClose={() => setDeleteCode(null)} onConfirm={confirmDelete} />}
        {showUpgrade && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgrade(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0F1520] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <img src="/mascot.png" alt="mascot" className="w-16 h-16 object-contain mx-auto mb-3" />
              <h3 className="text-lg font-black text-[#F0F4F8] mb-2">Upgrade to Unlock</h3>
              <p className="text-sm text-[#4A5568] mb-5">Get folders, campaigns, custom domains, and more from just $4/month.</p>
              <button
                onClick={() => { setShowUpgrade(false); router.push("/#pricing"); }}
                className="w-full py-3 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all"
              >
                View Upgrade Options
              </button>
              <button onClick={() => setShowUpgrade(false)} className="mt-2 text-xs text-[#4A5568] hover:text-[#94A3B8] transition-colors w-full py-1">
                Maybe later
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}