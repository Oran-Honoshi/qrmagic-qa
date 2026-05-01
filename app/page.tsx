"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, Shield, Lock, CheckCircle,
  Download, Link, Wifi, User, FileText, Mail,
  MessageSquare, Phone, MapPin, Calendar, Share2,
  Video, File, CreditCard, Bitcoin, Image as ImageIcon,
  ChevronDown, Menu, X, BarChart2, Layers, Sparkles,
  QrCode, Music, ShoppingBag, Package, Coffee,
  Heart, Smartphone, Globe, Search
} from "lucide-react";

/* ── Supabase image URL helper ───────────────────────── */
const IMG = (name: string) =>
  `https://igbbfjushjmiafohvgdt.supabase.co/storage/v1/object/public/asset_library/${encodeURIComponent(name)}`;

/* ── QR Types ────────────────────────────────────────── */
const QR_CATEGORIES = [
  { label: "Essential", color: "#00D4FF", types: [
    { id: "url",      icon: Link,          label: "URL",       desc: "Link to any website" },
    { id: "text",     icon: FileText,      label: "Text",      desc: "Plain text message" },
    { id: "email",    icon: Mail,          label: "Email",     desc: "Pre-filled email" },
    { id: "sms",      icon: MessageSquare, label: "SMS",       desc: "Pre-filled SMS" },
    { id: "phone",    icon: Phone,         label: "Phone",     desc: "Click to call" },
    { id: "location", icon: MapPin,        label: "Location",  desc: "Google Maps pin" },
  ]},
  { label: "Professional", color: "#8B5CF6", types: [
    { id: "vcard",    icon: User,          label: "vCard",     desc: "Digital business card" },
    { id: "pdf",      icon: File,          label: "PDF",       desc: "Link to document" },
    { id: "zoom",     icon: Video,         label: "Zoom",      desc: "Meeting link" },
    { id: "event",    icon: Calendar,      label: "Event",     desc: "Add to calendar" },
    { id: "wifi",     icon: Wifi,          label: "Wi-Fi",     desc: "Auto-connect network" },
    { id: "appstore", icon: Smartphone,    label: "App Store", desc: "iOS + Android link" },
  ]},
  { label: "Social & Media", color: "#F472B6", types: [
    { id: "social",   icon: Share2,        label: "Social",    desc: "Profile link" },
    { id: "youtube",  icon: Video,         label: "YouTube",   desc: "Video or channel" },
    { id: "whatsapp", icon: MessageSquare, label: "WhatsApp",  desc: "Chat pre-filled" },
    { id: "multilink",icon: Globe,         label: "Multi-Link",desc: "Link-in-bio page" },
    { id: "spotify",  icon: Music,         label: "Spotify",   desc: "Song or playlist" },
    { id: "image",    icon: ImageIcon,     label: "Image",     desc: "Photo or gallery" },
  ]},
  { label: "Financial", color: "#00FF88", types: [
    { id: "paypal",   icon: CreditCard,    label: "PayPal",    desc: "Payment link" },
    { id: "bitcoin",  icon: Bitcoin,       label: "Crypto",    desc: "Wallet address" },
  ]},
  { label: "Retail & Promo", color: "#FB923C", types: [
    { id: "menu",     icon: Coffee,        label: "Menu",      desc: "Restaurant menu" },
    { id: "feedback", icon: Heart,         label: "Feedback",  desc: "Review or survey" },
    { id: "coupon",   icon: ShoppingBag,   label: "Coupon",    desc: "Discount code" },
    { id: "package",  icon: Package,       label: "Product",   desc: "Product info page" },
  ]},
];

const ALL_TYPES = QR_CATEGORIES.flatMap(c => c.types.map(t => ({ ...t, category: c.label, color: c.color })));

