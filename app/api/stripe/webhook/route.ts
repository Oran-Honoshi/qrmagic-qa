import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

// Map Stripe price IDs to plan names
function getPlanFromPriceId(priceId: string): string {
  const basicPrices = [
    process.env.STRIPE_PRICE_BASIC_MONTHLY,
    process.env.STRIPE_PRICE_BASIC_ANNUAL,
  ];
  const plusPrices = [
    process.env.STRIPE_PRICE_PLUS_MONTHLY,
    process.env.STRIPE_PRICE_PLUS_ANNUAL,
  ];
  if (basicPrices.includes(priceId)) return "basic";
  if (plusPrices.includes(priceId)) return "plus";
  return "free";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event;
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-04-22.dahlia",
    });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // Payment succeeded — upgrade the user
      case "checkout.session.completed": {
        const session = event.data.object as {
          client_reference_id?: string;
          subscription?: string;
          metadata?: Record<string, string>;
        };
        const userId = session.client_reference_id ||
                       session.metadata?.userId;
        const plan = session.metadata?.plan || "basic";

        if (userId) {
          await supabase.from("users")
            .update({
              plan,
              stripe_subscription_id: session.subscription || null,
            })
            .eq("id", userId);
          console.log(`Upgraded user ${userId} to ${plan}`);
        }
        break;
      }

      // Subscription renewed — keep plan active
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as {
          subscription?: string;
          subscription_details?: { metadata?: Record<string, string> };
          lines?: { data?: Array<{ price?: { id?: string } }> };
        };
        const subId = invoice.subscription;
        const userId = invoice.subscription_details?.metadata?.userId;
        const priceId = invoice.lines?.data?.[0]?.price?.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : "basic";

        if (userId) {
          await supabase.from("users")
            .update({ plan })
            .eq("id", userId);
        } else if (subId) {
          // Fallback: find by subscription ID
          await supabase.from("users")
            .update({ plan })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }

      // Subscription cancelled or payment failed — downgrade to free
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const obj = event.data.object as {
          id?: string;
          metadata?: Record<string, string>;
        };
        const userId = obj.metadata?.userId;
        const subId = obj.id;

        if (userId) {
          await supabase.from("users")
            .update({ plan: "free" })
            .eq("id", userId);
        } else if (subId) {
          await supabase.from("users")
            .update({ plan: "free" })
            .eq("stripe_subscription_id", subId);
        }
        console.log(`Downgraded user to free — sub: ${subId}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Stripe requires raw body — disable body parsing
export const config = {
  api: { bodyParser: false },
};