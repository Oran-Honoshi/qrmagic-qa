"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Check for invite token in URL
        const inviteToken = new URLSearchParams(window.location.search).get("invite");

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) { router.replace("/auth?error=oauth_failed"); return; }

        const { user } = session;
        const { data: existing } = await supabase
          .from("users").select("*").eq("email", user.email!).maybeSingle();

        let userId: string;
        let userPlan = "free";

        if (existing) {
          userId = existing.id;
          userPlan = existing.plan || "free";
          sessionStorage.setItem("qrmagic_session", JSON.stringify({
            id: existing.id, email: existing.email,
            name: existing.name, plan: existing.plan,
          }));
        } else {
          const name = user.user_metadata?.full_name ||
                       user.user_metadata?.name ||
                       user.email?.split("@")[0] || "User";
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({ email: user.email, name, password: "", marketing: false, plan: "free", deleted: false })
            .select().single();
          if (insertError || !newUser) { router.replace("/auth?error=account_creation_failed"); return; }
          userId = newUser.id;
          sessionStorage.setItem("qrmagic_session", JSON.stringify({
            id: newUser.id, email: newUser.email,
            name: newUser.name, plan: newUser.plan,
          }));
        }

        // Handle invite token — link member to owner's workspace
        if (inviteToken) {
          const { data: invite } = await supabase
            .from("team_invites")
            .select("*")
            .eq("token", inviteToken)
            .eq("accepted", false)
            .gte("expires_at", new Date().toISOString())
            .single();

          if (invite) {
            await supabase.from("team_members").upsert({
              owner_id: invite.owner_id,
              member_id: userId,
              role: invite.role || "member",
            });
            await supabase.from("team_invites")
              .update({ accepted: true })
              .eq("id", invite.id);
          }
        }

        router.replace("/dashboard");
      } catch { router.replace("/auth?error=unknown"); }
    }
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10 text-center">
        <img src="/mascot.png" alt="Sqrly" className="w-16 h-16 object-contain mx-auto mb-5"
          style={{ animation: "float 3.5s ease-in-out infinite" }} />
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#00D4FF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#94A3B8] font-medium">Signing you in...</p>
        <p className="text-xs text-[#CBD5E1] mt-1">You&apos;ll be redirected to your dashboard.</p>
      </div>
    </div>
  );
}