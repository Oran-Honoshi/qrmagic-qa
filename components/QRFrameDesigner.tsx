"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, X, Type, Palette } from "lucide-react";

type FrameId = string;

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

const FRAMES: Record<string, FramePreset> = {
  none: {
    id: "none", name: "None", emoji: "✕",
    path: "", viewBox: "0 0 200 200",
    qrPos: { x: 0, y: 0, size: 200 },
    textPos: { x: 0, y: 0 },
  },
  rect_clean: {
    id: "rect_clean", name: "Classic", emoji: "⬜",
    path: "M4 4 H196 V220 H4 Z",
    viewBox: "0 0 200 224",
    qrPos: { x: 12, y: 12, size: 176 },
    textPos: { x: 100, y: 218 },
  },
  rect_rounded: {
    id: "rect_rounded", name: "Rounded", emoji: "▢",
    path: "M16 4 H184 A12 12 0 0 1 196 16 V208 A12 12 0 0 1 184 220 H16 A12 12 0 0 1 4 208 V16 A12 12 0 0 1 16 4 Z",
    viewBox: "0 0 200 224",
    qrPos: { x: 14, y: 14, size: 172 },
    textPos: { x: 100, y: 218 },
  },
  double_border: {
    id: "double_border", name: "Double", emoji: "🔲",
    path: "M4 4 H196 V220 H4 Z M10 10 H190 V214 H10 Z",
    viewBox: "0 0 200 224",
    qrPos: { x: 16, y: 16, size: 168 },
    textPos: { x: 100, y: 218 },
  },
  speech_bottom: {
    id: "speech_bottom", name: "Speech", emoji: "💬",
    path: "M16 4 H184 A12 12 0 0 1 196 16 V196 A12 12 0 0 1 184 208 H116 L100 228 L84 208 H16 A12 12 0 0 1 4 196 V16 A12 12 0 0 1 16 4 Z",
    viewBox: "0 0 200 232",
    qrPos: { x: 14, y: 12, size: 172 },
    textPos: { x: 100, y: 222 },
  },
  banner_top: {
    id: "banner_top", name: "Banner", emoji: "🏷",
    path: "M4 30 H80 L100 4 L120 30 H196 V220 H4 Z",
    viewBox: "0 0 200 224",
    qrPos: { x: 12, y: 34, size: 172 },
    textPos: { x: 100, y: 218 },
  },
  phone: {
    id: "phone", name: "Phone", emoji: "📱",
    path: "M44 2 H156 A18 18 0 0 1 174 20 V240 A18 18 0 0 1 156 258 H44 A18 18 0 0 1 26 240 V20 A18 18 0 0 1 44 2 Z M80 8 H120 A6 6 0 0 1 120 20 H80 A6 6 0 0 1 80 8 Z",
    viewBox: "0 0 200 262",
    qrPos: { x: 34, y: 28, size: 132 },
    textPos: { x: 100, y: 252 },
  },
  circle: {
    id: "circle", name: "Circle", emoji: "⭕",
    path: "M100 4 A96 96 0 1 1 99.9 4 Z",
    viewBox: "0 0 200 200",
    qrPos: { x: 30, y: 30, size: 140 },
    textPos: { x: 100, y: 192 },
  },
  hexagon: {
    id: "hexagon", name: "Hexagon", emoji: "⬡",
    path: "M100 4 L190 54 L190 154 L100 204 L10 154 L10 54 Z",
    viewBox: "0 0 200 208",
    qrPos: { x: 30, y: 30, size: 140 },
    textPos: { x: 100, y: 202 },
  },
  octagon: {
    id: "octagon", name: "Octagon", emoji: "⬠",
    path: "M60 4 H140 L196 60 V148 L140 204 H60 L4 148 V60 Z",
    viewBox: "0 0 200 208",
    qrPos: { x: 28, y: 28, size: 144 },
    textPos: { x: 100, y: 202 },
  },
  sign: {
    id: "sign", name: "Sign", emoji: "🪧",
    path: "M4 4 H196 V190 H116 L100 218 L84 190 H4 Z",
    viewBox: "0 0 200 222",
    qrPos: { x: 14, y: 14, size: 172 },
    textPos: { x: 100, y: 186 },
  },
  corner_cuts: {
    id: "corner_cuts", name: "Corner Cut", emoji: "✂️",
    path: "M24 4 H176 L196 24 V196 L176 216 H24 L4 196 V24 Z",
    viewBox: "0 0 200 220",
    qrPos: { x: 16, y: 16, size: 168 },
    textPos: { x: 100, y: 214 },
  },
  tag_right: {
    id: "tag_right", name: "Price Tag", emoji: "🏷",
    path: "M4 4 H156 L196 100 L156 196 H4 Z",
    viewBox: "0 0 200 200",
    qrPos: { x: 14, y: 28, size: 144 },
    textPos: { x: 90, y: 194 },
  },
  diamond: {
    id: "diamond", name: "Diamond", emoji: "◇",
    path: "M100 4 L196 104 L100 204 L4 104 Z",
    viewBox: "0 0 200 208",
    qrPos: { x: 40, y: 40, size: 120 },
    textPos: { x: 100, y: 202 },
  },
  neon: {
    id: "neon", name: "Neon", emoji: "⚡",
    path: "M10 4 H190 A8 8 0 0 1 198 12 V212 A8 8 0 0 1 190 220 H10 A8 8 0 0 1 2 212 V12 A8 8 0 0 1 10 4 Z",
    viewBox: "0 0 200 224",
    qrPos: { x: 12, y: 12, size: 176 },
    textPos: { x: 100, y: 218 },
    strokeColor: "#00FF88", fillColor: "#0F172A", strokeWidth: 2,
  },
};

