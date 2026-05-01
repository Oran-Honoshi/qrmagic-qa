"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem("qrmagic_session") || "null"); }
  catch { return null; }
}

const PLANS = [
  { id: "free", name: "Free", price: { monthly: 0, annual: 0 }, period: "forever",
    desc: "No credit card. No watermark.", cta: "Get Started Free", href: "/auth", featured: false,
    features: ["50 static QR codes","1 dynamic QR code","Custom colors & logo","PNG download","Basic analytics","18 QR types"] },
  { id: "basic", name: "Basic", price: { monthly: 5, annual: 4 }, period: "/mo",
    desc: "For growing businesses.", cta: "Start Free Trial", href: null, featured: true,
    features: ["Unlimited static codes","10 dynamic QR codes","Advanced analytics","SVG + PNG + PDF export","Custom frames","Email support"] },
  { id: "plus", name: "Plus", price: { monthly: 18, annual: 14 }, period: "/mo",
    desc: "For teams and campaigns.", cta: "Start Free Trial", href: null, featured: false,
    features: ["100 dynamic QR codes","Folder organization","Campaign tracking","API access","Team collaboration","Priority support"] },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleUpgrade(planId: string) {
    const session = getSession();
    if (!session) { window.location.href = "/auth?mode=signup"; return; }
    setLoading(planId); setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billing: annual ? "annual" : "monthly", userId: session.id, email: session.email }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(null); return; }
      if (data.url) window.location.href = data.url;
    } catch { setError("Something went wrong. Please try again."); setLoading(null); }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.07) 0%, transparent 60%)" }} />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/mascot.png" alt="Sqrly" className="w-7 h-7 object-contain rounded-lg" />
          <span className="text-base font-black tracking-tight text-[#0F172A]">Sq<span className="text-[#00D4FF]">r</span>ly</span>
        </a>
        <div className="flex items-center gap-2">
          <a href="/auth" className="text-sm text-[#475569] hover:text-[#0F172A] transition-colors px-3">Log In</a>
          <a href="/auth?mode=signup" className="px-4 py-2 text-sm font-bold bg-[#00FF88] text-[#0F172A] rounded-full hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)]">
            Get Started Free
          </a>
        </div>
      </nav>

      <div className="relative z-10 pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0F172A] mb-4">Simple Pricing</h1>
            <p className="text-[#475569] text-lg mb-8">Start free. Upgrade when you grow.</p>
            <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
              <button onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-white shadow-sm text-[#0F172A]" : "text-[#475569]"}`}>
                Monthly
              </button>
              <button onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual ? "bg-white shadow-sm text-[#0F172A]" : "text-[#475569]"}`}>
                Annually
              </button>
              {annual && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00FF88]/20 text-[#00CC6E] mr-1">Save 20%</span>}
            </div>
          </motion.div>

          {error && (
            <div className="flex items-center gap-2 max-w-md mx-auto mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <Zap size={14} className="flex-shrink-0" strokeWidth={1.5} />
              {error.includes("not configured") ? "Stripe payments coming soon! Sign up free in the meantime." : error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 items-start md:items-center mb-16">
            {PLANS.map((plan, i) => {
              const price = annual ? plan.price.annual : plan.price.monthly;
              return (
                <motion.div key={plan.id}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  whileHover={plan.featured ? { y: -6 } : { y: -3 }}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    plan.featured
                      ? "bg-white border-2 border-[#00FF88] shadow-[0_20px_50px_rgba(0,255,136,0.20)]"
                      : "bg-white border border-slate-200 shadow-sm"
                  }`}>
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00FF88] text-[#0F172A] text-[11px] font-black">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-5 mt-2">
                    <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">{plan.name}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      {price === 0
                        ? <span className="text-4xl font-black text-[#0F172A]">Free</span>
                        : <><span className="text-xl font-bold text-[#475569]">$</span><span className="text-4xl font-black text-[#0F172A]">{price}</span><span className="text-sm text-[#475569]">{plan.period}</span></>
                      }
                    </div>
                    <p className="text-xs text-[#94A3B8]">{plan.desc}</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => plan.href ? window.location.href = plan.href : handleUpgrade(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold mb-5 transition-all ${
                      plan.featured
                        ? "bg-[#00FF88] text-[#0F172A] hover:bg-[#00CC6E] shadow-[0_8px_24px_rgba(0,255,136,0.3)]"
                        : "border border-slate-200 text-[#475569] hover:border-[#00D4FF] hover:text-[#00D4FF]"
                    } disabled:opacity-50`}>
                    {loading === plan.id ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><ArrowRight size={14} strokeWidth={2} />{plan.cta}</>}
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

          <div className="grid sm:grid-cols-3 gap-4 text-center">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime, no questions asked. Keep access until end of billing period." },
              { q: "Is there a free trial?", a: "Yes. All paid plans include a 7-day free trial. No credit card required to start." },
              { q: "What payment methods?", a: "All major credit and debit cards via Stripe. Secure, encrypted, PCI compliant." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0F172A] mb-2">{q}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#94A3B8] mt-8">
            Questions? <a href="mailto:office@honoshi.co.il" className="text-[#00D4FF] hover:underline">office@honoshi.co.il</a>
          </p>
        </div>
      </div>
    </div>
  );
}