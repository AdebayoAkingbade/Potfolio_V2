import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { acceptTeamInvitation } from "@/lib/portfolio-engine/server/repository";
import { getRequestId, serverLogger } from "@/lib/portfolio-engine/server/logger";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const userEmail = auth.user.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Authenticated user email is missing." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const inviteId =
    body && typeof body === "object" && typeof body.inviteId === "string" ? body.inviteId.trim() : "";

  if (!inviteId) {
    return NextResponse.json({ error: "Invite ID is required." }, { status: 400 });
  }

  try {
    const result = await acceptTeamInvitation(auth.supabase, auth.user.id, userEmail, inviteId);

    if (!result.ok) {
      serverLogger.warn("Team invitation acceptance failed", {
        requestId,
        operation: "team_accept",
        userId: auth.user.id,
        status: result.status,
        errorCode: "FORBIDDEN",
      });
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    serverLogger.info("Team invitation accepted successfully", {
      requestId,
      operation: "team_accept",
      userId: auth.user.id,
      status: 200,
      metadata: { draftId: result.draftId },
    });

    return NextResponse.json({ success: true, draftId: result.draftId });
  } catch (error) {
    serverLogger.error("Error accepting team invitation", {
      requestId,
      operation: "team_accept",
      userId: auth.user.id,
      status: 500,
      errorCode: "INTERNAL_ERROR",
    }, error);
    return NextResponse.json({ error: "Could not accept invitation." }, { status: 500 });
  }
}
