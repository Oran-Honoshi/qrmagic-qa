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

    // Create transaction via Paddle API
    const body: Record<string, unknown> = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      checkout: {
        url: `${siteUrl}/dashboard?upgraded=1`,
      },
      custom_data: { userId, plan, billing },
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

    // Log full response for debugging
    console.log("Paddle status:", response.status);
    console.log("Paddle data:", JSON.stringify(data).slice(0, 1000));

    const checkoutUrl = data?.data?.checkout?.url;
    if (checkoutUrl) {
      return NextResponse.json({ url: checkoutUrl, discountApplied: !!discountId });
    }

    // Log why we're falling back
    const errDetail = data?.error?.detail || data?.error?.code || JSON.stringify(data).slice(0, 200);
    console.error("No checkout URL from Paddle, error:", errDetail);

    // Fallback: Paddle Pay Link (always works)
    // Format: https://buy.paddle.com/product/{price_id}
    const payLinkUrl = `https://buy.paddle.com/product/${priceId}?quantity=1&email=${encodeURIComponent(email || "")}${discountId ? `&coupon=${discountId}` : ""}`;
    return NextResponse.json({ url: payLinkUrl, fallback: true, paddleError: errDetail });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    console.error("Paddle checkout exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}