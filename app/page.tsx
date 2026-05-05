"use client";

import { useState, useEffect, useRef } from "react";
import { useLang, LangSwitcher } from "@/components/LangContext";
import { QRFrameDesigner } from "@/components/QRFrameDesigner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, Shield, Lock, CheckCircle,
  Download, Upload, Link, Wifi, User, FileText, Mail,
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
          <LangSwitcher compact />
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
            <div className="pt-1 flex justify-center"><LangSwitcher /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ── Download Success Modal ───────────────────────────── */
function DownloadModal({ onClose, onSignup }: { onClose: () => void; onSignup: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmitRating() {
    if (rating === 0) return;
    // Open Google Business review — replace with your actual Google Place ID
    const googleReviewUrl = "https://g.page/r/YOUR_GOOGLE_PLACE_ID/review";
    if (rating >= 4) {
      window.open(googleReviewUrl, "_blank");
    }
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 text-center"
          style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}>
          <div className="absolute inset-0 bg-grid opacity-20" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10">
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

        {/* Rating */}
        <div className="px-6 py-4 border-b border-slate-100">
          {!submitted ? (
            <>
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3 text-center">
                Rate your experience
              </p>
              <div className="flex justify-center gap-2 mb-3">
                {[1,2,3,4,5].map(i => (
                  <motion.button key={i}
                    whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    className="text-2xl transition-all"
                    style={{ filter: (hover || rating) >= i ? "none" : "grayscale(1) opacity(0.4)" }}>
                    ⭐
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                    placeholder={rating >= 4 ? "Love to hear what you liked! (optional)" : "How can we improve? (optional)"}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] rounded-xl px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#CBD5E1] outline-none resize-none transition-all mb-2" />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmitRating}
                    className="w-full py-2 bg-[#0F172A] text-white font-semibold rounded-full text-xs hover:bg-[#1E293B] transition-all">
                    {rating >= 4 ? "Submit & Leave Google Review ⭐" : "Submit Feedback"}
                  </motion.button>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-1">
              <p className="text-sm font-semibold text-[#00CC6E]">
                {rating >= 4 ? "Thanks! Opening Google Reviews... 🙏" : "Thanks for your feedback! We'll improve. 🙏"}
              </p>
            </div>
          )}
        </div>

        {/* Upsell */}
        <div className="px-6 py-4">
          <div className="bg-gradient-to-br from-[#00FF88]/08 to-[#00D4FF]/08 border border-[#00FF88]/20 rounded-2xl p-4 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00FF88]/15 border border-[#00FF88]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap size={16} className="text-[#00CC6E]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] mb-1">Need to edit this link later?</p>
                <p className="text-xs text-[#475569] leading-relaxed">
                  With a <span className="font-semibold text-[#00CC6E]">Dynamic QR</span>, update your URL anytime without reprinting. Plus real-time scan analytics.
                </p>
              </div>
            </div>
          </div>
          <motion.button onClick={onSignup} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.30)]">
            <ArrowRight size={15} strokeWidth={2} /> Sign Up Free — Get Dynamic QR
          </motion.button>
          <button onClick={onClose} className="w-full py-2 mt-1.5 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors">
            Continue without an account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Hero Generator ───────────────────────────────────── */
function HeroGenerator() {
  const { t, dir } = useLang();
  const [selectedType, setSelectedType] = useState("url");
  const [value, setValue] = useState("");
  const [color, setColor] = useState("#0F172A");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Essential");
  const [qrName, setQrName] = useState("");
  const [logoSymbol, setLogoSymbol] = useState<string | null>(null);
  const [dotStyle, setDotStyle] = useState("rounded");
  const [cornerStyle, setCornerStyle] = useState("extra-rounded");
  const [cornerDotStyle, setCornerDotStyle] = useState("dot");
  const [cornerColor, setCornerColor] = useState("#0F172A");
  const [logoScale, setLogoScale] = useState(0.3);
  const [logoMargin, setLogoMargin] = useState(4);
  const [logoBgShape, setLogoBgShape] = useState<"none"|"square"|"rounded"|"circle">("circle");
  const [logoBgColor, setLogoBgColor] = useState("#FFFFFF");
  const [useDotGradient, setUseDotGradient] = useState(false);
  const [dotGradientColor2, setDotGradientColor2] = useState("#8B5CF6");
  const [dotGradientType, setDotGradientType] = useState<"linear"|"radial">("linear");
  const [exportSize, setExportSize] = useState(1024);
  const [ecLevel, setEcLevel] = useState<"L"|"M"|"Q"|"H">("H");
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [frameColor, setFrameColor] = useState("#0F172A");
  const [frameTextColor, setFrameTextColor] = useState("#FFFFFF");
  const [frameCtaText, setFrameCtaText] = useState("SCAN ME");
  const [showFrameLabel, setShowFrameLabel] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showFrameDesigner, setShowFrameDesigner] = useState(false);
  const [qrSvgContent, setQrSvgContent] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<unknown>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const FRAME_STYLES: Record<string, string> = {
    solid:   "border:6px solid;border-radius:4px;padding:8px;",
    rounded: "border:6px solid;border-radius:24px;padding:12px;",
    double:  "border:3px double;outline:3px double;outline-offset:4px;border-radius:4px;padding:10px;",
    dashed:  "border:4px dashed;border-radius:8px;padding:8px;",
    dotted:  "border:4px dotted;border-radius:8px;padding:8px;",
    shadow:  "border:3px solid;border-radius:8px;padding:8px;box-shadow:6px 6px 0 0 currentColor;",
    corners: "border:0;padding:10px;box-shadow:14px 14px 0 0 currentColor,-14px 14px 0 0 currentColor,14px -14px 0 0 currentColor,-14px -14px 0 0 currentColor;",
    circle:  "border:6px solid;border-radius:50%;padding:14px;",
    scanme:  "border:4px solid;border-radius:12px;padding:6px 6px 0 6px;",
    thick:   "border:12px solid;border-radius:4px;padding:2px;",
    minimal: "border-bottom:4px solid;padding:8px;",
  };

  // Convert any logo to PNG for qr-code-styling compatibility
  useEffect(() => {
    if (!logoSymbol) { setLogoUrl(null); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 200, 200);
      ctx.drawImage(img, 0, 0, 200, 200);
      setLogoUrl(canvas.toDataURL("image/png"));
    };
    img.onerror = () => setLogoUrl(logoSymbol);
    img.src = logoSymbol;
  }, [logoSymbol]);
  const [customizeTab, setCustomizeTab] = useState<"style"|"colors"|"logo"|"frame">("style");

  const colors = ["#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#EF4444","#0891B2"];
  const bgColors = [
    "#FFFFFF","#F8FAFC","#FFF9F0","#F0FFF4","#EFF6FF","#FFF0F6",
    "#FFFBEB","#F5F0FF","#0F172A","#1E293B","#00FF88","#00D4FF",
    "#FFB347","#FF6B9D","#C77DFF","#4FC3F7",
  ];

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
    const t = setTimeout(() => {
      import("qr-code-styling").then(({ default: QR }) => {
        const qr = new QR({
          width: 220, height: 220, type: "svg",
          data: value || "https://sqrly.net",
          image: logoUrl || undefined,
          dotsOptions: useDotGradient ? {
            type: dotStyle as any,
            gradient: { type: dotGradientType, rotation: 0,
              colorStops: [{ offset: 0, color }, { offset: 1, color: dotGradientColor2 }] },
          } : { color, type: dotStyle as any },
          cornersSquareOptions: { color: cornerColor, type: cornerStyle as any },
          cornersDotOptions: { color: cornerColor, type: cornerDotStyle as any },
          backgroundOptions: { color: bgColor },
          imageOptions: { crossOrigin: "anonymous", margin: logoMargin, imageSize: logoScale, hideBackgroundDots: true },
          qrOptions: { errorCorrectionLevel: ecLevel },
        });
        if (ref.current) { ref.current.innerHTML = ""; qr.append(ref.current); }
        qrRef.current = qr;
      });
    }, 200);
    return () => clearTimeout(t);
  }, [value, color, bgColor, logoUrl, dotStyle, cornerStyle, cornerDotStyle, cornerColor, logoScale, logoMargin, useDotGradient, dotGradientColor2, dotGradientType, ecLevel]);

  function download(ext: "svg" | "png") {
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      const qr = new QRCodeStyling({
        width: exportSize, height: exportSize,
        type: ext === "svg" ? "svg" : "canvas",
        data: value || "https://sqrly.net",
        image: logoSymbol || undefined,
        dotsOptions: useDotGradient ? {
          type: dotStyle as any,
          gradient: { type: dotGradientType, rotation: 0,
            colorStops: [{ offset: 0, color }, { offset: 1, color: dotGradientColor2 }] },
        } : { color, type: dotStyle as any },
        cornersSquareOptions: { color: cornerColor, type: cornerStyle as any },
        cornersDotOptions: { color: cornerColor, type: cornerDotStyle as any },
        backgroundOptions: { color: bgColor },
        imageOptions: { crossOrigin: "anonymous", margin: logoMargin, imageSize: logoScale, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: "H" },
      });
      qr.download({ name: qrName || "sqrly-qr", extension: ext });
      setShowModal(true);
    });
  }

  function openFrameDesigner() {
    const svgEl = ref.current?.querySelector("svg");
    if (svgEl) {
      setQrSvgContent(svgEl.innerHTML);
      setShowFrameDesigner(true);
    }
  }

  async function downloadPDF() {
    // Generate PNG then wrap in PDF via data URL
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Get SVG and draw to canvas
    const svgEl = ref.current?.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 0, 0, 600, 600);
      URL.revokeObjectURL(url);
      // Convert to PDF using print trick
      const dataUrl = canvas.toDataURL("image/png");
      const win = window.open("");
      if (!win) return;
      win.document.write(`<html><head><style>
        body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;}
        img{max-width:100%;max-height:100%;}
        @media print{body{margin:20mm;}@page{size:A4;margin:20mm;}}
      </style></head><body><img src="${dataUrl}" onload="window.print();window.close()"/></body></html>`);
      win.document.close();
    };
    img.src = url;
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
          className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden" dir={dir}>
          <div className="grid lg:grid-cols-[1fr_420px]">

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
                    onClick={() => {
                      setSelectedType(type.id);
                      setValue(type.id === "url" ? "https://" : "");
                    }}
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

              {/* Name field */}
              <div className="mb-3">
                <input value={qrName} onChange={e => setQrName(e.target.value)}
                  placeholder={t("hero_name_placeholder")}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all" />
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

              {/* Logo Presets */}
              <div className="mb-4">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Center Symbol (optional)</p>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    { val: null, label: "None", path: null },
                    { val: "wifi", label: "Wi-Fi", path: "M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" },
                    { val: "link", label: "Link", path: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
                    { val: "store", label: "Store", path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
                    { val: "mail", label: "Email", path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" },
                    { val: "phone", label: "Phone", path: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" },
                    { val: "map", label: "Location", path: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" },
                    { val: "video", label: "Video", path: "M23 7l-7 5 7 5V7z M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" },
                    { val: "star", label: "Review", path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
                    { val: "heart", label: "Like", path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
                    { val: "globe", label: "Website", path: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" },
                    { val: "gift", label: "Promo", path: "M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" },
                  ] as const).map(p => {
                    const isActive = !p.val ? !logoSymbol : logoSymbol === p.val;
                    return (
                      <button key={p.val || "none"}
                        onClick={() => setLogoSymbol(p.val)}
                        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-[8px] font-medium transition-all cursor-pointer ${
                          isActive ? "bg-[#00D4FF]/08 border-[#00D4FF]/30 text-[#0891B2]"
                                   : "bg-slate-50 border-slate-200 text-[#475569] hover:border-[#00D4FF]/30"
                        }`}>
                        {p.path ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke={isActive ? "#0891B2" : "#475569"} strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d={p.path} />
                          </svg>
                        ) : (
                          <span className="text-base w-[18px] text-center">✕</span>
                        )}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
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

            {/* Right — Customize + Preview */}
            <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100">

              {/* Customize Tabs */}
              <div className="border-b border-slate-100">
                <div className="flex">
                  {(["style","colors","logo","frame"] as const).map(tab => (
                    <button key={tab} onClick={() => setCustomizeTab(tab as any)}
                      className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider capitalize transition-all border-b-2 ${
                        customizeTab === tab
                          ? "border-[#00D4FF] text-[#0891B2] bg-[#00D4FF]/04"
                          : "border-transparent text-[#94A3B8] hover:text-[#475569]"
                      }`}>
                      {tab === "style" ? "🎨" : tab === "colors" ? "🖌" : tab === "logo" ? "🖼" : "🔲"}{" "}
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 overflow-y-auto" style={{ maxHeight: "360px" }}>

                {/* ── STYLE TAB ── */}
                {customizeTab === "style" && (
                  <div className="space-y-4">
                    {/* Style Presets */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Style Presets</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { name:"Classic",  dot:"square",         corner:"square",        cd:"square",  cc:"#0F172A", qc:"#0F172A" },
                          { name:"Rounded",  dot:"rounded",        corner:"extra-rounded", cd:"dot",     cc:"#0F172A", qc:"#0F172A" },
                          { name:"Dots",     dot:"dots",           corner:"extra-rounded", cd:"dot",     cc:"#00D4FF", qc:"#00D4FF" },
                          { name:"Classy",   dot:"classy-rounded", corner:"classy",        cd:"classy",  cc:"#8B5CF6", qc:"#8B5CF6" },
                          { name:"Blob",     dot:"extra-rounded",  corner:"extra-rounded", cd:"dot",     cc:"#00FF88", qc:"#00FF88" },
                          { name:"Sharp",    dot:"classy",         corner:"square",        cd:"square",  cc:"#EF4444", qc:"#EF4444" },
                        ].map(p => (
                          <button key={p.name} onClick={() => {
                            setDotStyle(p.dot); setCornerStyle(p.corner); setCornerDotStyle(p.cd);
                            setCornerColor(p.cc); setColor(p.qc);
                          }}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                              dotStyle === p.dot && cornerStyle === p.corner
                                ? "bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#0891B2]"
                                : "bg-slate-50 border-slate-200 text-[#475569] hover:border-[#00D4FF]/20"
                            }`}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dot Style */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Dot Style</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[
                          { v:"rounded", label:"Round" }, { v:"dots", label:"Dots" },
                          { v:"classy", label:"Classy" }, { v:"classy-rounded", label:"Soft" },
                          { v:"square", label:"Square" }, { v:"extra-rounded", label:"Blob" },
                        ].map(d => (
                          <button key={d.v} onClick={() => setDotStyle(d.v)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                              dotStyle === d.v ? "bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569] hover:border-[#00D4FF]/20"
                            }`}>{d.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Corner Style */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Corner Style</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[
                          { v:"square", label:"Square" }, { v:"extra-rounded", label:"Round" },
                          { v:"dot", label:"Dot" }, { v:"classy", label:"Classy" }, { v:"classy-rounded", label:"Soft" },
                        ].map(c => (
                          <button key={c.v} onClick={() => setCornerStyle(c.v)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                              cornerStyle === c.v ? "bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569] hover:border-[#00D4FF]/20"
                            }`}>{c.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* EC Level */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">
                        Error Correction
                        <span className="ml-1.5 text-[9px] font-normal text-[#94A3B8] normal-case">H = most reliable · use L for simpler QR</span>
                      </label>
                      <div className="flex gap-1.5">
                        {(["L","M","Q","H"] as const).map(ec => (
                          <button key={ec} onClick={() => setEcLevel(ec)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              ecLevel === ec ? "bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569] hover:border-[#00D4FF]/20"
                            }`}>
                            {ec}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Export Size */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Export Size</label>
                      <div className="flex gap-1.5">
                        {[512,1024,2048,4096].map(s => (
                          <button key={s} onClick={() => setExportSize(s)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              exportSize === s ? "bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569]"
                            }`}>{s >= 1024 ? `${s/1024}K` : s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── COLORS TAB ── */}
                {customizeTab === "colors" && (
                  <div className="space-y-4">
                    {/* QR Color */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">QR Color</label>
                      <div className="flex gap-1.5 flex-wrap items-center">
                        <input type="color" value={color} onChange={e => setColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
                        {["#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#EF4444","#0891B2"].map(c => (
                          <button key={c} onClick={() => setColor(c)} style={{ background: c }}
                            className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${color === c ? "border-[#00D4FF] scale-125" : "border-white shadow"}`} />
                        ))}
                      </div>
                    </div>

                    {/* Dot Gradient */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Dot Gradient</label>
                        <button onClick={() => setUseDotGradient(g => !g)}
                          className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${useDotGradient ? "bg-[#00D4FF]" : "bg-slate-200"}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all ${useDotGradient ? "left-5" : "left-1"}`} />
                        </button>
                      </div>
                      {useDotGradient && (
                        <div className="space-y-2">
                          <div className="flex gap-2 items-center flex-wrap">
                            <input type="color" value={dotGradientColor2} onChange={e => setDotGradientColor2(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                            <span className="text-[10px] text-[#94A3B8]">Second color</span>
                            {["#8B5CF6","#F472B6","#FB923C","#00FF88","#00D4FF"].map(c => (
                              <button key={c} onClick={() => setDotGradientColor2(c)} style={{ background: c }}
                                className={`w-5 h-5 rounded-full border-2 ${dotGradientColor2 === c ? "border-[#00D4FF] scale-125" : "border-white shadow"}`} />
                            ))}
                          </div>
                          <div className="flex gap-1.5">
                            {(["linear","radial"] as const).map(t => (
                              <button key={t} onClick={() => setDotGradientType(t)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border capitalize transition-all ${dotGradientType === t ? "bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#0891B2]" : "bg-slate-50 border-slate-200"}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Corner Color */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Corner Color</label>
                      <div className="flex gap-1.5 flex-wrap items-center">
                        <input type="color" value={cornerColor} onChange={e => setCornerColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
                        {["#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#EF4444"].map(c => (
                          <button key={c} onClick={() => setCornerColor(c)} style={{ background: c }}
                            className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${cornerColor === c ? "border-[#00D4FF] scale-125" : "border-white shadow"}`} />
                        ))}
                      </div>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Background</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {["#FFFFFF","#F8FAFC","#0F172A","#1E293B","#FFF9F0","#F0FFF4","#EFF6FF","#F5F0FF","#FFF0F6","#FFFBEB","#00FF88","#00D4FF"].map(c => (
                          <button key={c} onClick={() => setBgColor(c)}
                            style={{ background: c, border: bgColor === c ? "2px solid #00D4FF" : "2px solid #E2E8F0" }}
                            className="w-7 h-7 rounded-lg transition-all hover:scale-110" />
                        ))}
                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border-2 border-slate-200 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── LOGO TAB ── */}
                {customizeTab === "logo" && (
                  <div className="space-y-4">
                    {/* Brand logos */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Brand Logos</label>
                      <div className="grid grid-cols-8 gap-1">
                        {([
                          {id:"none",  bg:"#F1F5F9", fg:"#64748B", path:null,    label:"None"},
                          {id:"wa",    bg:"#25D366", fg:"#fff",    label:"WA",   path:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a6.3 6.3 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"},
                          {id:"ig",    bg:"#E1306C", fg:"#fff",    label:"IG",   path:"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838a6 6 0 100 12 6 6 0 000-12zm0 9.675a3.675 3.675 0 110-7.35 3.675 3.675 0 010 7.35zm6.406-10.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"},
                          {id:"fb",    bg:"#1877F2", fg:"#fff",    label:"FB",   path:"M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"},
                          {id:"yt",    bg:"#FF0000", fg:"#fff",    label:"YT",   path:"M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97C23 15.88 23 12 23 12s0-3.88-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"},
                          {id:"tt",    bg:"#010101", fg:"#fff",    label:"TT",   path:"M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9a8.18 8.18 0 004.78 1.52V7.09a4.85 4.85 0 01-1.01-.4z"},
                          {id:"li",    bg:"#0077B5", fg:"#fff",    label:"LI",   path:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z"},
                          {id:"tw",    bg:"#000000", fg:"#fff",    label:"X",    path:"M4 4l11.733 16H20L8.267 4z M4 20l6.768-6.768 M13.232 10.768L20 4"},
                          {id:"sc",    bg:"#FFFC00", fg:"#0F172A", label:"SC",   path:"M12 2c2 0 4.5 1.5 4.5 4.5 0 1.5-.5 2.5-1.5 3.5 3 0 5 2 5 5 0 1-1 2-2 2-.5 0-1-.5-1.5-1 0 1-.5 2-1.5 2h-6c-1 0-1.5-1-1.5-2-.5.5-1 1-1.5 1-1 0-2-1-2-2 0-3 2-5 5-5-1-1-1.5-2-1.5-3.5C7.5 3.5 10 2 12 2z"},
                          {id:"tg",    bg:"#2CA5E0", fg:"#fff",    label:"TG",   path:"m22 2-21 8 8 3 10-10-7 9 1 5 3-4 5 3z"},
                          {id:"gh",    bg:"#181717", fg:"#fff",    label:"GH",   path:"M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"},
                          {id:"rd",    bg:"#FF4500", fg:"#fff",    label:"RD",   path:"M12 2a10 10 0 100 20A10 10 0 0012 2zm5 11c0 1.1-.9 2-2 2h-.1c-.4 1.1-1.4 2-2.9 2s-2.5-.9-2.9-2H9c-1.1 0-2-.9-2-2 0-.6.3-1.1.7-1.4a3.4 3.4 0 01-.2-.9c0-1.9 2-3.5 4.5-3.5.3 0 .6 0 .9.1l.6-1.6a.5.5 0 01.9.3l-.7 1.9c1.2.4 2 1.2 2 2.1 0 .3-.1.6-.2.9.4.3.5.8.5 1.1z"},
                          {id:"sp",    bg:"#1DB954", fg:"#fff",    label:"SP",   path:"M12 2a10 10 0 100 20A10 10 0 0012 2zm4.5 14.4c-.2.3-.6.4-.9.2-2.4-1.5-5.5-1.8-9.1-.9-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 3.9-1 7.4-.6 10.1 1.1.3.1.4.5.3.8zm1.2-2.7c-.2.3-.7.5-1 .2-2.8-1.7-7-2.2-10.2-1.2-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.7-1.1 8.3-.6 11.5 1.4.3.2.4.6.1 1zm.1-2.8c-3.3-2-8.8-2.1-12-1.2-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 3.6-1 9.7-.8 13.5 1.4.5.3.6.9.4 1.4-.3.4-.9.5-1.5.2z"},
                          {id:"sl",    bg:"#4A154B", fg:"#fff",    label:"SL",   path:"M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.521V8.834zm-1.268 0a2.528 2.528 0 01-2.52 2.521 2.528 2.528 0 01-2.521-2.521V2.522A2.528 2.528 0 0115.165 0a2.528 2.528 0 012.52 2.522v6.312z"},
                          {id:"dr",    bg:"#4285F4", fg:"#fff",    label:"GD",   path:"M3 17.5l3-5.5h12l3 5.5H3zM12 3L3 18h3L12 6l6 12h3L12 3z"},
                          {id:"db",    bg:"#0061FF", fg:"#fff",    label:"DB",   path:"M12 2L6 6l6 4-6 4 6 4 6-4-6-4 6-4-6-4zm-6 4l-6 4 6 4 6-4-6-4z"},
                        ] as const).map(b => {
                          const logoSvg = b.path
                            ? (() => {
                                const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${b.fg}" stroke="${b.fg}" stroke-width="0.5"><rect width="24" height="24" fill="${b.bg}" rx="3"/><path d="${b.path}"/></svg>`;
                                return `data:image/svg+xml;base64,${btoa(svg)}`;
                              })()
                            : null;
                          const isActive = logoSvg ? logoSymbol === logoSvg : !logoSymbol;
                          return (
                            <button key={b.id} onClick={() => setLogoSymbol(logoSvg ?? null)}
                              title={b.label}
                              style={{ background: b.bg }}
                              className={`aspect-square rounded-lg flex items-center justify-center transition-all ${isActive ? "ring-2 ring-[#00D4FF]" : "hover:scale-110"}`}>
                              {b.path ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={b.fg} stroke={b.fg} strokeWidth="0.5">
                                  <path d={b.path} />
                                </svg>
                              ) : <span style={{ color: b.fg }} className="text-xs font-bold">✕</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Logo upload */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Upload Your Logo</label>
                      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#00D4FF]/40 transition-all">
                        <Upload size={14} className="text-[#94A3B8]" />
                        <span className="text-xs text-[#94A3B8]">Click to upload PNG/SVG</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = ev => setLogoSymbol(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }} />
                      </label>
                    </div>

                    {/* Logo options - only show when logo selected */}
                    {logoSymbol && (
                      <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">
                            Size: {Math.round(logoScale * 100)}%
                          </label>
                          <input type="range" min="10" max="50" value={Math.round(logoScale * 100)}
                            onChange={e => setLogoScale(Number(e.target.value) / 100)}
                            className="w-full accent-[#00D4FF]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Background Shape</label>
                          <div className="flex gap-1.5">
                            {(["none","square","rounded","circle"] as const).map(s => (
                              <button key={s} onClick={() => setLogoBgShape(s)}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-semibold border capitalize transition-all ${
                                  logoBgShape === s ? "bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#0891B2]" : "bg-white border-slate-200 text-[#475569]"
                                }`}>{s}</button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => setLogoSymbol(null)}
                          className="w-full py-1.5 text-[10px] font-semibold text-[#EF4444] border border-red-100 rounded-lg hover:bg-red-50 transition-all">
                          Remove Logo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

                {/* ── FRAME TAB ── */}
                {(customizeTab as string) === "frame" && (
                  <div className="space-y-4">

                    {/* With/Without Label */}
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                      <button onClick={() => setShowFrameLabel(true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${showFrameLabel ? "bg-white shadow text-[#0F172A]" : "text-[#94A3B8]"}`}>
                        With Label
                      </button>
                      <button onClick={() => setShowFrameLabel(false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!showFrameLabel ? "bg-white shadow text-[#0F172A]" : "text-[#94A3B8]"}`}>
                        Without Label
                      </button>
                    </div>

                    {/* Frame picker */}
                    <div>
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">Frame Style</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button onClick={() => setSelectedFrame(null)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[8px] font-medium transition-all ${
                            !selectedFrame ? "bg-[#00D4FF]/08 border-[#00D4FF]/30 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569]"
                          }`}>
                          <span className="text-lg">✕</span>None
                        </button>
                        {[
                          { id:"solid",    name:"Solid",    style:"border:6px solid;border-radius:4px;padding:6px;" },
                          { id:"rounded",  name:"Rounded",  style:"border:6px solid;border-radius:24px;padding:10px;" },
                          { id:"double",   name:"Double",   style:"border:3px double;outline:3px double;outline-offset:4px;border-radius:4px;padding:8px;" },
                          { id:"dashed",   name:"Dashed",   style:"border:4px dashed;border-radius:8px;padding:8px;" },
                          { id:"dotted",   name:"Dotted",   style:"border:4px dotted;border-radius:8px;padding:8px;" },
                          { id:"shadow",   name:"Shadow",   style:"border:3px solid;border-radius:8px;padding:8px;box-shadow:6px 6px 0 0 currentColor;" },
                          { id:"corners",  name:"Corners",  style:"border:0;padding:10px;box-shadow:14px 14px 0 0 currentColor,-14px 14px 0 0 currentColor,14px -14px 0 0 currentColor,-14px -14px 0 0 currentColor;" },
                          { id:"circle",   name:"Circle",   style:"border:6px solid;border-radius:50%;padding:14px;" },
                          { id:"scanme",   name:"Scan Me",  style:"border:4px solid;border-radius:12px;padding:6px 6px 0 6px;" },
                          { id:"thick",    name:"Thick",    style:"border:12px solid;border-radius:4px;padding:2px;" },
                          { id:"minimal",  name:"Minimal",  style:"border-bottom:4px solid;padding:8px;" },
                        ].map(f => (
                          <button key={f.id} onClick={() => setSelectedFrame(f.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[8px] font-medium transition-all ${
                              selectedFrame === f.id ? "bg-[#00D4FF]/08 border-[#00D4FF]/30 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569] hover:border-[#00D4FF]/20"
                            }`}>
                            <div style={{
                              width:28, height:28, borderColor: frameColor, color: frameColor,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              ...Object.fromEntries(f.style.split(";").filter(s=>s.trim()).map(s => {
                                const [k,...v] = s.split(":"); return [k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), v.join(":").trim().replace("currentColor", frameColor)];
                              }))
                            }}>
                              <div style={{width:14,height:14,background:"#0F172A",borderRadius:1}} />
                            </div>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frame Options */}
                    {selectedFrame && (
                      <div className="space-y-3 bg-slate-50 rounded-2xl p-3 border border-slate-200">
                        {showFrameLabel && (
                          <div>
                            <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Label Text</label>
                            <input value={frameCtaText} onChange={e => setFrameCtaText(e.target.value)}
                              placeholder="SCAN ME" maxLength={20}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-center tracking-widest uppercase outline-none focus:border-[#00D4FF]" />
                            <div className="flex gap-1.5 flex-wrap mt-1.5">
                              {["SCAN ME","FOLLOW US","SCAN & ORDER","FREE WIFI","BOOK NOW"].map(t => (
                                <button key={t} onClick={() => setFrameCtaText(t)}
                                  className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[8px] font-semibold text-[#475569] hover:border-[#00D4FF] transition-all">
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Frame Color</label>
                          <div className="flex gap-1.5 flex-wrap items-center">
                            <input type="color" value={frameColor} onChange={e => setFrameColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                            {["#0F172A","#FFFFFF","#00D4FF","#00FF88","#8B5CF6","#F472B6","#EF4444","#FB923C"].map(c => (
                              <button key={c} onClick={() => setFrameColor(c)} style={{ background: c }}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${frameColor === c ? "border-[#00D4FF] scale-125" : "border-white shadow"}`} />
                            ))}
                          </div>
                        </div>
                        {showFrameLabel && (
                          <div>
                            <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Label Color</label>
                            <div className="flex gap-1.5 flex-wrap items-center">
                              <input type="color" value={frameTextColor} onChange={e => setFrameTextColor(e.target.value)}
                                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                              {["#FFFFFF","#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#EF4444"].map(c => (
                                <button key={c} onClick={() => setFrameTextColor(c)} style={{ background: c }}
                                  className={`w-6 h-6 rounded-full border-2 transition-all ${frameTextColor === c ? "border-[#00D4FF] scale-125" : "border-white shadow"}`} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* QR Preview */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Live Preview</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_rgba(0,255,136,0.6)]" />
                    <span className="text-[10px] font-medium text-[#94A3B8]">Real-time</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="relative z-10 flex flex-col items-center">
                    {selectedFrame ? (
                      <div style={{
                        borderColor: frameColor,
                        color: frameColor,
                        background: bgColor,
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "center",
                        ...Object.fromEntries((FRAME_STYLES[selectedFrame] || "").split(";").filter(s=>s.trim()).map(s => {
                          const [k,...v] = s.split(":"); return [k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), v.join(":").trim().replace("currentColor", frameColor)];
                        }))
                      }}>
                        <div ref={ref} />
                        {showFrameLabel && frameCtaText && (
                          <div style={{
                            background: frameColor, color: frameTextColor,
                            padding: "5px 12px", fontSize: "10px", fontWeight: 800,
                            letterSpacing: "2px", textTransform: "uppercase",
                            width: "100%", textAlign: "center", marginTop: "4px",
                          }}>
                            {frameCtaText}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ background: bgColor, borderRadius: "8px", padding: "8px", lineHeight: 0 }}>
                        <div ref={ref} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Download buttons */}
                <div className="space-y-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => download("svg")}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.30)]">
                    <Download size={14} strokeWidth={2} /> Download SVG
                  </motion.button>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => download("png")}
                      className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-[#475569] font-semibold rounded-full text-xs hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all">
                      <Download size={10} strokeWidth={1.5} /> PNG
                    </button>
                    <button onClick={() => downloadPDF()}
                      className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-[#475569] font-semibold rounded-full text-xs hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all">
                      <Download size={10} strokeWidth={1.5} /> PDF
                    </button>
                    <a href="/auth?mode=signup"
                      className="flex items-center justify-center gap-1.5 py-2 bg-[#0F172A] text-white font-bold rounded-full text-xs hover:bg-[#1E293B] transition-all">
                      <Zap size={10} strokeWidth={2} /> Save
                    </a>
                  </div>
                  <p className="text-center text-[10px] text-[#94A3B8]">Free · No watermark · No signup for downloads</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && <DownloadModal onClose={() => setShowModal(false)} onSignup={() => { window.location.href = "/auth?mode=signup"; }} />}
        {showFrameDesigner && qrSvgContent && (
          <QRFrameDesigner
            qrSvgContent={qrSvgContent}
            onClose={() => setShowFrameDesigner(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}


/* ── Real World Images ────────────────────────────────── */
function RealWorldSection() {
  const images = [
    { file: "computer screen with qr code in it.jpg",            caption: "Digital presence",       tag: "Web",         span: 2 },
    { file: "business card with qr code on it.jpg",              caption: "Smart business cards",   tag: "Networking",  span: 1 },
    { file: "restaurant table with a qr code to order by.jpg",   caption: "Contactless ordering",   tag: "Hospitality", span: 1 },
    { file: "wedding table with qr code.jpg",                    caption: "Wedding menus & RSVPs",  tag: "Events",      span: 1 },
    { file: "woman with shopping bag holdoing a qr code.jpg",    caption: "Retail & promotions",    tag: "Retail",      span: 1 },
    { file: "package delivered with qr code on it.jpg",          caption: "Product tracking",       tag: "Logistics",   span: 1 },
    { file: "table in cafe with qr code on it.jpg",              caption: "Café menus",             tag: "F&B",         span: 1 },
    { type: "cta" as const, span: 2 },
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
          {images.map((item, i) => {
            if ("type" in item && item.type === "cta") {
              return (
                <motion.div key="cta"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.5 }}
                  className="relative overflow-hidden rounded-2xl col-span-2"
                  style={{ aspectRatio: "2/1", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}
                >
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)" }} />
                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                    <span className="text-3xl">🚀</span>
                    <h3 className="text-lg font-black text-white leading-tight">
                      So much more ideas &amp; usage.<br />
                      <span className="text-[#00FF88]">The sky is the limit.</span>
                    </h3>
                    <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                      Restaurants, real estate, events, healthcare, logistics, retail — every industry has a QR story. What&apos;s yours?
                    </p>
                    <a href="/auth?mode=signup"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.3)]">
                      <ArrowRight size={14} strokeWidth={2} /> Start Free Now
                    </a>
                  </div>
                </motion.div>
              );
            }
            const img = item as { file: string; caption: string; tag: string; span: number };
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ${img.span === 2 ? "col-span-2" : ""}`}
                style={{ aspectRatio: img.span === 2 ? "2/1" : "1/1" }}
              >
                <img src={IMG(img.file)} alt={img.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                    {img.tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-bold text-white leading-tight">{img.caption}</p>
                </div>
              </motion.div>
            );
          })}
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


/* ── App Screenshots ──────────────────────────────────── */
function AppScreenshots() {
  const screens = [
    {
      title: "Create in seconds",
      desc: "22 QR types, live preview, custom colors and logo overlay.",
      mockup: "create",
      accent: "#00D4FF",
    },
    {
      title: "Manage everything",
      desc: "All your QR codes in one place. Edit, preview, download, delete.",
      mockup: "codes",
      accent: "#00FF88",
    },
    {
      title: "Track every scan",
      desc: "Real-time analytics — scans, clicks, CTR, top performers.",
      mockup: "analytics",
      accent: "#8B5CF6",
    },
  ];

  const mockupContent: Record<string, React.ReactNode> = {
    create: (
      <div className="p-4 space-y-3">
        <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Choose Type</div>
        <div className="grid grid-cols-4 gap-1.5">
          {["URL","Wi-Fi","vCard","Email","SMS","Phone","Location","Event"].map(t => (
            <div key={t} className={`rounded-lg p-1.5 text-center text-[8px] font-semibold border ${t === "URL" ? "bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569]"}`}>{t}</div>
          ))}
        </div>
        <div className="h-px bg-slate-100" />
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center" style={{ height: 80 }}>
          <div className="w-14 h-14 bg-[#0F172A] rounded-lg opacity-80" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, white 3px, white 4px), repeating-linear-gradient(90deg, transparent, transparent 3px, white 3px, white 4px)",
          }} />
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 bg-[#00FF88] text-[#0F172A] text-[8px] font-bold rounded-full py-1.5 text-center">Download SVG</div>
          <div className="flex-1 border border-slate-200 text-[8px] font-medium rounded-full py-1.5 text-center text-[#475569]">Download PNG</div>
        </div>
      </div>
    ),
    codes: (
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-[#0F172A]">My Codes</div>
          <div className="text-[8px] bg-[#00FF88] text-[#0F172A] font-bold px-2 py-0.5 rounded-full">+ Create</div>
        </div>
        {[
          { name: "Homepage", type: "URL", scans: 142, dynamic: true },
          { name: "Guest WiFi", type: "Wi-Fi", scans: 89, dynamic: false },
          { name: "Business Card", type: "vCard", scans: 56, dynamic: true },
          { name: "Menu QR", type: "Menu", scans: 234, dynamic: true },
        ].map((code, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-xl">
            <div className="w-6 h-6 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-[#00D4FF] rounded-sm opacity-60" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-[#0F172A] truncate">{code.name}</div>
              <div className="text-[8px] text-[#94A3B8]">{code.scans} scans</div>
            </div>
            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${code.dynamic ? "bg-[#00D4FF]/10 text-[#0891B2]" : "bg-slate-100 text-[#94A3B8]"}`}>
              {code.dynamic ? "dynamic" : "static"}
            </span>
          </div>
        ))}
      </div>
    ),
    analytics: (
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[{ label: "Total Scans", val: "521", color: "#00D4FF" }, { label: "Avg CTR", val: "38%", color: "#00FF88" }, { label: "Active Codes", val: "4", color: "#8B5CF6" }, { label: "This Week", val: "+23%", color: "#FB923C" }].map(s => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-xl p-2">
              <div className="text-[11px] font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[7px] text-[#94A3B8]">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-2">
          <div className="text-[8px] font-bold text-[#0F172A] mb-2">Weekly Scans</div>
          <div className="flex items-end gap-1 h-12">
            {[40, 65, 45, 80, 60, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 rounded-t"
                style={{ height: `${h}%`, background: "linear-gradient(180deg, #00D4FF, #0891B2)" }} />
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <section className="py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A] mb-3">
            See How Easy It Is
          </h2>
          <p className="text-[#475569] max-w-lg mx-auto">
            Create, manage, and track your QR codes — all from one clean dashboard.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {screens.map((screen, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="flex flex-col"
            >
              {/* Phone mockup */}
              <div className="relative mx-auto mb-5" style={{ width: 200 }}>
                {/* Phone frame */}
                <div className="bg-[#0F172A] rounded-[28px] p-2 shadow-2xl"
                  style={{ boxShadow: `0 24px 60px ${screen.accent}25, 0 8px 20px rgba(0,0,0,0.3)` }}>
                  {/* Screen */}
                  <div className="bg-[#F8FAFC] rounded-[22px] overflow-hidden" style={{ minHeight: 260 }}>
                    {/* Status bar */}
                    <div className="bg-white flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                      <div className="w-12 h-3 rounded-full" style={{ background: "#0F172A" }} />
                      <div className="flex gap-1">
                        {[...Array(3)].map((_,j) => <div key={j} className="w-1.5 h-1.5 bg-slate-200 rounded-full" />)}
                      </div>
                    </div>
                    {mockupContent[screen.mockup]}
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute inset-0 rounded-[28px] pointer-events-none"
                  style={{ boxShadow: `0 0 40px ${screen.accent}20` }} />
              </div>

              {/* Label */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-2"
                  style={{ background: `${screen.accent}15`, color: screen.accent, border: `1px solid ${screen.accent}30` }}>
                  {i + 1 < 10 ? `0${i+1}` : i+1}
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] mb-1">{screen.title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{screen.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <motion.a href="/auth?mode=signup" whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#0F172A] text-white font-bold rounded-full text-sm hover:bg-[#1E293B] transition-all shadow-lg">
            <ArrowRight size={15} strokeWidth={2} /> Try it yourself — it&apos;s free
          </motion.a>
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
      desc: "For growing businesses.", cta: "Get Started Free", href: "/auth?mode=signup", featured: true,
      features: ["Unlimited static codes","10 dynamic QR codes","Advanced analytics","Custom frames & logo","Bulk import (50 codes)","Email support"] },
    { name: "Plus", price: { monthly: 18, annual: 14 }, period: "/mo",
      desc: "For teams and campaigns.", cta: "Get Started Free", href: "/auth?mode=signup", featured: false,
      features: ["100 dynamic QR codes","Folder organization","Campaign tracking","Bulk import (500 codes)","Geographic analytics","3 team seats (soon)","Email support"] },
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
      <AppScreenshots />
      <StaticVsDynamic />
      <Pricing />
      <FAQ />
      <CTABottom />
      <Footer />
    </main>
  );
}