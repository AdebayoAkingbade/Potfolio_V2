import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { publishDraftForUser } from "@/lib/portfolio-engine/server/repository";
import { publishedPortfolioPath } from "@/lib/portfolio-engine/cache";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PublishRouteContext = {
  params: Promise<{ draftId: string }>;
};

function errorResponse(message: string, status: number, details?: string[]) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(_request: Request, { params }: PublishRouteContext) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const { draftId } = await params;

  try {
    const result = await publishDraftForUser(auth.supabase, auth.user.id, draftId);

    if (!result.ok || !result.publication) {
      return errorResponse("Portfolio is not ready to publish.", result.status, result.errors);
    }

    return NextResponse.json({
      publication: result.publication,
      url: publishedPortfolioPath(result.publication.slug),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not publish portfolio.";
    return errorResponse(message, 500);
  }
}
