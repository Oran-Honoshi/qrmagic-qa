"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, X, Type, Palette } from "lucide-react";

type FrameId = "none" | "modern" | "rounded" | "badge" | "ticket" | "bubble" | "minimal" | "neon" | "sign" | "tag" | "arrow" | "circle";

interface FramePreset {
  id: FrameId;
  name: string;
  emoji: string;
  path: string;
  viewBox: string;
  qrPos: { x: number; y: number; size: number };
  textPos: { x: number; y: number; anchor?: string };
  textTop?: boolean;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const FRAMES: Record<FrameId, FramePreset> = {
  none: {
    id: "none", name: "Clean", emoji: "✨",
    path: "", viewBox: "0 0 200 200",
    qrPos: { x: 0, y: 0, size: 200 },
    textPos: { x: 0, y: 0 },
  },
  modern: {
    id: "modern", name: "Modern", emoji: "🔲",
    path: "M10 5 H190 A8 8 0 0 1 198 13 V215 A8 8 0 0 1 190 223 H10 A8 8 0 0 1 2 215 V13 A8 8 0 0 1 10 5 Z",
    viewBox: "0 0 200 228",
    qrPos: { x: 12, y: 12, size: 176 },
    textPos: { x: 100, y: 218 },
    strokeColor: "#00D4FF", fillColor: "#FFFFFF", strokeWidth: 2,
  },
  rounded: {
    id: "rounded", name: "Rounded", emoji: "⬜",
    path: "M30 4 H170 A26 26 0 0 1 196 30 V210 A26 26 0 0 1 170 236 H30 A26 26 0 0 1 4 210 V30 A26 26 0 0 1 30 4 Z",
    viewBox: "0 0 200 240",
    qrPos: { x: 16, y: 16, size: 168 },
    textPos: { x: 100, y: 228 },
    strokeColor: "#00FF88", fillColor: "#FFFFFF", strokeWidth: 2,
  },
  badge: {
    id: "badge", name: "Badge", emoji: "🏅",
    path: "M100 4 L196 52 V148 L100 196 L4 148 V52 Z",
    viewBox: "0 0 200 200",
    qrPos: { x: 40, y: 40, size: 120 },
    textPos: { x: 100, y: 186 },
    strokeColor: "#8B5CF6", fillColor: "#FFFFFF", strokeWidth: 2,
  },
  ticket: {
    id: "ticket", name: "Ticket", emoji: "🎟",
    path: "M4 20 H196 V80 A12 12 0 0 1 196 100 A12 12 0 0 1 196 120 V180 H4 V120 A12 12 0 0 1 4 100 A12 12 0 0 1 4 80 V20 Z",
    viewBox: "0 0 200 200",
    qrPos: { x: 30, y: 30, size: 140 },
    textPos: { x: 100, y: 14 },
    textTop: true,
    strokeColor: "#FB923C", fillColor: "#FFFFFF", strokeWidth: 1.5,
  },
  bubble: {
    id: "bubble", name: "Bubble", emoji: "💬",
    path: "M10 10 H190 A10 10 0 0 1 200 20 V180 A10 10 0 0 1 190 190 H110 L100 210 L90 190 H10 A10 10 0 0 1 0 180 V20 A10 10 0 0 1 10 10 Z",
    viewBox: "0 0 200 215",
    qrPos: { x: 15, y: 15, size: 170 },
    textPos: { x: 0, y: 0 },
    strokeColor: "#F472B6", fillColor: "#FFFFFF", strokeWidth: 2,
  },
  minimal: {
    id: "minimal", name: "Minimal", emoji: "➕",
    path: "",
    viewBox: "0 0 200 220",
    qrPos: { x: 0, y: 0, size: 200 },
    textPos: { x: 100, y: 214 },
    strokeColor: "#00D4FF", fillColor: "transparent",
  },
  neon: {
    id: "neon", name: "Neon", emoji: "⚡",
    path: "M10 5 H190 A8 8 0 0 1 198 13 V215 A8 8 0 0 1 190 223 H10 A8 8 0 0 1 2 215 V13 A8 8 0 0 1 10 5 Z",
    viewBox: "0 0 200 228",
    qrPos: { x: 12, y: 12, size: 176 },
    textPos: { x: 100, y: 218 },
    strokeColor: "#00FF88", fillColor: "#0F172A", strokeWidth: 2,
  },
  sign: {
    id: "sign", name: "Sign", emoji: "🪧",
    path: "M4 4 H196 V196 H110 L100 216 L90 196 H4 Z",
    viewBox: "0 0 200 220",
    qrPos: { x: 16, y: 16, size: 168 },
    textPos: { x: 100, y: 190 },
    strokeColor: "#00D4FF", fillColor: "#FFFFFF", strokeWidth: 2,
  },
  tag: {
    id: "tag", name: "Tag", emoji: "🏷",
    path: "M4 20 H160 L196 100 L160 180 H4 Z",
    viewBox: "0 0 200 200",
    qrPos: { x: 16, y: 16, size: 140 },
    textPos: { x: 90, y: 190 },
    strokeColor: "#8B5CF6", fillColor: "#FFFFFF", strokeWidth: 2,
  },
  arrow: {
    id: "arrow", name: "Arrow", emoji: "➡️",
    path: "M4 40 H130 L196 100 L130 160 H4 Z",
    viewBox: "0 0 200 200",
    qrPos: { x: 12, y: 36, size: 128 },
    textPos: { x: 70, y: 188 },
    strokeColor: "#FB923C", fillColor: "#FFFFFF", strokeWidth: 2,
  },
  circle: {
    id: "circle", name: "Circle", emoji: "⭕",
    path: "M100 4 A96 96 0 1 1 99.99 4 Z",
    viewBox: "0 0 200 200",
    qrPos: { x: 30, y: 30, size: 140 },
    textPos: { x: 100, y: 190 },
    strokeColor: "#F472B6", fillColor: "#FFFFFF", strokeWidth: 2,
  },
};

const CTA_PRESETS = [
  "SCAN ME", "SCAN TO ORDER", "SCAN TO CONNECT",
  "FOLLOW US", "GET DISCOUNT", "LEARN MORE",
  "BOOK NOW", "JOIN US", "WATCH VIDEO", "FREE WIFI",
];

// Symbol overlays — emoji/icon placed in center of QR
const SYMBOLS = [
  { id: "none",     label: "None",      icon: "—" },
  { id: "wifi",     label: "Wi-Fi",     icon: "📶" },
  { id: "link",     label: "Link",      icon: "🔗" },
  { id: "store",    label: "Store",     icon: "🏪" },
  { id: "menu",     label: "Menu",      icon: "🍽" },
  { id: "heart",    label: "Like",      icon: "❤️" },
  { id: "star",     label: "Review",    icon: "⭐" },
  { id: "phone",    label: "Call",      icon: "📞" },
  { id: "mail",     label: "Email",     icon: "✉️" },
  { id: "map",      label: "Location",  icon: "📍" },
  { id: "video",    label: "Video",     icon: "▶️" },
  { id: "cart",     label: "Shop",      icon: "🛒" },
  { id: "gift",     label: "Promo",     icon: "🎁" },
  { id: "book",     label: "Info",      icon: "📖" },
  { id: "music",    label: "Music",     icon: "🎵" },
  { id: "camera",   label: "Photo",     icon: "📷" },
];

const COLORS = {
  stroke: ["#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#0F172A","#EF4444","#FCD34D"],
  text:   ["#0F172A","#FFFFFF","#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#EF4444"],
  fill:   ["#FFFFFF","#F8FAFC","#0F172A","#1E293B","#F0FFF4","#EFF6FF","#FFF7ED","#FDF4FF"],
};

// Corner dot styles for the QR code itself
const CORNER_STYLES = [
  { id: "square",        label: "Square",      preview: "⬛" },
  { id: "extra-rounded", label: "Rounded",     preview: "🔵" },
  { id: "dot",           label: "Dot",         preview: "⚫" },
  { id: "classy",        label: "Classy",      preview: "💠" },
  { id: "classy-rounded",label: "Soft",        preview: "🔷" },
];

function ColorDot({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-6 h-6 rounded-full border-2 flex-shrink-0 transition-transform"
      style={{
        background: color,
        borderColor: selected ? "#0F172A" : (color === "#FFFFFF" ? "#E2E8F0" : "transparent"),
        transform: selected ? "scale(1.3)" : "scale(1)",
        boxShadow: selected ? `0 0 0 2px white, 0 0 0 3px ${color}` : "none",
      }} />
  );
}

export function QRFrameDesigner({
  qrSvgContent,
  onClose,
}: {
  qrSvgContent: string;
  onClose: () => void;
}) {
  const [frameId, setFrameId] = useState<FrameId>("modern");
  const [ctaText, setCtaText] = useState("SCAN ME");
  const [strokeColor, setStrokeColor] = useState("#00D4FF");
  const [textColor, setTextColor] = useState("#0F172A");
  const [fillColor, setFillColor] = useState("#FFFFFF");
  const [downloaded, setDownloaded] = useState(false);
  const [cornerStyle, setCornerStyle] = useState("extra-rounded");
  const [symbol, setSymbol] = useState("none");
  const svgRef = useRef<SVGSVGElement>(null);

  const frame = FRAMES[frameId];

  // For neon frame override text to white
  const effectiveTextColor = frameId === "neon" ? "#00FF88" : textColor;
  const effectiveFillColor = frameId === "neon" ? "#0F172A" : fillColor;
  const effectiveStroke = frameId === "neon" ? "#00FF88" : strokeColor;

  function download() {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(svgRef.current);
    // Ensure proper XML declaration for standalone SVG
    svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgStr;
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sqrly-framed-qr.svg";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-[#0F172A]">Frame Designer</h2>
            <p className="text-xs text-[#94A3B8]">Add a frame and CTA label to your QR code</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#475569] hover:bg-slate-200 transition-colors">
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_320px]">
          {/* Preview */}
          <div className="p-6 flex flex-col items-center justify-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center"
              style={{ width: "min(300px, 100%)", aspectRatio: "1" }}>
              <svg ref={svgRef} viewBox={frame.viewBox}
                className="w-full h-full" xmlns="http://www.w3.org/2000/svg"
                style={{ filter: frameId === "neon" ? "drop-shadow(0 0 8px rgba(0,255,136,0.4))" : "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}>

                {/* Background */}
                {frame.path && (
                  <path d={frame.path} fill={effectiveFillColor}
                    stroke={effectiveStroke} strokeWidth={frame.strokeWidth || 2} />
                )}

                {/* QR Code layer */}
                <g transform={`translate(${frame.qrPos.x}, ${frame.qrPos.y}) scale(${frame.qrPos.size / 200})`}
                  dangerouslySetInnerHTML={{ __html: qrSvgContent }} />

                {/* Symbol overlay — centered on QR */}
                {symbol !== "none" && (() => {
                  const sym = SYMBOLS.find(s => s.id === symbol);
                  if (!sym) return null;
                  const cx = frame.qrPos.x + frame.qrPos.size / 2;
                  const cy = frame.qrPos.y + frame.qrPos.size / 2;
                  return (
                    <>
                      <circle cx={cx} cy={cy} r={18}
                        fill={effectiveFillColor}
                        stroke={effectiveStroke}
                        strokeWidth={1.5} />
                      <text x={cx} y={cy + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize="18">
                        {sym.icon}
                      </text>
                    </>
                  );
                })()}

                {/* Corner accents for modern/rounded */}
                {(frameId === "modern" || frameId === "rounded") && (
                  <>
                    {[
                      { x: frame.qrPos.x + 2, y: frame.qrPos.y + 2 },
                      { x: frame.qrPos.x + frame.qrPos.size - 14, y: frame.qrPos.y + 2 },
                      { x: frame.qrPos.x + 2, y: frame.qrPos.y + frame.qrPos.size - 14 },
                      { x: frame.qrPos.x + frame.qrPos.size - 14, y: frame.qrPos.y + frame.qrPos.size - 14 },
                    ].map((pos, i) => (
                      <rect key={i} x={pos.x} y={pos.y} width={12} height={12} rx={2}
                        fill="none" stroke={effectiveStroke} strokeWidth={2} opacity={0.5} />
                    ))}
                  </>
                )}

                {/* Minimal frame — just corner lines */}
                {frameId === "minimal" && (
                  <>
                    <line x1={0} y1={10} x2={0} y2={0} stroke={effectiveStroke} strokeWidth={4} strokeLinecap="round" />
                    <line x1={0} y1={0} x2={10} y2={0} stroke={effectiveStroke} strokeWidth={4} strokeLinecap="round" />
                    <line x1={190} y1={0} x2={200} y2={0} stroke={effectiveStroke} strokeWidth={4} strokeLinecap="round" />
                    <line x1={200} y1={0} x2={200} y2={10} stroke={effectiveStroke} strokeWidth={4} strokeLinecap="round" />
                    <line x1={0} y1={190} x2={0} y2={200} stroke={effectiveStroke} strokeWidth={4} strokeLinecap="round" />
                    <line x1={0} y1={200} x2={10} y2={200} stroke={effectiveStroke} strokeWidth={4} strokeLinecap="round" />
                    <line x1={200} y1={190} x2={200} y2={200} stroke={effectiveStroke} strokeWidth={4} strokeLinecap="round" />
                    <line x1={190} y1={200} x2={200} y2={200} stroke={effectiveStroke} strokeWidth={4} strokeLinecap="round" />
                  </>
                )}

                {/* CTA Text */}
                {frameId !== "none" && ctaText && frame.textPos.x > 0 && (
                  <text x={frame.textPos.x} y={frame.textPos.y}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={effectiveTextColor} fontWeight="900"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize={frameId === "ticket" ? "9" : "8"}
                    letterSpacing="1">
                    {ctaText.toUpperCase()}
                  </text>
                )}
              </svg>
            </div>

            {/* Download */}
            <motion.button onClick={download} whileTap={{ scale: 0.95 }}
              className={`mt-5 flex items-center gap-2 px-6 py-3 font-bold rounded-full text-sm transition-all ${
                downloaded
                  ? "bg-[#00D4FF]/15 border border-[#00D4FF]/30 text-[#0891B2]"
                  : "bg-[#00FF88] text-[#0F172A] shadow-[0_4px_16px_rgba(0,255,136,0.30)] hover:bg-[#00CC6E]"
              }`}>
              {downloaded ? <><Check size={14} strokeWidth={2} /> Downloaded!</> : <><Download size={14} strokeWidth={2} /> Download Framed SVG</>}
            </motion.button>
            <p className="text-[9.5px] text-[#CBD5E1] mt-2">Single SVG · Print-ready · EU DPP compliant</p>
          </div>

          {/* Controls */}
          <div className="p-5 space-y-5 overflow-y-auto">

            {/* Frame gallery */}
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Frame Style</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.values(FRAMES).map(f => (
                  <motion.button key={f.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setFrameId(f.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                      frameId === f.id
                        ? "border-[#00D4FF] bg-[#00D4FF]/08"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200"
                    }`}>
                    <span className="text-lg leading-none">{f.emoji}</span>
                    <span className="text-[9px] font-semibold text-[#475569] text-center leading-tight">{f.name}</span>
                    {frameId === f.id && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#00D4FF] rounded-full flex items-center justify-center">
                        <Check size={8} strokeWidth={3} className="text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CTA text */}
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Type size={10} strokeWidth={2} /> CTA Label
              </p>
              <input value={ctaText} onChange={e => setCtaText(e.target.value.slice(0, 20))}
                placeholder="e.g. SCAN TO ORDER"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] rounded-xl px-3 py-2.5 text-sm font-bold text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all uppercase tracking-wide mb-2" />
              <div className="flex flex-wrap gap-1.5">
                {CTA_PRESETS.map(preset => (
                  <button key={preset} onClick={() => setCtaText(preset)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition-all border ${
                      ctaText === preset
                        ? "bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#0891B2]"
                        : "border-slate-200 text-[#475569] hover:border-[#00D4FF]/30"
                    }`}>
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Symbol overlay */}
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Center Symbol (optional)
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {SYMBOLS.map(s => (
                  <motion.button key={s.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setSymbol(s.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                      symbol === s.id
                        ? "bg-[#00D4FF]/08 border-[#00D4FF]/30"
                        : "bg-slate-50 border-slate-200 hover:border-[#00D4FF]/20"
                    }`}>
                    <span className="text-base leading-none">{s.icon}</span>
                    <span className={`text-[8px] font-semibold text-center ${
                      symbol === s.id ? "text-[#0891B2]" : "text-[#94A3B8]"
                    }`}>{s.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Corner style */}
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Corner Style
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {CORNER_STYLES.map(cs => (
                  <motion.button key={cs.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setCornerStyle(cs.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
                      cornerStyle === cs.id
                        ? "bg-[#00D4FF]/08 border-[#00D4FF]/30"
                        : "bg-slate-50 border-slate-200 hover:border-[#00D4FF]/20"
                    }`}>
                    <span className="text-base">{cs.preview}</span>
                    <span className={`text-[8px] font-semibold ${cornerStyle === cs.id ? "text-[#0891B2]" : "text-[#94A3B8]"}`}>{cs.label}</span>
                  </motion.button>
                ))}
              </div>
              <p className="text-[9px] text-[#CBD5E1] mt-1.5">
                Corner style applies when QR is regenerated in the dashboard creator.
              </p>
            </div>

            {/* Colors */}
            {frameId !== "none" && frameId !== "neon" && (
              <div>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Palette size={10} strokeWidth={2} /> Colors
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-[#94A3B8] mb-1.5">Frame border</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {COLORS.stroke.map(c => <ColorDot key={c} color={c} selected={strokeColor === c} onClick={() => setStrokeColor(c)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8] mb-1.5">Background</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {COLORS.fill.map(c => <ColorDot key={c} color={c} selected={fillColor === c} onClick={() => setFillColor(c)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8] mb-1.5">Text color</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {COLORS.text.map(c => <ColorDot key={c} color={c} selected={textColor === c} onClick={() => setTextColor(c)} />)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {frameId === "neon" && (
              <div className="bg-[#0F172A] rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-[#00FF88] mb-0.5">Neon preset</p>
                <p className="text-[9px] text-white/40">Dark background · Mint glow · Auto-styled</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}