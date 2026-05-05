"use client";

import { useState, Suspense , useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Zap, ArrowRight, ArrowLeft, Info, X } from "lucide-react";

function getSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("qrmagic_session") || "null")
      || JSON.parse(localStorage.getItem("qrmagic_session") || "null");
  }
  catch { return null; }
}

/* ── Tooltip ─────────────────────────────────────────── */
function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-[#94A3B8] hover:text-[#00D4FF] transition-colors ml-1"
      >
        <Info size={11} strokeWidth={2} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#0F172A] text-white text-[10px] leading-relaxed rounded-xl px-3 py-2 shadow-xl z-50 pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F172A] rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ── Plan data ───────────────────────────────────────── */
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    period: "forever",
    tagline: "No credit card. No watermark. Forever.",
    cta: "Get Started Free",
    href: "/auth",
    featured: false,
    features: [
      { text: "50 static QR codes", tip: "Static QR codes encode data directly. Content cannot be changed after creation." },
      { text: "1 dynamic QR code", tip: "Dynamic QR codes redirect through Sqrly so you can change the destination URL anytime." },
      { text: "22 QR types", tip: "URL, Wi-Fi, vCard, WhatsApp, Location, Event, Crypto, Menu, and 14 more." },
      { text: "Custom colors & logo overlay", tip: "Choose QR dot color, background color, and upload a logo to place in the center." },
      { text: "PNG + SVG download", tip: "SVG is vector — scales infinitely for print. PNG is raster, great for web and screens." },
      { text: "Scan count for dynamic code", tip: "See how many times your 1 dynamic QR code has been scanned in real time." },
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: { monthly: 5, annual: 4 },
    period: "/mo",
    tagline: "All that is in Free, adding:",
    cta: "Start Free Trial",
    href: null,
    featured: true,
    features: [
      { text: "Unlimited static QR codes", tip: "No limit on static codes — create as many as your business needs." },
      { text: "10 dynamic QR codes", tip: "10 editable QR codes with live destination URL editing and scan tracking." },
      { text: "Folder organization", tip: "Group your QR codes into folders by campaign, client, or project." },
      { text: "SVG + PNG + PDF export", tip: "PDF download wraps your QR in a print-ready A4 document." },
      { text: "Advanced analytics (30 days)", tip: "Daily scan charts, top performing codes, and CTR for the past 30 days." },
      { text: "Custom frames & stickers", tip: "Add 'Scan Me', 'Order Here', or custom CTA frames around your QR code." },
      { text: "Asset library (25 files, 2MB each)", tip: "Upload logos once and reuse them across all your QR codes without re-uploading." },
      { text: "Bulk import (50 codes/CSV)", tip: "Upload a CSV to generate up to 50 QR codes at once and download as a ZIP." },
      { text: "Email support", tip: "Direct email support from the Sqrly team." },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: { monthly: 18, annual: 14 },
    period: "/mo",
    tagline: "All that is in Basic, adding:",
    cta: "Start Free Trial",
    href: null,
    featured: false,
    features: [
      { text: "100 dynamic QR codes", tip: "Up to 100 live, editable dynamic QR codes with full analytics." },
      { text: "Advanced analytics (unlimited)", tip: "Full analytics history with no time limit — see all scan data from day one." },
      { text: "Campaign tracking", tip: "Group multiple QR codes under one campaign and compare their performance side by side." },
      { text: "Geographic scan data", tip: "See which countries your QR codes are being scanned in." },
      { text: "Asset library (100 files, 5MB each)", tip: "Up to 100 saved assets at 5MB each — logos, icons, and images." },
      { text: "Bulk import (500 codes/CSV)", tip: "Scale up — import and generate up to 500 QR codes in a single CSV upload." },
      { text: "Custom short domain (soon)", tip: "Use your own domain for QR redirects instead of sqrly.io/r/... — coming soon." },
      { text: "Email support", tip: "Priority email support from the Sqrly team." },
    { text: "3 team seats (soon)", tip: "Invite up to 2 additional team members to manage QR codes together under one account. Owner + 2 members." },
    ],
  },
];

const COMPARE_ROWS = [
  { label: "Static QR codes",     tips: "Static codes cannot be edited after creation but work forever.", free: "50",          basic: "Unlimited",   plus: "Unlimited" },
  { label: "Dynamic QR codes",    tips: "Edit destination URL anytime without reprinting.",               free: "1",           basic: "10",          plus: "100" },
  { label: "Folder organization", tips: "Group QR codes by project, client, or campaign.",               free: "—",           basic: "✅",           plus: "✅" },
  { label: "Bulk import",         tips: "Upload CSV to generate QR codes in bulk.",                      free: "—",           basic: "50/upload",   plus: "500/upload" },
  { label: "Asset library",       tips: "Save logos to reuse across QR codes.",                          free: "—",           basic: "25 files",    plus: "100 files" },
  { label: "Analytics",           tips: "Scan tracking and performance data.",                           free: "Count only",  basic: "30 days",     plus: "Unlimited" },
  { label: "Frames & stickers",   tips: "Add CTA labels and decorative frames.",                         free: "—",           basic: "✅",           plus: "✅" },
  { label: "PDF export",          tips: "Download QR as a print-ready PDF.",                             free: "—",           basic: "✅",           plus: "✅" },
  { label: "Campaign tracking",   tips: "Group codes into campaigns and compare.",                       free: "—",           basic: "—",           plus: "✅" },
  { label: "Geographic data",     tips: "Country-level scan location data.",                             free: "—",           basic: "—",           plus: "✅" },
  { label: "Custom short domain", tips: "Use your own domain for QR redirects.",                        free: "—",           basic: "—",           plus: "Soon" },
  { label: "Team seats",          tips: "Owner + up to 2 additional members on the same account.",   free: "—",           basic: "—",           plus: "3 (soon)" },
  { label: "Support",             tips: "",                                                              free: "Community",   basic: "Email",       plus: "Email" },
  { label: "Price (annual)",      tips: "Billed annually. Cancel anytime.",                             free: "Free",        basic: "$4/mo",       plus: "$14/mo" },
];

function FeatureRow({ text, tip }: { text: string; tip?: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <CheckCircle size={13} className="text-[#00D4FF] flex-shrink-0 mt-0.5" strokeWidth={2} />
      <span className="text-xs text-[#475569] leading-relaxed">
        {text}
        {tip && <Tip text={tip} />}
      </span>
    </div>
  );
}

function PricingContent() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || (window as any).Paddle) return;
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.onload = () => (window as any).Paddle?.Initialize({ token: "live_2420b2b74a2e9df0fa9b6368010" });
    document.head.appendChild(s);
  }, []);
  const [showCompare, setShowCompare] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromOffer = searchParams.get("from") === "offer";

  async function handleUpgrade(planId: string) {
    const session = getSession();
    if (!session) { window.location.href = "/auth?mode=signup"; return; }
    setLoading(planId); setError("");
    try {
      const res = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          billing: annual ? "annual" : "monthly",
          userId: session.id,
          email: session.email,
          createdAt: session.createdAt || null,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(null); return; }

      const Paddle = (window as any).Paddle;
      if (!Paddle) { setError("Payment system not loaded. Please refresh."); setLoading(null); return; }

      // Pure client-side Paddle.js checkout — avoids 401
      const checkoutConfig: Record<string, unknown> = {
        items: [{ priceId: data.priceId, quantity: 1 }],
        customer: { email: session.email },
        customData: { userId: session.id },
        settings: {
          displayMode: "overlay",
          theme: "light",
          successUrl: `${window.location.origin}/dashboard?upgraded=1`,
        },
      };
      if (data.discountId) checkoutConfig.discountId = data.discountId;
      Paddle.Checkout.open(checkoutConfig);
      setLoading(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(`Something went wrong: ${msg}`);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.07) 0%, transparent 60%)" }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/mascot.png" alt="Sqrly" className="w-7 h-7 object-contain rounded-lg" />
          <span className="text-base font-black tracking-tight text-[#0F172A]">Sq<span className="text-[#00D4FF]">r</span>ly</span>
        </a>
        <div className="flex items-center gap-2">
          {fromOffer ? (
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-200 text-[#475569] rounded-full hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all">
              <ArrowLeft size={14} strokeWidth={1.5} /> Back to Dashboard
            </button>
          ) : (
            <a href="/auth?mode=signup"
              className="px-4 py-2 text-sm font-bold bg-[#00FF88] text-[#0F172A] rounded-full hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)]">
              Get Started Free
            </a>
          )}
        </div>
      </nav>

      <div className="relative z-10 pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
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

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 max-w-md mx-auto mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <Zap size={14} strokeWidth={1.5} />
              {error.includes("configured") ? "Payments coming soon! Sign up free in the meantime." : error}
            </div>
          )}

          {/* Plan cards */}
          <div className="grid md:grid-cols-3 gap-5 items-start mb-10">
            {PLANS.map((plan, i) => {
              const price = annual ? plan.price.annual : plan.price.monthly;
              return (
                <motion.div key={plan.id}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: plan.featured ? -6 : -3, transition: { duration: 0.2 } }}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    plan.featured
                      ? "bg-white border-2 border-[#00FF88] shadow-[0_20px_50px_rgba(0,255,136,0.15)]"
                      : "bg-white border border-slate-200 shadow-sm"
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00FF88] text-[#0F172A] text-[11px] font-black whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-4 mt-2">
                    <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">{plan.name}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      {price === 0
                        ? <span className="text-4xl font-black text-[#0F172A]">Free</span>
                        : <><span className="text-xl font-bold text-[#475569]">$</span><span className="text-4xl font-black text-[#0F172A]">{price}</span><span className="text-sm text-[#475569]">{plan.period}</span></>
                      }
                    </div>
                    {price > 0 && annual && <p className="text-[10px] text-[#94A3B8]">billed annually · cancel anytime</p>}
                    <p className="text-xs text-[#475569] mt-2 font-medium">{plan.tagline}</p>
                  </div>

                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => plan.href ? window.location.href = plan.href : handleUpgrade(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold mb-4 transition-all ${
                      plan.featured
                        ? "bg-[#00FF88] text-[#0F172A] hover:bg-[#00CC6E] shadow-[0_8px_24px_rgba(0,255,136,0.3)]"
                        : "border border-slate-200 text-[#475569] hover:border-[#00D4FF] hover:text-[#00D4FF]"
                    } disabled:opacity-50`}>
                    {loading === plan.id
                      ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      : <><ArrowRight size={13} strokeWidth={2} />{plan.cta}</>
                    }
                  </motion.button>

                  <div className="h-px bg-slate-100 mb-3" />

                  <div className="flex-1">
                    {plan.features.map((f, fi) => (
                      <FeatureRow key={fi} text={f.text} tip={f.tip} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Compare toggle */}
          <div className="text-center mb-6">
            <button onClick={() => setShowCompare(!showCompare)}
              className="text-sm font-semibold text-[#00D4FF] hover:text-[#0891B2] transition-colors">
              {showCompare ? "▲ Hide comparison" : "▼ Full feature comparison"}
            </button>
          </div>

          {/* Comparison table */}
          <AnimatePresence>
            {showCompare && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-10">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left px-5 py-3 text-xs font-bold text-[#94A3B8] uppercase tracking-wider w-1/3">Feature</th>
                          {["Free","Basic","Plus"].map(p => (
                            <th key={p} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-center ${p === "Basic" ? "text-[#00CC6E] bg-[#00FF88]/04" : "text-[#475569]"}`}>{p}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARE_ROWS.map((row, i) => (
                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 text-xs font-medium text-[#0F172A]">
                              {row.label}
                              {row.tips && <Tip text={row.tips} />}
                            </td>
                            {[row.free, row.basic, row.plus].map((val, j) => (
                              <td key={j} className={`px-4 py-3 text-center text-xs ${j === 1 ? "bg-[#00FF88]/04" : ""}`}>
                                {val === "✅"
                                  ? <CheckCircle size={14} className="text-[#00CC6E] mx-auto" strokeWidth={2} />
                                  : val === "—"
                                    ? <X size={12} className="text-[#CBD5E1] mx-auto" strokeWidth={2} />
                                    : <span className={`font-semibold ${j === 0 ? "text-[#94A3B8]" : j === 1 ? "text-[#00CC6E]" : "text-[#8B5CF6]"}`}>{val}</span>
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ strip */}
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime, no questions asked. You keep access until the end of your billing period. No penalties." },
              { q: "Is there a free trial?", a: "Yes. All paid plans include a 7-day free trial. No credit card required to try Basic or Plus." },
              { q: "What happens if I downgrade?", a: "Your existing QR codes stay. Dynamic codes over your new plan limit are paused (not deleted) and can be reactivated on upgrade." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0F172A] mb-2">{q}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#94A3B8]">
            Questions? <a href="mailto:office@honoshi.co.il" className="text-[#00D4FF] hover:underline">office@honoshi.co.il</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}