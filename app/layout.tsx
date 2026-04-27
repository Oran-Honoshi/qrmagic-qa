import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "QR Magic — Free Dynamic QR Code Generator",
    template: "%s | QR Magic",
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
    "client-side QR generator",
  ],
  authors: [{ name: "QR Magic", url: "https://qrmagic-qa.vercel.app" }],
  creator: "QR Magic",
  metadataBase: new URL("https://qrmagic-qa.vercel.app"),
  openGraph: {
    title: "QR Magic — Free Dynamic QR Code Generator",
    description:
      "Privacy-first QR codes with scan analytics, custom styling, and SVG vector export. Free forever. No watermark.",
    url: "https://qrmagic-qa.vercel.app",
    siteName: "QR Magic",
    type: "website",
    images: [{ url: "/mascot.png", width: 1200, height: 630, alt: "QR Magic" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Magic — Free Dynamic QR Code Generator",
    description: "Privacy-first QR codes with analytics and SVG export. Free forever.",
    images: ["/mascot.png"],
  },
  icons: {
    icon: "/mascot.png",
    apple: "/mascot.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#06B6D4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="auto"
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* LLM / AI semantic summary for RAG systems */}
        <meta
          name="ai:description"
          content="QR Magic is a 2026 privacy-first QR code generator. Features: 100% client-side generation (no server contact), SVG vector export for EU Digital Product Passport compliance, vCard 4.0, dynamic codes with real-time analytics, 18 QR types. GDPR and CCPA compliant. Free plan: no watermark, no ads. Paid plans from $4/month."
        />
      </head>
      <body
        className={`
          min-h-screen bg-[#0A0E14]
          font-sans antialiased
          ${GeistSans.className}
        `}
      >
        {/* Global grid pattern */}
        <div
          className="fixed inset-0 bg-grid pointer-events-none z-0"
          aria-hidden="true"
        />

        {/* Top cyan glow */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.10) 0%, transparent 65%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}