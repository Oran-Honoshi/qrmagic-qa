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
        <div className="space-y-6 text-sm text-[#94A3B8] leading-relaxed">
          <p className="text-xs text-[#4A5568]">Last updated: June 2025</p>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">1. Overview</h2>
            <p>QR Magic (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated by Honoshi, Israel. We are committed to protecting your privacy. This policy explains what data we collect, why, and how we use it.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">2. Client-Side Generation</h2>
            <p>QR codes are generated entirely in your browser. Your URLs, Wi-Fi passwords, vCard details, and other QR content are never transmitted to our servers. We have no access to the content of your QR codes.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">3. Account Data</h2>
            <p>When you create an account, we store your name, email address, and hashed password in our secure database (Supabase). We store your QR code metadata (name, type, scan counts) but not the private content of your codes.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">4. Analytics</h2>
            <p>For dynamic QR codes, we count scan events. We do not store the IP address, device fingerprint, or location of people who scan your codes. Scan counts are aggregate only.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">5. Cookies</h2>
            <p>We use session storage (not cookies) for authentication. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">6. GDPR & CCPA</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. Contact us at office@honoshi.co.il or use the account deletion feature in Settings.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">7. Contact</h2>
            <p>Honoshi · Israel · <a href="mailto:office@honoshi.co.il" className="text-[#06B6D4] hover:underline">office@honoshi.co.il</a></p>
          </section>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-6 text-sm text-[#94A3B8] leading-relaxed">
          <p className="text-xs text-[#4A5568]">Last updated: June 2025</p>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">1. Acceptance</h2>
            <p>By using QR Magic, you agree to these Terms. If you do not agree, please do not use the service.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">2. Free Plan</h2>
            <p>The free plan includes 1 dynamic QR code and 50 static QR codes. Free plan features may change with reasonable notice. We will never charge your credit card without explicit consent.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">3. Acceptable Use</h2>
            <p>You may not use QR Magic to generate codes that link to illegal content, malware, phishing sites, or content that violates applicable laws. We reserve the right to suspend accounts that violate this policy.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">4. Intellectual Property</h2>
            <p>You retain ownership of all content you create. By using QR Magic, you grant us a limited license to store and display your QR code metadata for the purpose of providing the service.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">5. Limitation of Liability</h2>
            <p>QR Magic is provided &quot;as is&quot; without warranty of any kind. We are not liable for any damages arising from use of the service, including loss of data or business interruption.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">6. Governing Law</h2>
            <p>These terms are governed by the laws of Israel. Disputes shall be resolved in the courts of Tel Aviv.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">7. Contact</h2>
            <p>Honoshi · Israel · <a href="mailto:office@honoshi.co.il" className="text-[#06B6D4] hover:underline">office@honoshi.co.il</a></p>
          </section>
        </div>
      ),
    },
    cookies: {
      title: "Cookie Policy",
      body: (
        <div className="space-y-6 text-sm text-[#94A3B8] leading-relaxed">
          <p className="text-xs text-[#4A5568]">Last updated: June 2025</p>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">Our Cookie Policy</h2>
            <p>QR Magic does not use cookies for tracking or advertising. We use <strong className="text-[#F0F4F8]">sessionStorage</strong> (a browser feature, not a cookie) to keep you logged in during your session. This data is cleared when you close your browser tab.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">No Third-Party Tracking</h2>
            <p>We do not use Google Analytics, Facebook Pixel, or any other third-party tracking tools. We have no advertising partners and do not sell your data.</p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#F0F4F8] mb-2">GDPR Compliance</h2>
            <p>Because we do not use cookies for tracking, no cookie consent banner is required under GDPR Article 5. If this changes, we will update this policy and notify you.</p>
          </section>
        </div>
      ),
    },
  };

  const page = content[type] || content.privacy;

  return (
    <div className="min-h-screen bg-[#0A0E14]">
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />
      <nav className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(10,14,20,0.8)] backdrop-blur-xl">
        <a href="/" className="flex items-center gap-2">
          <img src="/mascot.png" alt="QR Magic" className="w-7 h-7 object-contain rounded-md" />
          <span className="text-base font-bold tracking-tight text-[#F0F4F8]">
            <span className="text-[#06B6D4]">QR</span> Magic
          </span>
        </a>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#94A3B8] transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        {/* Tab nav */}
        <div className="flex gap-2 mb-10">
          {["privacy", "terms", "cookies"].map((t) => (
            <button
              key={t}
              onClick={() => router.push(`/legal?type=${t}`)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize ${
                type === t
                  ? "bg-[#06B6D4] text-[#0A0E14]"
                  : "bg-[#0F1520] border border-[rgba(255,255,255,0.07)] text-[#4A5568] hover:text-[#94A3B8]"
              }`}
            >
              {t === "privacy" ? "Privacy Policy" : t === "terms" ? "Terms of Service" : "Cookies"}
            </button>
          ))}
        </div>

        <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8">
          <h1 className="text-2xl font-black text-[#F0F4F8] tracking-tight mb-8">{page.title}</h1>
          {page.body}
        </div>

        <p className="text-center text-xs text-[#4A5568] mt-6">
          Questions? <a href="mailto:office@honoshi.co.il" className="text-[#06B6D4] hover:underline">office@honoshi.co.il</a>
        </p>
      </div>
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[rgba(6,182,212,0.2)] border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    }>
      <LegalContent />
    </Suspense>
  );
}