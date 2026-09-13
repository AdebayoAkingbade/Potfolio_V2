import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { cloneDraftForUser } from "@/lib/portfolio-engine/server/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type CloneRouteContext = {
  params: Promise<{ draftId: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(_request: Request, { params }: CloneRouteContext) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const { draftId } = await params;

  try {
    const draft = await cloneDraftForUser(auth.supabase, auth.user.id, draftId);
    if (!draft) return errorResponse("Draft not found.", 404);
    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not clone draft.";
    return errorResponse(message, 500);
  }
}
