"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Upload, Image, Trash2, Copy, Check, X,
  Zap, FolderOpen, AlertCircle, ExternalLink
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

const BUCKET = "user_assets";

const PLAN_LIMITS: Record<string, { count: number; size_bytes: number; label: string }> = {
  free:  { count: 5,   size_bytes: 512 * 1024,       label: "5 assets · 500KB each" },
  basic: { count: 25,  size_bytes: 2 * 1024 * 1024,  label: "25 assets · 2MB each" },
  plus:  { count: 100, size_bytes: 5 * 1024 * 1024,  label: "100 assets · 5MB each" },
};

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem("qrmagic_session") || "null"); }
  catch { return null; }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type Asset = {
  id: string;
  name: string;
  url: string;
  size_bytes: number;
  created_at: string;
};

export default function AssetsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [bucketReady, setBucketReady] = useState(true);

  const session = getSession();
  const plan = session?.plan || "free";
  const limits = PLAN_LIMITS[plan];

  useEffect(() => {
    if (!session?.id) return;
    loadAssets();
  }, []);

  async function loadAssets() {
    if (!session?.id) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", session.id)
      .order("created_at", { ascending: false });

    if (err?.code === "42P01") {
      // Table doesn't exist yet
      setBucketReady(false);
    } else {
      setAssets(data || []);
    }
    setLoading(false);
  }

  async function handleUpload(file: File) {
    if (!session?.id) return;
    setError("");

    // Validate type
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only PNG, JPG, SVG, and WebP files are supported."); return;
    }

    // Validate size
    if (file.size > limits.size_bytes) {
      setError(`File too large. Your ${plan} plan allows ${formatBytes(limits.size_bytes)} per file.`); return;
    }

    // Validate count
    if (assets.length >= limits.count) {
      setError(`You've reached your ${limits.count} asset limit on the ${plan} plan.`); return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop();
    const filename = `${session.id}/${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, { contentType: file.type, upsert: false });

    if (uploadErr) {
      if (uploadErr.message.includes("Bucket not found")) {
        setBucketReady(false);
      } else {
        setError(`Upload failed: ${uploadErr.message}`);
      }
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    const url = urlData.publicUrl;

    // Save to assets table
    const { data: asset, error: dbErr } = await supabase
      .from("assets")
      .insert({
        user_id: session.id,
        name: file.name,
        url,
        size_bytes: file.size,
      })
      .select()
      .single();

    if (dbErr) {
      setError(`Could not save asset: ${dbErr.message}`);
    } else if (asset) {
      setAssets(prev => [asset, ...prev]);
    }

    setUploading(false);
  }

  async function deleteAsset(asset: Asset) {
    setDeleting(asset.id);

    // Extract path from URL
    const urlParts = asset.url.split(`/${BUCKET}/`);
    const path = urlParts[1];

    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
    await supabase.from("assets").delete().eq("id", asset.id);
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    setDeleting(null);
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  // Bucket not set up yet
  if (!bucketReady) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={28} className="text-amber-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-black text-[#0F172A] mb-2">Asset Library Setup Required</h2>
        <p className="text-sm text-[#475569] mb-6 leading-relaxed max-w-md mx-auto">
          The asset storage bucket needs to be created in Supabase before you can upload files.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs text-[#475569] space-y-2 mb-6">
          <p className="font-bold text-[#0F172A]">One-time setup (2 minutes):</p>
          <p>1. Go to your <a href="https://app.supabase.com" target="_blank" className="text-[#00D4FF] hover:underline">Supabase dashboard</a></p>
          <p>2. Click <strong className="text-[#0F172A]">Storage → New bucket</strong></p>
          <p>3. Name it: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">user_assets</code></p>
          <p>4. Set to <strong className="text-[#0F172A]">Public</strong></p>
          <p>5. Also run this SQL in the SQL Editor:</p>
          <pre className="bg-slate-100 rounded-xl p-3 text-[10px] overflow-x-auto mt-2">{`CREATE TABLE IF NOT EXISTS assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);`}</pre>
          <p>6. Come back here and refresh</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={loadAssets}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)]">
          Try Again
        </motion.button>
      </div>
    );
  }

  const usedCount = assets.length;
  const usedPct = Math.min((usedCount / limits.count) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-black text-[#0F172A] tracking-tight">Asset Library</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">Upload logos and images to reuse across your QR codes.</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => fileRef.current?.click()}
          disabled={uploading || usedCount >= limits.count}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.25)] disabled:opacity-50">
          {uploading
            ? <div className="w-3.5 h-3.5 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" />
            : <Upload size={13} strokeWidth={2} />}
          {uploading ? "Uploading..." : "Upload Asset"}
        </motion.button>
        <input ref={fileRef} type="file" accept="image/*,.svg" className="sr-only"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
      </div>

      {/* Plan usage */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#475569]">
            {usedCount} / {limits.count} assets used
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00FF88]/15 border border-[#00FF88]/25 text-[#00CC6E] capitalize">
            {plan} · {limits.label}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${usedPct}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full rounded-full ${usedPct > 80 ? "bg-amber-400" : "bg-gradient-to-r from-[#00FF88] to-[#00D4FF]"}`} />
        </div>
        {plan === "free" && (
          <p className="text-[10px] text-[#94A3B8] mt-2">
            <button onClick={() => router.push("/pricing")} className="text-[#00D4FF] hover:underline font-medium">Upgrade to Basic</button> for 25 assets up to 2MB each.
          </p>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">
            <X size={14} className="flex-shrink-0" strokeWidth={2} /> {error}
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600"><X size={12} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-5 transition-all cursor-pointer ${
          dragOver ? "border-[#00D4FF] bg-[#00D4FF]/04" : "border-slate-200 hover:border-[#00D4FF]/40 hover:bg-slate-50"
        }`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
      >
        <Upload size={24} className="mx-auto mb-3 text-[#CBD5E1]" strokeWidth={1.5} />
        <p className="text-sm font-semibold text-[#475569] mb-1">Drop an image here or click to browse</p>
        <p className="text-xs text-[#94A3B8]">PNG, JPG, SVG, WebP · Max {formatBytes(limits.size_bytes)}</p>
      </div>

      {/* Assets grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="aspect-square shimmer rounded-2xl" />)}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-slate-300" strokeWidth={1} />
          </div>
          <p className="text-sm font-semibold text-[#475569] mb-1">No assets yet</p>
          <p className="text-xs text-[#94A3B8]">Upload your first logo or image to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {assets.map((asset, i) => (
            <motion.div key={asset.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#00D4FF]/30 transition-all duration-300"
            >
              {/* Preview */}
              <div className="aspect-square bg-slate-50 flex items-center justify-center p-4">
                <img src={asset.url} alt={asset.name}
                  className="max-w-full max-h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>

              {/* Info */}
              <div className="p-2.5 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-[#0F172A] truncate">{asset.name}</p>
                <p className="text-[9px] text-[#94A3B8]">{formatBytes(asset.size_bytes || 0)}</p>
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => copyUrl(asset.url)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#00D4FF]/10 border border-[#00D4FF]/25 rounded-xl text-[11px] font-semibold text-[#0891B2] hover:bg-[#00D4FF]/20 transition-all">
                  {copied === asset.url ? <><Check size={11} strokeWidth={2} />Copied!</> : <><Copy size={11} strokeWidth={1.5} />Copy URL</>}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => window.open(asset.url, "_blank")}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-[#475569] hover:border-[#00D4FF]/30 hover:text-[#00D4FF] transition-all">
                  <ExternalLink size={11} strokeWidth={1.5} /> View
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => deleteAsset(asset)}
                  disabled={deleting === asset.id}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-200 rounded-xl text-[11px] font-medium text-red-500 hover:bg-red-100 transition-all disabled:opacity-50">
                  {deleting === asset.id
                    ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                    : <><Trash2 size={11} strokeWidth={1.5} />Delete</>}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Use in QR tip */}
      {assets.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-[#00FF88]/08 to-[#00D4FF]/08 border border-[#00FF88]/20 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00FF88]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap size={14} className="text-[#00CC6E]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F172A] mb-0.5">Use in QR Codes</p>
            <p className="text-xs text-[#475569] leading-relaxed">
              Copy any asset URL and paste it into the <button onClick={() => router.push("/dashboard/create")} className="text-[#00D4FF] hover:underline font-medium">QR Creator</button> logo field to overlay it on your QR code.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}