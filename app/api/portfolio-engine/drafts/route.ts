import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import {
  getActiveDraftForUser,
  upsertDraftForUser,
} from "@/lib/portfolio-engine/server/repository";
import { coercePortfolioDraft } from "@/lib/portfolio-engine/validation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function errorResponse(message: string, status: number, details?: string[]) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET() {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  try {
    const draft = await getActiveDraftForUser(auth.supabase, auth.user.id);
    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load draft.";
    return errorResponse(message, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const body = await request.json().catch(() => null);
  const draft = coercePortfolioDraft(
    body && typeof body === "object" && "draft" in body ? body.draft : body,
  );

  if (!draft) return errorResponse("Invalid portfolio draft payload.", 400);

  try {
    const savedDraft = await upsertDraftForUser(auth.supabase, auth.user.id, draft);
    return NextResponse.json({ draft: savedDraft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save draft.";
    return errorResponse(message, 500);
  }
}
