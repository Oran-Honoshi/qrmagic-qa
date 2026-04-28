import { NextRequest, NextResponse } from "next/server";

// Stripe price IDs - set these in Vercel environment variables
const PRICE_IDS: Record<string, string> = {
  basic_monthly:  process.env.STRIPE_PRICE_BASIC_MONTHLY  || "",
  basic_annual:   process.env.STRIPE_PRICE_BASIC_ANNUAL   || "",
  plus_monthly:   process.env.STRIPE_PRICE_PLUS_MONTHLY   || "",
  plus_annual:    process.env.STRIPE_PRICE_PLUS_ANNUAL    || "",
};

export async function POST(request: NextRequest) {
  try {
    const { plan, billing, userId, email } = await request.json();

    const priceKey = `${plan}_${billing}`;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid plan or Stripe not configured yet. Price key: ${priceKey}` },
        { status: 400 }
      );
    }

    // Dynamic import of Stripe to avoid SSR issues
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-04-22.dahlia",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/dashboard?upgraded=true`,
      cancel_url:  `${request.nextUrl.origin}/#pricing`,
      client_reference_id: userId,
      customer_email: email,
      metadata: { userId, plan, billing },
      subscription_data: {
        metadata: { userId, plan },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}