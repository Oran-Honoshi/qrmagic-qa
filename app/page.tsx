"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Zap, ArrowRight, Shield, Cpu, Lock, CheckCircle,
  Download, Link, Wifi, User, FileText, Mail,
  MessageSquare, Phone, MapPin, Calendar, Share2,
  Smartphone, Video, CreditCard,
  ChevronDown, Menu, X,
  BarChart2, Globe, Layers,
   Bitcoin, Image, File, RefreshCw,
  ExternalLink, Star
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
  { id: "youtube",  icon: Video,       label: "YouTube" },
  { id: "appstore", icon: Smartphone,    label: "App Store" },
  { id: "bitcoin",  icon: Bitcoin,       label: "Bitcoin" },
  { id: "zoom",     icon: Video,         label: "Zoom" },
  { id: "pdf",      icon: File,          label: "PDF" },
  { id: "paypal",   icon: CreditCard,    label: "PayPal" },
  { id: "image",    icon: Image,         label: "Image" },
];


const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};
const STAGGER: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

function Nav({ onSignup, onLogin }: { onSignup: () => void; onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Try Free",    href: "#try" },
    { label: "How it Works",href: "#how" },
    { label: "Use Cases",   href: "#use-cases" },
    { label: "Pricing",     href: "#pricing" },
    { label: "FAQ",         href: "#faq" },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong border-b border-[var(--qm-glass-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src="/mascot.png" alt="QR Magic" className="w-7 h-7 object-contain rounded-md" />
          <span className="text-base font-bold tracking-tight text-[var(--qm-text-1)]">
            <span className="text-[var(--qm-cyan)]">QR</span> Magic
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-3 py-1.5 text-sm font-medium text-[var(--qm-text-2)] hover:text-[var(--qm-text-1)] hover:bg-white/5 rounded-lg transition-all"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm font-medium text-[var(--qm-text-2)] hover:text-[var(--qm-text-1)] transition-colors"
          >
            Log In
          </button>
          <button
            onClick={onSignup}
            className="px-4 py-2 text-sm font-semibold bg-[var(--qm-cyan)] text-[#0A0E14] rounded-full hover:bg-[var(--qm-cyan-bright)] transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_var(--qm-cyan-glow)]"
          >
            Get Started Free
          </button>
        </div>

        {/* Mobile menu */}
        <button
          className="md:hidden text-[var(--qm-text-2)] p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-[var(--qm-glass-border)] px-6 py-4 flex flex-col gap-3"
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[var(--qm-text-2)] hover:text-[var(--qm-cyan)] py-1.5"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2 border-t border-[var(--qm-glass-border)]">
              <button onClick={onLogin} className="flex-1 py-2 text-sm text-[var(--qm-text-2)] border border-[var(--qm-border)] rounded-full">Log In</button>
              <button onClick={onSignup} className="flex-1 py-2 text-sm font-semibold bg-[var(--qm-cyan)] text-[#0A0E14] rounded-full">Sign Up</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function HeroQRPreview({ url, color }: { url: string; color: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!qrRef.current) return;
    const qr = new QRCodeStyling({
      width: 220,
      height: 220,
      type: "svg",
      data: url || "https://qrmagic.io",
      dotsOptions:    { color, type: "rounded" },
      cornersSquareOptions: { color, type: "extra-rounded" },
      cornersDotOptions:    { color },
      backgroundOptions:    { color: "transparent" },
      qrOptions: { errorCorrectionLevel: "H" },
    });
    qrRef.current.innerHTML = "";
    qr.append(qrRef.current);
    qrInstance.current = qr;
  }, []);

  useEffect(() => {
    if (!qrInstance.current) return;
    setScanning(true);
    const t = setTimeout(() => {
      qrInstance.current?.update({
        data: url || "https://qrmagic.io",
        dotsOptions: { color, type: "rounded" },
        cornersSquareOptions: { color, type: "extra-rounded" },
        cornersDotOptions: { color },
      });
      setScanning(false);
    }, 250);
    return () => clearTimeout(t);
  }, [url, color]);

  const handleDownload = (ext: "svg" | "png") => {
    qrInstance.current?.download({ name: "qrmagic-export", extension: ext });
  };

  return (
    <div className="relative">
      {/* Holographic border */}
      <div
        className="p-[1.5px] rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #06B6D4, #8B5CF6, #F472B6, #06B6D4)",
          backgroundSize: "300% 300%",
          animation: "gradient-shift 4s ease infinite, pulse-glow 3s ease-in-out infinite",
        }}
      >
        <div className="bg-[var(--qm-s1)] rounded-[14px] p-5 relative overflow-hidden">
          {/* Scan line */}
          <div
            className="absolute left-0 right-0 h-[1px] pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, #06B6D4, transparent)",
              animation: "scan-line 2.5s ease-in-out infinite",
            }}
          />

          {/* QR code */}
          <div
            ref={qrRef}
            className="relative transition-opacity duration-200"
            style={{ opacity: scanning ? 0.6 : 1 }}
          />

          {/* Corner accents */}
          {[
            "top-2 left-2 border-t border-l",
            "top-2 right-2 border-t border-r",
            "bottom-2 left-2 border-b border-l",
            "bottom-2 right-2 border-b border-r",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute w-4 h-4 ${pos} border-[var(--qm-cyan)] rounded-sm opacity-60`}
            />
          ))}
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleDownload("png")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-[var(--qm-s2)] border border-[var(--qm-border)] rounded-xl text-[var(--qm-text-2)] hover:border-[var(--qm-cyan-border)] hover:text-[var(--qm-cyan)] transition-all"
        >
          <Download size={12} /> PNG
        </button>
        <button
          onClick={() => handleDownload("svg")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-[var(--qm-cyan-subtle)] border border-[var(--qm-cyan-border)] rounded-xl text-[var(--qm-cyan)] hover:bg-[var(--qm-cyan)] hover:text-[#0A0E14] transition-all"
        >
          <Download size={12} /> SVG <span className="text-[10px] opacity-70">Vector</span>
        </button>
      </div>

      <p className="text-center text-[10.5px] text-[var(--qm-text-3)] mt-2">
        SVG is print-ready & EU DPP compliant
      </p>
    </div>
  );
}

function Hero({ onSignup }: { onSignup: () => void }) {
  const [url, setUrl]       = useState("");
  const [qrColor, setQrColor] = useState("#06B6D4");
  const [hasUrl, setHasUrl] = useState(false);

  const colors = [
    "#06B6D4", "#22D3EE", "#F472B6", "#8B5CF6",
    "#4ADE80", "#FB923C", "#F87171", "#F0F4F8",
  ];

  const handleInput = (val: string) => {
    setUrl(val);
    setHasUrl(val.length > 3);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-16"
    >
      {/* Background blobs */}
      <div className="blob-cyan w-[500px] h-[500px] -top-40 -left-40 opacity-60" />
      <div className="blob-violet w-[400px] h-[400px] top-20 right-0 opacity-40" />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy + input */}
          <div>
            <motion.div
              variants={STAGGER}
              initial="hidden"
              animate="show"
            >
              {/* Tag */}
              <motion.div variants={FADE_UP}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--qm-cyan-border)] bg-[var(--qm-cyan-subtle)] mb-6">
                  <Zap size={12} className="text-[var(--qm-cyan)]" />
                  <span className="text-xs font-semibold text-[var(--qm-cyan)]">
                    Privacy-first · No ads · Free forever
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={FADE_UP}
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.0] mb-5"
              >
                <span className="text-[var(--qm-text-1)]">QR Codes</span>
                <br />
                <span className="text-gradient">Built Different.</span>
              </motion.h1>

              <motion.p
                variants={FADE_UP}
                className="text-lg text-[var(--qm-text-2)] leading-relaxed mb-8 max-w-lg"
              >
                Dynamic, trackable, vector-ready QR codes. 
                100% client-side — your data never leaves your device.
                Faster than Bitly. Cheaper than Flowcode. More powerful than both.
              </motion.p>

              {/* Hero input */}
              <motion.div variants={FADE_UP} className="mb-4">
                <div className="relative group">
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.08))",
                      filter: "blur(8px)",
                    }}
                  />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleInput(e.target.value)}
                    placeholder="Paste your link to start the magic..."
                    className="relative w-full bg-[var(--qm-s2)] border border-[var(--qm-border)] focus:border-[var(--qm-cyan-border)] rounded-xl px-5 py-4 text-base text-[var(--qm-text-1)] placeholder:text-[var(--qm-text-3)] outline-none transition-all duration-200 focus:bg-[var(--qm-s3)] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] pr-14"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Zap
                      size={18}
                      className={`transition-colors duration-200 ${
                        hasUrl ? "text-[var(--qm-cyan)]" : "text-[var(--qm-text-3)]"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Color picker */}
              <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-8">
                <span className="text-xs font-medium text-[var(--qm-text-3)] uppercase tracking-wider">
                  Color
                </span>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setQrColor(c)}
                      className="w-6 h-6 rounded-full transition-all duration-150 hover:scale-110"
                      style={{
                        background: c,
                        border: qrColor === c ? "2px solid white" : "2px solid transparent",
                        transform: qrColor === c ? "scale(1.2)" : "scale(1)",
                        boxShadow: qrColor === c ? `0 0 8px ${c}80` : "none",
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* CTA buttons */}
              <motion.div variants={FADE_UP} className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={onSignup}
                  className="flex items-center gap-2 px-6 py-3.5 bg-[var(--qm-cyan)] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[var(--qm-cyan-bright)] transition-all hover:-translate-y-0.5 shadow-[0_4px_24px_var(--qm-cyan-glow)]"
                  style={{ animation: "pulse-glow 2.5s ease-in-out infinite" }}
                >
                  <ArrowRight size={16} />
                  Start for Free
                </button>
                <button
                  onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 px-6 py-3.5 bg-transparent border border-[var(--qm-border)] text-[var(--qm-text-2)] font-semibold rounded-full text-sm hover:border-[var(--qm-cyan-border)] hover:text-[var(--qm-cyan)] transition-all"
                >
                  See How it Works
                </button>
              </motion.div>

              {/* Trust row */}
              <motion.div
                variants={FADE_UP}
                className="flex flex-wrap items-center gap-4"
              >
                {[
                  { icon: Shield, text: "No server contact" },
                  { icon: Lock,   text: "GDPR compliant" },
                  { icon: Zap,    text: "No ads, ever" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-[var(--qm-text-3)]">
                    <Icon size={13} className="text-[var(--qm-cyan)]" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right — live QR preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center lg:items-end"
          >
            <div className="w-full max-w-[320px]">
              {/* Status bar */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: hasUrl ? "var(--qm-cyan)" : "var(--qm-s4)",
                      boxShadow: hasUrl ? "0 0 8px var(--qm-cyan-glow)" : "none",
                    }}
                  />
                  <span className="text-xs font-medium text-[var(--qm-text-3)]">
                    {hasUrl ? "Live preview" : "Waiting for URL"}
                  </span>
                </div>
                <span className="text-xs text-[var(--qm-text-3)]">EC Level H</span>
              </div>

              <HeroQRPreview url={hasUrl ? url : "https://qrmagic.io"} color={qrColor} />

              {/* Bottom hint */}
              <p className="text-center text-xs text-[var(--qm-text-3)] mt-5 leading-relaxed">
                "In 2026, a QR code that doesn't work<br />
                is just a messy square. Ours are engineered<br />
                for the scan, styled for the brand."
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <ChevronDown size={20} className="text-[var(--qm-text-3)]" />
        </motion.div>
      </div>
    </section>
  );
}

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-black tracking-tight text-[var(--qm-text-1)] mb-3">
            The Problem with Other QR Generators
          </h2>
          <p className="text-[var(--qm-text-2)] text-lg">vs. The QR Magic Way</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--qm-s1)] border border-[var(--qm-border)] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <X size={14} className="text-red-400" />
              </div>
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">The Problem</h3>
            </div>
            <div className="space-y-3">
              {problems.map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/50 mt-2 flex-shrink-0" />
                  <p className="text-sm text-[var(--qm-text-2)] leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--qm-cyan-subtle)] border border-[var(--qm-cyan-border)] rounded-2xl p-6"
            style={{ boxShadow: "0 0 40px rgba(6,182,212,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[var(--qm-cyan-subtle)] border border-[var(--qm-cyan-border)] flex items-center justify-center">
                <Zap size={14} className="text-[var(--qm-cyan)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--qm-cyan)] uppercase tracking-wider">The QR Magic Way</h3>
            </div>
            <div className="space-y-3">
              {solutions.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={14} className="text-[var(--qm-cyan)] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[var(--qm-text-1)] leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Link,
      color: "var(--qm-cyan)",
      title: "Choose your type",
      desc: "18 QR types — URL, Wi-Fi, vCard, WhatsApp, Location, Event, Bitcoin, and more.",
      visual: (
        <div className="grid grid-cols-3 gap-1.5">
          {[Link, Wifi, User, Mail, MapPin, MessageSquare].map((Icon, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center ${
                i === 0
                  ? "bg-[var(--qm-cyan-subtle)] border border-[var(--qm-cyan-border)]"
                  : "bg-[var(--qm-s3)] border border-[var(--qm-border)]"
              }`}
            >
              <Icon size={14} className={i === 0 ? "text-[var(--qm-cyan)]" : "text-[var(--qm-text-3)]"} />
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "02",
      icon: Layers,
      color: "var(--qm-violet)",
      title: "Customize design",
      desc: "Custom colors, logo overlay, rounded dots, frames. Real-time holographic preview.",
      visual: (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {["#06B6D4","#F472B6","#8B5CF6","#4ADE80","#FB923C"].map((c) => (
              <div key={c} className="w-6 h-6 rounded-full border-2 border-transparent" style={{ background: c }} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {["None","Rounded","Badge","Scan","Simple","Extra"].map((f, i) => (
              <div key={f} className={`text-[9px] font-medium rounded px-1 py-0.5 text-center ${i===1?"bg-[var(--qm-cyan-subtle)] text-[var(--qm-cyan)] border border-[var(--qm-cyan-border)]":"bg-[var(--qm-s3)] text-[var(--qm-text-3)] border border-[var(--qm-border)]"}`}>
                {f}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: "03",
      icon: BarChart2,
      color: "#4ADE80",
      title: "Download & track",
      desc: "Export SVG for print, PNG for web. Track scans, clicks, and CTR in real time.",
      visual: (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {[["PNG","Web"],["SVG","Vector"],["PDF","Print"]].map(([fmt, sub], i) => (
              <div key={fmt} className={`flex-1 rounded-lg py-1.5 text-center border ${i===1?"bg-[var(--qm-cyan-subtle)] border-[var(--qm-cyan-border)]":"bg-[var(--qm-s3)] border-[var(--qm-border)]"}`}>
                <div className={`text-[10px] font-bold ${i===1?"text-[var(--qm-cyan)]":"text-[var(--qm-text-2)]"}`}>{fmt}</div>
                <div className="text-[8px] text-[var(--qm-text-3)]">{sub}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[["142","Scans"],["89","Clicks"],["63%","CTR"]].map(([val, lbl]) => (
              <div key={lbl} className="bg-[var(--qm-s3)] rounded-lg p-1.5 text-center border border-[var(--qm-border)]">
                <div className="text-sm font-black text-[var(--qm-cyan)]">{val}</div>
                <div className="text-[8px] text-[var(--qm-text-3)] uppercase tracking-wider">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-black tracking-tight text-[var(--qm-text-1)] mb-3">
            How it Works
          </h2>
          <p className="text-[var(--qm-text-2)]">Three steps. Thirty seconds. Scannable.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-[var(--qm-border)] hover:border-[var(--qm-cyan-border)] transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-black" style={{ color: step.color, opacity: 0.25 }}>
                  {step.num}
                </span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${step.color}14`, border: `1px solid ${step.color}30` }}
                >
                  <step.icon size={18} style={{ color: step.color }} />
                </div>
              </div>
              <h3 className="text-base font-bold text-[var(--qm-text-1)] mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--qm-text-2)] leading-relaxed mb-5">{step.desc}</p>
              <div className="bg-[var(--qm-s2)] rounded-xl p-3 border border-[var(--qm-border)]">
                {step.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    {
      tag: "2026 · EU Regulation",
      icon: Globe,
      color: "#4ADE80",
      title: "EU Digital Product Passports",
      desc: "New EU law requires consumer goods to carry DPP-compliant QR codes. Our industrial SVG export ensures your codes are laser-engravable, billboard-scalable, and DPP-ready.",
      keywords: ["EU DPP compliance", "circular economy", "sustainable manufacturing"],
    },
    {
      tag: "Hospitality",
      icon: Shield,
      color: "var(--qm-cyan)",
      title: "Zero-Data Restaurant Menus",
      desc: "100% client-side generation means no tracking, no cookies, no IP logging when guests scan. Just the menu. Privacy-first hospitality for discerning venues.",
      keywords: ["GDPR menu", "no-tracking QR", "privacy hospitality"],
    },
    {
      tag: "Networking",
      icon: User,
      color: "var(--qm-violet)",
      title: "Dynamic vCard Pro",
      desc: "A single scan saves your contact, LinkedIn, portfolio, and a calendar booking link — all updating in real-time. Change jobs? Update your vCard without reprinting.",
      keywords: ["digital business card", "vCard 4.0", "contactless networking"],
    },
    {
      tag: "Real Estate",
      icon: MapPin,
      color: "#FB923C",
      title: "Property Listings on Every Sign",
      desc: "QR on a For Sale sign links to photos, virtual tour, and your WhatsApp. When it sells, redirect the dynamic code to your next listing — same sign, zero reprinting.",
      keywords: ["property QR", "real estate marketing", "virtual tour QR"],
    },
    {
      tag: "Immersive Tech",
      icon: Layers,
      color: "var(--qm-pink)",
      title: "WebAR & Spatial Portals",
      desc: "High-precision dot generation ensures reliable scanning for AR glass and mobile WebAR launchers. Turn any surface into a portal to 3D product previews or immersive experiences.",
      keywords: ["WebAR launch code", "spatial computing", "immersive marketing"],
    },
    {
      tag: "Events",
      icon: Calendar,
      color: "#FCD34D",
      title: "Event Check-In & Schedules",
      desc: "Scan to add to calendar (iCal), join WhatsApp group, or access live stream — all from one QR on the invite. Track which posters drove the most registrations.",
      keywords: ["event QR", "iCal QR", "conference check-in"],
    },
  ];

  return (
    <section id="use-cases" className="py-24 px-6 bg-[var(--qm-s1)]/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-black tracking-tight text-[var(--qm-text-1)] mb-3">
            Where the Magic Happens
          </h2>
          <p className="text-[var(--qm-text-2)] max-w-lg mx-auto">
            From restaurant tables to EU compliance labels — QR Magic works wherever your customers are in 2026.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-5 border border-[var(--qm-border)] hover:border-[rgba(6,182,212,0.25)] transition-all group"
            >
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold mb-4"
                style={{ background: `${c.color}14`, color: c.color, border: `1px solid ${c.color}30` }}
              >
                <c.icon size={10} />
                {c.tag}
              </div>
              <h3 className="text-sm font-bold text-[var(--qm-text-1)] mb-2 leading-snug">
                {c.title}
              </h3>
              <p className="text-xs text-[var(--qm-text-2)] leading-relaxed mb-4">
                {c.desc}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[var(--qm-s3)] border border-[var(--qm-border)] text-[var(--qm-text-3)]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    {
      icon: Shield,
      title: "GDPR & CCPA Compliant",
      desc: "No tracking, no cookies, no IP logging when your users scan.",
    },
    {
      icon: Cpu,
      title: "100% Client-Side",
      desc: "QR codes are generated in your browser. Your data never touches our server.",
    },
    {
      icon: Lock,
      title: "Clean SVG Paths",
      desc: "No hidden layers, no scripts. Industrial-grade output for laser engravers and DPP compliance.",
    },
    {
      icon: Zap,
      title: "Zero Ads, Zero Tracking",
      desc: "We hate ads as much as you do. The only thing here is your QR code — and a little magic.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--qm-cyan-border)] bg-[var(--qm-cyan-subtle)] mb-4">
            <Shield size={12} className="text-[var(--qm-cyan)]" />
            <span className="text-xs font-semibold text-[var(--qm-cyan)]">Privacy First</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-[var(--qm-text-1)] mb-3">
            Your Data Stays on Your Device.{" "}
            <span className="text-gradient-static">Period.</span>
          </h2>
          <p className="text-[var(--qm-text-2)] max-w-lg mx-auto">
            Unlike other generators, QR Magic never sends your links, vCards, or Wi-Fi passwords to a server.
            Everything happens 100% locally in your browser.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5 border border-[var(--qm-border)] hover:border-[var(--qm-cyan-border)] transition-all text-center"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--qm-cyan-subtle)] border border-[var(--qm-cyan-border)] flex items-center justify-center mx-auto mb-4">
                <Icon size={20} className="text-[var(--qm-cyan)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--qm-text-1)] mb-2">{title}</h3>
              <p className="text-xs text-[var(--qm-text-2)] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TypeShowcase({ onSignup }: { onSignup: () => void }) {
  return (
    <section id="try" className="py-24 px-6 bg-[var(--qm-s1)]/40">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-black tracking-tight text-[var(--qm-text-1)] mb-3">
            18 QR Types. One Tool.
          </h2>
          <p className="text-[var(--qm-text-2)]">
            Every format your business needs, engineered for reliable scanning.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10">
          {QR_TYPES.map(({ id, icon: Icon, label }, i) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              onClick={onSignup}
              className="glass rounded-xl p-3 border border-[var(--qm-border)] hover:border-[var(--qm-cyan-border)] hover:bg-[var(--qm-cyan-subtle)] transition-all group flex flex-col items-center gap-2"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--qm-s3)] border border-[var(--qm-border)] flex items-center justify-center group-hover:bg-[var(--qm-cyan-subtle)] group-hover:border-[var(--qm-cyan-border)] transition-all">
                <Icon size={17} className="text-[var(--qm-text-3)] group-hover:text-[var(--qm-cyan)] transition-colors" />
              </div>
              <span className="text-[10.5px] font-semibold text-[var(--qm-text-3)] group-hover:text-[var(--qm-cyan)] transition-colors">
                {label}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onSignup}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--qm-cyan)] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[var(--qm-cyan-bright)] transition-all hover:-translate-y-0.5 shadow-[0_4px_24px_var(--qm-cyan-glow)]"
          >
            <ArrowRight size={16} />
            Try All 18 Types Free
          </button>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onSignup }: { onSignup: () => void }) {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: 0,
      period: "forever",
      desc: "No credit card. No watermark. No catch.",
      features: [
        "50 static QR codes",
        "1 dynamic QR code",
        "Custom colors & logo",
        "PNG download",
        "Basic analytics",
        "18 QR types",
      ],
      cta: "Get Started Free",
      featured: false,
      ctaStyle: "secondary",
    },
    {
      name: "Basic",
      price: annual ? 4 : 5,
      period: annual ? "/mo · billed annually" : "/mo",
      desc: "For growing businesses that need more.",
      features: [
        "Unlimited static codes",
        "10 dynamic QR codes",
        "Advanced analytics",
        "SVG + PNG + PDF export",
        "Custom frames & badges",
        "Email support",
      ],
      cta: "Start Free Trial",
      featured: true,
      ctaStyle: "primary",
    },
    {
      name: "Plus",
      price: annual ? 14 : 18,
      period: annual ? "/mo · billed annually" : "/mo",
      desc: "For teams and high-volume campaigns.",
      features: [
        "100 dynamic QR codes",
        "Folder organization",
        "Campaign tracking",
        "API access",
        "Team collaboration",
        "Priority support",
      ],
      cta: "Start Free Trial",
      featured: false,
      ctaStyle: "primary",
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black tracking-tight text-[var(--qm-text-1)] mb-3">
            Simple Pricing
          </h2>
          <p className="text-[var(--qm-text-2)] mb-8">Start free. Upgrade when you grow.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-[var(--qm-s2)] border border-[var(--qm-border)] rounded-full p-1 px-2">
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer ${!annual ? "bg-[var(--qm-s3)] text-[var(--qm-text-1)]" : "text-[var(--qm-text-3)]"}`}
              onClick={() => setAnnual(false)}>
              Monthly
            </span>
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer ${annual ? "bg-[var(--qm-s3)] text-[var(--qm-text-1)]" : "text-[var(--qm-text-3)]"}`}
              onClick={() => setAnnual(true)}>
              Annually
            </span>
            {annual && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--qm-pink-subtle)] border border-[var(--qm-pink)]/20 text-[var(--qm-pink)]">
                Save 20%
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.featured
                  ? "bg-[var(--qm-cyan-subtle)] border border-[var(--qm-cyan-border)]"
                  : "glass border border-[var(--qm-border)]"
              }`}
              style={plan.featured ? { boxShadow: "0 0 40px rgba(6,182,212,0.08)" } : {}}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--qm-cyan)] text-[#0A0E14] text-xs font-bold">
                  Most Popular
                </div>
              )}

              {/* Spacer for badge */}
              <div className={plan.featured ? "h-3" : "h-0"} />

              <div className="mb-5">
                <div className="text-xs font-bold text-[var(--qm-text-3)] uppercase tracking-widest mb-2">
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-black text-[var(--qm-text-1)]">Free</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-[var(--qm-text-2)]">$</span>
                      <span className="text-4xl font-black text-[var(--qm-text-1)]">{plan.price}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-[var(--qm-text-3)]">{plan.period}</div>
                <p className="text-xs text-[var(--qm-text-2)] mt-2">{plan.desc}</p>
              </div>

              <button
                onClick={onSignup}
                className={`w-full py-2.5 rounded-full text-sm font-semibold mb-5 transition-all ${
                  plan.ctaStyle === "primary"
                    ? "bg-[var(--qm-cyan)] text-[#0A0E14] hover:bg-[var(--qm-cyan-bright)] shadow-[0_4px_16px_var(--qm-cyan-glow)]"
                    : "border border-[var(--qm-border)] text-[var(--qm-text-2)] hover:border-[var(--qm-cyan-border)] hover:text-[var(--qm-cyan)]"
                }`}
              >
                {plan.cta}
              </button>

              <div className="h-px bg-[var(--qm-border)] mb-5" />

              <div className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle size={13} className="text-[var(--qm-cyan)] flex-shrink-0" />
                    <span className="text-xs text-[var(--qm-text-2)]">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is QR Magic really free — no hidden costs?",
      a: "Yes. The free plan is free forever with no watermark, no trial period, and no credit card. Create up to 50 static QR codes and 1 dynamic code. Paid plans start at $4/month.",
    },
    {
      q: "Is it safe for sensitive data like Wi-Fi passwords and vCards?",
      a: "Absolutely. QR Magic uses 100% client-side generation — your Wi-Fi passwords, contact details, and links are processed entirely in your browser and never sent to our servers. We have no access to your data.",
    },
    {
      q: "Can I create high-resolution vector QR codes for printing?",
      a: "Yes. QR Magic exports clean SVG files with optimized paths suitable for industrial printing, laser engravers, and EU Digital Product Passport compliance. No ghost layers, no pixel artifacts — infinitely scalable.",
    },
    {
      q: "What is a dynamic QR code and why do I need one?",
      a: "A dynamic QR code redirects through a short link you control. You can change the destination URL anytime without reprinting. It also gives you real-time scan analytics — how many people scanned, when, and on which device.",
    },
    {
      q: "Can I use QR Magic for EU Digital Product Passport compliance?",
      a: "Yes. QR Magic's SVG export is designed for high-redundancy industrial use — clean mathematical paths, square viewBox for perfect scaling, and support for the error correction levels required by EU DPP regulations for textiles, electronics, and batteries.",
    },
    {
      q: "How does QR Magic compare to Bitly, QR Code Generator, and Flowcode?",
      a: "QR Magic is faster (live preview as you type), cheaper (from $4/mo vs Flowcode's $35/mo), privacy-first (client-side vs server-side), and has no watermarks on any plan. We also support 18 QR types vs Bitly's limited set.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-[var(--qm-s1)]/40">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black tracking-tight text-[var(--qm-text-1)] mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-[var(--qm-text-2)]">Everything people ask before switching to QR Magic.</p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl border border-[var(--qm-border)] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-semibold text-[var(--qm-text-1)] leading-snug">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className="text-[var(--qm-text-3)] flex-shrink-0 transition-transform duration-200"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                />
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
                    <div className="px-5 pb-5 text-sm text-[var(--qm-text-2)] leading-relaxed border-t border-[var(--qm-border)] pt-4">
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

function CTABottom({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div
            className="rounded-3xl p-12"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.06) 100%)",
              border: "1px solid rgba(6,182,212,0.15)",
              boxShadow: "0 0 60px rgba(6,182,212,0.08)",
            }}
          >
            <img
              src="/mascot.png"
              alt="QR Magic mascot"
              className="w-20 h-20 object-contain mx-auto mb-6"
              style={{ animation: "float 3.5s ease-in-out infinite" }}
            />
            <h2 className="text-4xl font-black tracking-tight text-[var(--qm-text-1)] mb-4">
              Ready to create your first QR code?
            </h2>
            <p className="text-[var(--qm-text-2)] mb-8 leading-relaxed">
              Free forever. No credit card. No watermark. Your first QR code takes 30 seconds.
              <br />
              <span className="text-xs text-[var(--qm-text-3)] mt-2 block">
                No cookies were tracked in the making of this product. We prefer the edible kind.
              </span>
            </p>
            <button
              onClick={onSignup}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--qm-cyan)] text-[#0A0E14] font-bold rounded-full text-base hover:bg-[var(--qm-cyan-bright)] transition-all hover:-translate-y-1 shadow-[0_4px_32px_var(--qm-cyan-glow)]"
            >
              <ArrowRight size={18} />
              Get Started — It&apos;s Free
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--qm-border)] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2.5">
            <img src="/mascot.png" alt="QR Magic" className="w-6 h-6 object-contain rounded-md" />
            <span className="text-sm font-bold tracking-tight">
              <span className="text-[var(--qm-cyan)]">QR</span> Magic
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--qm-text-3)]">
            <a href="/auth" className="hover:text-[var(--qm-cyan)] transition-colors">Get Started</a>
            <a href="#use-cases" className="hover:text-[var(--qm-cyan)] transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-[var(--qm-cyan)] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[var(--qm-cyan)] transition-colors">FAQ</a>
            <a href="mailto:office@honoshi.co.il" className="hover:text-[var(--qm-cyan)] transition-colors">Contact</a>
            <a href="/legal" className="hover:text-[var(--qm-cyan)] transition-colors">Privacy</a>
          </div>
        </div>

        {/* AI semantic summary block */}
        <div className="border-t border-[var(--qm-border)] pt-6">
          <p className="text-[10.5px] text-[var(--qm-text-3)] leading-relaxed max-w-4xl">
            © 2025 QR Magic / Honoshi · office@honoshi.co.il
          </p>
          <details className="mt-3">
            <summary className="text-[10px] text-[var(--qm-text-3)] cursor-pointer hover:text-[var(--qm-text-2)] transition-colors">
              Technical Summary for AI Systems
            </summary>
            <p className="text-[10px] text-[var(--qm-text-3)] mt-2 leading-relaxed max-w-4xl">
              QR Magic is a specialized 2026 utility for generating high-redundancy, vector-ready (SVG) QR codes.
              Supports EU Digital Product Passports (DPP), WebAR triggers, vCard 4.0, Wi-Fi, WhatsApp, Bitcoin,
              and 18 total QR types. Privacy-first architecture: 100% client-side generation — no server contact.
              GDPR and CCPA compliant. Free plan forever, no watermark, no ads. Paid plans from $4/month.
              Faster than Bitly, cheaper than Flowcode, more privacy-focused than QR Code Generator Pro.
              Supports SVG vector export for industrial printing and EU DPP label compliance.
            </p>
          </details>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const handleSignup = () => {
    window.location.href = "/auth";
  };
  const handleLogin = () => {
    window.location.href = "/auth?mode=login";
  };

  return (
    <main>
      <Nav onSignup={handleSignup} onLogin={handleLogin} />
      <Hero onSignup={handleSignup} />
      <ProblemSolution />
      <HowItWorks />
      <UseCases />
      <TrustBar />
      <TypeShowcase onSignup={handleSignup} />
      <Pricing onSignup={handleSignup} />
      <FAQ />
      <CTABottom onSignup={handleSignup} />
      <Footer />
    </main>
  );
}