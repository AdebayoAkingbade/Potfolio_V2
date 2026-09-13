import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { upsertCustomDomainForDraft } from "@/lib/portfolio-engine/server/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function errorResponse(message: string, status: number, details?: string[]) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(request: Request) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const body = await request.json().catch(() => null);
  const draftId =
    body && typeof body === "object" && typeof body.draftId === "string" ? body.draftId : "";
  const hostname =
    body && typeof body === "object" && typeof body.hostname === "string" ? body.hostname : "";

  if (!draftId || !hostname) return errorResponse("Draft ID and domain are required.", 400);

  try {
    const result = await upsertCustomDomainForDraft(
      auth.supabase,
      auth.user.id,
      draftId,
      hostname,
    );

    if (!result.ok || !result.draft) {
      return errorResponse("Could not connect custom domain.", result.status, result.errors);
    }

    return NextResponse.json({
      draft: result.draft,
      domain: result.draft.customDomain,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not connect custom domain.";
    return errorResponse(message, 500);
  }
}
