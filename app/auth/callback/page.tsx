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
        // Get the session from Supabase after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user) {
          router.replace("/auth?error=oauth_failed");
          return;
        }

        const { user } = session;

        // Check if user already exists in our users table
        const { data: existing } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email!)
          .maybeSingle();

        if (existing) {
          // Existing user — update session
          sessionStorage.setItem("qrmagic_session", JSON.stringify({
            id: existing.id,
            email: existing.email,
            name: existing.name,
            plan: existing.plan,
          }));
        } else {
          // New user — create record
          const name = user.user_metadata?.full_name ||
                       user.user_metadata?.name ||
                       user.email?.split("@")[0] || "User";

          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              email: user.email,
              name,
              password: "", // OAuth users have no password
              marketing: false,
              plan: "free",
              deleted: false,
            })
            .select()
            .single();

          if (insertError || !newUser) {
            router.replace("/auth?error=account_creation_failed");
            return;
          }

          sessionStorage.setItem("qrmagic_session", JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            plan: newUser.plan,
          }));
        }

        router.replace("/dashboard");
      } catch {
        router.replace("/auth?error=unknown");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10 text-center">
        <div className="w-12 h-12 border-2 border-[rgba(6,182,212,0.15)] border-t-[#06B6D4] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#4A5568]">Signing you in with Google...</p>
      </div>
    </div>
  );
}