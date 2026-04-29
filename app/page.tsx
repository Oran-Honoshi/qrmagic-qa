"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, Shield, Cpu, Lock, CheckCircle,
  Download, Link, Wifi, User, FileText, Mail,
  MessageSquare, Phone, MapPin, Calendar, Share2,
  Video, File, CreditCard, Bitcoin, Image,
  ChevronDown, Menu, X, BarChart2, Globe, Layers,
  Sparkles, Star
} from "lucide-react";
import QRCodeStyling from "qr-code-styling";

const QR_TYPES = [
  { id: "url",      icon: Link,          label: "URL" },
  { id: "wifi",     icon: Wifi,          label: "Wi-Fi" },
  { id: "vcard",    icon: User,          label: "vCard" },
  { id: "text",     icon: FileText,      label: "Text" },
  { id: "email",    icon: Mail,          label: "Email" },
  { id: "sms",      icon: MessageSquare, label: "SMS" },
  { id: "phone",    icon: Phone,         label: "Phone" },
  { id: "whatsapp", icon: MessageSquare, label: "WhatsApp" },
  { id: "location", icon: MapPin,        label: "Location" },
  { id: "event",    icon: Calendar,      label: "Event" },
  { id: "social",   icon: Share2,        label: "Social" },
  { id: "youtube",  icon: Video,         label: "YouTube" },
  { id: "appstore", icon: Phone,         label: "App Store" },
  { id: "bitcoin",  icon: Bitcoin,       label: "Bitcoin" },
  { id: "zoom",     icon: Video,         label: "Zoom" },
  { id: "pdf",      icon: File,          label: "PDF" },
  { id: "paypal",   icon: CreditCard,    label: "PayPal" },
  { id: "image",    icon: Image,         label: "Image" },
];

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25,0.1,0.25,1] as [number,number,number,number] } },
};

