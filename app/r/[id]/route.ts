import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://igbbfjushjmiafohvgdt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmJmanVzaGptaWFmb2h2Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTgxNDQsImV4cCI6MjA5MjYzNDE0NH0.xIvQiHWm4IVlkGSwgRK0Owyhhna5qz8HCGCtPL2JexI"
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    // Look up the QR code by short_id
    const { data: qrCode, error } = await supabase
      .from("qr_codes")
      .select("id, redirect_url, value, status, scans, clicks")
      .eq("short_id", id)
      .single();

    if (error || !qrCode) {
      // QR code not found - redirect to landing with error
      return NextResponse.redirect(
        new URL(`/?error=qr_not_found&id=${id}`, request.url)
      );
    }

    // Determine destination URL
    const destination = qrCode.redirect_url || qrCode.value;

    if (!destination) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Ensure URL has protocol
    const url = destination.startsWith("http")
      ? destination
      : `https://${destination}`;

    // Track scan asynchronously (don't await - don't slow down redirect)
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";

    // Fire and forget - increment scan count and log event
    Promise.all([
      supabase
        .from("qr_codes")
        .update({ scans: (qrCode.scans || 0) + 1 })
        .eq("id", qrCode.id),
      supabase
        .from("scan_events")
        .insert({
          qr_code_id: qrCode.id,
          user_agent: userAgent.substring(0, 500),
          referer: referer.substring(0, 500),
        }),
    ]).catch(() => {}); // Silently fail - never block the redirect

    // 302 redirect (not cached, so scan count stays accurate)
    return NextResponse.redirect(url, { status: 302 });

  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}