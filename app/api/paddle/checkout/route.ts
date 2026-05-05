import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

const PRICE_IDS: Record<string, Record<string, string>> = {
  basic: {
    monthly: process.env.PADDLE_PRICE_BASIC_MONTHLY || "",
    annual:  process.env.PADDLE_PRICE_BASIC_ANNUAL  || "",
  },
  plus: {
    monthly: process.env.PADDLE_PRICE_PLUS_MONTHLY || "",
    annual:  process.env.PADDLE_PRICE_PLUS_ANNUAL  || "",
  },
};

export async function POST(req: NextRequest) {
  try {
    // userId is now extracted from request body
    const { plan, billing, userId, email, createdAt } = await req.json();

    const priceId = PRICE_IDS[plan]?.[billing];
    if (!priceId) {
      return NextResponse.json({ error: `Invalid plan "${plan}" / billing "${billing}"` }, { status: 400 });
    }

    // Check trial eligibility
    let trialDaysRemaining = 7; // default: full 7-day trial
    let noTrial = false;

    if (userId) {
      const { data: userData } = await supabase
        .from("users")
        .select("had_trial, trial_started_at, subscription_status")
        .eq("id", userId)
        .single();

      if (userData?.had_trial && userData?.trial_started_at) {
        // Calculate how many days are left from the ORIGINAL trial
        const trialEnd = new Date(userData.trial_started_at).getTime() + 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const daysLeft = Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000));

        if (daysLeft <= 0) {
          // Original 7-day window has fully passed — no trial at all
          noTrial = true;
          trialDaysRemaining = 0;
        } else {
          // Give them the remaining days from their original trial
          trialDaysRemaining = daysLeft;
        }
      } else if (userData?.had_trial) {
        // had_trial set but no start date — block trial to be safe
        noTrial = true;
        trialDaysRemaining = 0;
      }
    }

    // Check 48h welcome discount window
    const isInDiscountWindow = createdAt
      ? (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000
      : false;
    const discountId = isInDiscountWindow ? (process.env.PADDLE_DISCOUNT_ID || null) : null;

    // Return everything Paddle.js needs client-side
    // trialDays tells Paddle.js how many trial days to offer
    // noTrial = true means charge immediately, no trial
    return NextResponse.json({
      priceId,
      email,
      userId,
      discountId,
      noTrial,
      trialDays: trialDaysRemaining,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}