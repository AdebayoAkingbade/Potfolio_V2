import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { deletePublishedPortfolioForUser } from "@/lib/portfolio-engine/server/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PublicationRouteContext = {
  params: Promise<{ slug: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(_request: Request, { params }: PublicationRouteContext) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const { slug } = await params;

  try {
    const deleted = await deletePublishedPortfolioForUser(auth.supabase, auth.user.id, slug);
    if (!deleted) return errorResponse("Published portfolio not found.", 404);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete published portfolio.";
    return errorResponse(message, 500);
  }
}
