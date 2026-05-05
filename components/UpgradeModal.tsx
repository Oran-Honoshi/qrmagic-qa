"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  onClose: () => void;
  reason: "dynamic_limit" | "static_limit" | "asset_limit" | "bulk_limit";
  currentPlan: string;
  createdAt?: string;
}

const UPGRADE_CONTENT = {
  dynamic_limit: {
    emoji: "⚡",
    title: "Dynamic QR Codes — Upgrade Feature",
    body: "Dynamic QR codes let you change the destination URL anytime without reprinting. The free plan includes 1 dynamic code — upgrade for more.",
    highlight: "Edit destination · track scans · redirect analytics",
    basicFeature: "10 dynamic codes",
    plusFeature: "100 dynamic codes",
  },
  static_limit: {
    emoji: "🔲",
    title: "Static QR Limit Reached",
    body: "You've created 50 static QR codes on the free plan. Upgrade to Basic for unlimited static codes.",
    highlight: "Unlimited static codes on Basic and Plus",
    basicFeature: "Unlimited static codes",
    plusFeature: "Unlimited static codes",
  },
  asset_limit: {
    emoji: "🖼",
    title: "Asset Library Full",
    body: "You've reached your asset limit. Upgrade to store more logos and images for your QR codes.",
    highlight: "Store logos once, reuse across all QR codes",
    basicFeature: "25 assets · 2MB each",
    plusFeature: "100 assets · 5MB each",
  },
  bulk_limit: {
    emoji: "📦",
    title: "Bulk Import Limit Reached",
    body: "Your plan supports up to 50 codes per CSV import. Upgrade to Plus for 500 codes per upload.",
    highlight: "Generate hundreds of QR codes from a single CSV",
    basicFeature: "50 codes per upload",
    plusFeature: "500 codes per upload",
  },
};

export function UpgradeModal({ onClose, reason, currentPlan, createdAt }: UpgradeModalProps) {
  const isIn48h = createdAt
    ? (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000
    : false;
  const router = useRouter();
  const content = UPGRADE_CONTENT[reason];
  const showBasic = currentPlan === "free";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-5 text-center"
            style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}>
            <button onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <X size={13} />
            </button>
            <div className="text-3xl mb-3">{content.emoji}</div>
            <h3 className="text-base font-black text-white mb-1">{content.title}</h3>
            <p className="text-xs text-white/50 leading-relaxed">{content.body}</p>
          </div>

          {/* Highlight */}
          <div className="px-6 py-4 bg-[#00FF88]/06 border-b border-[#00FF88]/15">
            <div className="flex items-center gap-2">
              <CheckCircle size={13} className="text-[#00CC6E] flex-shrink-0" strokeWidth={2} />
              <p className="text-xs font-semibold text-[#0F172A]">{content.highlight}</p>
            </div>
          </div>

          {/* Plan comparison */}
          <div className="px-6 py-5">
            <div className={`grid gap-3 mb-5 ${showBasic ? "grid-cols-2" : "grid-cols-1"}`}>
              {showBasic && (
                <div className="border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Basic</div>
                  <div className="text-2xl font-black text-[#0F172A] mb-1">$4<span className="text-sm font-medium text-[#94A3B8]">/mo</span></div>
                  <div className="text-[10px] text-[#475569] mb-3">billed annually</div>
                  <div className="text-xs font-semibold text-[#00CC6E] bg-[#00FF88]/10 rounded-lg px-2 py-1">
                    {content.basicFeature}
                  </div>
                </div>
              )}
              <div className={`border-2 border-[#00FF88] rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(0,255,136,0.15)] ${!showBasic ? "col-span-1" : ""}`}>
                <div className="text-[10px] font-bold text-[#00CC6E] uppercase tracking-wider mb-2">Plus</div>
                <div className="text-2xl font-black text-[#0F172A] mb-1">$14<span className="text-sm font-medium text-[#94A3B8]">/mo</span></div>
                <div className="text-[10px] text-[#475569] mb-3">billed annually</div>
                <div className="text-xs font-semibold text-[#00CC6E] bg-[#00FF88]/10 rounded-lg px-2 py-1">
                  {content.plusFeature}
                </div>
              </div>
            </div>

            {/* 48h discount badge */}
            {isIn48h && (
              <div className="mb-3 flex items-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/25 rounded-xl px-3 py-2.5">
                <span className="text-lg">🎉</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#0F172A]">Welcome offer — 25% off your first payment</p>
                  <p className="text-[10px] text-[#475569] mt-0.5">
                    Use code <span className="font-mono font-bold text-[#0891B2] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded">LAUNCH48</span> at checkout · expires 48h after signup
                  </p>
                </div>
              </div>
            )}

            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { router.push("/pricing?from=limit"); onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.3)]">
              <Zap size={14} strokeWidth={2} /> View Plans & Upgrade
              <ArrowRight size={14} strokeWidth={2} />
            </motion.button>
            <button onClick={onClose}
              className="w-full py-2 mt-2 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors">
              Maybe later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}