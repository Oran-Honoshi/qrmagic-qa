import { NextRequest, NextResponse } from "next/server";

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
    const { plan, billing, userId, email, createdAt } = await req.json();

    const priceId = PRICE_IDS[plan]?.[billing];
    if (!priceId) {
      return NextResponse.json({ error: `Invalid plan "${plan}" / billing "${billing}"` }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sqrly.net";

    // 48h welcome discount
    const isInDiscountWindow = createdAt
      ? (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000
      : false;
    const discountId = isInDiscountWindow ? process.env.PADDLE_DISCOUNT_ID : undefined;

    // Return data for Paddle.js client-side checkout
    // Paddle.js opens an overlay — no server redirect needed
    return NextResponse.json({
      priceId,
      email,
      userId,
      discountId: discountId || null,
      clientToken: process.env.PADDLE_CLIENT_TOKEN,
      successUrl: `${siteUrl}/dashboard?upgraded=1`,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}