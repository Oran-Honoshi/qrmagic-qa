"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User, Shield, Bell, Trash2, Check, X,
  Eye, EyeOff, LogOut, Zap
} from "lucide-react";
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

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[rgba(255,255,255,0.05)]">
        <div className="w-7 h-7 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center">
          <Icon size={14} className="text-[#06B6D4]" />
        </div>
        <h3 className="text-sm font-semibold text-[#F0F4F8]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 mb-4">
      <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">{label}</label>
      {hint && <p className="text-[10px] text-[#4A5568]">{hint}</p>}
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, disabled, rightEl }: {
  value: string; onChange?: (v: string) => void; type?: string;
  placeholder?: string; disabled?: boolean; rightEl?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type={type} value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className="w-full bg-[#141C2B] border border-[rgba(255,255,255,0.07)] focus:border-[rgba(6,182,212,0.4)] rounded-xl px-4 py-2.5 text-sm text-[#F0F4F8] placeholder:text-[#4A5568] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10"
      />
      {rightEl && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>
      )}
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg z-50 ${
        type === "success"
          ? "bg-green-500/90 text-white"
          : "bg-red-500/90 text-white"
      }`}
    >
      {type === "success" ? <Check size={14} /> : <X size={14} />}
      {msg}
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
      .then(({ data }) => {
        if (!data) return;
        setName(data.name || "");
        setEmail(data.email || "");
        setMarketing(data.marketing ?? false);
      });
  }, []);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function saveProfile() {
    if (!user) return;
    setSaving("profile");
    const { error } = await supabase.from("users").update({ name }).eq("id", user.id);
    setSaving(null);
    if (error) showToast("Could not save. Try again.", "error");
    else {
      sessionStorage.setItem("qrmagic_session", JSON.stringify({ ...user, name }));
      showToast("Profile updated!", "success");
    }
  }

  async function savePassword() {
    if (!user || !oldPass || !newPass) return;
    if (newPass.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
    setSaving("password");
    const { data } = await supabase.from("users").select("password").eq("id", user.id).single();
    if (data?.password !== oldPass) { showToast("Current password is incorrect.", "error"); setSaving(null); return; }
    const { error } = await supabase.from("users").update({ password: newPass }).eq("id", user.id);
    setSaving(null);
    if (error) showToast("Could not update password.", "error");
    else { setOldPass(""); setNewPass(""); showToast("Password updated!", "success"); }
  }

  async function saveNotifications() {
    if (!user) return;
    setSaving("notif");
    await supabase.from("users").update({ marketing }).eq("id", user.id);
    setSaving(null);
    showToast("Preferences saved!", "success");
  }

  async function deleteAccount() {
    if (!user || deleteConfirm !== "DELETE") return;
    await supabase.from("users").update({ deleted: true, deleted_at: new Date().toISOString() }).eq("id", user.id);
    sessionStorage.removeItem("qrmagic_session");
    router.replace("/");
  }

  const plan = user?.plan || "free";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="mb-6">
        <h1 className="text-lg font-black text-[#F0F4F8] tracking-tight">Settings</h1>
        <p className="text-xs text-[#4A5568] mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* Plan badge */}
      <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
            <Zap size={16} className="text-[#06B6D4]" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#F0F4F8] capitalize">{plan} Plan</div>
            <div className="text-[10px] text-[#4A5568]">
              {plan === "free" ? "1 dynamic QR · 50 static QR" : "Unlimited dynamic · Unlimited static"}
            </div>
          </div>
        </div>
        {plan === "free" && (
          <button onClick={() => router.push("/#pricing")}
            className="px-4 py-2 text-xs font-bold rounded-full bg-[#06B6D4] text-[#0A0E14] hover:bg-[#22D3EE] transition-all shadow-[0_4px_12px_rgba(6,182,212,0.25)]">
            Upgrade
          </button>
        )}
      </div>

      {/* Profile */}
      <SectionCard title="Profile" icon={User}>
        <Field label="Full Name">
          <Input value={name} onChange={setName} placeholder="Your name" />
        </Field>
        <Field label="Email Address" hint="Email cannot be changed after signup.">
          <Input value={email} disabled />
        </Field>
        <button onClick={saveProfile} disabled={saving === "profile"}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all disabled:opacity-50">
          {saving === "profile" ? (
            <div className="w-3.5 h-3.5 border-2 border-[#0A0E14]/30 border-t-[#0A0E14] rounded-full animate-spin" />
          ) : <Check size={13} />}
          Save Profile
        </button>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security" icon={Shield}>
        <Field label="Current Password">
          <Input value={oldPass} onChange={setOldPass} type={showOld ? "text" : "password"}
            placeholder="Enter current password"
            rightEl={
              <button type="button" onClick={() => setShowOld(!showOld)}
                className="text-[#4A5568] hover:text-[#94A3B8] transition-colors">
                {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
        </Field>
        <Field label="New Password">
          <Input value={newPass} onChange={setNewPass} type={showNew ? "text" : "password"}
            placeholder="Min 6 characters"
            rightEl={
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="text-[#4A5568] hover:text-[#94A3B8] transition-colors">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
        </Field>
        <button onClick={savePassword} disabled={saving === "password" || !oldPass || !newPass}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all disabled:opacity-50">
          {saving === "password" ? (
            <div className="w-3.5 h-3.5 border-2 border-[#0A0E14]/30 border-t-[#0A0E14] rounded-full animate-spin" />
          ) : <Shield size={13} />}
          Update Password
        </button>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" icon={Bell}>
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-sm font-medium text-[#F0F4F8]">Product Updates & Offers</div>
            <div className="text-xs text-[#4A5568] mt-0.5">Tips, new features, and occasional promotions.</div>
          </div>
          <button onClick={() => setMarketing(!marketing)}
            className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${marketing ? "bg-[#06B6D4]" : "bg-[#1A2436] border border-[rgba(255,255,255,0.1)]"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${marketing ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
        <button onClick={saveNotifications} disabled={saving === "notif"}
          className="flex items-center gap-2 px-5 py-2.5 mt-4 bg-[#06B6D4] text-[#0A0E14] font-bold rounded-full text-sm hover:bg-[#22D3EE] transition-all disabled:opacity-50">
          {saving === "notif" ? (
            <div className="w-3.5 h-3.5 border-2 border-[#0A0E14]/30 border-t-[#0A0E14] rounded-full animate-spin" />
          ) : <Check size={13} />}
          Save Preferences
        </button>
      </SectionCard>

      {/* Sign out */}
      <div className="bg-[#0F1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-5">
        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[rgba(255,255,255,0.05)]">
          <div className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
            <LogOut size={14} className="text-[#4A5568]" />
          </div>
          <h3 className="text-sm font-semibold text-[#F0F4F8]">Session</h3>
        </div>
        <p className="text-xs text-[#4A5568] mb-4">Signed in as <span className="text-[#94A3B8] font-medium">{email}</span></p>
        <button
          onClick={() => { sessionStorage.removeItem("qrmagic_session"); router.replace("/auth"); }}
          className="flex items-center gap-2 px-5 py-2.5 border border-[rgba(255,255,255,0.1)] text-[#94A3B8] font-semibold rounded-full text-sm hover:border-[rgba(255,255,255,0.2)] hover:text-[#F0F4F8] transition-all"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-[rgba(248,113,113,0.04)] border border-[rgba(248,113,113,0.15)] rounded-xl p-5"
        style={{ borderTop: "2px solid rgba(248,113,113,0.3)" }}>
        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[rgba(248,113,113,0.1)]">
          <div className="w-7 h-7 rounded-lg bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] flex items-center justify-center">
            <Trash2 size={14} className="text-[#F87171]" />
          </div>
          <h3 className="text-sm font-semibold text-[#F87171]">Danger Zone</h3>
        </div>
        <p className="text-xs text-[#4A5568] mb-4 leading-relaxed">
          Deleting your account is permanent. All QR codes and analytics data will be removed. This cannot be undone.
        </p>
        <button onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] text-[#F87171] font-semibold rounded-full text-sm hover:bg-[rgba(248,113,113,0.18)] transition-all">
          <Trash2 size={13} /> Delete My Account
        </button>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0F1520] border border-[rgba(248,113,113,0.2)] rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
          >
            <h3 className="text-base font-bold text-[#F0F4F8] mb-2">Delete Account?</h3>
            <p className="text-sm text-[#4A5568] mb-4 leading-relaxed">
              This will permanently delete your account and all QR codes. Type <span className="font-bold text-[#F87171]">DELETE</span> to confirm.
            </p>
            <input
              value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full bg-[#141C2B] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2.5 text-sm text-[#F0F4F8] outline-none mb-4 focus:border-[rgba(248,113,113,0.4)] transition-all"
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 py-2.5 text-sm font-semibold border border-[rgba(255,255,255,0.07)] rounded-full text-[#4A5568] hover:text-[#94A3B8] transition-colors">
                Cancel
              </button>
              <button onClick={deleteAccount}
                disabled={deleteConfirm !== "DELETE"}
                className="flex-1 py-2.5 text-sm font-bold bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Delete Forever
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}