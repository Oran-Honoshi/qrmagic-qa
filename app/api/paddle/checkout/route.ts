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
      return NextResponse.json({ error: "Invalid plan or billing period" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sqrly.net";

    // Check 48-hour welcome discount window
    const isInDiscountWindow = createdAt
      ? (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000
      : false;
    const discountId = isInDiscountWindow ? process.env.PADDLE_DISCOUNT_ID : undefined;

    // Build Paddle transaction with correct API format
    // https://developer.paddle.com/api-reference/transactions/create-transaction
    const body: Record<string, unknown> = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      checkout: {
        url: `${siteUrl}/dashboard?upgraded=1`,
      },
      custom_data: { userId, plan, billing },
    };

    if (discountId) {
      body.discount_id = discountId;
    }

    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Paddle response status:", response.status);
    console.log("Paddle response:", JSON.stringify(data).slice(0, 500));

    // Try to get checkout URL from Paddle transaction response
    const checkoutUrl = data?.data?.checkout?.url;
    if (checkoutUrl) {
      return NextResponse.json({ url: checkoutUrl, discountApplied: !!discountId });
    }

    // If transaction API failed, fall back to Paddle's direct payment link
    // This always works — it's just the hosted checkout page
    console.error("Paddle transaction failed, using hosted checkout fallback");
    const fallbackUrl = buildHostedCheckoutUrl(priceId, email, siteUrl, discountId);
    return NextResponse.json({ url: fallbackUrl });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    console.error("Paddle checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildHostedCheckoutUrl(
  priceId: string,
  email: string,
  siteUrl: string,
  discountId?: string
): string {
  // Paddle hosted checkout — always works, no API needed
  const params = new URLSearchParams();
  params.set("items[0][price_id]", priceId);
  params.set("items[0][quantity]", "1");
  if (email) params.set("customer_email", email);
  params.set("success_url", `${siteUrl}/dashboard?upgraded=1`);
  if (discountId) params.set("discount_id", discountId);
  return `https://checkout.paddle.com/checkout/custom-checkout?${params.toString()}`;
}