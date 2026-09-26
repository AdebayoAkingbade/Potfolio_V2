import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { createSupabasePublicServerClient } from "@/lib/supabase/server";
import { checkDistributedRateLimit } from "@/lib/portfolio-engine/server/rate-limit";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const ALLOWED_EVENT_TYPES = new Set([
  "view",
  "click",
  "contact_click",
  "linkedin_click",
  "github_click",
  "cv_download",
  "project_view",
  "lead",
]);

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
    const url = new URL(value);
    return url.hostname.slice(0, 100);
  } catch {
    return "Direct";
  }
}

export async function POST(request: Request) {
  const supabase = createSupabasePublicServerClient();
  if (!supabase) return NextResponse.json({ tracked: false, reason: "backend-unconfigured" });

  const hash = visitorHash(request);

  // Distributed rate limit: max 60 events per minute per visitor
  const rateLimit = await checkDistributedRateLimit(
    supabase,
    hash,
    60,
    60 * 1000,
    "analytics_event",
  );

  if (!rateLimit.ok) {
    return NextResponse.json({ tracked: false, reason: "rate-limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const slug =
    body && typeof body === "object" && typeof body.slug === "string" ? body.slug.trim().slice(0, 100) : "";
  const rawEventType =
    body && typeof body === "object" && typeof body.eventType === "string"
      ? body.eventType.trim().toLowerCase()
      : "view";

  const eventType = ALLOWED_EVENT_TYPES.has(rawEventType) ? rawEventType : "view";
  const section =
    body && typeof body === "object" && typeof body.section === "string"
      ? body.section.trim().slice(0, 80)
      : null;
  const readSeconds =
    body && typeof body === "object" && typeof body.readSeconds === "number"
      ? Math.min(86400, Math.max(0, Math.round(body.readSeconds)))
      : null;

  if (!slug) {
    return NextResponse.json({ error: "Portfolio slug is required." }, { status: 400 });
  }

  const { data: publication, error: publicationError } = await supabase
    .from("portfolio_publications")
    .select("id, user_id, slug")
    .eq("slug", slug)
    .is("deleted_at", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (publicationError || !publication) {
    return NextResponse.json({ tracked: false, reason: "publication-not-found" });
  }

  const referrer = referrerHostname(request.headers.get("referer"));
  const rawUserAgent = request.headers.get("user-agent")?.slice(0, 200) ?? null;

  const { error } = await supabase.from("portfolio_analytics_events").insert({
    publication_id: publication.id,
    user_id: publication.user_id,
    slug: publication.slug,
    event_type: eventType,
    referrer,
    section,
    visitor_hash: hash,
    read_seconds: readSeconds,
    user_agent: rawUserAgent,
    metadata: {},
  });

  if (error) return NextResponse.json({ tracked: false, reason: "insert-failed" });
  return NextResponse.json({ tracked: true });
}
