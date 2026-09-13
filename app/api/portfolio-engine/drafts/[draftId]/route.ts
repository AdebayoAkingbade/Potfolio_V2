import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import {
  deleteDraftForUser,
  getDraftForUser,
  upsertDraftForUser,
} from "@/lib/portfolio-engine/server/repository";
import { coercePortfolioDraft } from "@/lib/portfolio-engine/validation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type DraftRouteContext = {
  params: Promise<{ draftId: string }>;
};

function errorResponse(message: string, status: number, details?: string[]) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(_request: Request, { params }: DraftRouteContext) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const { draftId } = await params;

  try {
    const draft = await getDraftForUser(auth.supabase, auth.user.id, draftId);
    if (!draft) return errorResponse("Draft not found.", 404);
    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load draft.";
    return errorResponse(message, 500);
  }
}

export async function PATCH(request: Request, { params }: DraftRouteContext) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const { draftId } = await params;
  const body = await request.json().catch(() => null);
  const draft = coercePortfolioDraft(
    body && typeof body === "object" && "draft" in body ? body.draft : body,
  );

  if (!draft || draft.id !== draftId) {
    return errorResponse("Invalid portfolio draft payload.", 400);
  }

  try {
    const savedDraft = await upsertDraftForUser(auth.supabase, auth.user.id, draft);
    return NextResponse.json({ draft: savedDraft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save draft.";
    return errorResponse(message, 500);
  }
}

export async function DELETE(_request: Request, { params }: DraftRouteContext) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const { draftId } = await params;

  try {
    const deleted = await deleteDraftForUser(auth.supabase, auth.user.id, draftId);
    if (!deleted) return errorResponse("Draft not found.", 404);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete draft.";
    return errorResponse(message, 500);
  }
}