const CTA_PRESETS = [
  "SCAN ME", "SCAN TO ORDER", "SCAN TO CONNECT",
  "FOLLOW US", "GET DISCOUNT", "LEARN MORE",
  "BOOK NOW", "JOIN US", "WATCH VIDEO", "FREE WIFI",
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
  const [frameId, setFrameId] = useState<FrameId>("rect_rounded");
  const [ctaText, setCtaText] = useState("SCAN ME");
  const [strokeColor, setStrokeColor] = useState("#00D4FF");
  const [textColor, setTextColor] = useState("#0F172A");
  const [fillColor, setFillColor] = useState("#FFFFFF");
  const [downloaded, setDownloaded] = useState(false);
  const [cornerStyle, setCornerStyle] = useState("extra-rounded");
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor2, setGradientColor2] = useState("#00D4FF");
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [ctaInput, setCtaInput] = useState("SCAN ME");
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

                {/* Gradient defs */}
                {useGradient && (
                  <defs>
                    {gradientType === "linear" ? (
                      <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={effectiveStroke} />
                        <stop offset="100%" stopColor={gradientColor2} />
                      </linearGradient>
                    ) : (
                      <radialGradient id="frameGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={effectiveStroke} />
                        <stop offset="100%" stopColor={gradientColor2} />
                      </radialGradient>
                    )}
                  </defs>
                )}

                {/* Background */}
                {frame.path && (
                  <path d={frame.path} fill={effectiveFillColor}
                    stroke={useGradient ? "url(#frameGrad)" : effectiveStroke} strokeWidth={frame.strokeWidth || 2} />
                )}

                {/* QR Code layer */}
                <g transform={`translate(${frame.qrPos.x}, ${frame.qrPos.y}) scale(${frame.qrPos.size / 200})`}
                  dangerouslySetInnerHTML={{ __html: qrSvgContent }} />



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
              <input value={ctaInput || ctaText} onChange={e => setCtaText(e.target.value.slice(0, 20))}
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

            {/* Gradient frame color */}
            {frameId !== "none" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Gradient Frame</p>
                  <button onClick={() => setUseGradient((g: boolean) => !g)}
                    className={`w-9 h-5 rounded-full transition-all relative ${useGradient ? "bg-[#00D4FF]" : "bg-slate-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${useGradient ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
                {useGradient && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-[9px] text-[#94A3B8] mb-1">Color 1</p>
                        <input type="color" value={effectiveStroke}
                          className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] text-[#94A3B8] mb-1">Color 2</p>
                        <input type="color" value={gradientColor2}
                          onChange={e => setGradientColor2(e.target.value)}
                          className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["linear", "radial"] as const).map(t => (
                        <button key={t} onClick={() => setGradientType(t)}
                          className={`py-1.5 rounded-lg text-[10px] font-semibold border capitalize transition-all ${
                            gradientType === t ? "bg-[#00D4FF]/08 border-[#00D4FF]/30 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569]"
                          }`}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}


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