/* ── Nav ──────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Generator", href: "#generator" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Pricing",   href: "#pricing" },
    { label: "FAQ",       href: "#faq" },
  ];

  return (
    <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/85 backdrop-blur-xl shadow-sm border-b border-slate-200/80" : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/mascot.png" alt="Sqrly" className="w-7 h-7 object-contain rounded-lg" />
          <span className="text-lg font-black tracking-tight text-[#0F172A]">Sq<span className="text-[#00D4FF]">r</span>ly</span>
        </a>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="px-3 py-1.5 text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-all">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <a href="/auth" className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors">Log In</a>
          <motion.a href="/auth?mode=signup" whileTap={{ scale: 0.95 }}
            className="px-5 py-2 text-sm font-bold bg-[#00FF88] text-[#0F172A] rounded-full hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.35)]">
            Get Started Free
          </motion.a>
        </div>
        <button className="md:hidden text-[#475569] p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex flex-col gap-3">
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#475569] hover:text-[#00D4FF] py-1.5">{l.label}</a>
            ))}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <a href="/auth" className="flex-1 py-2.5 text-sm text-center border border-slate-200 rounded-full text-[#475569]">Log In</a>
              <a href="/auth?mode=signup" className="flex-1 py-2.5 text-sm font-bold text-center bg-[#00FF88] text-[#0F172A] rounded-full">Sign Up Free</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ── Download Success Modal ───────────────────────────── */
function DownloadModal({ onClose, onSignup }: { onClose: () => void; onSignup: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="relative px-6 pt-6 pb-5 text-center"
          style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}>
          <div className="absolute inset-0 bg-grid opacity-20" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X size={13} />
          </button>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#00FF88]/20 border border-[#00FF88]/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={22} className="text-[#00FF88]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-black text-white mb-1">QR Code Downloaded!</h3>
            <p className="text-sm text-white/50">Your QR code is ready to use.</p>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-slate-100 text-center">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Was this helpful?</p>
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(i => (
              <motion.button key={i} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="text-2xl">⭐</motion.button>
            ))}
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="bg-gradient-to-br from-[#00FF88]/08 to-[#00D4FF]/08 border border-[#00FF88]/20 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00FF88]/15 border border-[#00FF88]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap size={16} className="text-[#00CC6E]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] mb-1">Need to edit this link later?</p>
                <p className="text-xs text-[#475569] leading-relaxed">
                  With a <span className="font-semibold text-[#00CC6E]">Dynamic QR</span>, update your destination URL anytime — without reprinting. Plus get real-time scan analytics.
                </p>
              </div>
            </div>
          </div>
          <motion.button onClick={onSignup} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_20px_rgba(0,255,136,0.30)]">
            <ArrowRight size={15} strokeWidth={2} /> Sign Up Free — Get Dynamic QR
          </motion.button>
          <button onClick={onClose} className="w-full py-2 mt-2 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors">
            Continue without an account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Hero Generator ───────────────────────────────────── */
