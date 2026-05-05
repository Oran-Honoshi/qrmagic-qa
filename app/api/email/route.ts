// app/api/email/route.ts
import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Sqrly <noreply@sqrly.net>";

type EmailType = "welcome" | "password_reset" | "trial_ending";

interface EmailPayload {
  type: EmailType;
  to: string;
  name?: string;
  resetLink?: string;
  daysLeft?: number;
}

function getWelcomeHtml(name: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:linear-gradient(135deg,#0F172A 0%,#1E293B 100%);padding:40px 40px 32px;text-align:center;">
    <h1 style="color:#00FF88;font-size:28px;font-weight:900;margin:0;letter-spacing:-0.5px;">Sqrly</h1>
    <p style="color:#94A3B8;font-size:13px;margin:8px 0 0;">QR Code Generator</p>
  </div>
  <div style="padding:40px;">
    <h2 style="color:#0F172A;font-size:22px;font-weight:800;margin:0 0 12px;">Welcome${name ? `, ${name}` : ""}! 👋</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">Your free Sqrly account is ready. Start creating beautiful QR codes that work for your business.</p>
    <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:0 0 28px;">
      <p style="color:#0F172A;font-weight:700;font-size:13px;margin:0 0 12px;">Your free plan includes:</p>
      <ul style="color:#475569;font-size:13px;line-height:2;margin:0;padding-left:20px;">
        <li>50 static QR codes</li>
        <li>1 dynamic QR code (editable anytime)</li>
        <li>Custom colors &amp; logo overlay</li>
        <li>PNG, SVG &amp; PDF export</li>
      </ul>
    </div>
    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px;margin:0 0 28px;">
      <p style="color:#92400E;font-size:13px;font-weight:700;margin:0 0 4px;">🎉 Welcome offer — 25% off</p>
      <p style="color:#78350F;font-size:12px;margin:0;">Use code <strong>LAUNCH48</strong> within 48 hours of signup for 25% off your first payment.</p>
    </div>
    <a href="https://sqrly.net/dashboard" style="display:block;background:#00FF88;color:#0F172A;font-weight:800;font-size:15px;text-align:center;padding:16px;border-radius:12px;text-decoration:none;">Create Your First QR Code →</a>
  </div>
  <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
    <p style="color:#94A3B8;font-size:12px;margin:0;">© 2026 Sqrly · <a href="https://sqrly.net" style="color:#94A3B8;">sqrly.net</a></p>
  </div>
</div>
</body></html>`;
}

function getPasswordResetHtml(resetLink: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:linear-gradient(135deg,#0F172A 0%,#1E293B 100%);padding:40px 40px 32px;text-align:center;">
    <h1 style="color:#00FF88;font-size:28px;font-weight:900;margin:0;">Sqrly</h1>
  </div>
  <div style="padding:40px;">
    <h2 style="color:#0F172A;font-size:22px;font-weight:800;margin:0 0 12px;">Reset your password</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 28px;">Click the button below to set a new password. This link expires in 1 hour.</p>
    <a href="${resetLink}" style="display:block;background:#00FF88;color:#0F172A;font-weight:800;font-size:15px;text-align:center;padding:16px;border-radius:12px;text-decoration:none;margin:0 0 24px;">Reset Password →</a>
    <p style="color:#94A3B8;font-size:12px;text-align:center;margin:0;">If you didn't request this, you can safely ignore this email.</p>
  </div>
  <div style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
    <p style="color:#94A3B8;font-size:12px;margin:0;">© 2026 Sqrly · <a href="https://sqrly.net" style="color:#94A3B8;">sqrly.net</a></p>
  </div>
</div>
</body></html>`;
}

export async function POST(req: NextRequest) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "Email not configured" }, { status: 503 });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { type, to, name, resetLink } = payload;

    let subject = "";
    let html = "";

    if (type === "welcome") {
      subject = "Welcome to Sqrly 🎉";
      html = getWelcomeHtml(name || "");
    } else if (type === "password_reset") {
      if (!resetLink) return NextResponse.json({ error: "resetLink required" }, { status: 400 });
      subject = "Reset your Sqrly password";
      html = getPasswordResetHtml(resetLink);
    } else {
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return NextResponse.json({ error: data.message || "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}