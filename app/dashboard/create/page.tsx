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
const INLINE_FRAMES: Record<string, {id: string; name: string; emoji: string; path: string; viewBox: string; qrPos: {x:number;y:number;size:number}; textPos: {x:number;y:number}}> = {
  none: { id:"none", name:"None", emoji:"✕", path:"", viewBox:"0 0 200 200", qrPos:{x:0,y:0,size:200}, textPos:{x:0,y:0} },
  rect_clean: { id:"rect_clean", name:"Classic", emoji:"⬜", path:"M4 4 H196 V220 H4 Z", viewBox:"0 0 200 224", qrPos:{x:12,y:12,size:176}, textPos:{x:100,y:218} },
  rect_rounded: { id:"rect_rounded", name:"Rounded", emoji:"▢", path:"M16 4 H184 A12 12 0 0 1 196 16 V208 A12 12 0 0 1 184 220 H16 A12 12 0 0 1 4 208 V16 A12 12 0 0 1 16 4 Z", viewBox:"0 0 200 224", qrPos:{x:14,y:14,size:172}, textPos:{x:100,y:218} },
  double_border: { id:"double_border", name:"Double", emoji:"🔲", path:"M4 4 H196 V220 H4 Z M10 10 H190 V214 H10 Z", viewBox:"0 0 200 224", qrPos:{x:16,y:16,size:168}, textPos:{x:100,y:218} },
  speech: { id:"speech", name:"Speech", emoji:"💬", path:"M16 4 H184 A12 12 0 0 1 196 16 V196 A12 12 0 0 1 184 208 H116 L100 228 L84 208 H16 A12 12 0 0 1 4 196 V16 A12 12 0 0 1 16 4 Z", viewBox:"0 0 200 232", qrPos:{x:14,y:12,size:172}, textPos:{x:100,y:222} },
  banner: { id:"banner", name:"Banner", emoji:"🏷", path:"M4 30 H80 L100 4 L120 30 H196 V220 H4 Z", viewBox:"0 0 200 224", qrPos:{x:12,y:34,size:172}, textPos:{x:100,y:218} },
  phone: { id:"phone", name:"Phone", emoji:"📱", path:"M44 2 H156 A18 18 0 0 1 174 20 V240 A18 18 0 0 1 156 258 H44 A18 18 0 0 1 26 240 V20 A18 18 0 0 1 44 2 Z", viewBox:"0 0 200 262", qrPos:{x:34,y:28,size:132}, textPos:{x:100,y:252} },
  circle: { id:"circle", name:"Circle", emoji:"⭕", path:"M100 4 A96 96 0 1 1 99.9 4 Z", viewBox:"0 0 200 200", qrPos:{x:30,y:30,size:140}, textPos:{x:100,y:192} },
  hexagon: { id:"hexagon", name:"Hexagon", emoji:"⬡", path:"M100 4 L190 54 L190 154 L100 204 L10 154 L10 54 Z", viewBox:"0 0 200 208", qrPos:{x:30,y:30,size:140}, textPos:{x:100,y:202} },
  octagon: { id:"octagon", name:"Octagon", emoji:"⬠", path:"M60 4 H140 L196 60 V148 L140 204 H60 L4 148 V60 Z", viewBox:"0 0 200 208", qrPos:{x:28,y:28,size:144}, textPos:{x:100,y:202} },
  sign: { id:"sign", name:"Sign", emoji:"🪧", path:"M4 4 H196 V190 H116 L100 218 L84 190 H4 Z", viewBox:"0 0 200 222", qrPos:{x:14,y:14,size:172}, textPos:{x:100,y:186} },
  corner_cut: { id:"corner_cut", name:"Corner Cut", emoji:"✂️", path:"M24 4 H176 L196 24 V196 L176 216 H24 L4 196 V24 Z", viewBox:"0 0 200 220", qrPos:{x:16,y:16,size:168}, textPos:{x:100,y:214} },
  diamond: { id:"diamond", name:"Diamond", emoji:"◇", path:"M100 4 L196 104 L100 204 L4 104 Z", viewBox:"0 0 200 208", qrPos:{x:40,y:40,size:120}, textPos:{x:100,y:202} },
};

const BASE_URL = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "https://sqrly.net");

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
      let base = v("url") || "https://sqrly.net";
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
    case "social":  return v("url") || "https://sqrly.net";
    case "youtube": return v("url") || "https://youtube.com";
    case "appstore": {
      const p = v("platform");
      if (p === "ios") return v("iosUrl") || "https://apps.apple.com";
      if (p === "android") return v("androidUrl") || "https://play.google.com";
      return v("iosUrl") || v("androidUrl") || "https://sqrly.net";
    }
    case "bitcoin": return `${v("currency")||"bitcoin"}:${v("address")}${v("amount") ? `?amount=${v("amount")}` : ""}`;
    case "zoom":    return v("url") || "https://zoom.us";
    case "pdf":     return v("url") || "https://sqrly.net";
    case "paypal":  return v("url") || "https://paypal.me";
    case "image":   return v("url") || "https://sqrly.net";
    case "multilink": return v("name") ? `${BASE_URL}/l/${Date.now()}` : "https://sqrly.net";
    case "spotify":   return v("url") || "https://open.spotify.com";
    case "menu":      return v("url") || "https://sqrly.net";
    case "feedback":  return v("url") || "https://sqrly.net";
    case "coupon":    return v("url") || "https://sqrly.net";
    case "package":   return v("url") || "https://sqrly.net";
    default:        return "https://sqrly.net";
  }
}

/* Holographic QR Preview */
/* Holographic QR Preview */
function QRPreview({
  value, color, bgColor, dotStyle, ecLevel, logo, isHolo,
  logoPlacement = "center", cornerSquareStyle = "extra-rounded",
  cornerDotStyle = "dot", cornerColor = "#0F172A", logoScale = 0.3,
  logoMargin = 4, useDotGradient = false, dotGradientColor2 = "#8B5CF6",
  dotGradientType = "linear", dotGradientRotation = 0,
}: {
  value: string; color: string; bgColor: string;
  dotStyle: string; ecLevel: string; logo: string | null; isHolo: boolean;
  logoPlacement?: "center" | "behind" | "background";
  cornerSquareStyle?: string; cornerDotStyle?: string; cornerColor?: string;
  logoScale?: number; logoMargin?: number;
  useDotGradient?: boolean; dotGradientColor2?: string;
  dotGradientType?: "linear" | "radial"; dotGradientRotation?: number;
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
        data: value || "https://sqrly.net",
        image: logo || undefined,
        dotsOptions: useDotGradient ? {
          type: dotStyle as "rounded",
          gradient: {
            type: dotGradientType,
            rotation: dotGradientRotation * Math.PI / 180,
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: dotGradientColor2 },
            ],
          },
        } : { color, type: dotStyle as "rounded" },
        cornersSquareOptions: { color: cornerColor, type: cornerSquareStyle as any },
        cornersDotOptions: { color: cornerColor, type: cornerDotStyle as any },
        backgroundOptions: { color: bgColor },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: logoMargin,
          imageSize: logoPlacement === "behind" ? 0.6 : logoScale,
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
        data: value || "https://sqrly.net",
        image: logo || undefined,
        dotsOptions: useDotGradient ? {
          type: dotStyle as "rounded",
          gradient: {
            type: dotGradientType,
            rotation: dotGradientRotation * Math.PI / 180,
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: dotGradientColor2 },
            ],
          },
        } : { color, type: dotStyle as "rounded" },
        cornersSquareOptions: { color: cornerColor, type: cornerSquareStyle as any },
        cornersDotOptions: { color: cornerColor, type: cornerDotStyle as any },
        backgroundOptions: { color: bgColor },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: logoMargin,
          imageSize: logoPlacement === "behind" ? 0.6 : logoScale,
          hideBackgroundDots: logoPlacement !== "behind",
        },
        qrOptions: { errorCorrectionLevel: ecLevel as "H" },
      });
    }, 300);
    return () => clearTimeout(t);
  }, [value, color, bgColor, dotStyle, ecLevel, logo, cornerColor, cornerSquareStyle, cornerDotStyle, logoScale, logoMargin, useDotGradient, dotGradientColor2, dotGradientType, dotGradientRotation]);

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
      <button onClick={downloadPDF}
        className="w-full mt-1.5 flex items-center justify-center gap-1 py-2 text-[11px] font-semibold bg-[#F8FAFC] border border-[rgba(226,232,240,1)] rounded-xl text-[#475569] hover:border-[rgba(0,212,255,0.25)] hover:text-[#0891B2] transition-all">
        <Download size={11} /> PDF (Print)
      </button>

    </div>
  );
}


