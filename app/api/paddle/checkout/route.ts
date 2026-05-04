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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sqrly.net";

    // Check 48-hour welcome discount window
    const isInDiscountWindow = createdAt
      ? (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000
      : false;
    const discountId = isInDiscountWindow ? process.env.PADDLE_DISCOUNT_ID : undefined;

    // Use Paddle's hosted checkout via payment link approach
    // Build checkout URL with price ID directly
    const checkoutParams = new URLSearchParams({
      "items[0][price_id]": priceId,
      "items[0][quantity]": "1",
      "customer_email": email || "",
      "success_url": `${siteUrl}/dashboard?upgraded=1`,
      "custom_data[userId]": userId || "",
      "custom_data[plan]": plan,
      "custom_data[billing]": billing,
    });

    if (discountId) {
      checkoutParams.set("discount_id", discountId);
    }

    // Try Paddle's transaction API first (server-side)
    const body: Record<string, unknown> = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer_email: email,
      custom_data: { userId, plan, billing },
      success_url: `${siteUrl}/dashboard?upgraded=1`,
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
      console.error("Paddle transaction error:", JSON.stringify(data));

      // Fallback: return a hosted checkout URL directly
      const hostedUrl = `https://buy.paddle.com/product/${priceId}?customer_email=${encodeURIComponent(email || "")}&success_url=${encodeURIComponent(`${siteUrl}/dashboard?upgraded=1`)}`;
      return NextResponse.json({ url: hostedUrl });
    }

    // Get checkout URL from response
    const checkoutUrl = data?.data?.checkout?.url;
    if (!checkoutUrl) {
      // Fallback to Paddle hosted checkout
      const hostedUrl = `https://checkout.paddle.com/checkout/product/${priceId}?success_url=${encodeURIComponent(`${siteUrl}/dashboard?upgraded=1`)}`;
      return NextResponse.json({ url: hostedUrl });
    }

    return NextResponse.json({
      url: checkoutUrl,
      discountApplied: !!discountId,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    console.error("Paddle checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}