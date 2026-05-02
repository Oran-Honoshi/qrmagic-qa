"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Link, Wifi, User, FileText, Mail, MessageSquare, Phone,
  MapPin, Calendar, Share2, Video, File, CreditCard,
  Bitcoin, Image, Check, ChevronDown, Upload, X,
  Download, Zap, Lock, ArrowLeft, Info
,
  Smartphone, Globe, Music, Coffee, Heart, ShoppingBag, Package
} from "lucide-react";
import type QRCodeStylingType from "qr-code-styling";
import { createClient } from "@supabase/supabase-js";
import { QRFrameDesigner } from "@/components/QRFrameDesigner";
import { UpgradeModal } from "@/components/UpgradeModal";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem("qrmagic_session") || "null"); }
  catch { return null; }
}

// Generate a unique 8-char alphanumeric short ID
function generateShortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Base URL for redirects
const BASE_URL = typeof window !== "undefined"
  ? window.location.origin
  : "https://qrmagic-qa-oran-honoshis-projects.vercel.app";

/* Types */
const QR_TYPES = [
  // Essential
  { id: "url",       icon: Link,          label: "URL",        desc: "Link to any website",        category: "Essential" },
  { id: "text",      icon: FileText,      label: "Text",       desc: "Plain text message",         category: "Essential" },
  { id: "email",     icon: Mail,          label: "Email",      desc: "Pre-filled email compose",   category: "Essential" },
  { id: "sms",       icon: MessageSquare, label: "SMS",        desc: "Pre-filled SMS message",     category: "Essential" },
  { id: "phone",     icon: Phone,         label: "Phone",      desc: "Click-to-call number",       category: "Essential" },
  { id: "location",  icon: MapPin,        label: "Location",   desc: "Google Maps pin",            category: "Essential" },
  // Professional
  { id: "vcard",     icon: User,          label: "vCard",      desc: "Digital business card",      category: "Professional" },
  { id: "wifi",      icon: Wifi,          label: "Wi-Fi",      desc: "Auto-connect to network",    category: "Professional" },
  { id: "pdf",       icon: File,          label: "PDF",        desc: "Document or file link",      category: "Professional" },
  { id: "zoom",      icon: Video,         label: "Zoom",       desc: "Zoom meeting link",          category: "Professional" },
  { id: "event",     icon: Calendar,      label: "Event",      desc: "Add to calendar (iCal)",     category: "Professional" },
  { id: "appstore",  icon: Smartphone,    label: "App Store",  desc: "iOS & Android app links",    category: "Professional" },
  // Social & Media
  { id: "whatsapp",  icon: MessageSquare, label: "WhatsApp",   desc: "WhatsApp chat link",         category: "Social" },
  { id: "social",    icon: Share2,        label: "Social",     desc: "Social media profile",       category: "Social" },
  { id: "youtube",   icon: Video,         label: "YouTube",    desc: "Video or channel link",      category: "Social" },
  { id: "multilink", icon: Globe,         label: "Multi-Link", desc: "Link-in-bio page",           category: "Social" },
  { id: "spotify",   icon: Music,         label: "Spotify",    desc: "Song or playlist",           category: "Social" },
  { id: "image",     icon: Image,         label: "Image",      desc: "Photo or image URL",         category: "Social" },
  // Financial
  { id: "paypal",    icon: CreditCard,    label: "PayPal",     desc: "PayPal payment link",        category: "Financial" },
  { id: "bitcoin",   icon: Bitcoin,       label: "Crypto",     desc: "Crypto wallet address",      category: "Financial" },
  // Retail & Promo
  { id: "menu",      icon: Coffee,        label: "Menu",       desc: "Restaurant menu link",       category: "Retail" },
  { id: "feedback",  icon: Heart,         label: "Feedback",   desc: "Review or survey link",      category: "Retail" },
  { id: "coupon",    icon: ShoppingBag,   label: "Coupon",     desc: "Discount or promo page",     category: "Retail" },
  { id: "package",   icon: Package,       label: "Product",    desc: "Product info page",          category: "Retail" },
];

const QR_CATEGORIES_LIST = [
  { label: "Essential",      color: "#00D4FF", types: ["url","text","email","sms","phone","location"] },
  { label: "Professional",   color: "#8B5CF6", types: ["vcard","wifi","pdf","zoom","event","appstore"] },
  { label: "Social & Media", color: "#F472B6", types: ["whatsapp","social","youtube","multilink","spotify","image"] },
  { label: "Financial",      color: "#00FF88", types: ["paypal","bitcoin"] },
  { label: "Retail & Promo", color: "#FB923C", types: ["menu","feedback","coupon","package"] },
];

