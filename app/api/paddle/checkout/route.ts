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
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Payments not configured." }, { status: 503 });
  }

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

    // Create a Paddle transaction to get a transaction ID
    // Then pass the transaction ID to Paddle.js for client-side completion
    const body: Record<string, unknown> = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      custom_data: { userId, plan, billing },
      checkout: {
        url: `${siteUrl}/dashboard?upgraded=1`,
      },
    };
    if (discountId) body.discount_id = discountId;

    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Paddle transaction:", response.status, JSON.stringify(data).slice(0, 300));

    const transactionId = data?.data?.id;
    const checkoutUrl = data?.data?.checkout?.url;

    if (transactionId) {
      // Return transaction ID — Paddle.js uses this to open checkout
      return NextResponse.json({
        transactionId,
        checkoutUrl,
        discountApplied: !!discountId,
      });
    }

    console.error("Paddle error:", JSON.stringify(data));
    return NextResponse.json({
      error: data?.error?.detail || "Could not create checkout session",
    }, { status: 500 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    console.error("Paddle checkout exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}