"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff, User, Mail, Lock, CheckCircle, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

const SESSION_KEY = "qrmagic_session";
function saveSession(u: Record<string, unknown>) {
  if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
}
function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}
async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) console.error("Google OAuth error:", error);
}
function launchConfetti() {
  if (typeof window === "undefined") return;
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:9999;";
  document.body.appendChild(wrap);
  const colors = ["#00FF88","#00D4FF","#8B5CF6","#F472B6","#FB923C","#0F172A"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 8;
    el.style.cssText = `position:absolute;top:-20px;left:${Math.random()*100}%;width:${size}px;height:${size}px;background:${colors[i%colors.length]};border-radius:${Math.random()>0.4?"50%":"3px"};animation:confetti-fall ${1.4+Math.random()*0.8}s linear ${Math.random()*0.8}s forwards;`;
    wrap.appendChild(el);
  }
  setTimeout(() => document.body.removeChild(wrap), 3500);
}

function Field({ label, id, type="text", placeholder, value, onChange, icon: Icon, rightEl }: {
  label: string; id: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ElementType; rightEl?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-[#475569] uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#CBD5E1]" strokeWidth={1.5} />
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] focus:bg-white rounded-xl pl-10 pr-10 py-3 text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]" />
        {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
    </div>
  );
}

