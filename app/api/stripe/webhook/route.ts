import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

export async function POST(req: NextRequest) {
  // Return 200 immediately if Stripe is not configured yet
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    console.warn("Stripe not configured — webhook skipped");
    return NextResponse.json({ received: true, status: "stripe_not_configured" });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  try {
    // Dynamic import so Stripe is never imported at build time
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret, { apiVersion: "2026-04-22.dahlia" as any });

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || "basic";
      if (userId) {
        await supabase.from("users").update({
          plan,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        }).eq("id", userId);
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as any;
      const customerId = invoice.customer;
      if (customerId) {
        const sub = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
        const plan = sub.data[0]?.metadata?.plan || "basic";
        await supabase.from("users").update({ plan }).eq("stripe_customer_id", customerId);
      }
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.paused"
    ) {
      const subscription = event.data.object as any;
      await supabase.from("users")
        .update({ plan: "free" })
        .eq("stripe_customer_id", subscription.customer);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}