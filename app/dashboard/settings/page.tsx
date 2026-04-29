"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Shield, Bell, Trash2, Check, X, Eye, EyeOff, LogOut, Zap } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem("qrmagic_session") || "null"); }
  catch { return null; }
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-[#00D4FF]/08 border border-[#00D4FF]/15 flex items-center justify-center">
          <Icon size={14} className="text-[#0891B2]" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, type="text", placeholder, disabled, rightEl }: {
  value: string; onChange?: (v: string) => void; type?: string;
  placeholder?: string; disabled?: boolean; rightEl?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4FF] focus:bg-white rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)] pr-10" />
      {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>}
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg z-50 ${
        type === "success" ? "bg-[#00FF88] text-[#0F172A]" : "bg-red-500 text-white"
      }`}>
      {type === "success" ? <Check size={14} /> : <X size={14} />} {msg}
    </motion.div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    setUser(session);
    supabase.from("users").select("*").eq("id", session.id).single()
      .then(({ data }) => { if (!data) return; setName(data.name||""); setEmail(data.email||""); setMarketing(data.marketing??false); });
  }, []);

  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  async function saveProfile() {
    if (!user) return; setSaving("profile");
    const { error } = await supabase.from("users").update({ name }).eq("id", user.id);
    setSaving(null);
    if (error) showToast("Could not save.", "error");
    else { sessionStorage.setItem("qrmagic_session", JSON.stringify({ ...user, name })); showToast("Profile updated!", "success"); }
  }

  async function savePassword() {
    if (!user || !oldPass || !newPass) return;
    if (newPass.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
    setSaving("password");
    const { data } = await supabase.from("users").select("password").eq("id", user.id).single();
    if (data?.password !== oldPass) { showToast("Current password is incorrect.", "error"); setSaving(null); return; }
    await supabase.from("users").update({ password: newPass }).eq("id", user.id);
    setSaving(null); setOldPass(""); setNewPass(""); showToast("Password updated!", "success");
  }

  async function deleteAccount() {
    if (!user || deleteConfirm !== "DELETE") return;
    await supabase.from("users").update({ deleted: true, deleted_at: new Date().toISOString() }).eq("id", user.id);
    sessionStorage.removeItem("qrmagic_session");
    router.replace("/");
  }

  const plan = user?.plan || "free";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="mb-6">
        <h1 className="text-lg font-black text-[#0F172A] tracking-tight">Settings</h1>
        <p className="text-xs text-[#94A3B8] mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* Plan */}
      <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#00D4FF]/10 border border-[#00FF88]/25 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00FF88]/15 border border-[#00FF88]/25 flex items-center justify-center">
            <Zap size={16} className="text-[#00CC6E]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F172A] capitalize">{plan} Plan</div>
            <div className="text-[10px] text-[#94A3B8]">
              {plan === "free" ? "1 dynamic QR · 50 static QR" : "Unlimited dynamic · Unlimited static"}
            </div>
          </div>
        </div>
        {plan === "free" && (
          <button onClick={() => router.push("/pricing")}
            className="px-4 py-2 text-xs font-bold rounded-full bg-[#00FF88] text-[#0F172A] hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)]">
            Upgrade
          </button>
        )}
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5 block">Full Name</label>
            <Input value={name} onChange={setName} placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5 block">Email Address</label>
            <Input value={email} disabled />
            <p className="text-[10px] text-[#94A3B8] mt-1">Email cannot be changed after signup.</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={saveProfile} disabled={saving === "profile"}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.25)] disabled:opacity-50">
          {saving === "profile" ? <div className="w-3.5 h-3.5 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" /> : <Check size={13} />}
          Save Profile
        </motion.button>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Shield}>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5 block">Current Password</label>
            <Input value={oldPass} onChange={setOldPass} type={showOld ? "text" : "password"} placeholder="Enter current password"
              rightEl={<button onClick={() => setShowOld(!showOld)} className="text-[#CBD5E1] hover:text-[#475569] transition-colors">
                {showOld ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
              </button>} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5 block">New Password</label>
            <Input value={newPass} onChange={setNewPass} type={showNew ? "text" : "password"} placeholder="Min 6 characters"
              rightEl={<button onClick={() => setShowNew(!showNew)} className="text-[#CBD5E1] hover:text-[#475569] transition-colors">
                {showNew ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
              </button>} />
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={savePassword} disabled={saving === "password" || !oldPass || !newPass}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.25)] disabled:opacity-50">
          {saving === "password" ? <div className="w-3.5 h-3.5 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" /> : <Shield size={13} />}
          Update Password
        </motion.button>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="flex items-center justify-between py-1 mb-4">
          <div>
            <div className="text-sm font-medium text-[#0F172A]">Product Updates & Offers</div>
            <div className="text-xs text-[#94A3B8] mt-0.5">Tips, new features, and occasional promotions.</div>
          </div>
          <button onClick={() => setMarketing(!marketing)}
            className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${marketing ? "bg-[#00FF88]" : "bg-slate-200"}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${marketing ? "left-6" : "left-1"}`} />
          </button>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={async () => { if (!user) return; setSaving("notif"); await supabase.from("users").update({ marketing }).eq("id", user.id); setSaving(null); showToast("Preferences saved!", "success"); }}
          disabled={saving === "notif"}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.25)] disabled:opacity-50">
          {saving === "notif" ? <div className="w-3.5 h-3.5 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" /> : <Check size={13} />}
          Save Preferences
        </motion.button>
      </Section>

      {/* Sign out */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
            <LogOut size={14} className="text-[#94A3B8]" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">Session</h3>
        </div>
        <p className="text-xs text-[#94A3B8] mb-4">Signed in as <span className="text-[#0F172A] font-medium">{email}</span></p>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { sessionStorage.removeItem("qrmagic_session"); router.replace("/auth"); }}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-[#475569] font-semibold rounded-full text-sm hover:border-red-200 hover:text-red-500 transition-all">
          <LogOut size={13} strokeWidth={1.5} /> Sign Out
        </motion.button>
      </div>

      {/* Danger */}
      <div className="bg-red-50/50 border border-red-200 rounded-2xl p-5" style={{ borderTop: "2px solid rgb(252,165,165)" }}>
        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-red-100">
          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
            <Trash2 size={14} className="text-red-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-bold text-red-500">Danger Zone</h3>
        </div>
        <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">Permanently deletes your account and all QR codes. This cannot be undone.</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border border-red-200 text-red-500 font-semibold rounded-full text-sm hover:bg-red-100 transition-all">
          <Trash2 size={13} strokeWidth={1.5} /> Delete My Account
        </motion.button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white border border-red-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#0F172A] mb-2">Delete Account?</h3>
            <p className="text-sm text-[#475569] mb-4 leading-relaxed">
              Type <span className="font-bold text-red-500">DELETE</span> to confirm.
            </p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] outline-none mb-4 focus:border-red-300 transition-all" />
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 rounded-full text-[#475569] hover:text-[#0F172A] transition-colors">
                Cancel
              </button>
              <button onClick={deleteAccount} disabled={deleteConfirm !== "DELETE"}
                className="flex-1 py-2.5 text-sm font-bold bg-red-500 text-white rounded-full hover:bg-red-600 transition-all disabled:opacity-40">
                Delete Forever
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}