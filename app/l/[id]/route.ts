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
  if (!id) return NextResponse.redirect(new URL("/", request.url));

  const { data } = await supabase
    .from("multilink_pages")
    .select("*")
    .eq("short_id", id)
    .single();

  if (!data) return NextResponse.redirect(new URL("/?error=not_found", request.url));

  // Increment scans
  supabase.from("multilink_pages")
    .update({ scans: (data.scans || 0) + 1 })
    .eq("id", data.id)
    .then(() => {});

  // Render hosted multi-link page
  const links: Array<{ label: string; url: string }> = data.links || [];
  const color = data.color || "#00D4FF";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.title || "My Links"} · Sqrly</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: white; border: 1px solid #E2E8F0; border-radius: 24px; padding: 32px 24px; max-width: 400px; width: 100%; box-shadow: 0 8px 32px rgba(15,23,42,0.08); text-align: center; }
    h1 { font-size: 22px; font-weight: 900; color: #0F172A; margin-bottom: 6px; }
    .sub { font-size: 13px; color: #94A3B8; margin-bottom: 28px; }
    .links { display: flex; flex-direction: column; gap: 12px; }
    a { display: flex; align-items: center; justify-content: center; padding: 14px 20px; background: white; border: 1px solid #E2E8F0; border-radius: 14px; font-size: 14px; font-weight: 600; color: #0F172A; text-decoration: none; transition: all 0.2s; }
    a:hover { border-color: ${color}; color: ${color}; box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-1px); }
    .footer { margin-top: 24px; font-size: 10px; color: #CBD5E1; }
    .footer a { color: #00D4FF; border: none; padding: 0; font-size: 10px; background: none; font-weight: 400; box-shadow: none; transform: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${data.title || "My Links"}</h1>
    <p class="sub">Powered by Sqrly</p>
    <div class="links">
      ${links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join("")}
    </div>
    <p class="footer">Create your own at <a href="https://sqrly.net">Sqrly</a></p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}