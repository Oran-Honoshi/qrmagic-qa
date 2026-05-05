"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Check, X, KeyRound } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email"|"verify"|"reset"|"done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email."); return; }
    setLoading(true); setError("");
    const { data } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (!data) { setError("No account found with this email."); setLoading(false); return; }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`reset_${email}`, JSON.stringify({ code: resetCode, expires: Date.now() + 10 * 60 * 1000 }));
    // Send reset code via email
    try {
      const siteUrl = window.location.origin;
      // Encode the reset link with the code
      const resetLink = `${siteUrl}/auth?mode=reset&email=${encodeURIComponent(email)}&code=${resetCode}`;
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password_reset", to: email, resetLink }),
      });
      if (!res.ok) throw new Error("Email failed");
      setLoading(false); setStep("verify");
    } catch {
      // Even if email fails, still proceed (show code in dev)
      console.log(`Reset code for ${email}: ${resetCode}`);
      setLoading(false); setStep("verify");
    }
  }

  function handleVerifyCode() {
    setError("");
    const stored = sessionStorage.getItem(`reset_${email}`);
    if (!stored) { setError("Code expired. Please request a new one."); return; }
    const { code: storedCode, expires } = JSON.parse(stored);
    if (Date.now() > expires) { sessionStorage.removeItem(`reset_${email}`); setError("Code expired."); return; }
    if (code !== storedCode) { setError("Incorrect code. Please try again."); return; }
    setStep("reset");
  }

  async function handleResetPassword() {
    if (!newPass || newPass.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPass !== confirmPass) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    await supabase.from("users").update({ password: newPass }).eq("email", email);
    sessionStorage.removeItem(`reset_${email}`);
    setLoading(false); setStep("done");
  }

  const inputCls = "w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] focus:bg-white rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.07) 0%, transparent 65%)" }} />

      <nav className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <a href="/" className="flex items-center gap-2">
          <img src="/mascot.png" alt="Sqrly" className="w-7 h-7 object-contain rounded-lg" />
          <span className="text-base font-black tracking-tight text-[#0F172A]">Sq<span className="text-[#00D4FF]">r</span>ly</span>
        </a>
        <a href="/auth" className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#00D4FF] transition-colors">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to Login
        </a>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={24} className="text-[#00D4FF]" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">
              {step === "done" ? "Password Reset!" : "Reset Password"}
            </h1>
            <p className="text-sm text-[#94A3B8]">
              {step === "email" && "Enter your email and we'll send a reset code."}
              {step === "verify" && `We sent a 6-digit code to ${email}`}
              {step === "reset" && "Choose a new password for your account."}
              {step === "done" && "Your password has been updated successfully."}
            </p>
          </motion.div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                  <X size={14} className="flex-shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {step === "email" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#CBD5E1]" strokeWidth={1.5} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendCode()}
                      placeholder="you@example.com"
                      className={inputCls + " pl-10"} />
                  </div>
                </div>
                <motion.button onClick={handleSendCode} disabled={loading} whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.30)] disabled:opacity-50">
                  {loading ? <div className="w-4 h-4 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" /> : "Send Reset Code"}
                </motion.button>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-4">
                <div className="bg-[#00D4FF]/06 border border-[#00D4FF]/20 rounded-xl p-3 text-xs text-[#0891B2] leading-relaxed">
                  <span className="font-semibold">Dev mode:</span> Check your browser console for the reset code.
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5 block">6-Digit Code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value.slice(0,6))}
                    onKeyDown={e => e.key === "Enter" && handleVerifyCode()}
                    placeholder="000000" maxLength={6}
                    className={inputCls + " text-center text-xl tracking-[0.5em] font-mono"} />
                </div>
                <motion.button onClick={handleVerifyCode} whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.30)]">
                  Verify Code
                </motion.button>
                <button onClick={() => { setStep("email"); setCode(""); setError(""); }}
                  className="w-full py-2 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors">Back</button>
              </div>
            )}

            {step === "reset" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5 block">New Password</label>
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                  <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleResetPassword()} placeholder="Repeat new password" className={inputCls} />
                </div>
                <motion.button onClick={handleResetPassword} disabled={loading} whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_16px_rgba(0,255,136,0.30)] disabled:opacity-50">
                  {loading ? <div className="w-4 h-4 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" /> : "Set New Password"}
                </motion.button>
              </div>
            )}

            {step === "done" && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#00FF88]/15 border border-[#00FF88]/30 flex items-center justify-center mx-auto">
                  <Check size={24} className="text-[#00CC6E]" strokeWidth={2} />
                </div>
                <p className="text-sm text-[#475569]">You can now log in with your new password.</p>
                <a href="/auth" className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all">
                  Go to Login
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}