import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

async function verifyPaddleSignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return false;

  const signature = req.headers.get("paddle-signature");
  if (!signature) return false;

  // Parse ts and h1 from signature header
  const parts = Object.fromEntries(
    signature.split(";").map(p => p.split("="))
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  const signed = `${ts}:${rawBody}`;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC", key, encoder.encode(signed)
    );
    const computed = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return computed === h1;
  } catch {
    return false;
  }
}

function getPlanFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {
    [process.env.PADDLE_PRICE_BASIC_MONTHLY || ""]: "basic",
    [process.env.PADDLE_PRICE_BASIC_ANNUAL  || ""]: "basic",
    [process.env.PADDLE_PRICE_PLUS_MONTHLY  || ""]: "plus",
    [process.env.PADDLE_PRICE_PLUS_ANNUAL   || ""]: "plus",
  };
  return priceMap[priceId] || "basic";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const isValid = await verifyPaddleSignature(req, rawBody);
  if (!isValid) {
    console.error("Paddle webhook signature invalid");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event?.event_type;
  const data = event?.data;

  console.log(`Paddle webhook: ${eventType}`);

  try {
    // Subscription activated or created — user paid / trial started
    if (eventType === "subscription.activated" || eventType === "subscription.created") {
      const userId = data?.custom_data?.userId;
      const customerEmail = data?.customer?.email;
      const priceId = data?.items?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId);
      const paddleSubId = data?.id;
      const paddleCustomerId = data?.customer_id;
      const status = data?.status;

      const updateData = {
        plan,
        paddle_customer_id: paddleCustomerId,
        paddle_subscription_id: paddleSubId,
        subscription_status: status,
      };

      if (userId) {
        await supabase.from("users").update(updateData).eq("id", userId);
      } else if (customerEmail) {
        // Fallback: match by email when userId not in custom_data
        await supabase.from("users").update(updateData).eq("email", customerEmail);
      }
    }

    // Subscription updated — plan change
    if (eventType === "subscription.updated") {
      const paddleSubId = data?.id;
      const priceId = data?.items?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId);
      const status = data?.status;

      await supabase.from("users").update({
        plan,
        subscription_status: status,
      }).eq("paddle_subscription_id", paddleSubId);
    }

    // Subscription trialing — set plan but mark as trial
    if (eventType === "subscription.trialing") {
      const userId = data?.custom_data?.userId;
      const customerEmail = data?.customer?.email;
      const priceId = data?.items?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId);
      const paddleSubId = data?.id;
      const paddleCustomerId = data?.customer_id;

      const updateData = {
        plan,
        subscription_status: "trialing",
        had_trial: true,
        trial_started_at: new Date().toISOString(),
        paddle_subscription_id: paddleSubId,
        paddle_customer_id: paddleCustomerId,
      };

      if (userId) {
        await supabase.from("users").update(updateData).eq("id", userId);
      } else if (customerEmail) {
        await supabase.from("users").update(updateData).eq("email", customerEmail);
      }
    }

    // Subscription canceled or paused — downgrade to free
    if (eventType === "subscription.canceled") {
      const paddleSubId = data?.id;
      // Check if there's a future scheduled end date
      // If canceled during trial or mid-period, keep access until period ends
      const scheduledChangeAt = data?.scheduled_change?.effective_at;
      const now = new Date();
      const endsInFuture = scheduledChangeAt && new Date(scheduledChangeAt) > now;

      if (endsInFuture) {
        // Keep plan active, just mark as canceled — access until period end
        await supabase.from("users").update({
          subscription_status: "canceled",
        }).eq("paddle_subscription_id", paddleSubId);
      } else {
        // Immediate cancellation — downgrade now
        await supabase.from("users").update({
          plan: "free",
          subscription_status: "canceled",
        }).eq("paddle_subscription_id", paddleSubId);
      }
    }

    if (eventType === "subscription.paused") {
      const paddleSubId = data?.id;
      await supabase.from("users").update({
        plan: "free",
        subscription_status: "paused",
      }).eq("paddle_subscription_id", paddleSubId);
    }

    // Subscription resumed
    if (eventType === "subscription.resumed") {
      const paddleSubId = data?.id;
      const priceId = data?.items?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId);
      await supabase.from("users").update({
        plan,
        subscription_status: "active",
      }).eq("paddle_subscription_id", paddleSubId);
    }

    // Transaction completed — payment confirmed
    if (eventType === "transaction.completed") {
      const userId = data?.custom_data?.userId;
      const customerEmail = data?.customer?.email;
      const priceId = data?.items?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId);
      const paddleCustomerId = data?.customer_id;
      const paddleSubId = data?.subscription_id;

      const updateData: Record<string, unknown> = {
        plan,
        subscription_status: "active",
      };
      if (paddleCustomerId) updateData.paddle_customer_id = paddleCustomerId;
      if (paddleSubId) updateData.paddle_subscription_id = paddleSubId;

      if (userId) {
        await supabase.from("users").update(updateData).eq("id", userId);
      } else if (customerEmail) {
        await supabase.from("users").update(updateData).eq("email", customerEmail);
      }
    }

  } catch (err) {
    console.error("Paddle webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}