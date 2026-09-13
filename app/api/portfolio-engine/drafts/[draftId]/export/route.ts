import { NextResponse } from "next/server";

import { renderPortfolioExportHtml } from "@/lib/portfolio-engine/export";
import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { getDraftForUser } from "@/lib/portfolio-engine/server/repository";
import { sanitizeDraft } from "@/lib/portfolio-engine/sanitize";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type ExportRouteContext = {
  params: Promise<{ draftId: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request, { params }: ExportRouteContext) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const { draftId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "html" ? "html" : "json";

  try {
    const draft = await getDraftForUser(auth.supabase, auth.user.id, draftId);
    if (!draft) return errorResponse("Draft not found.", 404);

    if (format === "html") {
      return new NextResponse(renderPortfolioExportHtml(draft), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${draft.slug || "portfolio"}.html"`,
        },
      });
    }

    return NextResponse.json(
      { draft: sanitizeDraft(draft), exportedAt: new Date().toISOString() },
      {
        headers: {
          "Content-Disposition": `attachment; filename="${draft.slug || "portfolio"}.json"`,
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not export draft.";
    return errorResponse(message, 500);
  }
}