function Alert({ message, type }: { message: string; type: "error" | "success" }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm border ${
        type === "error"
          ? "bg-red-50 border-red-200 text-red-600"
          : "bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00CC6E]"
      }`}>
      {type === "error" ? <X size={15} className="flex-shrink-0 mt-0.5" /> : <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />}
      <span>{message}</span>
    </motion.div>
  );
}

function LoginForm({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const { data, error: err } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
      if (err) throw err;
      if (!data) { setError("No account found with this email."); setLoading(false); return; }
      if (data.password !== pass) { setError("Incorrect password."); setLoading(false); return; }
      if (data.deleted) { setError("Account deleted. Contact office@honoshi.co.il."); setLoading(false); return; }
      saveSession({ id: data.id, email: data.email, name: data.name, plan: data.plan });
      onSuccess();
    } catch { setError("Connection error. Please try again."); setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>{error && <Alert message={error} type="error" />}</AnimatePresence>
      <Field label="Email" id="login-email" type="email" placeholder="you@example.com"
        value={email} onChange={setEmail} icon={Mail} />
      <Field label="Password" id="login-pass" type={showPass ? "text" : "password"}
        placeholder="••••••••" value={pass} onChange={setPass} icon={Lock}
        rightEl={
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="text-[#CBD5E1] hover:text-[#475569] transition-colors">
            {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
          </button>
        } />
      <motion.button onClick={handleLogin} disabled={loading} whileTap={{ scale: 0.95 }}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_20px_rgba(0,255,136,0.30)] disabled:opacity-50">
        {loading ? <div className="w-4 h-4 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" /> : <><ArrowRight size={15} /> Log In</>}
      </motion.button>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#94A3B8]">
          No account?{" "}
          <button onClick={onSwitch} className="text-[#00D4FF] font-semibold hover:text-[#0891B2] transition-colors">Sign up free →</button>
        </p>
        <a href="/forgot-password" className="text-xs text-[#94A3B8] hover:text-[#00D4FF] transition-colors">Forgot password?</a>
      </div>
    </div>
  );
}

function SignupForm({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: (isNew: boolean) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [marketing, setMarketing] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name) { setError("Please enter your name."); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email."); return; }
    if (!pass || pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
      if (existing) { setError("An account with this email already exists."); setLoading(false); return; }
      const { data, error: err } = await supabase.from("users")
        .insert({ email, name, password: pass, marketing, plan: "free", deleted: false })
        .select().single();
      if (err) throw err;
      saveSession({ id: data.id, email: data.email, name: data.name, plan: data.plan });
      onSuccess(true);
    } catch { setError("Could not create account. Please try again."); setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>{error && <Alert message={error} type="error" />}</AnimatePresence>
      <Field label="Full Name" id="signup-name" placeholder="Alex Smith" value={name} onChange={setName} icon={User} />
      <Field label="Email" id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} />
      <Field label="Password" id="signup-pass" type={showPass ? "text" : "password"} placeholder="Min 6 characters"
        value={pass} onChange={setPass} icon={Lock}
        rightEl={
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="text-[#CBD5E1] hover:text-[#475569] transition-colors">
            {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
          </button>
        } />
      <label className="flex items-start gap-2.5 cursor-pointer">
        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 cursor-pointer transition-all ${marketing ? "bg-[#00FF88] border-[#00FF88]" : "bg-white border-slate-300"}`}
          onClick={() => setMarketing(!marketing)}>
          {marketing && <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
            <path d="M2 6l3 3 5-5" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
        </div>
        <span className="text-xs text-[#475569] leading-relaxed">I agree to receive product updates. Unsubscribe anytime.</span>
      </label>
      <motion.button onClick={handleSignup} disabled={loading} whileTap={{ scale: 0.95 }}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_20px_rgba(0,255,136,0.30)] disabled:opacity-50">
        {loading ? <div className="w-4 h-4 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" /> : <><Zap size={15} /> Create Free Account</>}
      </motion.button>
      <p className="text-center text-[11px] text-[#94A3B8]">
        By signing up you agree to our{" "}
        <a href="/legal" className="text-[#00D4FF] hover:text-[#0891B2]">Terms</a> and{" "}
        <a href="/legal" className="text-[#00D4FF] hover:text-[#0891B2]">Privacy Policy</a>.
      </p>
      <p className="text-center text-xs text-[#94A3B8]">
        Already have an account?{" "}
        <button onClick={onSwitch} className="text-[#00D4FF] font-semibold hover:text-[#0891B2] transition-colors">Log in →</button>
      </p>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "login") setMode("login");
    else if (params.get("mode") === "signup") setMode("signup");
    const session = getSession();
    if (session?.id) window.location.replace("/dashboard");
  }, []);

  function handleSuccess(isNew = false) {
    if (isNew) { launchConfetti(); setTimeout(() => window.location.replace("/dashboard"), 800); }
    else window.location.replace("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 65%)" }} />

      <nav className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <a href="/" className="flex items-center gap-2">
          <img src="/mascot.png" alt="Sqrly" className="w-7 h-7 object-contain rounded-lg" />
          <span className="text-base font-black tracking-tight text-[#0F172A]">Sq<span className="text-[#00D4FF]">r</span>ly</span>
        </a>
        <a href="/" className="text-sm text-[#475569] hover:text-[#00D4FF] transition-colors">← Back to home</a>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6">
            <img src="/mascot.png" alt="Sqrly mascot" className="w-20 h-20 object-contain"
              style={{ animation: "float 3.5s ease-in-out infinite" }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black tracking-tight text-[#0F172A] mb-1">
                {mode === "login" ? "Welcome back" : "Join Sqrly"}
              </h1>
              <p className="text-sm text-[#94A3B8]">
                {mode === "login" ? "Good to see you again." : "Free forever. No credit card needed."}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-full p-1 gap-1 mb-6">
              {(["login","signup"] as const).map(tab => (
                <button key={tab} onClick={() => setMode(tab)}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                    mode === tab
                      ? "bg-white text-[#0F172A] shadow-sm"
                      : "text-[#475569] hover:text-[#0F172A]"
                  }`}>
                  {tab === "login" ? "Log In" : "Sign Up Free"}
                </button>
              ))}
            </div>

            {/* Google */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 mb-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] hover:border-[#00D4FF] hover:shadow-sm transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-[#CBD5E1] font-medium">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 16 : -16 }}
                transition={{ duration: 0.2 }}>
                {mode === "login"
                  ? <LoginForm onSwitch={() => setMode("signup")} onSuccess={() => handleSuccess(false)} />
                  : <SignupForm onSwitch={() => setMode("login")} onSuccess={isNew => handleSuccess(isNew)} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {["No credit card required","Free plan forever","Cancel anytime"].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <CheckCircle size={11} className="text-[#00D4FF]" strokeWidth={2} />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}