/* ── All Frame Presets ───────────────────────────────── */
const ALL_FRAMES = [
  { id:"frame_coffee", name:"Coffee Cup", emoji:"☕", path:"M40,40 h120 v80 c0,40 -20,60 -60,60 s-60,-20 -60,-60 z M160,60 c15,0 25,10 25,25 s-10,25 -25,25 v-10 c10,0 15,-5 15,-15 s-5,-15 -15,-15 z", viewBox:"0 0 200 240", qrPos:{x:45,y:45,size:110}, textPos:{x:100,y:220} },
  { id:"frame_bag", name:"Shopping Bag", emoji:"🛍", path:"M40,60 L30,190 H170 L160,60 Z M70,60 a30,30 0 0 1 60,0", viewBox:"0 0 200 240", qrPos:{x:50,y:80,size:100}, textPos:{x:100,y:225} },
  { id:"frame_tag", name:"Price Tag", emoji:"🏷", path:"M30,40 L130,40 L180,100 L130,160 L30,160 Z M50,100 a10,10 0 1 0 20,0 a10,10 0 1 0 -20,0", viewBox:"0 0 200 240", qrPos:{x:50,y:55,size:90}, textPos:{x:100,y:210} },
  { id:"frame_phone", name:"Smartphone", emoji:"📱", path:"M50,20 a20,20 0 0 0 -20,20 v140 a20,20 0 0 0 20,20 h100 a20,20 0 0 0 20,-20 v-140 a20,20 0 0 0 -20,-20 z M100,190 a5,5 0 1 1 0,-10 a5,5 0 0 1 0,10", viewBox:"0 0 200 240", qrPos:{x:45,y:40,size:110}, textPos:{x:100,y:235} },
  { id:"frame_laptop", name:"Laptop", emoji:"💻", path:"M20,40 h160 v100 h-160 z M10,145 h180 l5,15 h-190 z", viewBox:"0 0 200 240", qrPos:{x:40,y:50,size:80}, textPos:{x:100,y:200} },
  { id:"frame_bubble_round", name:"Speech Bubble", emoji:"💬", path:"M100,20 a80,80 0 1 0 50,140 l30,20 v-40 a80,80 0 0 0 -80,-120", viewBox:"0 0 200 240", qrPos:{x:45,y:45,size:110}, textPos:{x:100,y:220} },
  { id:"frame_bubble_square", name:"Chat Box", emoji:"🗨", path:"M20,30 h160 v120 h-100 l-40,30 v-30 h-20 z", viewBox:"0 0 200 240", qrPos:{x:40,y:45,size:120}, textPos:{x:100,y:220} },
  { id:"frame_heart", name:"Heart", emoji:"❤", path:"M100,180 L30,110 a40,40 0 1 1 70,-40 a40,40 0 1 1 70,40 z", viewBox:"0 0 200 240", qrPos:{x:55,y:65,size:90}, textPos:{x:100,y:220} },
  { id:"frame_ticket", name:"Ticket", emoji:"🎫", path:"M20,50 v30 a10,10 0 0 0 0,20 v30 h160 v-30 a10,10 0 0 0 0,-20 v-30 z", viewBox:"0 0 200 240", qrPos:{x:50,y:60,size:100}, textPos:{x:100,y:200} },
  { id:"frame_gift", name:"Gift Box", emoji:"🎁", path:"M30,70 h140 v100 h-140 z M25,50 h150 v20 h-150 z M100,50 v120 M70,50 c-10,-20 30,-20 30,0 c0,-20 40,-20 30,0", viewBox:"0 0 200 240", qrPos:{x:50,y:80,size:90}, textPos:{x:100,y:220} },
  { id:"frame_pin", name:"Map Pin", emoji:"📍", path:"M100,20 a70,70 0 0 0 -70,70 c0,50 70,110 70,110 s70,-60 70,-110 a70,70 0 0 0 -70,-70 z", viewBox:"0 0 200 240", qrPos:{x:55,y:45,size:90}, textPos:{x:100,y:230} },
  { id:"frame_house", name:"House", emoji:"🏠", path:"M100,20 L20,90 v90 h160 v-90 z M70,180 v-40 h60 v40", viewBox:"0 0 200 240", qrPos:{x:50,y:90,size:100}, textPos:{x:100,y:220} },
  { id:"frame_hexagon", name:"Hexagon", emoji:"⬡", path:"M100,10 L180,55 v90 L100,190 L20,145 v-90 Z", viewBox:"0 0 200 240", qrPos:{x:50,y:50,size:100}, textPos:{x:100,y:220} },
  { id:"frame_circle", name:"Circle", emoji:"⭕", path:"M100,100 m-90,0 a90,90 0 1 0 180,0 a90,90 0 1 0 -180,0", viewBox:"0 0 200 240", qrPos:{x:40,y:40,size:120}, textPos:{x:100,y:220} },
  { id:"frame_star", name:"Star Burst", emoji:"⭐", path:"M100,10 l25,50 l55,-15 l-30,50 l50,25 l-50,25 l30,50 l-55,-15 l-25,50 l-25,-50 l-55,15 l30,-50 l-50,-25 l50,-25 l-30,-50 l55,15 z", viewBox:"0 0 200 240", qrPos:{x:60,y:60,size:80}, textPos:{x:100,y:230} },
  { id:"frame_briefcase", name:"Briefcase", emoji:"💼", path:"M30,60 h140 v110 h-140 z M70,60 v-15 a10,10 0 0 1 10,-10 h40 a10,10 0 0 1 10,10 v15", viewBox:"0 0 200 240", qrPos:{x:50,y:75,size:100}, textPos:{x:100,y:220} },
  { id:"frame_store", name:"Storefront", emoji:"🏪", path:"M20,80 h160 v100 h-160 z M10,60 l10,20 h160 l10,-20 z", viewBox:"0 0 200 240", qrPos:{x:50,y:90,size:90}, textPos:{x:100,y:225} },
  { id:"frame_scanner", name:"Scanner", emoji:"🔍", path:"M30,30 h40 M130,30 h40 M30,170 h40 M130,170 h40 M30,30 v40 M170,30 v40 M30,170 v-40 M170,170 v-40", viewBox:"0 0 200 240", qrPos:{x:40,y:40,size:120}, textPos:{x:100,y:220} },
  { id:"frame_chip", name:"Circuit Chip", emoji:"🔲", path:"M40,40 h120 v120 h-120 z M40,60 h-20 M40,100 h-20 M40,140 h-20 M160,60 h20 M160,100 h20 M160,140 h20 M60,40 v-20 M100,40 v-20 M140,40 v-20", viewBox:"0 0 200 240", qrPos:{x:50,y:50,size:100}, textPos:{x:100,y:220} },
  { id:"frame_crown", name:"Crown", emoji:"👑", path:"M20,160 l20,-100 l40,40 l20,-60 l20,60 l40,-40 l20,100 z", viewBox:"0 0 200 240", qrPos:{x:55,y:80,size:90}, textPos:{x:100,y:220} },
  { id:"frame_calendar", name:"Calendar", emoji:"📅", path:"M30,40 h140 v140 h-140 z M30,70 h140 M60,30 v20 M140,30 v20", viewBox:"0 0 200 240", qrPos:{x:45,y:80,size:90}, textPos:{x:100,y:220} },
  { id:"frame_rounded", name:"Rounded Rect", emoji:"▢", path:"M40,20 h120 a20,20 0 0 1 20,20 v120 a20,20 0 0 1 -20,20 h-120 a20,20 0 0 1 -20,-20 v-120 a20,20 0 0 1 20,-20 z", viewBox:"0 0 200 240", qrPos:{x:40,y:40,size:120}, textPos:{x:100,y:220} },
  { id:"frame_diamond", name:"Diamond", emoji:"💠", path:"M100,10 L190,100 L100,190 L10,100 Z", viewBox:"0 0 200 240", qrPos:{x:65,y:65,size:70}, textPos:{x:100,y:220} },
  { id:"frame_octagon", name:"Octagon", emoji:"🛑", path:"M70,20 h60 l50,50 v60 l-50,50 h-60 l-50,-50 v-60 Z", viewBox:"0 0 200 240", qrPos:{x:50,y:50,size:100}, textPos:{x:100,y:220} },
  { id:"frame_browser", name:"Browser", emoji:"🌐", path:"M20,40 h160 v130 h-160 z M20,65 h160 M40,52 a3,3 0 1 0 6,0 a3,3 0 1 0 -6,0 M55,52 a3,3 0 1 0 6,0 a3,3 0 1 0 -6,0", viewBox:"0 0 200 240", qrPos:{x:40,y:75,size:85}, textPos:{x:100,y:220} },
  { id:"frame_burger", name:"Burger", emoji:"🍔", path:"M30,80 a70,70 0 0 1 140,0 v20 h-140 z M30,120 h140 v20 a70,70 0 0 1 -140,0 z M25,105 h150 v10 h-150 z", viewBox:"0 0 200 240", qrPos:{x:50,y:60,size:100}, textPos:{x:100,y:220} },
  { id:"frame_signpost", name:"Signpost", emoji:"🪧", path:"M30,40 h140 v80 h-140 z M95,120 v60 h10 v-60 z", viewBox:"0 0 200 240", qrPos:{x:45,y:50,size:100}, textPos:{x:100,y:230} },
  { id:"frame_cocktail", name:"Cocktail", emoji:"🍸", path:"M20,30 L100,110 L180,30 z M100,110 V180 M70,180 H130", viewBox:"0 0 200 240", qrPos:{x:60,y:35,size:80}, textPos:{x:100,y:220} },
  { id:"frame_pizza", name:"Pizza", emoji:"🍕", path:"M100,20 L180,180 A180,180 0 0 1 20,180 Z M100,35 L45,165 A140,140 0 0 0 155,165 Z", viewBox:"0 0 200 240", qrPos:{x:65,y:70,size:70}, textPos:{x:100,y:220} },
  { id:"frame_popper", name:"Party Popper", emoji:"🎉", path:"M40,180 l30,-30 l-30,-30 z M100,40 l10,10 M140,70 l10,-10 M160,110 l10,10", viewBox:"0 0 200 240", qrPos:{x:70,y:50,size:100}, textPos:{x:100,y:230} },
];

