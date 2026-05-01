"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import JSZip from "jszip";
import {
  Upload, Download, FileText, Check, X, AlertTriangle,
  RefreshCw, Folder, ChevronDown, Info, Zap, Eye
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem("sqrly_session") || "null"); }
  catch { return null; }
}

/* Plan limits */
const PLAN_LIMITS: Record<string, number> = {
  free: 0, basic: 50, plus: 500,
};

/* Build QR value from CSV row */
function buildValueFromRow(row: Record<string, string>): string {
  const v = (k: string) => (row[k] || "").trim();
  const type = v("type").toLowerCase();
  switch (type) {
    case "url":      return v("url") || "https://sqrly.io";
    case "wifi":     return `WIFI:T:${v("wifi_security")||"WPA"};S:${v("wifi_ssid")};P:${v("wifi_password")};;`;
    case "vcard":    return `BEGIN:VCARD\nVERSION:4.0\nFN:${v("vcard_name")}\nTITLE:${v("vcard_title")}\nORG:${v("vcard_company")}\nTEL;TYPE=cell:${v("vcard_phone")}\nEMAIL:${v("vcard_email")}\nURL:${v("vcard_website")}\nURL;TYPE=linkedin:${v("vcard_linkedin")}\nEND:VCARD`;
    case "text":     return v("text");
    case "email":    return `mailto:${v("email_to")}?subject=${encodeURIComponent(v("email_subject"))}&body=${encodeURIComponent(v("email_body"))}`;
    case "sms":      return `sms:${v("sms_phone")}${v("sms_message")?`?body=${encodeURIComponent(v("sms_message"))}` : ""}`;
    case "phone":    return `tel:${v("phone")}`;
    case "whatsapp": return `https://wa.me/${v("whatsapp_phone").replace(/\D/g,"")}${v("whatsapp_message")?`?text=${encodeURIComponent(v("whatsapp_message"))}` : ""}`;
    case "location": return v("location_maps_url") || `https://maps.google.com/?q=${v("location_lat")},${v("location_lng")}`;
    case "event":    return `BEGIN:VEVENT\nSUMMARY:${v("event_title")}\nLOCATION:${v("event_location")}\nDTSTART:${v("event_start").replace(/[-:T]/g,"").substring(0,15)}Z\nDTEND:${v("event_end").replace(/[-:T]/g,"").substring(0,15)}Z\nDESCRIPTION:${v("event_description")}\nEND:VEVENT`;
    case "social":   return v("social_url");
    case "youtube":  return v("youtube_url");
    case "pdf":      return v("pdf_url");
    case "paypal":   return v("paypal_url");
    case "image":    return v("image_url");
    default:         return v("url") || "https://sqrly.io";
  }
}

/* Validate a row */
function validateRow(row: Record<string, string>, i: number): string | null {
  const name = (row.name || "").trim();
  const type = (row.type || "").trim().toLowerCase();
  if (!name) return `Row ${i}: Name is required`;
  if (!type) return `Row ${i}: Type is required`;
  const validTypes = ["url","wifi","vcard","text","email","sms","phone","whatsapp","location","event","social","youtube","pdf","paypal","image","bitcoin","zoom","appstore"];
  if (!validTypes.includes(type)) return `Row ${i} (${name}): Unknown type "${type}"`;
  if (type === "url" && !row.url) return `Row ${i} (${name}): URL is required for type=url`;
  if (type === "wifi" && !row.wifi_ssid) return `Row ${i} (${name}): wifi_ssid is required`;
  if (type === "vcard" && !row.vcard_name) return `Row ${i} (${name}): vcard_name is required`;
  return null;
}

type ParsedRow = {
  index: number;
  row: Record<string, string>;
  name: string;
  type: string;
  status: string;
  folder: string;
  color: string;
  value: string;
  conflict: "replace" | "skip" | "rename" | null;
  conflictId?: string;
  error?: string;
};

type ConflictAction = "replace" | "skip" | "rename";

