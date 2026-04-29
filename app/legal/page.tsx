"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

function LegalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "privacy";

  const content: Record<string, { title: string; body: React.ReactNode }> = {
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-6 text-sm text-[#475569] leading-relaxed">
          <p className="text-xs text-[#94A3B8]">Last updated: June 2025</p>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">1. Overview</h2>
            <p>Sqrly (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated by Honoshi, Israel. We are committed to protecting your privacy. This policy explains what data we collect, why, and how we use it.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">2. Client-Side Generation</h2>
            <p>QR codes are generated entirely in your browser. Your URLs, Wi-Fi passwords, vCard details, and other QR content are never transmitted to our servers.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">3. Account Data</h2>
            <p>When you create an account, we store your name, email address, and hashed password in our secure database (Supabase). We store QR code metadata (name, type, scan counts) but not the private content of your codes.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">4. Analytics</h2>
            <p>For dynamic QR codes, we count scan events. We do not store IP address, device fingerprint, or location of people who scan your codes.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">5. GDPR & CCPA</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. Contact us at office@honoshi.co.il or use the account deletion feature in Settings.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">6. Contact</h2>
            <p>Honoshi · Israel · <a href="mailto:office@honoshi.co.il" className="text-[#00D4FF] hover:underline">office@honoshi.co.il</a></p></section>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-6 text-sm text-[#475569] leading-relaxed">
          <p className="text-xs text-[#94A3B8]">Last updated: June 2025</p>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">1. Acceptance</h2>
            <p>By using Sqrly, you agree to these Terms. If you do not agree, please do not use the service.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">2. Free Plan</h2>
            <p>The free plan includes 1 dynamic QR code and 50 static QR codes. Free plan features may change with reasonable notice.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">3. Acceptable Use</h2>
            <p>You may not use Sqrly to generate codes that link to illegal content, malware, phishing sites, or content that violates applicable laws.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">4. Governing Law</h2>
            <p>These terms are governed by the laws of Israel. Disputes shall be resolved in the courts of Tel Aviv.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">5. Contact</h2>
            <p>Honoshi · Israel · <a href="mailto:office@honoshi.co.il" className="text-[#00D4FF] hover:underline">office@honoshi.co.il</a></p></section>
        </div>
      ),
    },
    cookies: {
      title: "Cookie Policy",
      body: (
        <div className="space-y-6 text-sm text-[#475569] leading-relaxed">
          <p className="text-xs text-[#94A3B8]">Last updated: June 2025</p>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">Our Cookie Policy</h2>
            <p>Sqrly does not use cookies for tracking or advertising. We use <strong className="text-[#0F172A]">sessionStorage</strong> to keep you logged in during your session. This data is cleared when you close your browser tab.</p></section>
          <section><h2 className="text-base font-bold text-[#0F172A] mb-2">No Third-Party Tracking</h2>
            <p>We do not use Google Analytics, Facebook Pixel, or any other third-party tracking tools. We have no advertising partners and do not sell your data.</p></section>
        </div>
      ),
    },
  };

  const page = content[type] || content.privacy;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <nav className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <a href="/" className="flex items-center gap-2">
          <img src="/mascot.png" alt="Sqrly" className="w-7 h-7 object-contain rounded-lg" />
          <span className="text-base font-black tracking-tight text-[#0F172A]">Sq<span className="text-[#00D4FF]">r</span>ly</span>
        </a>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#00D4FF] transition-colors">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back
        </button>
      </nav>
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <div className="flex gap-2 mb-10">
          {["privacy","terms","cookies"].map(t => (
            <button key={t} onClick={() => router.push(`/legal?type=${t}`)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize ${
                type === t
                  ? "bg-[#00FF88] text-[#0F172A] shadow-[0_4px_12px_rgba(0,255,136,0.25)]"
                  : "bg-white border border-slate-200 text-[#475569] hover:border-[#00D4FF]/30 hover:text-[#00D4FF]"
              }`}>
              {t === "privacy" ? "Privacy Policy" : t === "terms" ? "Terms of Service" : "Cookies"}
            </button>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mb-8">{page.title}</h1>
          {page.body}
        </div>
        <p className="text-center text-xs text-[#94A3B8] mt-6">
          Questions? <a href="mailto:office@honoshi.co.il" className="text-[#00D4FF] hover:underline">office@honoshi.co.il</a>
        </p>
      </div>
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="w-5 h-5 border-2 border-slate-200 border-t-[#00D4FF] rounded-full animate-spin" /></div>}>
      <LegalContent />
    </Suspense>
  );
}