/* Main Create Page */
function CreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(getSession());
  const plan = session?.plan || "free";

  // Re-read session after layout potentially updates it
  useEffect(() => {
    const s = getSession();
    if (s) setSession(s);
    // Re-check after a short delay in case layout is still refreshing
    const t = setTimeout(() => {
      const s2 = getSession();
      if (s2) setSession(s2);
    }, 800);
    return () => clearTimeout(t);
  }, []);
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
  const [cornerSquareStyle, setCornerSquareStyle] = useState("extra-rounded");
  const [cornerDotStyle, setCornerDotStyle] = useState("dot");
  const [cornerColor, setCornerColor] = useState("#0F172A");
  const [logoScale, setLogoScale] = useState(0.3);
  const [showPhoneMockup, setShowPhoneMockup] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  // Dot gradient
  const [useDotGradient, setUseDotGradient] = useState(false);
  const [dotGradientColor2, setDotGradientColor2] = useState("#8B5CF6");
  const [dotGradientType, setDotGradientType] = useState<"linear"|"radial">("linear");
  const [dotGradientRotation, setDotGradientRotation] = useState(0);
  // Logo options
  const [logoBgShape, setLogoBgShape] = useState<"none"|"square"|"rounded"|"circle">("circle");
  const [logoBgColor, setLogoBgColor] = useState("#FFFFFF");
  const [logoMargin, setLogoMargin] = useState(4);
  // Export
  const [exportSize, setExportSize] = useState(1024);
  // Scannability
  const [scanWarning, setScanWarning] = useState<string|null>(null);
  // Active customize tab
  const [customizeTab, setCustomizeTab] = useState<"style"|"colors"|"logo"|"frame">("style");
  const [frameCtaText, setFrameCtaText] = useState("SCAN ME");
  const [frameColor, setFrameColor] = useState("#0F172A");
  const [frameTextColor, setFrameTextColor] = useState("#FFFFFF");
  const [frameGradient, setFrameGradient] = useState(false);
  const [frameGradientColor2, setFrameGradientColor2] = useState("#00D4FF");
  const [frameGradientType, setFrameGradientType] = useState<"linear"|"radial">("linear");
  const [isHolo, setIsHolo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"dynamic_limit" | "static_limit" | null>(null);

  const qrPreviewRef = useRef<HTMLDivElement>(null);

  function downloadFramed() {
    if (!selectedFrame || selectedFrame === "none") return;
    const frame = INLINE_FRAMES[selectedFrame];
    if (!frame || !qrPreviewRef.current) return;
    const qrSvg = qrPreviewRef.current.querySelector("svg");
    if (!qrSvg) return;
    const qrContent = new XMLSerializer().serializeToString(qrSvg);
    const { qrPos, textPos, viewBox, path } = frame;
    const svgOut = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path d="${path}" fill="white" stroke="${frameColor}" stroke-width="2.5" stroke-linejoin="round"/><g transform="translate(${qrPos.x},${qrPos.y}) scale(${qrPos.size/200})">${qrContent}</g><text x="${textPos.x}" y="${textPos.y}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="800" letter-spacing="2" fill="${frameTextColor}">${frameCtaText.toUpperCase()}</text></svg>`;
    const blob = new Blob([svgOut], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sqrly-framed.svg"; a.click();
    URL.revokeObjectURL(url);
  }



  const qrValue = selectedType ? buildQRValue(selectedType, formData) : "https://sqrly.net";

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

  // Scannability warning
  useEffect(() => {
    if (logo && logoScale > 0.35) {
      setScanWarning("Logo is large — may affect scannability. Try reducing logo size or use EC Level H.");
    } else if (useDotGradient && ecLevel === "L") {
      setScanWarning("Low error correction with gradient may reduce scannability. Consider EC Level M or H.");
    } else {
      setScanWarning(null);
    }
  }, [logo, logoScale, useDotGradient, ecLevel]);

  // Export at custom size
  async function downloadAtSize(ext: "png" | "svg" | "jpeg", size: number) {
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      const qr = new QRCodeStyling({
        width: size, height: size,
        type: ext === "svg" ? "svg" : "canvas",
        data: qrValue || "https://sqrly.net",
        image: logo || undefined,
        dotsOptions: useDotGradient ? {
          type: dotStyle as "rounded",
          gradient: { type: dotGradientType, rotation: dotGradientRotation * Math.PI / 180,
            colorStops: [{ offset: 0, color: qrColor }, { offset: 1, color: dotGradientColor2 }] },
        } : { color: qrColor, type: dotStyle as "rounded" },
        cornersSquareOptions: { color: cornerColor, type: cornerSquareStyle as any },
        cornersDotOptions: { color: cornerColor, type: cornerDotStyle as any },
        backgroundOptions: { color: bgColor },
        imageOptions: { crossOrigin: "anonymous", margin: logoMargin, imageSize: logoScale, hideBackgroundDots: true },
        qrOptions: { errorCorrectionLevel: ecLevel as "H" },
      });
      qr.download({ name: `sqrly-${size}px`, extension: ext });
    });
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function downloadFramedSVG() {
    const frame = ALL_FRAMES.find(f => f.id === selectedFrame);
    if (!frame) return;
    const qrEl = qrPreviewRef.current?.querySelector("svg");
    if (!qrEl) return;
    const qrSvg = new XMLSerializer().serializeToString(qrEl);
    const gradDefs = frameGradient ? `<defs><linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${frameColor}"/><stop offset="100%" stop-color="${frameGradientColor2}"/></linearGradient></defs>` : "";
    const strokeVal = frameGradient ? "url(#fg)" : frameColor;
    const [vw, vh] = frame.viewBox.split(" ").slice(2).map(Number);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${frame.viewBox}" width="${vw}" height="${vh}">${gradDefs}<path d="${frame.path}" fill="white" stroke="${strokeVal}" stroke-width="3" stroke-linejoin="round"/><g transform="translate(${frame.qrPos.x},${frame.qrPos.y}) scale(${frame.qrPos.size/200})">${qrSvg}</g><text x="${frame.textPos.x}" y="${frame.textPos.y}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="800" letter-spacing="3" fill="${frameTextColor}">${frameCtaText}</text></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sqrly-framed-${frame.id}.svg`; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    try {
      // For dynamic codes, generate a short_id and encode redirect URL
      let shortId: string | null = null;
      let savedValue = qrValue;

      // Check plan limits before saving
      const dynLimit = plan === "plus" ? 100 : plan === "basic" ? 10 : 1;
      if (isDynamic && dynamicUsed >= dynLimit) {
        setUpgradeReason("dynamic_limit");
        setSaving(false);
        return;
      }

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

      // Multilink — save to multilink_pages and encode /l/[id] URL
      if (selectedType === "multilink") {
        const mlId = generateShortId();
        const rawLinks = (formData.links || "").split("\n").filter(Boolean);
        const links = rawLinks.map((line: string) => {
          const [label, ...rest] = line.split("|");
          return { label: label.trim(), url: rest.join("|").trim() };
        }).filter((l: {label: string; url: string}) => l.label && l.url);

        await supabase.from("multilink_pages").insert({
          user_id: session.id,
          short_id: mlId,
          title: formData.name || "My Links",
          bio: formData.bio || "",
          avatar: formData.avatar || "",
          links,
          color: qrColor,
          scans: 0,
        });
        savedValue = `${BASE_URL}/l/${mlId}`;
        shortId = mlId;
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
                  state === "done" ? "bg-[#00FF88] border-[#00D4FF] text-[#0F172A]" :
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
                      <button onClick={() => {
                          const dynLimit = plan === "plus" ? 100 : plan === "basic" ? 10 : 1;
                          if (dynamicUsed < dynLimit) { setIsDynamic(true); }
                          else { setUpgradeReason("dynamic_limit"); }
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isDynamic ? "bg-[#00FF88] text-[#0F172A]" : "text-[#94A3B8] hover:text-[#475569]"
                        }`}>
                        <Zap size={10} className="inline mr-1" />Dynamic
                      </button>
                      <button onClick={() => setIsDynamic(false)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          !isDynamic ? "bg-[#00FF88] text-[#0F172A]" : "text-[#94A3B8] hover:text-[#475569]"
                        }`}>
                        <Lock size={10} className="inline mr-1" />Static
                      </button>
                    </div>
                    {(() => {
                      const dynLimit = plan === "plus" ? 100 : plan === "basic" ? 10 : 1;
                      const nearLimit = dynamicUsed >= dynLimit;
                      const approachingLimit = plan !== "plus" && dynamicUsed >= dynLimit * 0.8 && !nearLimit;
                      if (nearLimit) return (
                        <div className="flex items-center gap-2 text-xs text-[#FCD34D] bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-lg px-3 py-2">
                          <Info size={12} /> {plan === "free" ? "Free" : plan === "basic" ? "Basic" : "Plus"} plan limit reached ({dynamicUsed}/{dynLimit} dynamic).{" "}
                          {plan !== "plus" && <button onClick={() => setUpgradeReason("dynamic_limit")} className="underline font-bold">Upgrade for more.</button>}
                        </div>
                      );
                      if (approachingLimit) return (
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                          <Info size={12} /> {dynamicUsed}/{dynLimit} dynamic codes used on {plan} plan.
                        </div>
                      );
                      return null;
                    })()}
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
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                {/* ── Tabs ─────────────────────────────────────── */}
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                  {(["style","colors","logo","frame"] as const).map(tab => (
                    <button key={tab} onClick={() => setCustomizeTab(tab)}
                      className={`flex-1 py-3 text-[11px] font-bold capitalize transition-all border-b-2 ${
                        customizeTab === tab
                          ? "border-[#00D4FF] text-[#0891B2] bg-white"
                          : "border-transparent text-[#94A3B8] hover:text-[#475569]"
                      }`}>
                      {tab === "style" ? "🎨 Style" : tab === "colors" ? "🖌 Colors" : tab === "logo" ? "🖼 Logo" : "🖼 Frame"}
                    </button>
                  ))}
                </div>

                <div className="p-4 space-y-4">

                  {/* Scannability warning */}
                  {scanWarning && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                      <Info size={13} className="flex-shrink-0 mt-0.5" />{scanWarning}
                    </div>
                  )}

                  {/* ════════════════════════════════════════════ */}
                  {/* STYLE TAB                                    */}
                  {/* ════════════════════════════════════════════ */}
                  {customizeTab === "style" && <div className="space-y-4">

                    {/* Presets */}
                    <div>
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Quick Presets</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name:"Classic",   color:"#0F172A", bg:"#FFFFFF", dot:"square",        corner:"#0F172A" },
                          { name:"Neon",      color:"#00D4FF", bg:"#0F172A", dot:"rounded",       corner:"#00FF88" },
                          { name:"Purple",    color:"#8B5CF6", bg:"#FFFFFF", dot:"extra-rounded", corner:"#8B5CF6" },
                          { name:"Rose",      color:"#F472B6", bg:"#FFF0F6", dot:"dots",          corner:"#F472B6" },
                          { name:"Forest",    color:"#00FF88", bg:"#0F172A", dot:"classy-rounded",corner:"#00D4FF" },
                          { name:"Gold",      color:"#FCD34D", bg:"#0F172A", dot:"classy",        corner:"#FB923C" },
                          { name:"Ocean",     color:"#1E40AF", bg:"#EFF6FF", dot:"extra-rounded", corner:"#0891B2" },
                          { name:"Fire",      color:"#EF4444", bg:"#FFF7ED", dot:"rounded",       corner:"#FB923C" },
                          { name:"Minimal",   color:"#475569", bg:"#F8FAFC", dot:"dots",          corner:"#94A3B8" },
                        ].map(p => (
                          <button key={p.name} onClick={() => { setQrColor(p.color); setBgColor(p.bg); setDotStyle(p.dot); setCornerColor(p.corner); setIsHolo(false); }}
                            className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-slate-200 hover:border-[#00D4FF]/40 transition-all group bg-slate-50">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center border-2"
                              style={{ background: p.bg, borderColor: p.color }}>
                              <div className="w-4 h-4 rounded-sm" style={{ background: p.color }} />
                            </div>
                            <span className="text-[9px] font-semibold text-[#475569] group-hover:text-[#0891B2]">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dot style */}
                    <FormField label="Dot Style">
                      <div className="grid grid-cols-3 gap-2">
                        {(["rounded","dots","classy","classy-rounded","square","extra-rounded"] as const).map(d => (
                          <button key={d} onClick={() => setDotStyle(d)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                              dotStyle === d ? "bg-[#00D4FF]/08 border-[#00D4FF]/25 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#94A3B8] hover:border-[#00D4FF]/20"
                            }`}>{d}</button>
                        ))}
                      </div>
                    </FormField>

                    {/* Corner square style */}
                    <FormField label="Corner Shape">
                      <div className="grid grid-cols-3 gap-2">
                        {(["square","extra-rounded","dot","classy","classy-rounded","rounded"] as const).map(d => (
                          <button key={d} onClick={() => setCornerSquareStyle(d)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                              cornerSquareStyle === d ? "bg-[#00D4FF]/08 border-[#00D4FF]/25 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#94A3B8] hover:border-[#00D4FF]/20"
                            }`}>{d}</button>
                        ))}
                      </div>
                    </FormField>

                    {/* Corner dot style */}
                    <FormField label="Corner Dot">
                      <div className="grid grid-cols-3 gap-2">
                        {(["dot","square","extra-rounded","classy","classy-rounded","rounded"] as const).map(d => (
                          <button key={d} onClick={() => setCornerDotStyle(d)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                              cornerDotStyle === d ? "bg-[#00D4FF]/08 border-[#00D4FF]/25 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#94A3B8] hover:border-[#00D4FF]/20"
                            }`}>{d}</button>
                        ))}
                      </div>
                    </FormField>

                    {/* Error correction */}
                    <FormField label="Error Correction" hint="Use H when adding a logo">
                      <div className="grid grid-cols-4 gap-1.5">
                        {EC_LEVELS.map(l => (
                          <button key={l.v} onClick={() => setEcLevel(l.v)} title={l.desc}
                            className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              ecLevel === l.v ? "bg-[#00D4FF]/08 border-[#00D4FF]/25 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#94A3B8] hover:border-[#00D4FF]/20"
                            }`}>{l.label}</button>
                        ))}
                      </div>
                    </FormField>

                    {/* Holographic */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <div className="text-xs font-semibold text-[#475569]">Holographic Effect</div>
                        <div className="text-[10px] text-[#94A3B8]">Animated gradient border</div>
                      </div>
                      <button onClick={() => setIsHolo(!isHolo)}
                        className={`w-10 h-5 rounded-full transition-all relative ${isHolo ? "bg-[#00FF88]" : "bg-slate-200"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isHolo ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>

                    {/* Export size */}
                    <FormField label="Export Size">
                      <div className="grid grid-cols-4 gap-1.5">
                        {[512,1024,2048,4096].map(s => (
                          <button key={s} onClick={() => setExportSize(s)}
                            className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              exportSize === s ? "bg-[#00D4FF]/08 border-[#00D4FF]/25 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#94A3B8] hover:border-[#00D4FF]/20"
                            }`}>{s >= 1000 ? `${s/1024 >= 1 ? s/1024+"K" : s}` : s}px</button>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {(["svg","png","jpeg"] as const).map(ext => (
                          <button key={ext} onClick={() => downloadAtSize(ext, exportSize)}
                            className="flex items-center justify-center gap-1 py-2 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-xl text-[#475569] hover:border-[#00D4FF] hover:text-[#0891B2] transition-all">
                            <Download size={11} /> {ext.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </FormField>

                  </div>}

                  {/* ════════════════════════════════════════════ */}
                  {/* COLORS TAB                                   */}
                  {/* ════════════════════════════════════════════ */}
                  {customizeTab === "colors" && <div className="space-y-4">

                    <FormField label="QR Dot Color">
                      <div className="flex gap-2 flex-wrap items-center">
                        <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
                        {["#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#EF4444","#1E40AF"].map(c => (
                          <button key={c} onClick={() => setQrColor(c)} style={{ background: c }}
                            className={`w-7 h-7 rounded-full border-2 transition-all flex-shrink-0 ${qrColor === c ? "border-[#00D4FF] scale-125" : "border-white shadow-sm"}`} />
                        ))}
                      </div>
                    </FormField>

                    {/* Dot Gradient */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#475569]">Dot Gradient</span>
                        <button onClick={() => setUseDotGradient(g => !g)}
                          className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${useDotGradient ? "bg-[#00D4FF]" : "bg-slate-300"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${useDotGradient ? "left-4" : "left-0.5"}`} />
                        </button>
                      </div>
                      {useDotGradient && <div className="space-y-2 mt-2">
                        <div className="flex gap-3 items-center">
                          <div>
                            <p className="text-[9px] text-[#94A3B8] mb-1">Color 2</p>
                            <input type="color" value={dotGradientColor2} onChange={e => setDotGradientColor2(e.target.value)}
                              className="w-10 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] text-[#94A3B8] mb-1">Type</p>
                            <div className="flex gap-1">
                              {(["linear","radial"] as const).map(t => (
                                <button key={t} onClick={() => setDotGradientType(t)}
                                  className={`flex-1 py-1 rounded-lg text-[9px] font-semibold border capitalize ${dotGradientType === t ? "bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#0891B2]" : "bg-white border-slate-200"}`}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        {dotGradientType === "linear" && (
                          <div>
                            <p className="text-[9px] text-[#94A3B8] mb-1">Rotation: {dotGradientRotation}°</p>
                            <input type="range" min="0" max="360" value={dotGradientRotation}
                              onChange={e => setDotGradientRotation(Number(e.target.value))}
                              className="w-full accent-[#00D4FF]" />
                          </div>
                        )}
                      </div>}
                    </div>

                    <FormField label="Corner Color">
                      <div className="flex gap-2 flex-wrap items-center">
                        <input type="color" value={cornerColor} onChange={e => setCornerColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
                        {["#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#EF4444","#FB923C","#1E40AF"].map(c => (
                          <button key={c} onClick={() => setCornerColor(c)} style={{ background: c }}
                            className={`w-7 h-7 rounded-full border-2 transition-all flex-shrink-0 ${cornerColor === c ? "border-[#00D4FF] scale-125" : "border-white shadow-sm"}`} />
                        ))}
                      </div>
                    </FormField>

                    <FormField label="Background">
                      <div className="flex gap-2 flex-wrap items-center">
                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
                        {["#FFFFFF","#F8FAFC","#0F172A","#FFF7ED","#F0FDF4","#EFF6FF","#FDF2F8","#FFFBEB"].map(c => (
                          <button key={c} onClick={() => setBgColor(c)}
                            style={{ background: c, borderColor: bgColor === c ? "#00D4FF" : "#E2E8F0" }}
                            className={`w-7 h-7 rounded-full border-2 transition-all flex-shrink-0 ${bgColor === c ? "scale-125" : ""}`} />
                        ))}
                      </div>
                    </FormField>

                  </div>}

                  {/* ════════════════════════════════════════════ */}
                  {/* LOGO TAB                                     */}
                  {/* ════════════════════════════════════════════ */}
                  {customizeTab === "logo" && <div className="space-y-4">

                    {/* Upload */}
                    <FormField label="Upload Logo">
                      <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        logo ? "border-[#00D4FF]/40 bg-[#00D4FF]/04" : "border-slate-200 hover:border-[#00D4FF]/30"
                      }`}>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                        {logo ? (
                          <div className="flex items-center gap-3 w-full">
                            <img src={logo} alt="logo" className="w-10 h-10 object-contain rounded-lg border border-slate-200" />
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-[#0891B2]">Logo uploaded</div>
                              <div className="text-[10px] text-[#94A3B8]">Click to change</div>
                            </div>
                            <button onClick={e => { e.preventDefault(); setLogo(null); }} className="text-[#94A3B8] hover:text-[#EF4444]">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <><Upload size={18} className="text-[#94A3B8]" />
                          <div className="text-xs text-[#94A3B8]">Click to upload logo</div></>
                        )}
                      </label>
                    </FormField>

                    {/* Logo controls */}
                    {logo && <>
                      <FormField label={`Size: ${Math.round(logoScale * 100)}%`}>
                        <input type="range" min="10" max="50" value={Math.round(logoScale * 100)}
                          onChange={e => setLogoScale(Number(e.target.value) / 100)}
                          className="w-full accent-[#00D4FF]" />
                      </FormField>
                      <FormField label={`Margin: ${logoMargin}px`}>
                        <input type="range" min="0" max="20" value={logoMargin}
                          onChange={e => setLogoMargin(Number(e.target.value))}
                          className="w-full accent-[#00D4FF]" />
                      </FormField>
                      <FormField label="Background Shape">
                        <div className="grid grid-cols-4 gap-2">
                          {([
                            {id:"none",label:"None",icon:"—"},
                            {id:"square",label:"Square",icon:"⬛"},
                            {id:"rounded",label:"Rounded",icon:"▢"},
                            {id:"circle",label:"Circle",icon:"⭕"},
                          ] as const).map(s => (
                            <button key={s.id} onClick={() => setLogoBgShape(s.id)}
                              className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[9px] font-medium transition-all ${
                                logoBgShape === s.id ? "bg-[#00D4FF]/08 border-[#00D4FF]/30 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569]"
                              }`}>
                              <span className="text-base">{s.icon}</span>{s.label}
                            </button>
                          ))}
                        </div>
                        {logoBgShape !== "none" && (
                          <div className="flex items-center gap-2 mt-2">
                            <input type="color" value={logoBgColor} onChange={e => setLogoBgColor(e.target.value)}
                              className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer" />
                            <span className="text-[10px] text-[#94A3B8]">Background color</span>
                          </div>
                        )}
                      </FormField>
                      <FormField label="Placement">
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            {id:"center",label:"Center",emoji:"⬛"},
                            {id:"behind",label:"Behind",emoji:"🔳"},
                            {id:"background",label:"Watermark",emoji:"🖼"},
                          ] as const).map(p => (
                            <button key={p.id} onClick={() => setLogoPlacement(p.id)}
                              className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[9px] font-medium transition-all ${
                                logoPlacement === p.id ? "bg-[#00D4FF]/08 border-[#00D4FF]/30 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569]"
                              }`}>
                              <span className="text-base">{p.emoji}</span>{p.label}
                            </button>
                          ))}
                        </div>
                      </FormField>
                    </>}

                    {/* Brand logos — FIRST, with actual colors */}
                    <div>
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Brand Logos</p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {[
                          {label:"None",   bg:"#F1F5F9", fg:"#64748B", path:null},
                          {label:"WA",     bg:"#25D366", fg:"#fff", path:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a6.3 6.3 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"},
                          {label:"IG",     bg:"#E1306C", fg:"#fff", path:"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838a6 6 0 100 12 6 6 0 000-12zm0 9.675a3.675 3.675 0 110-7.35 3.675 3.675 0 010 7.35zm6.406-10.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"},
                          {label:"FB",     bg:"#1877F2", fg:"#fff", path:"M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"},
                          {label:"YT",     bg:"#FF0000", fg:"#fff", path:"M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97C23 15.88 23 12 23 12s0-3.88-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"},
                          {label:"TT",     bg:"#010101", fg:"#fff", path:"M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9a8.18 8.18 0 004.78 1.52V7.09a4.85 4.85 0 01-1.01-.4z"},
                          {label:"LI",     bg:"#0077B5", fg:"#fff", path:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z"},
                          {label:"X",      bg:"#000000", fg:"#fff", path:"M4 4l11.733 16H20L8.267 4z M4 20l6.768-6.768 M13.232 10.768L20 4"},
                          {label:"TG",     bg:"#2CA5E0", fg:"#fff", path:"m22 2-21 8 8 3 10-10-7 9 1 5 3-4 5 3z"},
                          {label:"SP",     bg:"#1DB954", fg:"#fff", path:"M12 2a10 10 0 100 20A10 10 0 0012 2zm4.5 14.4c-.2.3-.6.4-.9.2-2.4-1.5-5.5-1.8-9.1-.9-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 3.9-1 7.4-.6 10.1 1.1.3.1.4.5.3.8zm1.2-2.7c-.2.3-.7.5-1 .2-2.8-1.7-7-2.2-10.2-1.2-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.7-1.1 8.3-.6 11.5 1.4.3.2.4.6.1 1zm.1-2.8c-3.3-2-8.8-2.1-12-1.2-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 3.6-1 9.7-.8 13.5 1.4.5.3.6.9.4 1.4-.3.4-.9.5-1.5.2z"},
                          {label:"PP",     bg:"#003087", fg:"#fff", path:"M7 2h7c4 0 6 2 6 5s-2 5-6 5H9l-1 10H4L7 2zm5 7c2 0 3-1 3-2.5S14 4 12 4h-2l-1 5h3z"},
                          {label:"SH",     bg:"#95BF47", fg:"#fff", path:"M15.337 5.54L14.5 2H9L7.5 5.5 4 21h16L15.337 5.54zM12 19a3 3 0 110-6 3 3 0 010 6z"},
                          {label:"Pi",     bg:"#E60023", fg:"#fff", path:"M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3c2 0 3.5 1 3.5 2.5 0 2-1.5 3.5-3.5 3.5-.5 0-1-.1-1.4-.3-.3 1.4-.9 2.7-1.8 3.3l-.3-1.2c.6-1 1-2 1-3.3-.5.2-1 .5-1.5.5C6.5 10 5.5 9 5.5 7.5S7 5 9 5z"},
                          {label:"WO",     bg:"#00AFF0", fg:"#fff", path:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"},
                          {label:"SC",     bg:"#FFFC00", fg:"#0F172A", path:"M12 2c2 0 4.5 1.5 4.5 4.5 0 1.5-.5 2.5-1.5 3.5 3 0 5 2 5 5 0 1-1 2-2 2-.5 0-1-.5-1.5-1 0 1-.5 2-1.5 2h-6c-1 0-1.5-1-1.5-2-.5.5-1 1-1.5 1-1 0-2-1-2-2 0-3 2-5 5-5-1-1-1.5-2-1.5-3.5C7.5 3.5 10 2 12 2z"},
                          {label:"DC",     bg:"#5865F2", fg:"#fff", path:"M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"},
                          {label:"RD",     bg:"#FF4500", fg:"#fff", path:"M12 2a10 10 0 100 20A10 10 0 0012 2zm5 11c0 1.1-.9 2-2 2h-.1c-.4 1.1-1.4 2-2.9 2s-2.5-.9-2.9-2H9c-1.1 0-2-.9-2-2 0-.6.3-1.1.7-1.4a3.4 3.4 0 01-.2-.9c0-1.9 2-3.5 4.5-3.5.3 0 .6 0 .9.1l.6-1.6a.5.5 0 01.9.3l-.7 1.9c1.2.4 2 1.2 2 2.1 0 .3-.1.6-.2.9.4.3.5.8.5 1.1z"},
                          {label:"TW",     bg:"#1DA1F2", fg:"#fff", path:"M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"},
                          {label:"GH",     bg:"#181717", fg:"#fff", path:"M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"},
                          {label:"ET",     bg:"#F56400", fg:"#fff", path:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 12h-4v2h4v2H9V5h8v2h-6v3h5v2h-5v3h4v2z"},
                          {label:"AZ",     bg:"#FF9900", fg:"#fff", path:"M12 18c-3 0-5.5-1-5.5-1s2 2 5.5 2 5.5-2 5.5-2-2.5 1-5.5 1zm8-5s-1.5 1-3 1a5 5 0 01-5-5V3L8 5.5V9a7 7 0 007 7c2 0 3.5-1 3.5-1L20 13z"},
                          {label:"AB",     bg:"#FF5A5F", fg:"#fff", path:"M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"},
                        ].map(b => {
                          const svgData = b.path
                            ? `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${encodeURIComponent(b.fg)}" stroke="${encodeURIComponent(b.fg)}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"><path d="${b.path}"/></svg>`
                            : null;
                          const isActive = svgData ? logo === svgData : !logo;
                          return (
                            <button key={b.label} onClick={() => setLogo(svgData)}
                              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-[7px] font-bold transition-all ${
                                isActive ? "border-[#00D4FF]/40 ring-1 ring-[#00D4FF]" : "border-slate-200 hover:border-[#00D4FF]/30"
                              }`}
                              style={{ background: b.bg }}>
                              {svgData
                                ? <img src={svgData} alt={b.label} className="w-4 h-4 object-contain" />
                                : <span className="w-4 h-4 flex items-center justify-center text-[#64748B] font-bold">✕</span>
                              }
                              <span style={{ color: b.fg === "#fff" ? "#fff" : "#0F172A" }}>{b.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Icon presets (monochrome SVG) */}
                    <div>
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Icon Presets</p>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Quick Logo Presets</p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {[
                        { label: "None", val: null, path: null },
                        { label: "WhatsApp", val: "whatsapp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" },
                        { label: "Instagram", val: "instagram", path: "M16 3c2.717 0 3.056.01 4.122.058 1.064.048 1.79.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.637.417 1.363.465 2.427C21.99 8.944 22 9.283 22 12s-.01 3.056-.058 4.122c-.048 1.064-.218 1.79-.465 2.427a4.88 4.88 0 01-1.153 1.772 4.88 4.88 0 01-1.772 1.153c-.637.247-1.363.417-2.427.465C15.056 21.99 14.717 22 12 22s-3.056-.01-4.122-.058c-1.064-.048-1.79-.218-2.427-.465a4.89 4.89 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.637-.417-1.363-.465-2.427C2.01 15.056 2 14.717 2 12s.01-3.056.058-4.122c.048-1.064.218-1.79.465-2.427a4.88 4.88 0 011.153-1.772A4.88 4.88 0 015.448 4.52c.637-.247 1.363-.417 2.427-.465C8.944 2.01 9.283 2 12 2m0 5a5 5 0 100 10A5 5 0 0012 7zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0z" },
                        { label: "Facebook", val: "facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                        { label: "TikTok", val: "tiktok", path: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" },
                        { label: "LinkedIn", val: "linkedin", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" },
                        { label: "YouTube", val: "youtube", path: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58zM9.75 15.02V8.98L15 12l-5.25 3.02z" },
                        { label: "X/Twitter", val: "twitter", path: "M4 4l11.733 16h4.267l-11.733-16z M4 20l6.768-6.768 M13.232 10.768l6.768-6.768" },
                        { label: "Pinterest", val: "pinterest", path: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3c2 0 3.5 1 3.5 2.5 0 1.5-1 3-2.5 3-.5 0-1-.2-1.3-.5-.3 1.2-.8 2.3-1.7 3l-.3-1.2c.5-.8 1-1.7 1.2-2.7-.5.2-1 .4-1.5.4-1.5 0-2.5-1-2.5-2.5S10 5 12 5z" },
                        { label: "Discord", val: "discord", path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.128 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.027c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" },
                        { label: "Telegram", val: "telegram", path: "m22 2-21 8 8 3 10-10-7 9 1 5 3-4 5 3z" },
                        { label: "Spotify", val: "spotify", path: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm4.5 14.4c-.2.3-.6.4-.9.2-2.4-1.5-5.5-1.8-9.1-.9-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 3.9-1 7.4-.6 10.1 1.1.3.1.4.5.3.8zm1.2-2.7c-.2.3-.7.5-1 .2-2.8-1.7-7-2.2-10.2-1.2-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.7-1.1 8.3-.6 11.5 1.4.3.2.4.6.1 1zm.1-2.8c-3.3-2-8.8-2.1-12-1.2-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 3.6-1 9.7-.8 13.5 1.4.5.3.6.9.4 1.4-.3.4-.9.5-1.5.2z" },
                        { label: "Shopify", val: "shopify", path: "M15.337 5.54L14.5 2H9L7.5 5.5 4 21h16L15.337 5.54zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" },
                        { label: "PayPal", val: "paypal", path: "M7 2h7c4 0 6 2 6 5s-2 5-6 5H9l-1 10H4L7 2zM12 9c2 0 3-1 3-2.5S14 4 12 4h-2l-1 5h3z" },
                        { label: "Google", val: "google", path: "M12 11h9v2c0 5-3.5 8-9 8a9 9 0 1 1 0-18c2.5 0 4.5 1 6 2.5l-2.5 2.5c-1-1-2.5-1.5-3.5-1.5-4 0-7 3-7 7s3 7 7 7c3 0 5-2 5.5-5H12v-3z" },
                        { label: "Stripe", val: "stripe", path: "M14 6c-2 0-3 1-3 2s1 2 3 2 3 1 3 2-1 2-3 2-3-1-3-2M9 4v16M15 4v16" },
                        { label: "Scan", val: "scan", path: "M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" },
                        { label: "Camera", val: "camera", path: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
                        { label: "Download", val: "download", path: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" },
                        { label: "Share", val: "share", path: "M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13" },
                        { label: "Bookmark", val: "bookmark", path: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" },
                        { label: "Wi-Fi", val: "wifi", path: "M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" },
                        { label: "Link", val: "link", path: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
                        { label: "Email", val: "mail", path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" },
                        { label: "Call", val: "phone", path: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" },
                        { label: "Location", val: "map", path: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
                        { label: "Store", val: "store", path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
                        { label: "Cart", val: "cart", path: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zM3 6h18M16 10a4 4 0 0 1-8 0" },
                        { label: "Music", val: "music", path: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
                        { label: "Coffee", val: "coffee", path: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" },
                        { label: "Play", val: "play", path: "M5 3l14 9-14 9V3z" },
                        { label: "Star", val: "star", path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
                        { label: "Heart", val: "heart", path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
                        { label: "Plane", val: "plane", path: "M17.8 19.2L16 11l3.5-3.5c.7-.7.7-1.8 0-2.5s-1.8-.7-2.5 0L13.5 8.5l-8.2-1.8c-.5-.1-1 .1-1.3.5l-.1.1 4.8 5.7-2.6 2.6-2.5-.6-.8.2 1.1 1.1.2.8 3.5 1.4 1.4 3.5.8.2 1.1-1.1.2-.8-.6-2.5 2.6-2.6 5.7 4.8.1-.1c.4-.3.6-.8.5-1.3z" },
                        { label: "Car", val: "car", path: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
                        { label: "Leaf", val: "leaf", path: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 2c-2 5-2.5 6.5-3.6 12.2A7 7 0 0 1 11 20zM11 20l2-2" },
                        { label: "Building", val: "building", path: "M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18" },
                                            ].map(p => {
                        const svgUrl = p.path
                          ? `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%230F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="11" fill="white" stroke="%23E2E8F0"/><path d="${p.path}"/></svg>`
                          : null;
                        const isActive = !p.val ? !logo : logo === svgUrl;
                        return (
                          <button key={p.val || "none"}
                            onClick={() => setLogo(svgUrl)}
                            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-[8px] font-medium transition-all ${isActive ? "bg-[#00D4FF]/08 border-[#00D4FF]/30 text-[#0891B2]" : "bg-slate-50 border-slate-200 text-[#475569] hover:border-[#00D4FF]/30"}`}>
                            {p.path ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke={isActive ? "#0891B2" : "#475569"}
                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d={p.path} />
                              </svg>
                            ) : <span className="w-[18px] h-[18px] flex items-center justify-center font-bold">✕</span>}
                            {p.label}
                          </button>
                        );
                      })}
                    </div>


                  </div>



                  </div>}

                  {customizeTab === "frame" && <div className="space-y-4">

                    {/* Frame picker — SVG previews */}
                    <div>
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Frame Style</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[{id:null,name:"None",emoji:"✕"}, ...ALL_FRAMES].map(f => (
                          <button key={f.id || "none"} onClick={() => setSelectedFrame(f.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[8px] font-medium transition-all ${
                              selectedFrame === f.id
                                ? "bg-[#00D4FF]/08 border-[#00D4FF]/30 text-[#0891B2]"
                                : "bg-slate-50 border-slate-200 text-[#475569] hover:border-[#00D4FF]/20"
                            }`}>
                            {f.id ? (
                              <svg viewBox={f.viewBox} width="36" height="36" className="overflow-visible">
                                <path d={f.path} fill="white" stroke={frameColor} strokeWidth="6" strokeLinejoin="round"/>
                                <text x={f.textPos.x} y={f.textPos.y} textAnchor="middle"
                                  fontFamily="system-ui" fontSize="18" fontWeight="800" fill={frameTextColor}>
                                  {frameCtaText.slice(0,8)}
                                </text>
                              </svg>
                            ) : <span className="text-xl">✕</span>}
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedFrame && selectedFrame !== "none" && (
                      <div className="space-y-3">
                        {/* CTA Text */}
                        <div>
                          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Frame Text</label>
                          <input value={frameCtaText} onChange={e => setFrameCtaText(e.target.value)}
                            placeholder="SCAN ME" maxLength={20}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] rounded-xl px-3 py-2 text-sm font-bold text-center text-[#0F172A] outline-none transition-all tracking-widest uppercase" />
                        </div>

                        {/* Frame color */}
                        <div>
                          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Frame Color</label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <input type="color" value={frameColor}
                              onChange={e => setFrameColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
                            {["#0F172A","#00D4FF","#00FF88","#8B5CF6","#F472B6","#FB923C","#EF4444","#FFFFFF"].map(c => (
                              <button key={c} onClick={() => setFrameColor(c)}
                                style={{ background: c }}
                                className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${frameColor === c ? "border-[#00D4FF] scale-125" : "border-slate-200"}`} />
                            ))}
                          </div>
                        </div>

                        {/* Frame background */}
                        <div>
                          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Frame Background</label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <input type="color" value={frameTextColor}
                              onChange={e => setFrameTextColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
                            {["#FFFFFF","#0F172A","#F8FAFC","#F0FFF4","#EFF6FF","#FFF0F6","#FFFBEB","#F5F0FF"].map(c => (
                              <button key={c} onClick={() => setFrameTextColor(c)}
                                style={{ background: c }}
                                className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${frameTextColor === c ? "border-[#00D4FF] scale-125" : "border-slate-200"}`} />
                            ))}
                          </div>
                        </div>

                        {/* Download framed */}
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={downloadFramed}
                            className="flex items-center justify-center gap-1.5 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-xl text-xs hover:bg-[#00CC6E] transition-all">
                            <Download size={13} strokeWidth={2} /> SVG
                          </button>
                          <button onClick={downloadFramedSVG}
                            className="flex items-center justify-center gap-1.5 py-2.5 bg-[#0F172A] text-white font-bold rounded-xl text-xs hover:bg-[#1E293B] transition-all">
                            <Download size={13} strokeWidth={2} /> High-Res
                          </button>
                        </div>
                      </div>
                    )}

                  </div>} {/* END FRAME TAB */}

                </div> {/* end tabs content */}
              </div> {/* end customize card */}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm transition-all ${
                  saved
                    ? "bg-green-500/20 border border-green-500/30 text-green-400"
                    : "bg-[#00FF88] text-[#0F172A] hover:bg-[#00CC6E] hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,212,255,0.25)]"
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
            <div className="lg:sticky lg:top-6">
              <div ref={qrPreviewRef}>
                <QRPreview
                  value={qrValue}
                  color={qrColor}
                  bgColor={bgColor}
                  dotStyle={dotStyle}
                  ecLevel={ecLevel}
                  logo={logo}
                  isHolo={isHolo}
                  logoPlacement={logoPlacement}
                  cornerSquareStyle={cornerSquareStyle}
                  cornerDotStyle={cornerDotStyle}
                  cornerColor={cornerColor}
                  logoScale={logoScale}
                  logoMargin={logoMargin}
                  useDotGradient={useDotGradient}
                  dotGradientColor2={dotGradientColor2}
                  dotGradientType={dotGradientType}
                  dotGradientRotation={dotGradientRotation}
                />
              </div>

              {/* Live frame preview */}
              {selectedFrame && (() => {
                const frame = ALL_FRAMES.find(f => f.id === selectedFrame);
                if (!frame) return null;
                const qrEl = qrPreviewRef.current?.querySelector("svg");
                return (
                  <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 text-center">
                      Frame Preview — {frame.name}
                    </p>
                    <div className="flex justify-center">
                      <svg viewBox={frame.viewBox} className="w-full max-w-[200px]"
                        xmlns="http://www.w3.org/2000/svg">
                        {frameGradient && (
                          <defs>
                            <linearGradient id="fpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={frameColor} />
                              <stop offset="100%" stopColor={frameGradientColor2} />
                            </linearGradient>
                          </defs>
                        )}
                        <path d={frame.path}
                          fill="white"
                          stroke={frameGradient ? "url(#fpGrad)" : frameColor}
                          strokeWidth="6" strokeLinejoin="round" />
                        {/* QR placeholder */}
                        <rect x={frame.qrPos.x} y={frame.qrPos.y}
                          width={frame.qrPos.size} height={frame.qrPos.size}
                          fill={bgColor} rx="4" />
                        <text x={frame.qrPos.x + frame.qrPos.size/2}
                          y={frame.qrPos.y + frame.qrPos.size/2}
                          textAnchor="middle" dominantBaseline="middle"
                          fontSize="12" fill={qrColor} fontFamily="monospace">
                          QR
                        </text>
                        <text x={frame.textPos.x} y={frame.textPos.y}
                          textAnchor="middle" dominantBaseline="middle"
                          fontFamily="system-ui,sans-serif" fontSize="14"
                          fontWeight="800" letterSpacing="3"
                          fill={frameGradient ? "url(#fpGrad)" : frameTextColor}>
                          {frameCtaText || "SCAN ME"}
                        </text>
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button onClick={downloadFramed}
                        className="flex items-center justify-center gap-1.5 py-2 bg-[#00FF88] text-[#0F172A] font-bold rounded-xl text-xs hover:bg-[#00CC6E] transition-all">
                        <Download size={12} /> SVG
                      </button>
                      <button onClick={downloadFramedSVG}
                        className="flex items-center justify-center gap-1.5 py-2 bg-[#0F172A] text-white font-bold rounded-xl text-xs hover:bg-[#1E293B] transition-all">
                        <Download size={12} /> Hi-Res
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </motion.div>
      )}
      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason as "dynamic_limit" | "static_limit" | "asset_limit" | "bulk_limit"}
          currentPlan={plan}
          onClose={() => setUpgradeReason(null)}
        />
      )}
    </div>
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