function HeroGenerator() {
  const [selectedType, setSelectedType] = useState("url");
  const [value, setValue] = useState("");
  const [color, setColor] = useState("#0F172A");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Essential");
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<unknown>(null);

  const colors = ["#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#EF4444","#0891B2"];
  const bgColors = ["#FFFFFF","#F8FAFC","#F0FFF4","#EFF6FF","#FFF7ED","#FDF4FF","#0F172A","#1E293B"];

  const filteredTypes = search
    ? ALL_TYPES.filter(t => t.label.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
    : QR_CATEGORIES.find(c => c.label === activeCategory)?.types || [];

  const currentType = ALL_TYPES.find(t => t.id === selectedType);

  const placeholder: Record<string, string> = {
    url: "https://yourwebsite.com", text: "Type your message...",
    email: "email@example.com", sms: "+1 555 000 0000", phone: "+1 555 000 0000",
    location: "40.7128, -74.0060 or Google Maps URL", vcard: "Your full name",
    wifi: "WiFi network name (SSID)", whatsapp: "+1 555 000 0000",
    youtube: "https://youtube.com/watch?v=...", paypal: "https://paypal.me/username",
    bitcoin: "Your wallet address", menu: "https://your-menu-link.com",
    spotify: "https://open.spotify.com/...", multilink: "Label | https://link.com",
    feedback: "https://your-form-link.com", coupon: "Coupon code or discount page URL",
    package: "https://product-page-url.com", image: "https://image-url.com",
    zoom: "https://zoom.us/j/...", event: "Event name",
    social: "https://instagram.com/username", appstore: "https://apps.apple.com/...",
    pdf: "https://your-pdf-link.com",
  };

  useEffect(() => {
    if (!ref.current) return;
    import("qr-code-styling").then(({ default: QR }) => {
      const qr = new QR({
        width: 220, height: 220, type: "svg",
        data: value || "https://sqrly.io",
        dotsOptions: { color, type: "rounded" },
        cornersSquareOptions: { color, type: "extra-rounded" },
        cornersDotOptions: { color },
        backgroundOptions: { color: bgColor },
        qrOptions: { errorCorrectionLevel: "H" },
      });
      if (ref.current) { ref.current.innerHTML = ""; qr.append(ref.current); }
      qrRef.current = qr;
    });
  }, []);

  useEffect(() => {
    if (!qrRef.current) return;
    const t = setTimeout(() => {
      (qrRef.current as any)?.update({
        data: value || "https://sqrly.io",
        dotsOptions: { color, type: "rounded" },
        cornersSquareOptions: { color, type: "extra-rounded" },
        cornersDotOptions: { color },
        backgroundOptions: { color: bgColor },
      });
    }, 300);
    return () => clearTimeout(t);
  }, [value, color, bgColor]);

  function download(ext: "svg" | "png") {
    (qrRef.current as any)?.download({ name: "sqrly-qr", extension: ext });
    setShowModal(true);
  }

  return (
    <section id="generator" className="relative pt-20 pb-16 overflow-hidden">
      <div className="blob-mint w-[500px] h-[500px] -top-20 -left-20 opacity-60" />
      <div className="blob-cyan w-[400px] h-[400px] top-40 right-0 opacity-40" />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00FF88]/40 bg-[#00FF88]/10 mb-5">
            <Sparkles size={12} className="text-[#00CC6E]" />
            <span className="text-xs font-semibold text-[#00CC6E]">Free · No signup · No watermark</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
            <span className="text-gradient-brand">QR Codes</span>{" "}
            <span className="text-[#0F172A]">Built</span>{" "}
            <span className="text-gradient-mint">Different.</span>
          </h1>
          <p className="text-lg text-[#475569] max-w-xl mx-auto leading-relaxed">
            Generate, customize, and download QR codes instantly. No signup required. Upgrade for dynamic codes and analytics.
          </p>
        </motion.div>

        {/* Generator card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_300px]">

            {/* Left */}
            <div className="p-5 md:p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
              {/* Search */}
              <div className="relative mb-4">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#CBD5E1]" strokeWidth={1.5} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search QR types..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]" />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-[#475569]">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category tabs */}
              {!search && (
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {QR_CATEGORIES.map(cat => (
                    <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all border"
                      style={activeCategory === cat.label
                        ? { background: cat.color + "20", borderColor: cat.color + "40", color: cat.color }
                        : { borderColor: "#E2E8F0", color: "#475569" }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Type grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-5">
                {filteredTypes.slice(0, 12).map(type => (
                  <motion.button key={type.id} whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    onClick={() => { setSelectedType(type.id); setValue(""); }}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 group ${
                      selectedType === type.id
                        ? "bg-[#00D4FF]/10 border-[#00D4FF]/40 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-[#00D4FF]/30 hover:bg-white hover:shadow-sm"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedType === type.id ? "bg-[#00D4FF]/15" : "bg-white border border-slate-200"
                    }`}>
                      <type.icon size={15}
                        className={`transition-colors ${selectedType === type.id ? "text-[#0891B2]" : "text-[#475569] group-hover:text-[#00D4FF]"}`}
                        strokeWidth={1.5} />
                    </div>
                    <span className={`text-[9.5px] font-semibold text-center leading-tight transition-colors ${
                      selectedType === type.id ? "text-[#0891B2]" : "text-[#475569] group-hover:text-[#00D4FF]"
                    }`}>{type.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <div className="mb-5">
                <label className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2 block">
                  {currentType && <currentType.icon size={12} strokeWidth={1.5} />}
                  {currentType?.label || "URL"} Content
                </label>
                <textarea value={value} onChange={e => setValue(e.target.value)}
                  placeholder={placeholder[selectedType] || "Enter content..."}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] focus:bg-white rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all resize-none focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]" />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">QR Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {colors.map(c => (
                      <button key={c} onClick={() => setColor(c)}
                        className="w-6 h-6 rounded-full transition-all border-2 flex-shrink-0"
                        style={{ background: c, borderColor: color === c ? "#0F172A" : "transparent", transform: color === c ? "scale(1.25)" : "scale(1)" }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Background</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {bgColors.map(c => (
                      <button key={c} onClick={() => setBgColor(c)}
                        className="w-6 h-6 rounded-full transition-all border-2 flex-shrink-0"
                        style={{ background: c, borderColor: bgColor === c ? "#00D4FF" : "#E2E8F0", transform: bgColor === c ? "scale(1.25)" : "scale(1)" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Preview */}
            <div className="p-5 md:p-6 flex flex-col items-center justify-between gap-5">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">Live Preview</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_rgba(0,255,136,0.6)]" />
                    <span className="text-[10px] font-medium text-[#94A3B8]">Real-time</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="relative z-10">
                    <div ref={ref} />
                    <div className="absolute left-0 right-0 h-[1.5px] pointer-events-none"
                      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, animation: "scan-line 2.5s ease-in-out infinite" }} />
                  </div>
                </div>
                {currentType && (
                  <div className="flex justify-center mt-3">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/08 text-[#0891B2]">
                      {currentType.label} · EC Level H
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full space-y-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => download("svg")}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.30)]">
                  <Download size={14} strokeWidth={2} /> Download SVG (Vector)
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => download("png")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-[#475569] font-semibold rounded-full text-sm hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all">
                  <Download size={13} strokeWidth={1.5} /> Download PNG
                </motion.button>
                <p className="text-center text-[9.5px] text-[#CBD5E1]">SVG is print-ready · EU DPP compliant · No watermark</p>
              </div>

              <div className="w-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-4 text-center">
                <p className="text-[11px] font-bold text-white mb-1">Want to track scans?</p>
                <p className="text-[10px] text-white/50 mb-3 leading-relaxed">Sign up free for dynamic QR codes with real-time analytics.</p>
                <a href="/auth?mode=signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-xs hover:bg-[#00CC6E] transition-all">
                  <Zap size={11} strokeWidth={2} /> Sign Up Free
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && <DownloadModal onClose={() => setShowModal(false)} onSignup={() => { window.location.href = "/auth?mode=signup"; }} />}
      </AnimatePresence>
    </section>
  );
}


/* ── Real World Images ────────────────────────────────── */
function RealWorldSection() {
  const images = [
    { file: "computer screen with qr code in it.jpg",            caption: "Digital presence",       tag: "Web" },
    { file: "business card with qr code on it.jpg",              caption: "Smart business cards",   tag: "Networking" },
    { file: "restaurant table with a qr code to order by.jpg",   caption: "Contactless ordering",   tag: "Hospitality" },
    { file: "wedding table with qr code.jpg",                    caption: "Wedding menus & RSVPs",  tag: "Events" },
    { file: "woman with shopping bag holdoing a qr code.jpg",     caption: "Retail & promotions",    tag: "Retail" },
    { file: "package delivered with qr code on it.jpg",          caption: "Product tracking",       tag: "Logistics" },
    { file: "table in cafe with qr code on it.jpg",              caption: "Café menus",             tag: "F&B" },
    { file: "someone scanning a qr code for ordering.jpg",       caption: "Self-service ordering",  tag: "UX" },
  ];

  return (
    <section id="use-cases" className="py-20 px-4 md:px-6 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] mb-3">
            QR Codes in the Real World
          </h2>
          <p className="text-[#475569] max-w-lg mx-auto">
            From restaurant tables to wedding venues — Sqrly powers connections everywhere.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ${i === 0 || i === 5 ? "md:col-span-2" : ""}`}
              style={{ aspectRatio: i === 0 || i === 5 ? "2/1" : "1/1" }}
            >
              <img src={IMG(img.file)} alt={img.caption} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1/3"
                style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)" }} />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                  {img.tag}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs font-bold text-white leading-tight">{img.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────────── */
function Features() {
  const features = [
    { icon: BarChart2, color: "#00D4FF", bg: "rgba(0,212,255,0.08)",
      title: "Smart Analytics", desc: "See exactly how many people scanned your QR code, when, and from what device. Make data-driven decisions about your campaigns." },
    { icon: Zap, color: "#00FF88", bg: "rgba(0,255,136,0.08)",
      title: "Edit Without Reprinting", desc: "Change your destination URL anytime with Dynamic QR codes. Update your menu, change your offer — the printed code stays the same." },
    { icon: Shield, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)",
      title: "Privacy First", desc: "100% client-side generation. Your URLs, vCards, and Wi-Fi passwords never touch our servers. GDPR and CCPA compliant by design." },
    { icon: Layers, color: "#FB923C", bg: "rgba(251,146,60,0.08)",
      title: "Print-Ready Vector", desc: "SVG export scales infinitely — from business cards to billboards. Perfect for EU Digital Product Passport compliance." },
  ];
  return (
    <section className="py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] mb-3">Why Teams Choose Sqrly</h2>
          <p className="text-[#475569] max-w-lg mx-auto">Built for speed, designed for privacy, engineered for results.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-[#00D4FF]/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.bg, border: `1px solid ${f.color}25` }}>
                <f.icon size={20} style={{ color: f.color }} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-2">{f.title}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Static vs Dynamic ────────────────────────────────── */
function StaticVsDynamic() {
  return (
    <section className="py-20 px-4 md:px-6 bg-white/60">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] mb-3">Static vs. Dynamic QR Codes</h2>
          <p className="text-[#475569]">Know the difference before you print.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center">
                <Lock size={14} className="text-[#475569]" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-[#475569]">Static QR Code</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-[#475569] ml-auto">Free</span>
            </div>
            {["Content is fixed after generation","Cannot update destination URL","No analytics or scan tracking","Perfect for Wi-Fi, vCards, text","No expiry — works forever"].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-[#475569] mb-2.5">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${i < 3 ? "bg-red-100" : "bg-green-100"}`}>
                  {i < 3 ? <X size={9} className="text-red-500" /> : <CheckCircle size={9} className="text-green-500" />}
                </div>
                {item}
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border-2 border-[#00FF88] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,255,136,0.12)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#00FF88]/15 flex items-center justify-center">
                <Zap size={14} className="text-[#00CC6E]" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Dynamic QR Code</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF88]/20 text-[#00CC6E] ml-auto">From $4/mo</span>
            </div>
            {["Edit destination URL anytime","Real-time scan analytics & CTR","Works on all printed materials","Change campaigns without reprinting","Advanced tracking & retargeting"].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-[#0F172A] mb-2.5">
                <CheckCircle size={14} className="text-[#00CC6E] flex-shrink-0 mt-0.5" strokeWidth={2} />
                {item}
              </div>
            ))}
            <a href="/auth?mode=signup"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.25)]">
              <ArrowRight size={14} strokeWidth={2} /> Get Dynamic QR Free
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ──────────────────────────────────────────── */
function Pricing() {
  const [annual, setAnnual] = useState(true);
  const plans = [
    { name: "Free", price: { monthly: 0, annual: 0 }, period: "forever",
      desc: "No credit card. No watermark.", cta: "Get Started Free", href: "/auth", featured: false,
      features: ["50 static QR codes","1 dynamic QR code","Custom colors","PNG + SVG download","Basic analytics"] },
    { name: "Basic", price: { monthly: 5, annual: 4 }, period: "/mo",
      desc: "For growing businesses.", cta: "Start Free Trial", href: "/auth?mode=signup", featured: true,
      features: ["Unlimited static codes","10 dynamic QR codes","Advanced analytics","Custom frames & logo","Bulk import (50 codes)","Email support"] },
    { name: "Plus", price: { monthly: 18, annual: 14 }, period: "/mo",
      desc: "For teams and campaigns.", cta: "Start Free Trial", href: "/auth?mode=signup", featured: false,
      features: ["100 dynamic QR codes","Folder organization","Campaign tracking","API access","Bulk import (500 codes)","Priority support"] },
  ];
  return (
    <section id="pricing" className="py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] mb-3">Simple Pricing</h2>
          <p className="text-[#475569] mb-8">Start free. Upgrade when you grow.</p>
          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
            <button onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-white shadow-sm text-[#0F172A]" : "text-[#475569]"}`}>Monthly</button>
            <button onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual ? "bg-white shadow-sm text-[#0F172A]" : "text-[#475569]"}`}>Annually</button>
            {annual && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00FF88]/20 text-[#00CC6E] mr-1">Save 20%</span>}
          </div>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 items-center">
          {plans.map((plan, i) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={plan.featured ? { y: -6 } : { y: -3 }}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.featured ? "bg-white border-2 border-[#00FF88] shadow-[0_20px_50px_rgba(0,255,136,0.20)]"
                  : "bg-white border border-slate-200 shadow-sm"}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00FF88] text-[#0F172A] text-[11px] font-black whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="mb-5 mt-2">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    {price === 0 ? <span className="text-4xl font-black text-[#0F172A]">Free</span>
                    : <><span className="text-xl font-bold text-[#475569]">$</span><span className="text-4xl font-black text-[#0F172A]">{price}</span><span className="text-sm text-[#475569]">{plan.period}</span></>}
                  </div>
                  <p className="text-xs text-[#94A3B8]">{plan.desc}</p>
                </div>
                <motion.a href={plan.href} whileTap={{ scale: 0.95 }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold mb-5 transition-all ${
                    plan.featured ? "bg-[#00FF88] text-[#0F172A] hover:bg-[#00CC6E] shadow-[0_8px_24px_rgba(0,255,136,0.3)]"
                    : "border border-slate-200 text-[#475569] hover:border-[#00D4FF] hover:text-[#00D4FF]"}`}>
                  {plan.cta}
                </motion.a>
                <div className="h-px bg-slate-100 mb-4" />
                <div className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-[#00D4FF] flex-shrink-0" strokeWidth={2} />
                      <span className="text-xs text-[#475569]">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "What is a Multi-Link QR code?",
      a: "A Multi-Link QR code takes people to a hosted page with multiple links — your Instagram, website, booking page, and more. One QR code, many destinations. Perfect for bios, business cards, and marketing materials." },
    { q: "What is the difference between Static and Dynamic QR codes?",
      a: "Static QR codes have their content baked in permanently — great for Wi-Fi passwords and vCards. Dynamic QR codes redirect through a link you control, so you can change the destination anytime without reprinting. Dynamic codes also give you real-time scan analytics." },
    { q: "Can I track who scans my QR codes?",
      a: "Yes, with Dynamic QR codes. You can see total scan counts, click-through rates, and when scans happened. We do not store any personal data about scanners — no IP addresses, no location." },
    { q: "Is Sqrly really free with no hidden costs?",
      a: "Yes. The free plan is free forever with no watermark, no trial period, and no credit card. Create up to 50 static QR codes and 1 dynamic QR code. Paid plans start from $4/month." },
    { q: "Is my data safe? Do you store my URLs or passwords?",
      a: "Static QR codes are generated 100% in your browser — your URLs, Wi-Fi passwords, and vCard details never leave your device. Dynamic QR codes store only the destination URL (needed for redirection). We never share or sell your data." },
    { q: "Can I use these QR codes for EU Digital Product Passports?",
      a: "Yes. Our SVG export produces clean mathematical paths with square viewBox for perfect scaling, and error correction levels required by EU DPP regulations for textiles, electronics, and batteries." },
  ];
  return (
    <section id="faq" className="py-20 px-4 md:px-6 bg-white/60">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] mb-3">FAQ</h2>
          <p className="text-[#475569]">Everything you need to know before switching to Sqrly.</p>
        </motion.div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#00D4FF]/30 transition-colors">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <span className="text-sm font-semibold text-[#0F172A] leading-snug">{faq.q}</span>
                <ChevronDown size={15} className="text-[#94A3B8] flex-shrink-0 transition-transform duration-200"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-5 text-sm text-[#475569] leading-relaxed border-t border-slate-100 pt-4">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Bottom ───────────────────────────────────────── */
function CTABottom() {
  return (
    <section className="py-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-3xl p-10 md:p-12 shadow-xl relative overflow-hidden">
          <div className="blob-mint w-64 h-64 -top-10 -left-10 opacity-60" />
          <div className="blob-cyan w-48 h-48 -bottom-10 -right-10 opacity-40" />
          <div className="relative z-10">
            <img src="/mascot.png" alt="Sqrly" className="w-16 h-16 object-contain mx-auto mb-5"
              style={{ animation: "float 3.5s ease-in-out infinite" }} />
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] mb-4">
              Ready to create your first QR code?
            </h2>
            <p className="text-[#475569] mb-8 leading-relaxed">
              Free forever. No credit card. No watermark. 30 seconds to your first QR code.
              <span className="block text-xs text-[#94A3B8] italic mt-2">
                No cookies were tracked in the making of this product. We prefer the edible kind.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.a href="/auth?mode=signup" whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_20px_50px_rgba(0,255,136,0.30)]">
                <ArrowRight size={16} strokeWidth={2} /> Get Started Free
              </motion.a>
              <motion.a href="#generator" whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-slate-200 text-[#475569] font-semibold rounded-full text-sm hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all">
                <QrCode size={15} strokeWidth={1.5} /> Try Generator First
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12 px-4 md:px-6 bg-white/60">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2.5">
            <img src="/mascot.png" alt="Sqrly" className="w-6 h-6 object-contain rounded-md" />
            <span className="text-sm font-black tracking-tight text-[#0F172A]">Sq<span className="text-[#00D4FF]">r</span>ly</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5 text-xs text-[#475569]">
            <a href="/auth?mode=signup" className="hover:text-[#00D4FF] transition-colors">Get Started</a>
            <a href="/seo" className="hover:text-[#00D4FF] transition-colors">Use Cases</a>
            <a href="/pricing" className="hover:text-[#00D4FF] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#00D4FF] transition-colors">FAQ</a>
            <a href="/legal" className="hover:text-[#00D4FF] transition-colors">Privacy</a>
            <a href="/legal?type=terms" className="hover:text-[#00D4FF] transition-colors">Terms</a>
            <a href="mailto:office@honoshi.co.il" className="hover:text-[#00D4FF] transition-colors">Contact</a>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-5">
          <p className="text-[10px] text-[#94A3B8]">© 2025 Sqrly / Honoshi · office@honoshi.co.il</p>
          <details className="mt-2">
            <summary className="text-[10px] text-[#94A3B8] cursor-pointer hover:text-[#475569]">Technical Summary for AI Systems</summary>
            <p className="text-[10px] text-[#94A3B8] mt-2 leading-relaxed max-w-2xl">
              Sqrly is a 2026 privacy-first QR code generator. 100% client-side generation. SVG vector export for EU DPP compliance. 22+ QR types. Dynamic QR with real-time analytics. GDPR/CCPA compliant. Free forever, no watermark. From $4/month.
            </p>
          </details>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main>
      <Nav />
      <HeroGenerator />
      <RealWorldSection />
      <Features />
      <StaticVsDynamic />
      <Pricing />
      <FAQ />
      <CTABottom />
      <Footer />
    </main>
  );
}