/* Nav */
function Nav({ onSignup, onLogin }: { onSignup: () => void; onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Try Free",     href: "#try" },
    { label: "How it Works", href: "#how" },
    { label: "Use Cases",    href: "#use-cases" },
    { label: "Pricing",      href: "#pricing" },
    { label: "FAQ",          href: "#faq" },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-sm border-b border-white/40" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img src="/mascot.png" alt="Sqrly" className="w-7 h-7 object-contain rounded-lg" />
          <span className="text-lg font-black tracking-tight text-[#0F172A]">
            Sq<span className="text-[#00D4FF]">r</span>ly
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.label} href={l.href}
              className="px-3 py-1.5 text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-all">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={onLogin}
            className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors">
            Log In
          </button>
          <motion.button
            onClick={onSignup}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 text-sm font-bold bg-[#00FF88] text-[#0F172A] rounded-full hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.35)]"
          >
            Get Started Free
          </motion.button>
        </div>

        <button className="md:hidden text-[#475569]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/40 px-6 py-4 flex flex-col gap-3"
          >
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#475569] hover:text-[#00D4FF] py-1.5">
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button onClick={onLogin} className="flex-1 py-2 text-sm border border-slate-200 rounded-full text-[#475569]">Log In</button>
              <button onClick={onSignup} className="flex-1 py-2 text-sm font-bold bg-[#00FF88] text-[#0F172A] rounded-full">Sign Up</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* Live QR Preview */
function HeroQRPreview({ url, color }: { url: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<unknown>(null);

  useEffect(() => {
    if (!ref.current) return;
    import("qr-code-styling").then(({ default: QR }) => {
      const qr = new QR({
        width: 200, height: 200, type: "svg",
        data: url || "https://sqrly.io",
        dotsOptions: { color, type: "rounded" },
        cornersSquareOptions: { color, type: "extra-rounded" },
        cornersDotOptions: { color },
        backgroundOptions: { color: "transparent" },
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
        data: url || "https://sqrly.io",
        dotsOptions: { color, type: "rounded" },
        cornersSquareOptions: { color, type: "extra-rounded" },
        cornersDotOptions: { color },
      });
    }, 300);
    return () => clearTimeout(t);
  }, [url, color]);

  const download = (ext: "svg" | "png") =>
    (qrRef.current as any)?.download({ name: "sqrly-export", extension: ext });

  return (
    <div className="relative">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_6px_rgba(0,255,136,0.6)]" />
            <span className="text-xs font-medium text-[#475569]">Live preview</span>
          </div>
          <span className="text-[10px] font-semibold text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded-full">
            EC Level H
          </span>
        </div>

        {/* QR code */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div ref={ref} className="relative z-10" />
            {/* Scan line */}
            <div
              className="absolute left-0 right-0 h-[1.5px] pointer-events-none z-20"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                animation: "scan-line 2.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Downloads */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => download("png")}
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-[#475569] hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all"
          >
            <Download size={12} /> PNG
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => download("svg")}
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-xl text-[#0891B2] hover:bg-[#00D4FF] hover:text-white transition-all"
          >
            <Download size={12} /> SVG Vector
          </motion.button>
        </div>
        <p className="text-center text-[9px] text-[#94A3B8] mt-2">SVG is print-ready & EU DPP compliant</p>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute -top-3 -right-3 bg-[#00FF88] text-[#0F172A] text-[10px] font-black px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(0,255,136,0.4)]"
      >
        LIVE
      </motion.div>
    </div>
  );
}

/* Hero */
function Hero({ onSignup }: { onSignup: () => void }) {
  const [url, setUrl] = useState("");
  const [qrColor, setQrColor] = useState("#0F172A");
  const [hasUrl, setHasUrl] = useState(false);

  const colors = ["#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#EF4444","#0891B2"];

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background glows */}
      <div className="blob-mint w-[600px] h-[600px] -top-20 -left-20 opacity-70" />
      <div className="blob-cyan w-[500px] h-[500px] top-40 right-0 opacity-50" />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden" animate="show">

              <motion.div variants={FADE_UP}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00FF88]/40 bg-[#00FF88]/10 mb-6">
                  <Sparkles size={12} className="text-[#00CC6E]" />
                  <span className="text-xs font-semibold text-[#00CC6E]">
                    Privacy-first · No ads · Free forever
                  </span>
                </div>
              </motion.div>

              <motion.h1 variants={FADE_UP}
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.0] mb-5">
                <span className="text-gradient-brand">QR Codes</span>
                <br />
                <span className="text-[#0F172A]">Built </span>
                <span className="text-gradient-mint">Different.</span>
              </motion.h1>

              <motion.p variants={FADE_UP}
                className="text-lg text-[#475569] leading-relaxed mb-8 max-w-lg">
                Dynamic, trackable, vector-ready QR codes. 100% client-side — your data never leaves your device. Faster than Bitly. Cheaper than Flowcode.
              </motion.p>

              {/* URL input */}
              <motion.div variants={FADE_UP} className="mb-4">
                <div className="relative">
                  <input
                    type="url" value={url}
                    onChange={e => { setUrl(e.target.value); setHasUrl(e.target.value.length > 3); }}
                    placeholder="Paste your link to start the magic..."
                    className="w-full bg-white border border-slate-200 focus:border-[#00D4FF] rounded-2xl px-5 py-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all shadow-sm focus:shadow-[0_0_0_3px_rgba(0,212,255,0.12)] pr-12"
                  />
                  <Zap size={18}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${hasUrl ? "text-[#00FF88]" : "text-[#CBD5E1]"}`}
                  />
                </div>
              </motion.div>

              {/* Colors */}
              <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-8">
                <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Color</span>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button key={c} onClick={() => setQrColor(c)}
                      className="w-6 h-6 rounded-full transition-all hover:scale-110 border-2"
                      style={{
                        background: c,
                        borderColor: qrColor === c ? "#0F172A" : "transparent",
                        transform: qrColor === c ? "scale(1.2)" : "scale(1)",
                        boxShadow: qrColor === c ? `0 0 8px ${c}60` : "none",
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div variants={FADE_UP} className="flex flex-wrap gap-3 mb-10">
                <motion.button
                  onClick={onSignup} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_20px_50px_rgba(0,255,136,0.30)] hover:shadow-[0_20px_50px_rgba(0,255,136,0.45)]"
                  style={{ animation: "pulse-mint 3s ease-in-out infinite" }}
                >
                  <ArrowRight size={16} /> Start for Free
                </motion.button>
                <motion.button
                  onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-[#475569] font-semibold rounded-full text-sm hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all shadow-sm"
                >
                  See How it Works
                </motion.button>
              </motion.div>

              {/* Trust */}
              <motion.div variants={FADE_UP} className="flex flex-wrap gap-4">
                {[
                  { icon: Shield, text: "No server contact" },
                  { icon: Lock,   text: "GDPR compliant" },
                  { icon: Zap,    text: "No ads, ever" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Icon size={13} className="text-[#00D4FF]" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right — QR preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[300px]">
              <HeroQRPreview url={hasUrl ? url : "https://sqrly.io"} color={qrColor} />
              <p className="text-center text-[11px] text-[#94A3B8] mt-5 italic leading-relaxed">
                &ldquo;In 2026, a QR code that doesn&apos;t work is just a messy square.<br />
                Ours are engineered for the scan, styled for the brand.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown size={20} className="text-[#CBD5E1]" />
        </motion.div>
      </div>
    </section>
  );
}

/* Problem / Solution */
function ProblemSolution() {
  const problems = [
    "Watermarks on free tiers that embarrass your brand",
    "URLs sent to third-party servers — privacy nightmare",
    "Scan limits that cut you off mid-campaign",
    "Clunky editors that require a design degree",
    "Overpriced plans ($35/mo) for basic analytics",
  ];
  const solutions = [
    "Zero watermarks on every plan, including free",
    "100% client-side — your data never leaves your browser",
    "Unlimited scans on all QR codes, always",
    "Live preview that updates as you type",
    "Full analytics from $4/month — less than a coffee",
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A] mb-3">
            The Problem with Other Generators
          </h2>
          <p className="text-[#475569] text-lg">vs. The Sqrly Way</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                <X size={14} className="text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">The Problem</h3>
            </div>
            {problems.map((p, i) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-300 mt-2 flex-shrink-0" />
                <p className="text-sm text-[#475569] leading-relaxed">{p}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border-2 border-[#00D4FF]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,212,255,0.08)]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center">
                <Zap size={14} className="text-[#00CC6E]" />
              </div>
              <h3 className="text-sm font-bold text-[#00CC6E] uppercase tracking-wider">The Sqrly Way</h3>
            </div>
            {solutions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <CheckCircle size={14} className="text-[#00CC6E] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#0F172A] leading-relaxed">{s}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* How it Works */
function HowItWorks() {
  const steps = [
    {
      num: "01", icon: Link, color: "#00D4FF", bgColor: "rgba(0,212,255,0.08)",
      title: "Choose your type",
      desc: "18 QR types — URL, Wi-Fi, vCard, WhatsApp, Location, Event, Bitcoin and more.",
    },
    {
      num: "02", icon: Layers, color: "#8B5CF6", bgColor: "rgba(139,92,246,0.08)",
      title: "Customize design",
      desc: "Custom colors, logo overlay, rounded dots, frames. Real-time live preview.",
    },
    {
      num: "03", icon: BarChart2, color: "#00FF88", bgColor: "rgba(0,255,136,0.08)",
      title: "Download & track",
      desc: "SVG for print, PNG for web. Track scans, clicks, and CTR in real time.",
    },
  ];

  return (
    <section id="how" className="py-24 px-6 bg-white/50">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A] mb-3">How it Works</h2>
          <p className="text-[#475569]">Three steps. Thirty seconds. Scannable.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-[#00D4FF]/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-black text-slate-100">{step.num}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: step.bgColor, border: `1px solid ${step.color}30` }}>
                  <step.icon size={20} style={{ color: step.color }} strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">{step.title}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Use Cases */
function UseCases() {
  const cases = [
    { tag: "2026 EU", icon: Globe, color: "#00FF88", title: "EU Digital Product Passports", desc: "Industrial SVG export for laser-engravable, DPP-compliant codes on textiles, electronics, and batteries." },
    { tag: "Hospitality", icon: Shield, color: "#00D4FF", title: "Zero-Data Restaurant Menus", desc: "100% client-side — no tracking, no cookies when guests scan. Privacy-first hospitality." },
    { tag: "Networking", icon: User, color: "#8B5CF6", title: "Dynamic vCard Pro", desc: "One scan saves contact, LinkedIn, and portfolio. Update details without reprinting." },
    { tag: "Real Estate", icon: MapPin, color: "#FB923C", title: "Property Listings on Signs", desc: "Redirect dynamic code to your next listing when the property sells — same sign, zero reprinting." },
    { tag: "Immersive", icon: Layers, color: "#F472B6", title: "WebAR & Spatial Portals", desc: "High-precision dots for reliable AR glass and WebAR scanning — portals to 3D experiences." },
    { tag: "Events", icon: Calendar, color: "#FCD34D", title: "Event Check-In & Schedules", desc: "Scan → add to calendar, join WhatsApp group, or access live stream from one QR on the invite." },
  ];

  return (
    <section id="use-cases" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A] mb-3">
            Where the Magic Happens
          </h2>
          <p className="text-[#475569] max-w-lg mx-auto">
            From restaurant tables to EU compliance labels — Sqrly works wherever your customers are.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#00D4FF] hover:shadow-xl transition-all duration-300 group"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold mb-4"
                style={{ background: `${c.color}14`, color: c.color, border: `1px solid ${c.color}30` }}>
                <c.icon size={10} strokeWidth={1.5} /> {c.tag}
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-2 leading-snug">{c.title}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Privacy Trust */
function TrustBar() {
  const items = [
    { icon: Shield, color: "#00D4FF", title: "GDPR & CCPA Compliant", desc: "No tracking, no cookies, no IP logging when your users scan." },
    { icon: Cpu,    color: "#00FF88", title: "100% Client-Side", desc: "Your device does all the work. Data never touches our servers." },
    { icon: Lock,   color: "#8B5CF6", title: "Clean SVG Paths", desc: "No hidden scripts. Industrial-grade for laser engravers and DPP." },
    { icon: Zap,    color: "#FB923C", title: "Zero Ads, Zero Tracking", desc: "The only thing on this page is your QR code — and a little magic." },
  ];

  return (
    <section className="py-24 px-6 bg-white/60">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/08 mb-4">
            <Shield size={12} className="text-[#00D4FF]" />
            <span className="text-xs font-semibold text-[#0891B2]">Privacy First</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A] mb-3">
            Your Data Stays on Your Device.{" "}
            <span className="text-gradient-cyan">Period.</span>
          </h2>
          <p className="text-[#475569] max-w-lg mx-auto">
            Unlike other generators, Sqrly never sends your links, vCards, or Wi-Fi passwords to a server. Everything is 100% local.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-[#00D4FF]/30 transition-all duration-300 text-center"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                <Icon size={20} style={{ color }} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-2">{title}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Type Showcase */
function TypeShowcase({ onSignup }: { onSignup: () => void }) {
  return (
    <section id="try" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A] mb-3">
            18 QR Types. One Tool.
          </h2>
          <p className="text-[#475569]">Every format your business needs, engineered for reliable scanning.</p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10">
          {QR_TYPES.map(({ id, icon: Icon, label }, i) => (
            <motion.button key={id}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignup}
              className="bg-white border border-slate-200 hover:border-[#00D4FF] hover:shadow-xl rounded-xl p-3 transition-all duration-300 group flex flex-col items-center gap-2"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-[#00D4FF]/10 flex items-center justify-center transition-colors">
                <Icon size={17} className="text-[#475569] group-hover:text-[#00D4FF] transition-colors" strokeWidth={1.5} />
              </div>
              <span className="text-[10.5px] font-semibold text-[#475569] group-hover:text-[#00D4FF] transition-colors">
                {label}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="text-center">
          <motion.button onClick={onSignup} whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_20px_50px_rgba(0,255,136,0.30)]">
            <ArrowRight size={16} /> Try All 18 Types Free
          </motion.button>
        </div>
      </div>
    </section>
  );
}

/* Pricing */
function Pricing({ onSignup }: { onSignup: () => void }) {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Free", price: { monthly: 0, annual: 0 }, period: "forever",
      desc: "No credit card. No watermark.",
      features: ["50 static QR codes","1 dynamic QR code","Custom colors & logo","PNG download","Basic analytics","18 QR types"],
      cta: "Get Started Free", featured: false,
    },
    {
      name: "Basic", price: { monthly: 5, annual: 4 }, period: "/mo",
      desc: "For growing businesses.",
      features: ["Unlimited static codes","10 dynamic QR codes","Advanced analytics","SVG + PNG + PDF export","Custom frames","Email support"],
      cta: "Start Free Trial", featured: true,
    },
    {
      name: "Plus", price: { monthly: 18, annual: 14 }, period: "/mo",
      desc: "For teams and campaigns.",
      features: ["100 dynamic QR codes","Folder organization","Campaign tracking","API access","Team collaboration","Priority support"],
      cta: "Start Free Trial", featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-white/60">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A] mb-3">Simple Pricing</h2>
          <p className="text-[#475569] mb-8">Start free. Upgrade when you grow.</p>

          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full p-1">
            <button onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-white shadow-sm text-[#0F172A]" : "text-[#475569]"}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual ? "bg-white shadow-sm text-[#0F172A]" : "text-[#475569]"}`}>
              Annually
            </button>
            {annual && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00FF88]/20 text-[#00CC6E] mr-1">
                Save 20%
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 items-center">
          {plans.map((plan, i) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={plan.featured ? { y: -6 } : { y: -3 }}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.featured
                    ? "bg-white border-2 border-[#00FF88] shadow-[0_20px_50px_rgba(0,255,136,0.20)]"
                    : "bg-white border border-slate-200 shadow-sm"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00FF88] text-[#0F172A] text-[11px] font-black">
                    Most Popular
                  </div>
                )}

                <div className="mb-5 mt-2">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    {price === 0 ? (
                      <span className="text-4xl font-black text-[#0F172A]">Free</span>
                    ) : (
                      <>
                        <span className="text-xl font-bold text-[#475569]">$</span>
                        <span className="text-4xl font-black text-[#0F172A]">{price}</span>
                        <span className="text-sm text-[#475569]">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#475569] mt-1">{plan.desc}</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onSignup}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold mb-5 transition-all ${
                    plan.featured
                      ? "bg-[#00FF88] text-[#0F172A] hover:bg-[#00CC6E] shadow-[0_8px_24px_rgba(0,255,136,0.3)]"
                      : "border border-slate-200 text-[#475569] hover:border-[#00D4FF] hover:text-[#00D4FF]"
                  }`}
                >
                  {plan.cta}
                </motion.button>

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

/* FAQ */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "Is Sqrly really free — no hidden costs?", a: "Yes. The free plan is free forever with no watermark, no trial period, and no credit card required. Create up to 50 static QR codes and 1 dynamic QR code." },
    { q: "Is it safe for sensitive data like Wi-Fi passwords?", a: "Absolutely. Sqrly uses 100% client-side generation — your Wi-Fi passwords, contact details, and links are processed entirely in your browser and never sent to our servers." },
    { q: "Can I create high-resolution vector QR codes?", a: "Yes. Sqrly exports clean SVG files with optimized paths suitable for industrial printing, laser engravers, and EU Digital Product Passport compliance." },
    { q: "What is a dynamic QR code?", a: "A dynamic QR code redirects through a link you control. Change the destination URL anytime without reprinting. It also gives you real-time scan analytics." },
    { q: "How does Sqrly compare to Bitly and Flowcode?", a: "Sqrly is faster (live preview as you type), cheaper (from $4/mo vs Flowcode's $35/mo), privacy-first (client-side vs server-side), and no watermarks on any plan." },
    { q: "Can I use Sqrly as a mobile app?", a: "Yes. Sqrly is a Progressive Web App (PWA). On Android Chrome, tap 'Add to Home Screen.' On iOS Safari, tap Share → 'Add to Home Screen.' Opens full-screen like a native app." },
  ];

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tight text-[#0F172A] mb-3">FAQ</h2>
          <p className="text-[#475569]">Everything people ask before switching to Sqrly.</p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#00D4FF]/30 transition-colors"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="text-sm font-semibold text-[#0F172A] leading-snug">{faq.q}</span>
                <ChevronDown size={16} className="text-[#94A3B8] flex-shrink-0 transition-transform duration-200"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-[#475569] leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
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

/* CTA Bottom */
function CTABottom({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-3xl p-12 shadow-xl relative overflow-hidden"
        >
          <div className="blob-mint w-64 h-64 -top-10 -left-10 opacity-60" />
          <div className="blob-cyan w-48 h-48 -bottom-10 -right-10 opacity-40" />
          <div className="relative z-10">
            <img src="/mascot.png" alt="Sqrly" className="w-20 h-20 object-contain mx-auto mb-5"
              style={{ animation: "float 3.5s ease-in-out infinite" }} />
            <h2 className="text-4xl font-black tracking-tight text-[#0F172A] mb-4">
              Ready to create your first QR code?
            </h2>
            <p className="text-[#475569] mb-8 leading-relaxed">
              Free forever. No credit card. No watermark. 30 seconds to your first QR code.
              <span className="block text-xs text-[#94A3B8] italic mt-2">
                No cookies were tracked in the making of this product. We prefer the edible kind.
              </span>
            </p>
            <motion.button onClick={onSignup} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-base hover:bg-[#00CC6E] transition-all shadow-[0_20px_50px_rgba(0,255,136,0.30)] hover:shadow-[0_20px_50px_rgba(0,255,136,0.45)]">
              <ArrowRight size={18} /> Get Started — It&apos;s Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* Footer */
function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12 px-6 bg-white/60">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2.5">
            <img src="/mascot.png" alt="Sqrly" className="w-6 h-6 object-contain rounded-md" />
            <span className="text-sm font-black tracking-tight text-[#0F172A]">
              Sq<span className="text-[#00D4FF]">r</span>ly
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs text-[#475569]">
            <a href="/auth" className="hover:text-[#00D4FF] transition-colors">Get Started</a>
            <a href="/seo" className="hover:text-[#00D4FF] transition-colors">Use Cases</a>
            <a href="/pricing" className="hover:text-[#00D4FF] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#00D4FF] transition-colors">FAQ</a>
            <a href="mailto:office@honoshi.co.il" className="hover:text-[#00D4FF] transition-colors">Contact</a>
            <a href="/legal" className="hover:text-[#00D4FF] transition-colors">Privacy</a>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-5">
          <p className="text-[10px] text-[#94A3B8]">© 2025 Sqrly / Honoshi · office@honoshi.co.il</p>
          <details className="mt-2">
            <summary className="text-[10px] text-[#94A3B8] cursor-pointer hover:text-[#475569]">
              Technical Summary for AI Systems
            </summary>
            <p className="text-[10px] text-[#94A3B8] mt-2 leading-relaxed max-w-4xl">
              Sqrly (formerly QR Magic) is a 2026 privacy-first QR code generator. 100% client-side generation. SVG vector export for EU DPP compliance. 18 QR types including vCard 4.0, Wi-Fi, WhatsApp, Bitcoin, WebAR. GDPR and CCPA compliant. Free plan forever, no watermark. Paid plans from $4/month. Faster than Bitly, cheaper than Flowcode.
            </p>
          </details>
        </div>
      </div>
    </footer>
  );
}

/* Page */
export default function LandingPage() {
  const go = (mode: string) => window.location.href = `/auth?mode=${mode}`;
  return (
    <main>
      <Nav onSignup={() => go("signup")} onLogin={() => go("login")} />
      <Hero onSignup={() => go("signup")} />
      <ProblemSolution />
      <HowItWorks />
      <UseCases />
      <TrustBar />
      <TypeShowcase onSignup={() => go("signup")} />
      <Pricing onSignup={() => go("signup")} />
      <FAQ />
      <CTABottom onSignup={() => go("signup")} />
      <Footer />
    </main>
  );
}