const TYPE_HINTS: Record<string, string> = {
  url:       "Great for websites, landing pages, product pages, or any web link.",
  text:      "Perfect for short messages, quotes, or instructions that don't need a link.",
  email:     "Pre-fill an email — great for feedback collection or support.",
  sms:       "Let customers text you instantly — great for reservations or support.",
  phone:     "One scan dials your number — perfect for business cards and flyers.",
  location:  "Share your exact location — great for events, stores, or pop-ups.",
  vcard:     "Save your full contact card to someone's phone with one scan.",
  wifi:      "Let guests join your network without sharing the password verbally.",
  pdf:       "Link to a menu, brochure, manual, or any hosted document.",
  zoom:      "Share your Zoom link — great for printed invitations and posters.",
  event:     "Add an event to any calendar — great for conferences and weddings.",
  appstore:  "Direct people to download your iOS or Android app.",
  whatsapp:  "Open a pre-filled WhatsApp chat — great for customer service.",
  social:    "Link to your Instagram, LinkedIn, TikTok, or any social profile.",
  youtube:   "Share a video or channel — great for demos and tutorials.",
  multilink: "One QR, many links — like a Linktree. Perfect for bio links.",
  spotify:   "Share a song, playlist, or podcast — great for events and venues.",
  image:     "Display a photo or gallery — great for portfolios and products.",
  paypal:    "Accept payments or tips with one scan — great for freelancers.",
  bitcoin:   "Share your crypto wallet for donations or payments.",
  menu:      "Link to your digital menu — great for restaurants, cafés, and bars.",
  feedback:  "Collect reviews and ratings — great for hotels and services.",
  coupon:    "Share a discount or promo page — great for retail and events.",
  package:   "Link to product info, warranty, or support page.",
};


const QR_COLORS = [
  "#00D4FF", "#F472B6", "#8B5CF6", "#4ADE80",
  "#FB923C", "#F87171", "#0F172A", "#F8FAFC",
];
const BG_COLORS = [
  "#ffffff", "#F8FAFC", "#FFFFFF", "#0F172A",
  "#FFF7ED", "#F0FDF4", "#FDF2F8", "#EFF6FF",
];

const EC_LEVELS = [
  { v: "L", label: "L", desc: "7% — max capacity" },
  { v: "M", label: "M", desc: "15% — balanced" },
  { v: "Q", label: "Q", desc: "25% — good for logos" },
  { v: "H", label: "H", desc: "30% — best for logos" },
] as const;

const DOT_STYLES = [
  { v: "rounded",       label: "Rounded" },
  { v: "dots",          label: "Dots" },
  { v: "classy",        label: "Classy" },
  { v: "classy-rounded",label: "Classy+" },
  { v: "square",        label: "Square" },
  { v: "extra-rounded", label: "Extra" },
] as const;

/* Form field helper */
function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
        {label}
        {hint && (
          <span title={hint} className="cursor-help">
            <Info size={11} className="text-[#94A3B8]" />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = "text", rows,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; rows?: number;
}) {
  const cls = "w-full bg-[#F8FAFC] border border-[rgba(226,232,240,1)] focus:border-[rgba(6,182,212,0.4)] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all focus:bg-[#F1F5F9] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.06)]";
  if (rows) {
    return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cls + " resize-none"} />;
  }
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#F8FAFC] border border-[rgba(226,232,240,1)] focus:border-[rgba(6,182,212,0.4)] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] outline-none appearance-none pr-8 transition-all">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
    </div>
  );
}

