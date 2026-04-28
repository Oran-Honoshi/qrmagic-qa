"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ArrowRight, X } from "lucide-react";

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem("qrmagic_session") || "null"); }
  catch { return null; }
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    period: "forever",
    desc: "No credit card. No watermark.",
    features: [
      "50 static QR codes",
      "1 dynamic QR code",
      "Custom colors & logo",
      "PNG download",
      "Basic analytics",
      "18 QR types",
    ],
    cta: "Get Started Free",
    href: "/auth",
    featured: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: { monthly: 5, annual: 4 },
    period: "/mo",
    desc: "For growing businesses.",
    features: [
      "Unlimited static codes",
      "10 dynamic QR codes",
      "Advanced analytics",
      "SVG + PNG + PDF export",
      "Custom frames & badges",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: null,
    featured: true,
  },
  {
    id: "plus",
    name: "Plus",
    price: { monthly: 18, annual: 14 },
    period: "/mo",
    desc: "For teams and campaigns.",
    features: [
      "100 dynamic QR codes",
      "Folder organization",
      "Campaign tracking",
      "API access",
      "Team collaboration",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: null,
    featured: false,
  },
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          billing: annual ? "annual" : "monthly",
          userId: session.id,
          email: session.email,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(null); return; }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E14]">
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,14,20,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)] px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/mascot.png" alt="QR Magic" className="w-7 h-7 object-contain rounded-md" />
          <span className="text-base font-bold tracking-tight text-[#F0F4F8]">
            <span className="text-[#06B6D4]">QR</span> Magic
          </span>
        </a>
        <div className="flex items-center gap-2">
          <a href="/auth" className="text-sm text-[#4A5568] hover:text-[#94A3B8] transition-colors px-3">Log In</a>
          <a href="/auth?mode=signup" className="px-4 py-2 text-sm font-semibold bg-[#06B6D4] text-[#0A0E14] rounded-full hover:bg-[#22D3EE] transition-all">
            Get Started Free
          </a>
        </div>
      </nav>

      <div className="relative z-10 pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl font-black tracking-tight text-[#F0F4F8] mb-4">
              Simple Pricing
            </h1>
            <p className="text-[#4A5568] text-lg mb-8">Start free. Upgrade when you grow.</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-full p-1.5">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-[#1A2436] text-[#F0F4F8]" : "text-[#4A5568]"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual ? "bg-[#1A2436] text-[#F0F4F8]" : "text-[#4A5568]"}`}
              >
                Annually
              </button>
              {annual && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[rgba(244,114,182,0.1)] border border-[rgba(244,114,182,0.2)] text-[#F472B6] mr-1">
                  Save 20%
                </span>
              )}
            </div>
          </motion.div>

          {error && (
            <div className="flex items-center gap-2 max-w-md mx-auto mb-6 p-3 rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] text-[#FCD34D] text-sm">
              <Zap size={14} className="flex-shrink-0" />
              {error.includes("not configured") ? "Stripe payments coming soon! Sign up free in the meantime." : error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => {
              const price = annual ? plan.price.annual : plan.price.monthly;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    plan.featured
                      ? "bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.25)]"
                      : "bg-[#0F1520] border border-[rgba(255,255,255,0.07)]"
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#06B6D4] text-[#0A0E14] text-[11px] font-bold">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-5 mt-2">
                    <div className="text-[10px] font-bold text-[#4A5568] uppercase tracking-widest mb-2">{plan.name}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      {price === 0 ? (
                        <span className="text-4xl font-black text-[#F0F4F8]">Free</span>
                      ) : (
                        <>
                          <span className="text-xl font-bold text-[#4A5568]">$</span>
                          <span className="text-4xl font-black text-[#F0F4F8]">{price}</span>
                          <span className="text-sm text-[#4A5568]">{plan.period}</span>
                        </>
                      )}
                    </div>
                    {price > 0 && annual && (
                      <div className="text-[10px] text-[#4A5568]">billed annually</div>
                    )}
                    <p className="text-xs text-[#4A5568] mt-2">{plan.desc}</p>
                  </div>

                  <button
                    onClick={() => plan.href ? window.location.href = plan.href : handleUpgrade(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold mb-5 transition-all ${
                      plan.featured
                        ? "bg-[#06B6D4] text-[#0A0E14] hover:bg-[#22D3EE] shadow-[0_4px_16px_rgba(6,182,212,0.3)]"
                        : "border border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:border-[rgba(6,182,212,0.3)] hover:text-[#06B6D4]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.id ? (
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <><ArrowRight size={14} />{plan.cta}</>
                    )}
                  </button>

                  <div className="h-px bg-[rgba(255,255,255,0.06)] mb-4" />

                  <div className="space-y-2.5 flex-1">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2.5">
                        <CheckCircle size={13} className="text-[#06B6D4] flex-shrink-0" />
                        <span className="text-xs text-[#4A5568]">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ strip */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6 text-center">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime, no questions asked. You keep access until the end of your billing period." },
              { q: "Is there a free trial?", a: "Yes. All paid plans come with a 7-day free trial. No credit card required to start." },
              { q: "What payment methods?", a: "We accept all major credit and debit cards via Stripe. Secure, encrypted, PCI compliant." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
                <h3 className="text-sm font-bold text-[#F0F4F8] mb-2">{q}</h3>
                <p className="text-xs text-[#4A5568] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#4A5568] mt-8">
            Questions? <a href="mailto:office@honoshi.co.il" className="text-[#06B6D4] hover:underline">office@honoshi.co.il</a>
          </p>
        </div>
      </div>
    </div>
  );
}