"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Mail, Crown, Trash2, X, Check,
  Copy, UserPlus, Clock, AlertCircle, Zap
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem("qrmagic_session") || "null"); }
  catch { return null; }
}

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

type Member = {
  id: string;
  member_id: string;
  role: string;
  joined_at: string;
  email?: string;
};

type Invite = {
  id: string;
  email: string;
  token: string;
  role: string;
  accepted: boolean;
  created_at: string;
  expires_at: string;
};

export function TeamSettings() {
  const router = useRouter();
  const session = getSession();
  const plan = session?.plan || "free";
  const isPlus = plan === "plus";

  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const MAX_MEMBERS = 2; // Plus plan: owner + 2 members
  const totalSeats = members.length + invites.filter(i => !i.accepted).length;

  useEffect(() => {
    if (session?.id) loadTeam();
  }, []);

  async function loadTeam() {
    if (!session?.id) return;
    setLoading(true);

    const [{ data: membersData }, { data: invitesData }] = await Promise.all([
      supabase.from("team_members").select("*").eq("owner_id", session.id),
      supabase.from("team_invites").select("*").eq("owner_id", session.id).eq("accepted", false),
    ]);

    setMembers(membersData || []);
    setInvites(invitesData || []);
    setLoading(false);
  }

  async function sendInvite() {
    if (!inviteEmail || !session?.id) return;
    if (totalSeats >= MAX_MEMBERS) {
      setError("You've reached the 3-seat limit (you + 2 members) on the Plus plan.");
      return;
    }
    if (!inviteEmail.includes("@")) { setError("Please enter a valid email."); return; }

    setSending(true); setError(""); setSuccess("");

    const token = generateToken();
    const inviteUrl = `${window.location.origin}/auth?invite=${token}`;

    const { error: dbErr } = await supabase.from("team_invites").insert({
      owner_id: session.id,
      email: inviteEmail,
      token,
      role: inviteRole,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (dbErr) {
      setError(dbErr.message);
      setSending(false);
      return;
    }

    // Open mailto with invite link
    const subject = encodeURIComponent(`You're invited to join Sqrly`);
    const body = encodeURIComponent(
      `Hi!\n\n${session.email} has invited you to join their Sqrly workspace.\n\nClick the link below to accept:\n${inviteUrl}\n\nThis invite expires in 7 days.\n\nSqrly – QR Code Generator`
    );
    window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`);

    await loadTeam();
    setInviteEmail("");
    setSuccess(`Invite sent to ${inviteEmail}`);
    setTimeout(() => setSuccess(""), 4000);
    setSending(false);
  }

  async function cancelInvite(inviteId: string) {
    await supabase.from("team_invites").delete().eq("id", inviteId);
    setInvites(prev => prev.filter(i => i.id !== inviteId));
  }

  async function removeMember(memberId: string) {
    await supabase.from("team_members").delete().eq("id", memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
  }

  async function copyInviteLink(token: string) {
    const url = `${window.location.origin}/auth?invite=${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  if (!isPlus) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Users size={15} className="text-[#94A3B8]" strokeWidth={1.5} />
            Team Members
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">Invite team members to manage QR codes together</p>
        </div>
        <div className="px-6 py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mx-auto mb-4">
            <Users size={22} className="text-[#7C3AED]" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] mb-2">Team seats are a Plus feature</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed mb-5 max-w-xs mx-auto">
            Upgrade to Plus to invite up to 2 team members. Everyone shares the same QR codes, analytics, and assets.
          </p>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/pricing")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00FF88] text-[#0F172A] font-bold rounded-full text-sm hover:bg-[#00CC6E] transition-all shadow-[0_4px_12px_rgba(0,255,136,0.3)]">
            <Zap size={13} strokeWidth={2} /> Upgrade to Plus
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Users size={15} className="text-[#94A3B8]" strokeWidth={1.5} />
              Team Members
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {1 + members.length} / 3 seats used · {MAX_MEMBERS - totalSeats} invite{MAX_MEMBERS - totalSeats !== 1 ? "s" : ""} remaining
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
            <Crown size={11} className="text-[#7C3AED]" strokeWidth={2} />
            <span className="text-[10px] font-bold text-[#7C3AED]">Plus Plan</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Seat usage bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#475569] font-medium">Seats used</span>
            <span className="font-bold text-[#0F172A]">{1 + members.length} / 3</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }}
              animate={{ width: `${((1 + members.length) / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED]" />
          </div>
        </div>

        {/* Current members */}
        <div className="space-y-2">
          {/* Owner (you) */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-[#00FF88]/20 border border-[#00FF88]/30 flex items-center justify-center flex-shrink-0">
              <Crown size={14} className="text-[#00CC6E]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">{session?.email}</p>
              <p className="text-[10px] text-[#94A3B8]">Owner · you</p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00FF88]/15 text-[#00CC6E]">Owner</span>
          </div>

          {loading ? (
            <div className="py-4 flex justify-center">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-[#00D4FF] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/25 flex items-center justify-center flex-shrink-0">
                    <Users size={14} className="text-[#0891B2]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{member.email || member.member_id}</p>
                    <p className="text-[10px] text-[#94A3B8]">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#0891B2] capitalize">
                    {member.role}
                  </span>
                  <button onClick={() => removeMember(member.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[#CBD5E1] hover:text-red-500 hover:bg-red-50 transition-colors ml-1">
                    <Trash2 size={11} strokeWidth={1.5} />
                  </button>
                </div>
              ))}

              {/* Pending invites */}
              {invites.map(invite => (
                <div key={invite.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{invite.email}</p>
                    <p className="text-[10px] text-amber-600">
                      Invite pending · expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => copyInviteLink(invite.token)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-100 transition-colors"
                    title="Copy invite link">
                    {copiedToken === invite.token ? <Check size={11} strokeWidth={2} /> : <Copy size={11} strokeWidth={1.5} />}
                  </button>
                  <button onClick={() => cancelInvite(invite.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[#CBD5E1] hover:text-red-500 hover:bg-red-50 transition-colors">
                    <X size={11} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Invite form */}
        {totalSeats < MAX_MEMBERS ? (
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <UserPlus size={13} strokeWidth={1.5} className="text-[#94A3B8]" />
              Invite a Team Member
            </p>
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendInvite()}
                placeholder="colleague@company.com"
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#00D4FF] rounded-xl px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all" />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-[#475569] outline-none focus:border-[#00D4FF]">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="text-[9px] text-[#94A3B8] space-y-0.5">
              <p>• <strong className="text-[#475569]">Member</strong> — can view and download QR codes</p>
              <p>• <strong className="text-[#475569]">Admin</strong> — can create, edit, and delete QR codes</p>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={12} strokeWidth={2} /> {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs text-[#00CC6E] bg-[#00FF88]/08 border border-[#00FF88]/25 rounded-lg px-3 py-2">
                  <Check size={12} strokeWidth={2} /> {success}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button whileTap={{ scale: 0.95 }} onClick={sendInvite} disabled={sending || !inviteEmail}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0F172A] text-white font-semibold rounded-full text-xs hover:bg-[#1E293B] transition-all disabled:opacity-40">
              {sending
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Mail size={12} strokeWidth={2} /> Send Invite via Email</>}
            </motion.button>
            <p className="text-[9px] text-[#CBD5E1] text-center">
              Opens your email client with a pre-written invite. Invite link expires in 7 days.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <AlertCircle size={14} className="text-[#94A3B8] flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-[#475569]">All 3 seats are filled. Remove a member to invite someone new.</p>
          </div>
        )}
      </div>
    </div>
  );
}