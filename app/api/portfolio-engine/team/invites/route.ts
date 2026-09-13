import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { inviteTeamMemberForDraft } from "@/lib/portfolio-engine/server/repository";
import type { PortfolioTeamRole } from "@/types/portfolio-engine";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function errorResponse(message: string, status: number, details?: string[]) {
  return NextResponse.json({ error: message, details }, { status });
}

function isRole(value: unknown): value is PortfolioTeamRole {
  return value === "admin" || value === "editor" || value === "viewer";
}

export async function POST(request: Request) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const body = await request.json().catch(() => null);
  const draftId =
    body && typeof body === "object" && typeof body.draftId === "string" ? body.draftId : "";
  const email =
    body && typeof body === "object" && typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";
  const role = body && typeof body === "object" && isRole(body.role) ? body.role : "editor";

  if (!draftId) return errorResponse("Draft ID is required.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse("Enter a valid teammate email.", 400);
  }

  try {
    const result = await inviteTeamMemberForDraft(auth.supabase, auth.user.id, draftId, email, role);

    if (!result.ok || !result.draft) {
      return errorResponse("Could not invite teammate.", result.status, result.errors);
    }

    return NextResponse.json({ draft: result.draft, team: result.draft.team });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not invite teammate.";
    return errorResponse(message, 500);
  }
}
