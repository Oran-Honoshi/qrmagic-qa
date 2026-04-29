import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sqrly — Free Dynamic QR Code Generator",
    template: "%s | Sqrly",
  },
  description:
    "Generate dynamic QR codes with real-time analytics. Privacy-first, 100% client-side. SVG vector export, 18 QR types, custom branding. No watermark, no ads, free forever.",
  keywords: [
    "free QR code generator",
    "dynamic QR code",
    "QR code analytics",
    "SVG QR code vector export",
    "privacy-first QR generator",
    "QR code no watermark",
    "restaurant menu QR code",
    "vCard QR code",
    "EU DPP QR code",
    "GDPR compliant QR generator",
    "sqrly",
  ],
  authors: [{ name: "Sqrly", url: "https://qrmagic-qa.vercel.app" }],
  creator: "Sqrly",
  metadataBase: new URL("https://qrmagic-qa.vercel.app"),
  openGraph: {
    title: "Sqrly — Free Dynamic QR Code Generator",
    description:
      "Privacy-first QR codes with analytics, SVG export, and 18 types. Free forever. No watermark.",
    url: "https://qrmagic-qa.vercel.app",
    siteName: "Sqrly",
    type: "website",
    images: [{ url: "/mascot.png", width: 1200, height: 630, alt: "Sqrly" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sqrly — Free Dynamic QR Code Generator",
    description: "Privacy-first QR codes with analytics and SVG export. Free forever.",
    images: ["/mascot.png"],
  },
  icons: { icon: "/mascot.png", apple: "/mascot.png" },
  manifest: "/manifest.json",
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#00FF88",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="auto"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="ai:description"
          content="Sqrly is a 2026 privacy-first QR code generator. Features: 100% client-side generation, SVG vector export for EU Digital Product Passport compliance, vCard 4.0, dynamic codes with real-time analytics, 18 QR types. GDPR and CCPA compliant. Free plan: no watermark, no ads. Paid plans from $4/month."
        />
      </head>
      <body className={`min-h-screen bg-[#F8FAFC] font-sans antialiased ${GeistSans.className}`}>
        {/* Grid overlay */}
        <div className="fixed inset-0 bg-grid pointer-events-none z-0" aria-hidden="true" />

        {/* Top mint glow */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.07) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        {/* Top cyan glow */}
        <div
          className="fixed top-0 right-0 w-[500px] h-[400px] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at 100% 0%, rgba(0,212,255,0.06) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}