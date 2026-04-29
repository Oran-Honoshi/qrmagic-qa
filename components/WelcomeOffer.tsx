"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Copy, Check, Zap } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

function makeCoupon(userId: string) {
  return `SQRLY25-${userId.replace(/-/g, "").substring(0, 6).toUpperCase()}`;
}

function useCountdown(expiry: number) {
  const [diff, setDiff] = useState(Math.max(expiry - Date.now(), 0));
  useEffect(() => {
    const t = setInterval(() => setDiff(Math.max(expiry - Date.now(), 0)), 1000);
    return () => clearInterval(t);
  }, [expiry]);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, expired: diff === 0 };
}

function CountUnit({ val, label }: { val: number; label: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.06)] border border-slate-200 rounded-xl px-4 py-3 min-w-[60px] text-center">
      <div className="text-2xl font-black text-[#0F172A] tabular-nums leading-none">
        {String(val).padStart(2, "0")}
      </div>
      <div className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

export function WelcomeOffer({ userId, createdAt }: { userId: string; createdAt: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const expiry = new Date(createdAt).getTime() + 48 * 60 * 60 * 1000;
  const { h, m, s, expired } = useCountdown(expiry);
  const coupon = makeCoupon(userId);

  useEffect(() => {
    // Show after slight delay so dashboard loads first
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  async function close() {
    setVisible(false);
    await supabase.from("users").update({ welcome_shown: true }).eq("id", userId);
  }

  async function copy() {
    await navigator.clipboard.writeText(coupon);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (expired) return null;

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="w-full max-w-[420px] overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
          >
            {/* Header */}
            <div
              className="relative px-6 py-8 text-center overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}
            >
              {/* Glow effects */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)" }} />

              <button onClick={close}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[rgba(255,255,255,0.06)] border border-slate-200 flex items-center justify-center text-[#94A3B8] hover:text-[#475569] transition-colors">
                <X size={13} />
              </button>

              <div className="relative z-10">
                <img src="/mascot.png" alt="mascot"
                  className="w-16 h-16 object-contain mx-auto mb-4"
                  style={{ animation: "float 3.5s ease-in-out infinite" }} />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.1)] mb-3">
                  <Gift size={11} className="text-[#06B6D4]" />
                  <span className="text-[11px] font-semibold text-[#06B6D4]">Welcome offer</span>
                </div>

                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">
                  25% Off — Just for You
                </h2>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Upgrade to Basic or Plus within 48 hours<br />and save 25% on your first month.
                </p>

                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  <CountUnit val={h} label="hrs" />
                  <span className="text-[#94A3B8] font-bold text-lg">:</span>
                  <CountUnit val={m} label="min" />
                  <span className="text-[#94A3B8] font-bold text-lg">:</span>
                  <CountUnit val={s} label="sec" />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white border-t border-slate-200 px-6 py-5">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                Your personal discount code
              </p>

              {/* Coupon */}
              <div className="flex items-center justify-between bg-[rgba(0,212,255,0.06)] border border-dashed border-[rgba(0,212,255,0.3)] rounded-xl px-4 py-3 mb-4">
                <span className="text-lg font-black text-[#0F172A] tracking-widest">{coupon}</span>
                <button onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-[#06B6D4] hover:bg-[rgba(0,212,255,0.2)]">
                  {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                </button>
              </div>

              <p className="text-[10.5px] text-[#94A3B8] leading-relaxed mb-4">
                This code is unique to your account and expires 48 hours after signup. One use per account.
              </p>

              <button
                onClick={() => { close(); window.location.href = "/#pricing"; }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_20px_rgba(0,212,255,0.3)]"
              >
                <Zap size={14} /> Upgrade Now — Save 25%
              </button>
              <button onClick={close}
                className="w-full py-2 mt-2 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors">
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* First QR Celebration */
export function FirstQRCelebration({ userId }: { userId: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem("qrmagic_first_qr");
    if (!flag) return;
    sessionStorage.removeItem("qrmagic_first_qr");
    launchConfetti();
    setTimeout(() => setVisible(true), 400);
    supabase.from("users").update({ first_qr_celebrated: true }).eq("id", userId);
  }, [userId]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
      >
        <img src="/mascot.png" alt="mascot"
          className="w-20 h-20 object-contain mx-auto mb-4"
          style={{ animation: "float 3.5s ease-in-out infinite" }} />
        <h2 className="text-xl font-black text-[#0F172A] tracking-tight mb-2">
          Your first QR code!
        </h2>
        <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
          It&apos;s live and ready to scan. Share it anywhere — print, website, packaging, or business cards.
        </p>
        <button
          onClick={() => { setVisible(false); window.location.href = "/dashboard/codes"; }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all"
        >
          <Zap size={14} /> View My Codes
        </button>
        <button onClick={() => setVisible(false)}
          className="w-full py-2 mt-2 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors">
          Stay here
        </button>
      </motion.div>
    </div>
  );
}

function launchConfetti() {
  if (typeof window === "undefined") return;
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:9999;";
  document.body.appendChild(wrap);
  const colors = ["#06B6D4","#22D3EE","#F472B6","#8B5CF6","#4ADE80","#FB923C","#F0F4F8"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 9;
    el.style.cssText = `position:absolute;top:-20px;left:${Math.random()*100}%;width:${size}px;height:${size}px;background:${colors[i%colors.length]};border-radius:${Math.random()>0.4?"50%":"3px"};animation:confetti-fall ${1.4+Math.random()*0.8}s linear ${Math.random()*0.8}s forwards;`;
    wrap.appendChild(el);
  }
  setTimeout(() => document.body.removeChild(wrap), 3500);
}