/* QR form by type */
function QRForm({ type, data, onChange }: {
  type: string;
  data: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  const f = (key: string, label: string, ph: string, t = "text", hint?: string) => (
    <FormField key={key} label={label} hint={hint}>
      <Input value={data[key] || ""} onChange={v => onChange(key, v)} placeholder={ph} type={t} />
    </FormField>
  );
  const ta = (key: string, label: string, ph: string) => (
    <FormField key={key} label={label}>
      <Input value={data[key] || ""} onChange={v => onChange(key, v)} placeholder={ph} rows={4} />
    </FormField>
  );

  switch (type) {
    case "url": return <div className="space-y-3">
      {f("url", "Destination URL", "https://yourwebsite.com", "url")}
      {f("name", "QR Code Name", "My Homepage QR")}
      {/* UTM section */}
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold text-[#94A3B8] uppercase tracking-wider py-2 hover:text-[#475569] transition-colors list-none">
          UTM Tracking Parameters
          <ChevronDown size={13} className="group-open:rotate-180 transition-transform" />
        </summary>
        <div className="space-y-3 pt-2 border-t border-[rgba(226,232,240,0.6)] mt-2">
          {f("utmSource", "utm_source", "e.g. instagram")}
          {f("utmMedium", "utm_medium", "e.g. qr_code")}
          {f("utmCampaign", "utm_campaign", "e.g. summer_sale")}
          {f("utmTerm", "utm_term", "e.g. keyword")}
          {f("utmContent", "utm_content", "e.g. blue_button")}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] text-[#475569] leading-relaxed">
              💡 UTM parameters work on <strong className="text-[#0F172A]">both static and dynamic</strong> QR codes.
              Your destination website&apos;s analytics (e.g. Google Analytics) will capture these when someone scans the code.
            </p>
          </div>
        </div>
      </details>
    </div>;
    case "wifi": return <div className="space-y-3">
      {f("ssid", "Network Name (SSID)", "MyHomeNetwork")}
      {f("password", "Password", "••••••••", "password")}
      <FormField label="Security">
        <Select value={data.security || "WPA"} onChange={v => onChange("security", v)}
          options={[{value:"WPA",label:"WPA/WPA2"},{value:"WEP",label:"WEP"},{value:"",label:"None"}]} />
      </FormField>
    </div>;
    case "vcard": return <div className="space-y-3">
      {f("name", "Full Name", "Alex Smith")}
      {f("title", "Job Title", "Marketing Manager")}
      {f("company", "Company", "Acme Inc.")}
      {f("phone", "Phone", "+1 555 000 0000", "tel")}
      {f("email", "Email", "alex@example.com", "email")}
      {f("website", "Website", "https://alexsmith.com", "url")}
      {f("linkedin", "LinkedIn URL", "https://linkedin.com/in/alexsmith", "url")}
    </div>;
    case "text": return <div className="space-y-3">{ta("text", "Your Text", "Type anything here...")}</div>;
    case "email": return <div className="space-y-3">
      {f("email", "Email Address", "recipient@example.com", "email")}
      {f("subject", "Subject", "Hello there!")}
      {ta("body", "Body (optional)", "Your message...")}
    </div>;
    case "sms": return <div className="space-y-3">
      {f("phone", "Phone Number", "+1 555 000 0000", "tel")}
      {ta("message", "Pre-filled Message", "Your message...")}
    </div>;
    case "phone": return <div className="space-y-3">{f("phone", "Phone Number", "+1 555 000 0000", "tel")}</div>;
    case "whatsapp": return <div className="space-y-3">
      {f("phone", "WhatsApp Number (with country code)", "+1 555 000 0000", "tel")}
      {ta("message", "Pre-filled Message (optional)", "Hello! I saw your QR code...")}
    </div>;
    case "location": return <div className="space-y-3">
      {f("lat", "Latitude", "40.7128", "number")}
      {f("lng", "Longitude", "-74.0060", "number")}
      <div className="text-xs text-[#94A3B8]">Or paste a Google Maps URL:</div>
      {f("mapsUrl", "Google Maps URL (optional)", "https://maps.google.com/?q=...", "url")}
    </div>;
    case "event": return <div className="space-y-3">
      {f("title", "Event Title", "My Event")}
      {f("location", "Location", "123 Main St, City")}
      <FormField label="Start Date & Time">
        <Input value={data.start || ""} onChange={v => onChange("start", v)} type="datetime-local" />
      </FormField>
      <FormField label="End Date & Time">
        <Input value={data.end || ""} onChange={v => onChange("end", v)} type="datetime-local" />
      </FormField>
      {ta("description", "Description (optional)", "Join us for...")}
    </div>;
    case "social": return <div className="space-y-3">
      <FormField label="Platform">
        <Select value={data.platform || "instagram"} onChange={v => onChange("platform", v)}
          options={[
            {value:"instagram",label:"Instagram"},{value:"facebook",label:"Facebook"},
            {value:"twitter",label:"X / Twitter"},{value:"linkedin",label:"LinkedIn"},
            {value:"tiktok",label:"TikTok"},{value:"pinterest",label:"Pinterest"},
            {value:"youtube",label:"YouTube"},
          ]} />
      </FormField>
      {f("url", "Profile URL", "https://instagram.com/yourusername", "url")}
    </div>;
    case "youtube": return <div className="space-y-3">{f("url", "YouTube URL", "https://youtube.com/watch?v=...", "url")}</div>;
    case "appstore": return <div className="space-y-3">
      <FormField label="Platform">
        <Select value={data.platform || "both"} onChange={v => onChange("platform", v)}
          options={[{value:"both",label:"Both (smart redirect)"},{value:"ios",label:"App Store (iOS)"},{value:"android",label:"Google Play"}]} />
      </FormField>
      {f("iosUrl", "App Store URL", "https://apps.apple.com/...", "url")}
      {f("androidUrl", "Google Play URL", "https://play.google.com/...", "url")}
    </div>;
    case "bitcoin": return <div className="space-y-3">
      <FormField label="Cryptocurrency">
        <Select value={data.currency || "bitcoin"} onChange={v => onChange("currency", v)}
          options={[{value:"bitcoin",label:"Bitcoin (BTC)"},{value:"ethereum",label:"Ethereum (ETH)"},{value:"litecoin",label:"Litecoin (LTC)"}]} />
      </FormField>
      {f("address", "Wallet Address", "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")}
      {f("amount", "Amount (optional)", "0.001", "number")}
    </div>;
    case "zoom": return <div className="space-y-3">
      {f("url", "Zoom Meeting URL", "https://zoom.us/j/...", "url")}
      {f("id", "Meeting ID (optional)", "123 456 7890")}
      {f("password", "Passcode (optional)", "••••••••", "password")}
    </div>;
    case "pdf": return <div className="space-y-3">
      {f("url", "File / PDF URL", "https://example.com/menu.pdf", "url")}
      <p className="text-xs text-[#94A3B8]">Upload your file to Google Drive or Dropbox and paste the share link.</p>
    </div>;
    case "paypal": return <div className="space-y-3">
      <FormField label="Payment Type">
        <Select value={data.type || "paypal.me"} onChange={v => onChange("type", v)}
          options={[{value:"paypal.me",label:"PayPal.me link"},{value:"donate",label:"Donation"},{value:"request",label:"Payment Request"}]} />
      </FormField>
      {f("url", "PayPal.me URL", "https://paypal.me/yourusername", "url")}
      {f("amount", "Amount (optional)", "10.00", "number")}
    </div>;
    case "image": return <div className="space-y-3">{f("url", "Image URL", "https://example.com/image.jpg", "url")}</div>;
    case "multilink": return (
      <div className="space-y-3">
        {f("name", "Page Title", "My Links")}
        <div>
          <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2 block">
            Links <span className="text-[#94A3B8] normal-case font-normal">(one per line: Label | URL)</span>
          </label>
          <textarea
            value={data.links || ""}
            onChange={e => onChange("links", e.target.value)}
            placeholder="My Website | URL · Instagram | URL · Book a Call | URL"
            rows={5}
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] rounded-xl px-3 py-2.5 text-xs font-mono text-[#0F172A] placeholder:text-[#CBD5E1] outline-none resize-none transition-all"
          />
          <p className="text-[10px] text-[#94A3B8] mt-1.5">Each link on its own line. Format: Label | https://url.com</p>
        </div>
        {f("bio", "Short Bio (optional)", "Designer & creator based in Tel Aviv")}
        {f("avatar", "Profile Image URL (optional)", "https://...")}
      </div>
    );

    case "spotify": return (
      <div className="space-y-3">
        {f("url", "Spotify URL", "https://open.spotify.com/track/...")}
        {f("name", "QR Code Name", "My Playlist QR")}
      </div>
    );

    case "menu": return (
      <div className="space-y-3">
        {f("url", "Menu URL", "https://your-menu.com")}
        {f("name", "QR Code Name", "Restaurant Menu")}
        {f("restaurant", "Restaurant/Venue Name (optional)", "Café Bella")}
      </div>
    );

    case "feedback": return (
      <div className="space-y-3">
        {f("url", "Feedback Form URL", "https://forms.google.com/...")}
        {f("name", "QR Code Name", "Customer Feedback")}
      </div>
    );

    case "coupon": return (
      <div className="space-y-3">
        {f("url", "Coupon / Promo Page URL", "https://your-store.com/promo")}
        {f("code", "Discount Code (optional)", "SAVE20")}
        {f("name", "QR Code Name", "Summer Sale")}
      </div>
    );

    case "package": return (
      <div className="space-y-3">
        {f("url", "Product Page URL", "https://your-store.com/product")}
        {f("name", "QR Code Name", "Product QR")}
        {f("product", "Product Name (optional)", "Premium Widget v2")}
      </div>
    );

    default: return null;
  }
}

/* Build QR value from form data */
function buildQRValue(type: string, data: Record<string, string>): string {
  const v = (k: string) => data[k] || "";
  switch (type) {
    case "url": {
      let base = v("url") || "https://qrmagic.io";
      const params = [
        v("utmSource") && `utm_source=${encodeURIComponent(v("utmSource"))}`,
        v("utmMedium") && `utm_medium=${encodeURIComponent(v("utmMedium"))}`,
        v("utmCampaign") && `utm_campaign=${encodeURIComponent(v("utmCampaign"))}`,
        v("utmTerm") && `utm_term=${encodeURIComponent(v("utmTerm"))}`,
        v("utmContent") && `utm_content=${encodeURIComponent(v("utmContent"))}`,
      ].filter(Boolean);
      if (params.length) base += (base.includes("?") ? "&" : "?") + params.join("&");
      return base;
    }
    case "wifi":    return `WIFI:T:${v("security")||"WPA"};S:${v("ssid")};P:${v("password")};;`;
    case "vcard":   return `BEGIN:VCARD\nVERSION:4.0\nFN:${v("name")}\nTITLE:${v("title")}\nORG:${v("company")}\nTEL;TYPE=cell,voice;VALUE=uri:tel:${v("phone")}\nEMAIL:${v("email")}\nURL:${v("website")}\nURL;TYPE=linkedin:${v("linkedin")}\nEND:VCARD`;
    case "text":    return v("text") || "Hello from Sqrly!";
    case "email":   return `mailto:${v("email")}?subject=${encodeURIComponent(v("subject"))}&body=${encodeURIComponent(v("body"))}`;
    case "sms":     return `sms:${v("phone")}${v("message") ? `?body=${encodeURIComponent(v("message"))}` : ""}`;
    case "phone":   return `tel:${v("phone")}`;
    case "whatsapp": {
      const num = v("phone").replace(/[^0-9]/g, "");
      return `https://wa.me/${num}${v("message") ? `?text=${encodeURIComponent(v("message"))}` : ""}`;
    }
    case "location": {
      if (v("mapsUrl")) return v("mapsUrl");
      return v("lat") && v("lng") ? `https://maps.google.com/?q=${v("lat")},${v("lng")}` : "https://maps.google.com";
    }
    case "event": {
      const fmt = (d: string) => d ? d.replace(/[-:T]/g, "").substring(0, 15) + "Z" : "";
      return `BEGIN:VEVENT\nSUMMARY:${v("title")}\nLOCATION:${v("location")}\nDTSTART:${fmt(v("start"))}\nDTEND:${fmt(v("end"))}\nDESCRIPTION:${v("description")}\nEND:VEVENT`;
    }
    case "social":  return v("url") || "https://qrmagic.io";
    case "youtube": return v("url") || "https://youtube.com";
    case "appstore": {
      const p = v("platform");
      if (p === "ios") return v("iosUrl") || "https://apps.apple.com";
      if (p === "android") return v("androidUrl") || "https://play.google.com";
      return v("iosUrl") || v("androidUrl") || "https://qrmagic.io";
    }
    case "bitcoin": return `${v("currency")||"bitcoin"}:${v("address")}${v("amount") ? `?amount=${v("amount")}` : ""}`;
    case "zoom":    return v("url") || "https://zoom.us";
    case "pdf":     return v("url") || "https://qrmagic.io";
    case "paypal":  return v("url") || "https://paypal.me";
    case "image":   return v("url") || "https://qrmagic.io";
    default:        return "https://qrmagic.io";
  }
}

/* Holographic QR Preview */
/* Holographic QR Preview */
function QRPreview({
  value, color, bgColor, dotStyle, ecLevel, logo, isHolo, onOpenFrame, logoPlacement = "center",
}: {
  value: string; color: string; bgColor: string;
  dotStyle: string; ecLevel: string; logo: string | null; isHolo: boolean;
  onOpenFrame: () => void; logoPlacement?: "center" | "behind" | "background";
}): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<unknown>(null);

  useEffect(() => {
    if (!ref.current) return;
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (!ref.current) return;
      const qr = new QRCodeStyling({
        width: 220, height: 220,
        type: "svg",
        data: value || "https://qrmagic.io",
        image: logo || undefined,
        dotsOptions: { color, type: dotStyle as "rounded" },
        cornersSquareOptions: { color, type: "extra-rounded" },
        cornersDotOptions: { color },
        backgroundOptions: { color: bgColor },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: logoPlacement === "behind" ? 0 : 4,
          imageSize: logoPlacement === "behind" ? 0.6 : 0.3,
          hideBackgroundDots: logoPlacement !== "behind",
        },
        qrOptions: { errorCorrectionLevel: ecLevel as "H" },
      });
      ref.current.innerHTML = "";
      qr.append(ref.current);
      qrRef.current = qr;
    });
  }, []);

  useEffect(() => {
    if (!qrRef.current) return;
    const t = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (qrRef.current as any)?.update({
        data: value || "https://qrmagic.io",
        image: logo || undefined,
        dotsOptions: { color, type: dotStyle as "rounded" },
        cornersSquareOptions: { color, type: "extra-rounded" },
        cornersDotOptions: { color },
        backgroundOptions: { color: bgColor },
        qrOptions: { errorCorrectionLevel: ecLevel as "H" },
      });
    }, 300);
    return () => clearTimeout(t);
  }, [value, color, bgColor, dotStyle, ecLevel, logo]);

  function download(ext: "svg" | "png" | "jpeg") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (qrRef.current as any)?.download({ name: "sqrly-export", extension: ext });
  }

  function downloadPDF() {
    if (!ref.current) return;
    const svgEl = ref.current.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new window.Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 600; canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 0, 0, 600, 600);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/png");
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`<html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;}img{max-width:80%;max-height:80%;}@media print{body{margin:20mm;}@page{size:A4;margin:20mm;}}</style></head><body><img src="${dataUrl}" onload="window.print();setTimeout(()=>window.close(),500)"/></body></html>`);
      win.document.close();
    };
    img.src = url;
  }

  return (
    <div className="sticky top-6">
      <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-3 text-center">
        Live Preview
      </p>

      <div
        className="p-[1.5px] rounded-2xl mx-auto"
        style={{
          width: "fit-content",
          background: isHolo
            ? "linear-gradient(135deg, #00D4FF, #8B5CF6, #F472B6, #00D4FF)"
            : `linear-gradient(135deg, ${color}60, ${color}20)`,
          backgroundSize: "300% 300%",
          animation: isHolo
            ? "gradient-shift 3s ease infinite, pulse-glow 2.5s ease-in-out infinite"
            : "none",
        }}
      >
        <div
          className="rounded-[14px] p-4 relative overflow-hidden"
          style={{ background: bgColor }}
        >
          {isHolo && (
            <div
              className="absolute left-0 right-0 h-[1px] pointer-events-none z-10"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                animation: "scan-line 2.5s ease-in-out infinite",
              }}
            />
          )}
          <div ref={ref} />
          {isHolo && ["top-2 left-2 border-t border-l","top-2 right-2 border-t border-r","bottom-2 left-2 border-b border-l","bottom-2 right-2 border-b border-r"].map((pos, i) => (
            <div key={i} className={`absolute w-3 h-3 ${pos} opacity-50 rounded-[2px]`} style={{ borderColor: color }} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <span className="text-[10px] text-[#94A3B8]">EC: <span className="text-[#0891B2] font-semibold">{ecLevel}</span></span>
        <span className="text-[10px] text-[#94A3B8]">Style: <span className="text-[#0891B2] font-semibold capitalize">{dotStyle}</span></span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <button onClick={() => download("png")}
          className="flex items-center justify-center gap-1 py-2 text-[11px] font-semibold bg-[#F8FAFC] border border-[rgba(226,232,240,1)] rounded-xl text-[#475569] hover:border-[rgba(0,212,255,0.25)] hover:text-[#0891B2] transition-all">
          <Download size={11} /> PNG
        </button>
        <button onClick={() => download("svg")}
          className="flex items-center justify-center gap-1 py-2 text-[11px] font-semibold bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.15)] rounded-xl text-[#0891B2] hover:bg-[#00FF88] hover:text-[#F8FAFC] transition-all">
          <Download size={11} /> SVG
        </button>
        <button onClick={() => download("jpeg")}
          className="flex items-center justify-center gap-1 py-2 text-[11px] font-semibold bg-[#F8FAFC] border border-[rgba(226,232,240,1)] rounded-xl text-[#475569] hover:border-[rgba(0,212,255,0.25)] hover:text-[#0891B2] transition-all">
          <Download size={11} /> JPG
        </button>
      </div>

      <p className="text-center text-[9px] text-[#94A3B8] mt-2">
        SVG is print-ready &amp; EU DPP compliant
      </p>
    </div>
  );
}


/* Main Create Page */
function CreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = getSession();
  const plan = session?.plan || "free";
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isDynamic, setIsDynamic] = useState(false);
  const [dynamicUsed, setDynamicUsed] = useState(0);
  const [qrColor, setQrColor] = useState("#00D4FF");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dotStyle, setDotStyle] = useState("rounded");
  const [ecLevel, setEcLevel] = useState("H");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPlacement, setLogoPlacement] = useState<"center" | "behind" | "background">("center");
  const [isHolo, setIsHolo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFrameDesigner, setShowFrameDesigner] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"dynamic_limit" | "static_limit" | null>(null);
  const [qrSvgContent, setQrSvgContent] = useState("");

  const qrPreviewRef = useRef<HTMLDivElement>(null);

  function openFrameDesigner() {
    const svgEl = qrPreviewRef.current?.querySelector("svg");
    if (svgEl) {
      setQrSvgContent(svgEl.innerHTML);
      setShowFrameDesigner(true);
    }
  }

  const qrValue = selectedType ? buildQRValue(selectedType, formData) : "https://qrmagic.io";

  useEffect(() => {
    if (!session) return;
    // Check dynamic usage
    supabase.from("qr_codes").select("*", { count: "exact", head: true })
      .eq("user_id", session.id).eq("status", "dynamic")
      .then(({ count }) => setDynamicUsed(count || 0));
    // Pre-select type from URL
    const t = searchParams.get("type");
    if (t) { setSelectedType(t); setStep(2); }
  }, [searchParams]);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    try {
      // For dynamic codes, generate a short_id and encode redirect URL
      let shortId: string | null = null;
      let savedValue = qrValue;

      if (isDynamic && selectedType === "url") {
        // Generate unique short_id (retry if collision)
        let attempts = 0;
        while (attempts < 5) {
          shortId = generateShortId();
          const { data: existing } = await supabase
            .from("qr_codes").select("id").eq("short_id", shortId).maybeSingle();
          if (!existing) break;
          attempts++;
        }
        // The QR code encodes the redirect URL, not the real URL
        savedValue = `${BASE_URL}/r/${shortId}`;
      }

      const { data } = await supabase.from("qr_codes").insert({
        user_id: session.id,
        name: formData.name || `${selectedType?.toUpperCase()} Code`,
        type: selectedType,
        status: isDynamic ? "dynamic" : "static",
        value: savedValue,          // redirect URL for dynamic, real value for static
        redirect_url: isDynamic ? qrValue : null,  // real destination for dynamic
        short_id: shortId,
        color: qrColor,
        bg_color: bgColor,
        utm_source: formData.utmSource || null,
        utm_medium: formData.utmMedium || null,
        utm_campaign: formData.utmCampaign || null,
        utm_term: formData.utmTerm || null,
        utm_content: formData.utmContent || null,
        scans: 0, clicks: 0,
      }).select().single();

      // Check if first QR ever
      const { count } = await supabase.from("qr_codes")
        .select("*", { count: "exact", head: true }).eq("user_id", session.id);
      if (count === 1) sessionStorage.setItem("qrmagic_first_qr", "1");

      setSaved(true);
      setTimeout(() => router.push("/dashboard/codes"), 1500);
    } catch {
      setSaving(false);
    }
  }

  const steps = ["Choose Type", "Enter Details", "Customize"];

  return (
    <>
      <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#475569] transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 className="text-lg font-black text-[#0F172A] tracking-tight">Create QR Code</h1>
          <p className="text-xs text-[#94A3B8]">
            {selectedType ? `Type: ${QR_TYPES.find(t => t.id === selectedType)?.label}` : "Choose a type to get started"}
          </p>
        </div>
      </div>

      {/* Wizard steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "active" : "idle";
          return (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
                  state === "done" ? "bg-[#00FF88] border-[#00D4FF] text-[#F8FAFC]" :
                  state === "active" ? "border-[#00D4FF] text-[#0891B2] shadow-[0_0_8px_rgba(6,182,212,0.4)]" :
                  "border-[rgba(255,255,255,0.1)] text-[#94A3B8]"
                }`}>
                  {state === "done" ? <Check size={11} /> : n}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  state === "active" ? "text-[#0891B2]" : "text-[#94A3B8]"
                }`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${step > n ? "bg-[#00FF88]" : "bg-[rgba(226,232,240,1)]"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Type Selection */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-sm font-semibold text-[#0F172A] mb-5">What type of QR code?</h2>
          <div className="space-y-5 mb-6">
            {QR_CATEGORIES_LIST.map(cat => (
              <div key={cat.label}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ color: cat.color, background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                    {cat.label}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {QR_TYPES.filter(t => cat.types.includes(t.id)).map(({ id, icon: Icon, label, desc }) => (
                    <button key={id} onClick={() => { setSelectedType(id); setStep(2); }}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all group ${
                        selectedType === id
                          ? "bg-[#00D4FF]/08 border-[#00D4FF]/25"
                          : "bg-white border-slate-200 hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/04"
                      }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        selectedType === id ? "bg-[#00D4FF]/10" : "bg-slate-50 group-hover:bg-[#00D4FF]/06"
                      }`}>
                        <Icon size={18} className={selectedType === id ? "text-[#0891B2]" : "text-[#94A3B8] group-hover:text-[#0891B2]"} strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <div className={`text-[10px] font-semibold leading-tight ${selectedType === id ? "text-[#0891B2]" : "text-[#475569]"}`}>{label}</div>
                        <div className="text-[9px] text-[#94A3B8] mt-0.5 leading-tight">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2 & 3: Split panel */}
      {step >= 2 && selectedType && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            {/* Left panel */}
            <div className="space-y-5">
              {/* Step 2: Data */}
              <div className="bg-[#FFFFFF] border border-[rgba(226,232,240,1)] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Enter Details</h3>

                {/* Dynamic / Static toggle (URL only) */}
                {selectedType === "url" && (
                  <div className="mb-4">
                    <div className="flex bg-[#F8FAFC] border border-[rgba(226,232,240,1)] rounded-full p-1 gap-1 w-fit mb-2">
                      <button onClick={() => dynamicUsed < 1 ? setIsDynamic(true) : null}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isDynamic ? "bg-[#00FF88] text-[#F8FAFC]" : "text-[#94A3B8] hover:text-[#475569]"
                        }`}>
                        <Zap size={10} className="inline mr-1" />Dynamic
                      </button>
                      <button onClick={() => setIsDynamic(false)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          !isDynamic ? "bg-[#00FF88] text-[#F8FAFC]" : "text-[#94A3B8] hover:text-[#475569]"
                        }`}>
                        <Lock size={10} className="inline mr-1" />Static
                      </button>
                    </div>
                    {dynamicUsed >= 1 && (
                      <div className="flex items-center gap-2 text-xs text-[#FCD34D] bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-lg px-3 py-2">
                        <Info size={12} /> Free plan: 1 dynamic used. <button onClick={() => setUpgradeReason("dynamic_limit")} className="underline font-bold">Upgrade for more.</button>
                      </div>
                    )}
                  </div>
                )}

                {selectedType && TYPE_HINTS[selectedType] && (
                  <div className="bg-[#00D4FF]/06 border border-[#00D4FF]/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
                    <span className="text-sm flex-shrink-0 mt-0.5">💡</span>
                    <p className="text-xs text-[#0891B2] leading-relaxed">{TYPE_HINTS[selectedType]}</p>
                  </div>
                )}
                <QRForm
                  type={selectedType}
                  data={formData}
                  onChange={(k, v) => setFormData(prev => ({ ...prev, [k]: v }))}
                />
              </div>

              {/* Step 3: Customize */}
              <div className="bg-[#FFFFFF] border border-[rgba(226,232,240,1)] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Customize</h3>
                <div className="space-y-5">
                  {/* Holographic toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#475569]">Holographic Effect</div>
                      <div className="text-[10px] text-[#94A3B8]">Animated gradient border + scan line</div>
                    </div>
                    <button onClick={() => setIsHolo(!isHolo)}
                      className={`w-10 h-5 rounded-full transition-all relative ${isHolo ? "bg-[#00FF88]" : "bg-[#F1F5F9]"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${isHolo ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>

                  {/* Colors */}
                  <FormField label="QR Color">
                    <div className="flex gap-2 flex-wrap">
                      {QR_COLORS.map(c => (
                        <button key={c} onClick={() => setQrColor(c)}
                          className="w-7 h-7 rounded-full transition-all hover:scale-110 flex-shrink-0"
                          style={{
                            background: c,
                            border: qrColor === c ? "2px solid white" : "2px solid transparent",
                            transform: qrColor === c ? "scale(1.2)" : "scale(1)",
                            boxShadow: qrColor === c ? `0 0 8px ${c}80` : "none",
                          }} />
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Background Color">
                    <div className="flex gap-2 flex-wrap">
                      {BG_COLORS.map(c => (
                        <button key={c} onClick={() => setBgColor(c)}
                          className="w-7 h-7 rounded-full transition-all hover:scale-110 flex-shrink-0"
                          style={{
                            background: c,
                            border: bgColor === c ? `2px solid #00D4FF` : "2px solid rgba(255,255,255,0.15)",
                            transform: bgColor === c ? "scale(1.2)" : "scale(1)",
                          }} />
                      ))}
                    </div>
                  </FormField>

                  {/* Dot style */}
                  <FormField label="Dot Style">
                    <div className="grid grid-cols-3 gap-2">
                      {DOT_STYLES.map(d => (
                        <button key={d.v} onClick={() => setDotStyle(d.v)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                            dotStyle === d.v
                              ? "bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.25)] text-[#0891B2]"
                              : "bg-[#F8FAFC] border-[rgba(226,232,240,1)] text-[#94A3B8] hover:border-[rgba(0,212,255,0.15)] hover:text-[#475569]"
                          }`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  {/* Error correction */}
                  <FormField label="Error Correction" hint="Higher = more resistant to damage. Use H when adding a logo.">
                    <div className="grid grid-cols-4 gap-1.5">
                      {EC_LEVELS.map(l => (
                        <button key={l.v} onClick={() => setEcLevel(l.v)}
                          title={l.desc}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            ecLevel === l.v
                              ? "bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.25)] text-[#0891B2]"
                              : "bg-[#F8FAFC] border-[rgba(226,232,240,1)] text-[#94A3B8] hover:border-[rgba(0,212,255,0.15)]"
                          }`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  {/* Logo upload */}
                  <FormField label="Logo Overlay" hint="Recommended: use EC Level H with logos">
                    <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      logo
                        ? "border-[rgba(6,182,212,0.4)] bg-[rgba(6,182,212,0.05)]"
                        : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(0,212,255,0.25)] hover:bg-[rgba(6,182,212,0.03)]"
                    }`}>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                      {logo ? (
                        <div className="flex items-center gap-3">
                          <img src={logo} alt="logo" className="w-10 h-10 object-contain rounded-lg border border-[rgba(255,255,255,0.1)]" />
                          <div className="text-left">
                            <div className="text-xs font-semibold text-[#0891B2]">Logo uploaded</div>
                            <div className="text-[10px] text-[#94A3B8]">Click to change</div>
                          </div>
                          <button onClick={(e) => { e.preventDefault(); setLogo(null); }} className="ml-auto text-[#94A3B8] hover:text-[#F87171] transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload size={18} className="text-[#94A3B8]" />
                          <div className="text-center">
                            <div className="text-xs font-medium text-[#94A3B8]">Click to upload logo</div>
                            <div className="text-[9px] text-[#94A3B8] mt-0.5">PNG, JPG, SVG</div>
                          </div>
                        </>
                      )}
                    </label>
                  </FormField>

                  {/* Logo Placement */}
                  {logo && (
                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 block">
                        Logo Placement
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { id: "center" as const, label: "Center", desc: "In the middle", emoji: "⬛" },
                          { id: "behind" as const, label: "Behind Dots", desc: "Logo behind dots", emoji: "🔳" },
                          { id: "background" as const, label: "Background", desc: "Full background", emoji: "🖼" },
                        ]).map(p => (
                          <button key={p.id} onClick={() => setLogoPlacement(p.id)}
                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                              logoPlacement === p.id
                                ? "bg-[#00D4FF]/08 border-[#00D4FF]/30"
                                : "bg-slate-50 border-slate-200 hover:border-[#00D4FF]/20"
                            }`}>
                            <span className="text-lg">{p.emoji}</span>
                            <span className={`text-[9px] font-bold ${logoPlacement === p.id ? "text-[#0891B2]" : "text-[#475569]"}`}>{p.label}</span>
                            <span className="text-[8px] text-[#94A3B8] leading-tight text-center">{p.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm transition-all ${
                  saved
                    ? "bg-green-500/20 border border-green-500/30 text-green-400"
                    : "bg-[#00FF88] text-[#F8FAFC] hover:bg-[#00CC6E] hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,212,255,0.25)]"
                } disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-[#F8FAFC]/30 border-t-[#F8FAFC] rounded-full animate-spin" />
                ) : saved ? (
                  <><Check size={15} /> Saved! Redirecting...</>
                ) : (
                  <><Zap size={15} /> Save QR Code</>
                )}
              </button>
            </div>

            {/* Right panel — sticky preview */}
            <div>
              <div ref={qrPreviewRef}>
                <QRPreview
                  value={qrValue}
                  color={qrColor}
                  bgColor={bgColor}
                  dotStyle={dotStyle}
                  ecLevel={ecLevel}
                  logo={logo}
                  isHolo={isHolo}
                  onOpenFrame={openFrameDesigner}
                  logoPlacement={logoPlacement}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>

      {showFrameDesigner && qrSvgContent && (
        <QRFrameDesigner
          qrSvgContent={qrSvgContent}
          onClose={() => setShowFrameDesigner(false)}
        />
      )}
      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          currentPlan={plan}
          onClose={() => setUpgradeReason(null)}
        />
      )}
    </>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[rgba(0,212,255,0.15)] border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    }>
      <CreatePageInner />
    </Suspense>
  );
}