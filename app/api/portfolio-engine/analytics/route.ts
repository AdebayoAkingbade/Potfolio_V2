import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { getAnalyticsSummaryForUser } from "@/lib/portfolio-engine/server/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  try {
    return NextResponse.json(await getAnalyticsSummaryForUser(auth.supabase, auth.user.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load analytics.";
    return errorResponse(message, 500);
  }
}
