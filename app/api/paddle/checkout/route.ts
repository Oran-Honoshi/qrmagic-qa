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

const PADDLE_BASE = "https://api.paddle.com";

export async function POST(req: NextRequest) {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Payments not configured." }, { status: 503 });
  }

  try {
    const { plan, billing, userId, email, createdAt } = await req.json();

    const priceId = PRICE_IDS[plan]?.[billing];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or billing period" }, { status: 400 });
    }

    // Check if user is within 48-hour welcome discount window
    const isInDiscountWindow = createdAt
      ? (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000
      : false;

    const discountId = isInDiscountWindow
      ? process.env.PADDLE_DISCOUNT_ID
      : undefined;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sqrly.net";

    // Create Paddle transaction
    const body: Record<string, unknown> = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      custom_data: { userId, plan, billing },
      checkout: {
        url: `${siteUrl}/dashboard?upgraded=1`,
      },
    };

    if (discountId) {
      body.discount_id = discountId;
    }

    const response = await fetch(`${PADDLE_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paddle checkout error:", data);
      return NextResponse.json(
        { error: data?.error?.detail || "Checkout failed" },
        { status: 500 }
      );
    }

    const checkoutUrl = data?.data?.checkout?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
    }

    return NextResponse.json({
      url: checkoutUrl,
      discountApplied: !!discountId,
    });

  } catch (err: any) {
    console.error("Paddle checkout error:", err);
    return NextResponse.json({ error: err.message || "Checkout failed" }, { status: 500 });
  }
}