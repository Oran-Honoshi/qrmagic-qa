import { NextRequest, NextResponse } from "next/server";

const PRICE_IDS: Record<string, Record<string, string>> = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || "",
    annual:  process.env.STRIPE_PRICE_BASIC_ANNUAL  || "",
  },
  plus: {
    monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY || "",
    annual:  process.env.STRIPE_PRICE_PLUS_ANNUAL  || "",
  },
};

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please contact us at office@honoshi.co.il" },
      { status: 503 }
    );
  }

  try {
    const { plan, billing, userId, email } = await req.json();

    const priceId = PRICE_IDS[plan]?.[billing];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or billing period" }, { status: 400 });
    }

    // Dynamic import so Stripe is never imported at build time
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-04-30" as any });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sqrly.net"}/dashboard?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sqrly.net"}/pricing`,
      customer_email: email,
      metadata: { userId, plan, billing },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message || "Checkout failed" }, { status: 500 });
  }
}