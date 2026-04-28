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
  const [step, setStep] = useState<"email" | "verify" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  async function handleSendCode() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address."); return;
    }
    setLoading(true); setError("");
    try {
      const { data } = await supabase
        .from("users").select("id").eq("email", email).maybeSingle();
      if (!data) { setError("No account found with this email."); setLoading(false); return; }

      // Generate 6-digit code and store temporarily in session
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(resetCode);
      sessionStorage.setItem(`reset_${email}`, JSON.stringify({
        code: resetCode,
        expires: Date.now() + 10 * 60 * 1000, // 10 min
      }));

      // In production: send email via Supabase Edge Function or Resend
      // For now: show code in UI (development mode)
      console.log(`Reset code for ${email}: ${resetCode}`);
      setStep("verify");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  function handleVerifyCode() {
    setError("");
    const stored = sessionStorage.getItem(`reset_${email}`);
    if (!stored) { setError("Code expired. Please request a new one."); return; }
    const { code: storedCode, expires } = JSON.parse(stored);
    if (Date.now() > expires) {
      sessionStorage.removeItem(`reset_${email}`);
      setError("Code expired. Please request a new one."); return;
    }
    if (code !== storedCode) { setError("Incorrect code. Please try again."); return; }
    setStep("reset");
  }

  async function handleResetPassword() {
    if (!newPass || newPass.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPass !== confirmPass) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase
        .from("users").update({ password: newPass }).eq("email", email);
      if (err) throw err;
      sessionStorage.removeItem(`reset_${email}`);
      setStep("done");
    } catch {
      setError("Could not update password. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.10) 0%, transparent 65%)" }} />

      <nav className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-[rgba(255,255,255,0.07)]">
        <a href="/" className="flex items-center gap-2">
          <img src="/mascot.png" alt="QR Magic" className="w-7 h-7 object-contain rounded-md" />
          <span className="text-base font-bold tracking-tight text-[#F0F4F8]">
            <span className="text-[#06B6D4]">QR</span> Magic
          </span>
        </a>
        <a href="/auth" className="flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#94A3B8] transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </a>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center mx-auto mb-4">
              <KeyRound size={24} className="text-[#06B6D4]" />
            </div>
            <h1 className="text-2xl font-black text-[#F0F4F8] tracking-tight mb-2">
              {step === "done" ? "Password Reset!" : "Reset Password"}
            </h1>
            <p className="text-sm text-[#4A5568]">
              {step === "email" && "Enter your email and we'll send a reset code."}
              {step === "verify" && `We sent a 6-digit code to ${email}`}
              {step === "reset" && "Choose a new password for your account."}
              {step === "done" && "Your password has been updated successfully."}
            </p>
          </motion.div>

          <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm mb-4"
                >
                  <X size={14} className="flex-shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 1: Email */}
            {step === "email" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendCode()}
                      placeholder="you@example.com"
                      className="w-full bg-[#141C2B] border border-[rgba(255,255,255,0.07)] focus:border-[rgba(6,182,212,0.4)] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F0F4F8] placeholder:text-[#4A5568] outline-none transition-all"
                    />
                  </div>
                </div>
                <button onClick={handleSendCode} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all disabled:opacity-50">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-[#0A0E14]/30 border-t-[#0A0E14] rounded-full animate-spin" />
                    : "Send Reset Code"
                  }
                </button>
              </div>
            )}

            {/* Step 2: Verify code */}
            {step === "verify" && (
              <div className="space-y-4">
                <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-xl p-3 text-xs text-[#4A5568] leading-relaxed">
                  <span className="text-[#06B6D4] font-semibold">Development mode:</span> Check your browser console for the reset code. In production this would be sent via email.
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">
                    6-Digit Code
                  </label>
                  <input
                    type="text" value={code} onChange={e => setCode(e.target.value.slice(0, 6))}
                    onKeyDown={e => e.key === "Enter" && handleVerifyCode()}
                    placeholder="000000" maxLength={6}
                    className="w-full bg-[#141C2B] border border-[rgba(255,255,255,0.07)] focus:border-[rgba(6,182,212,0.4)] rounded-xl px-4 py-3 text-sm text-[#F0F4F8] placeholder:text-[#4A5568] outline-none transition-all text-center text-xl tracking-[0.5em] font-mono"
                  />
                </div>
                <button onClick={handleVerifyCode}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all">
                  Verify Code
                </button>
                <button onClick={() => { setStep("email"); setCode(""); setError(""); }}
                  className="w-full py-2 text-xs text-[#4A5568] hover:text-[#94A3B8] transition-colors">
                  Back
                </button>
              </div>
            )}

            {/* Step 3: New password */}
            {step === "reset" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">New Password</label>
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#141C2B] border border-[rgba(255,255,255,0.07)] focus:border-[rgba(6,182,212,0.4)] rounded-xl px-4 py-3 text-sm text-[#F0F4F8] placeholder:text-[#4A5568] outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                  <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                    placeholder="Repeat new password"
                    className="w-full bg-[#141C2B] border border-[rgba(255,255,255,0.07)] focus:border-[rgba(6,182,212,0.4)] rounded-xl px-4 py-3 text-sm text-[#F0F4F8] placeholder:text-[#4A5568] outline-none transition-all" />
                </div>
                <button onClick={handleResetPassword} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all disabled:opacity-50">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-[#0A0E14]/30 border-t-[#0A0E14] rounded-full animate-spin" />
                    : "Set New Password"
                  }
                </button>
              </div>
            )}

            {/* Step 4: Done */}
            {step === "done" && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <Check size={24} className="text-green-400" />
                </div>
                <p className="text-sm text-[#4A5568]">You can now log in with your new password.</p>
                <a href="/auth"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all">
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