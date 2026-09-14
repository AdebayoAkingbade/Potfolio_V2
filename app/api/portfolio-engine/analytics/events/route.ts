import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { createSupabasePublicServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function visitorHash(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const agent = request.headers.get("user-agent") ?? "";
  return createHash("sha256")
    .update(`${forwardedFor.split(",")[0]}:${agent}`)
    .digest("hex")
    .slice(0, 80);
}

function referrerHostname(value: string | null) {
  if (!value) return "Direct";
  try {
    return new URL(value).hostname;
  } catch {
    return "Direct";
  }
}

export async function POST(request: Request) {
  const supabase = createSupabasePublicServerClient();
  if (!supabase) return NextResponse.json({ tracked: false, reason: "backend-unconfigured" });

  const body = await request.json().catch(() => null);
  const slug =
    body && typeof body === "object" && typeof body.slug === "string" ? body.slug : "";
  const eventType =
    body && typeof body === "object" && typeof body.eventType === "string"
      ? body.eventType
      : "view";
  const section =
    body && typeof body === "object" && typeof body.section === "string"
      ? body.section.slice(0, 120)
      : null;
  const readSeconds =
    body && typeof body === "object" && typeof body.readSeconds === "number"
      ? Math.max(0, Math.round(body.readSeconds))
      : null;

  if (!slug) return errorResponse("Portfolio slug is required.", 400);

  const { data: publication, error: publicationError } = await supabase
    .from("portfolio_publications")
    .select("id,user_id,slug")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (publicationError || !publication) return NextResponse.json({ tracked: false });

  const referrer = referrerHostname(request.headers.get("referer"));

  const { error } = await supabase.from("portfolio_analytics_events").insert({
    publication_id: publication.id,
    user_id: publication.user_id,
    slug,
    event_type: eventType.slice(0, 40),
    referrer,
    section,
    visitor_hash: visitorHash(request),
    read_seconds: readSeconds,
    user_agent: request.headers.get("user-agent"),
    metadata: {},
  });

  if (error) return NextResponse.json({ tracked: false });
  return NextResponse.json({ tracked: true });
}
