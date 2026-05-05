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
    const { plan, billing, createdAt } = await req.json();

    const priceId = PRICE_IDS[plan]?.[billing];
    if (!priceId) {
      return NextResponse.json({ error: `Invalid plan "${plan}" / billing "${billing}"` }, { status: 400 });
    }

    // Check 48h welcome discount
    const isInDiscountWindow = createdAt
      ? (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000
      : false;
    const discountId = isInDiscountWindow ? (process.env.PADDLE_DISCOUNT_ID || null) : null;

    // Return just what Paddle.js needs — no server-side transaction
    // Paddle.js will handle the full checkout client-side
    return NextResponse.json({ priceId, discountId });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}