export default function BulkPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview" | "generating" | "done">("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  const session = getSession();
  const plan = session?.plan || "free";
  const limit = PLAN_LIMITS[plan] || 0;

  /* Export existing codes as CSV */
  async function exportExistingCSV() {
    if (!session) return;
    setExportingCSV(true);
    try {
      const { data } = await supabase
        .from("qr_codes").select("*").eq("user_id", session.id)
        .order("created_at", { ascending: false });
      if (!data?.length) { alert("No QR codes to export."); setExportingCSV(false); return; }

      const csvRows = data.map(c => ({
        name: c.name || "",
        type: c.type || "url",
        status: c.status || "static",
        folder: c.folder || "",
        color: c.color || "#00D4FF",
        url: c.type === "url" ? (c.redirect_url || c.value || "") : "",
        wifi_ssid: "", wifi_password: "", wifi_security: "",
        vcard_name: "", vcard_title: "", vcard_company: "",
        vcard_phone: "", vcard_email: "", vcard_website: "", vcard_linkedin: "",
        text: c.type === "text" ? c.value : "",
        email_to: "", email_subject: "", email_body: "",
        sms_phone: "", sms_message: "",
        phone: c.type === "phone" ? c.value : "",
        whatsapp_phone: "", whatsapp_message: "",
        location_lat: "", location_lng: "", location_maps_url: "",
        event_title: "", event_location: "", event_start: "", event_end: "", event_description: "",
        social_platform: "", social_url: "",
        youtube_url: c.type === "youtube" ? c.value : "",
        pdf_url: c.type === "pdf" ? c.value : "",
        paypal_url: c.type === "paypal" ? c.value : "",
        image_url: c.type === "image" ? c.value : "",
      }));

      const csv = Papa.unparse(csvRows);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "my-qr-codes.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Export failed. Please try again."); }
    setExportingCSV(false);
  }

  /* Parse uploaded CSV */
  async function parseCSV(file: File) {
    if (!session) return;
    setErrors([]); setRows([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rawRows = results.data as Record<string, string>[];
        const validationErrors: string[] = [];
        const parsed: ParsedRow[] = [];

        // Check plan limit
        if (rawRows.length > limit) {
          setErrors([`Your ${plan} plan allows up to ${limit} codes per bulk import. This file has ${rawRows.length} rows. Please upgrade or split your file.`]);
          return;
        }

        // Fetch existing codes for conflict detection
        const { data: existing } = await supabase
          .from("qr_codes").select("id, name, folder")
          .eq("user_id", session.id);
        const existingMap = new Map(
          (existing || []).map(c => [`${(c.folder||"").toLowerCase()}::${c.name.toLowerCase()}`, c.id])
        );

        rawRows.forEach((row, i) => {
          const err = validateRow(row, i + 2);
          if (err) { validationErrors.push(err); return; }

          const name = row.name.trim();
          const folder = (row.folder || "").trim();
          const key = `${folder.toLowerCase()}::${name.toLowerCase()}`;
          const conflictId = existingMap.get(key);

          parsed.push({
            index: i,
            row,
            name,
            type: (row.type || "url").toLowerCase(),
            status: (row.status || "static").toLowerCase(),
            folder,
            color: row.color || "#00D4FF",
            value: buildValueFromRow(row),
            conflict: conflictId ? "replace" : null,
            conflictId,
          });
        });

        setErrors(validationErrors);
        setRows(parsed);
        if (parsed.length > 0) setStep("preview");
      },
      error: (err) => setErrors([`CSV parse error: ${err.message}`]),
    });
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) { setErrors(["Please upload a .csv file."]); return; }
    parseCSV(file);
  }

  function setConflictAction(index: number, action: ConflictAction) {
    setRows(prev => prev.map(r => r.index === index ? { ...r, conflict: action } : r));
  }

  /* Generate all QR codes and download as ZIP */
  async function generateAll() {
    setStep("generating");
    setProgress(0); setGenerated(0);

    const QRCodeStyling = (await import("qr-code-styling")).default;
    const zip = new JSZip();
    const toProcess = rows.filter(r => r.conflict !== "skip" && !r.error);
    let done = 0;

    for (const r of toProcess) {
      try {
        // Determine final name (rename if conflict action is rename)
        const finalName = r.conflict === "rename"
          ? `${r.name} (copy)`
          : r.name;

        // Generate QR
        const qr = new QRCodeStyling({
          width: 1000, height: 1000,
          type: "svg",
          data: r.value || "https://sqrly.io",
          dotsOptions: { color: r.color, type: "rounded" },
          cornersSquareOptions: { color: r.color, type: "extra-rounded" },
          cornersDotOptions: { color: r.color },
          backgroundOptions: { color: "#ffffff" },
          qrOptions: { errorCorrectionLevel: "H" },
        });

        // Get SVG blob
        const svgBlob = await qr.getRawData("svg");
        if (svgBlob) {
          const folder = r.folder || "Sqrly Export";
          const safeFolder = folder.replace(/[/\\?%*:|"<>]/g, "-");
          const safeName = finalName.replace(/[/\\?%*:|"<>]/g, "-");
          zip.folder(safeFolder)?.file(`${safeName}.svg`, svgBlob);
        }

        // Save to Supabase (replace or create)
        if (r.conflict === "replace" && r.conflictId) {
          await supabase.from("qr_codes")
            .update({ name: finalName, value: r.value, color: r.color, folder: r.folder, status: r.status })
            .eq("id", r.conflictId);
        } else if (r.conflict !== "skip") {
          const shortId = r.status === "dynamic"
            ? Math.random().toString(36).substring(2, 10)
            : null;
          await supabase.from("qr_codes").insert({
            user_id: session?.id,
            name: finalName,
            type: r.type,
            status: r.status,
            value: shortId ? `${window.location.origin}/r/${shortId}` : r.value,
            redirect_url: shortId ? r.value : null,
            short_id: shortId,
            color: r.color,
            folder: r.folder || null,
            scans: 0, clicks: 0,
          });
        }

        done++;
        setGenerated(done);
        setProgress(Math.round((done / toProcess.length) * 100));
      } catch (err) {
        console.error(`Failed to generate ${r.name}:`, err);
      }
    }

    // Download ZIP
    setDownloading(true);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sqrly-bulk-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
    setStep("done");
  }

  const conflicts = rows.filter(r => r.conflict && r.conflict !== "skip" && r.conflict !== "rename");
  const skipped = rows.filter(r => r.conflict === "skip").length;
  const toGenerate = rows.filter(r => r.conflict !== "skip" && !r.error).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-black text-[#0F172A] tracking-tight">Bulk QR Generator</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Upload a CSV → get a ZIP of QR codes. Export your existing codes to edit and re-upload.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportExistingCSV} disabled={exportingCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] border border-[rgba(226,232,240,1)] rounded-full text-sm font-semibold text-[#475569] hover:border-[rgba(0,212,255,0.3)] hover:text-[#0891B2] transition-all disabled:opacity-50">
            {exportingCSV
              ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : <Download size={14} />}
            Export My Codes as CSV
          </button>
        </div>
      </div>

      {/* Plan gate */}
      {plan === "free" ? (
        <div className="bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.2)] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] flex items-center justify-center mx-auto mb-4">
            <Zap size={22} className="text-[#FCD34D]" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A] mb-2">Bulk Generation is a Paid Feature</h2>
          <p className="text-sm text-[#94A3B8] mb-5 leading-relaxed">
            Upgrade to <strong className="text-[#0F172A]">Basic</strong> to bulk generate up to 50 QR codes at once,
            or <strong className="text-[#0F172A]">Plus</strong> for up to 500 codes per upload.
          </p>
          <button onClick={() => router.push("/pricing")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00FF88] text-[#F8FAFC] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all">
            <Zap size={14} /> View Pricing
          </button>
        </div>
      ) : (
        <>
          {/* Templates download */}
          <div className="bg-[#FFFFFF] border border-[rgba(226,232,240,1)] rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={15} className="text-[#0891B2]" />
              <h3 className="text-sm font-semibold text-[#0F172A]">Download CSV Templates</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#FCD34D]">
                {plan} · up to {limit} codes
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">
              Fill in a template and upload it. Or export your existing codes, edit them, and re-upload.
              Columns left blank are ignored.
            </p>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {[
                { label: "Universal (all types)", file: "sqrly-template-universal.csv" },
                { label: "URL Template", file: "sqrly-template-url.csv" },
                { label: "vCard Template", file: "sqrly-template-vcard.csv" },
                { label: "Wi-Fi Template", file: "sqrly-template-wifi.csv" },
              ].map(t => (
                <a key={t.file} href={`/templates/${t.file}`} download
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] border border-[rgba(226,232,240,1)] rounded-xl text-xs font-medium text-[#475569] hover:border-[rgba(0,212,255,0.3)] hover:text-[#0891B2] transition-all">
                  <Download size={11} /> {t.label}
                </a>
              ))}
            </div>
          </div>

          {/* Upload zone */}
          {step === "upload" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  dragOver
                    ? "border-[#00D4FF] bg-[rgba(6,182,212,0.06)]"
                    : "border-[rgba(203,213,225,1)] hover:border-[rgba(0,212,255,0.3)] hover:bg-[rgba(6,182,212,0.03)]"
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              >
                <input ref={fileRef} type="file" accept=".csv" className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <Upload size={36} className="mx-auto mb-4 text-[#94A3B8]" />
                <h3 className="text-base font-bold text-[#0F172A] mb-2">Drop your CSV here</h3>
                <p className="text-sm text-[#94A3B8] mb-4">or click to browse</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF88] text-[#F8FAFC] font-bold rounded-full text-sm">
                  <Upload size={14} /> Choose CSV File
                </div>
              </div>

              {errors.length > 0 && (
                <div className="mt-4 space-y-2">
                  {errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded-xl text-xs text-red-400">
                      <X size={13} className="flex-shrink-0 mt-0.5" /> {e}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Preview */}
          {step === "preview" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stats bar */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] rounded-full text-xs font-semibold text-[#0891B2]">
                  <Check size={12} /> {toGenerate} to generate
                </div>
                {skipped > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(226,232,240,1)] rounded-full text-xs font-semibold text-[#94A3B8]">
                    {skipped} skipped
                  </div>
                )}
                {conflicts.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-full text-xs font-semibold text-[#FCD34D]">
                    <AlertTriangle size={12} /> {conflicts.length} conflicts
                  </div>
                )}
                {errors.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/8 border border-red-500/20 rounded-full text-xs font-semibold text-red-400">
                    <X size={12} /> {errors.length} errors
                  </div>
                )}
              </div>

              {/* Validation errors */}
              {errors.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  {errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded-xl text-xs text-red-400">
                      <X size={12} className="flex-shrink-0 mt-0.5" /> {e}
                    </div>
                  ))}
                </div>
              )}

              {/* Table */}
              <div className="bg-[#FFFFFF] border border-[rgba(226,232,240,1)] rounded-xl overflow-hidden mb-4">
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
                  {["Name","Type","Status","Folder","Conflict"].map(h => (
                    <div key={h} className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">{h}</div>
                  ))}
                </div>
                <div className="divide-y divide-[rgba(255,255,255,0.04)] max-h-96 overflow-y-auto">
                  {rows.map(r => (
                    <div key={r.index}
                      className={`hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-3 items-center ${r.error ? "opacity-50" : ""}`}>
                      <div className="text-sm font-medium text-[#0F172A] truncate">{r.name}</div>
                      <div className="text-xs text-[#94A3B8] capitalize">{r.type}</div>
                      <div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          r.status === "dynamic"
                            ? "bg-[rgba(0,212,255,0.06)] border-[rgba(0,212,255,0.2)] text-[#0891B2]"
                            : "bg-[rgba(255,255,255,0.04)] border-[rgba(226,232,240,1)] text-[#94A3B8]"
                        }`}>{r.status}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                        {r.folder && <><Folder size={11} /> {r.folder}</>}
                      </div>
                      <div>
                        {r.conflictId ? (
                          <div className="flex gap-1">
                            {(["replace","skip","rename"] as ConflictAction[]).map(action => (
                              <button key={action} onClick={() => setConflictAction(r.index, action)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize transition-all border ${
                                  r.conflict === action
                                    ? action === "replace" ? "bg-[rgba(0,212,255,0.10)] border-[rgba(0,212,255,0.4)] text-[#0891B2]"
                                    : action === "skip" ? "bg-[rgba(226,232,240,1)] border-[rgba(255,255,255,0.2)] text-[#475569]"
                                    : "bg-[rgba(244,114,182,0.1)] border-[rgba(244,114,182,0.3)] text-[#F472B6]"
                                    : "border-[rgba(226,232,240,0.8)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.15)]"
                                }`}>
                                {action}
                              </button>
                            ))}
                          </div>
                        ) : r.error ? (
                          <span className="text-[10px] text-red-400">{r.error}</span>
                        ) : (
                          <span className="text-[10px] text-[#94A3B8]">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conflict legend */}
              {rows.some(r => r.conflictId) && (
                <div className="bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)] rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={13} className="text-[#FCD34D]" />
                    <span className="text-xs font-semibold text-[#FCD34D]">Conflict Resolution</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-[#94A3B8]">
                    <div><span className="text-[#0891B2] font-semibold">Replace</span> — overwrite the existing QR code</div>
                    <div><span className="text-[#475569] font-semibold">Skip</span> — leave existing, don&apos;t create new</div>
                    <div><span className="text-[#F472B6] font-semibold">Rename</span> — create new with &quot;(copy)&quot; suffix</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep("upload"); setRows([]); setErrors([]); }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[rgba(203,213,225,1)] text-[#94A3B8] font-semibold rounded-full text-sm hover:text-[#475569] transition-all">
                  <X size={14} /> Cancel
                </button>
                <button onClick={generateAll} disabled={toGenerate === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#00FF88] text-[#F8FAFC] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(0,212,255,0.25)]">
                  <Zap size={14} /> Generate {toGenerate} QR Code{toGenerate !== 1 ? "s" : ""} + Download ZIP
                </button>
              </div>
            </motion.div>
          )}

          {/* Generating */}
          {step === "generating" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-16 h-16 border-3 border-[rgba(0,212,255,0.2)] border-t-[#00D4FF] rounded-full animate-spin mx-auto mb-6" style={{ borderWidth: 3 }} />
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Generating QR Codes...</h3>
              <p className="text-sm text-[#94A3B8] mb-6">{generated} of {toGenerate} complete</p>
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#0891B2] to-[#00D4FF] rounded-full"
                  />
                </div>
                <p className="text-xs text-[#94A3B8] mt-2">{progress}%</p>
              </div>
            </motion.div>
          )}

          {/* Done */}
          {step === "done" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                <Check size={28} className="text-green-400" />
              </div>
              <h3 className="text-xl font-black text-[#0F172A] mb-2">All Done!</h3>
              <p className="text-sm text-[#94A3B8] mb-8">
                {generated} QR code{generated !== 1 ? "s" : ""} generated and saved.
                Your ZIP file should be downloading now.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => router.push("/dashboard/codes")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-[#F8FAFC] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all">
                  View My Codes
                </button>
                <button onClick={() => { setStep("upload"); setRows([]); setErrors([]); setProgress(0); setGenerated(0); }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[rgba(203,213,225,1)] text-[#475569] font-semibold rounded-full text-sm hover:border-[rgba(0,212,255,0.3)] hover:text-[#0891B2] transition-all">
                  <RefreshCw size={14} /> Upload Another
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}