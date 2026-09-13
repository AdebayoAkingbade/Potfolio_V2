import { NextResponse } from "next/server";

import { importResumeTextIntoDraft } from "@/lib/portfolio-engine/importers";
import { coercePortfolioDraft } from "@/lib/portfolio-engine/validation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let text = "";
  let draftPayload: unknown = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);
    if (!formData) return errorResponse("Invalid resume import payload.", 400);
    const file = formData.get("file");
    const draftValue = formData.get("draft");
    text =
      file instanceof File
        ? await file.text()
        : typeof formData.get("text") === "string"
          ? String(formData.get("text"))
          : "";
    if (typeof draftValue === "string") {
      try {
        draftPayload = JSON.parse(draftValue) as unknown;
      } catch {
        draftPayload = null;
      }
    }
  } else {
    const body = await request.json().catch(() => null);
    text = body && typeof body === "object" && typeof body.text === "string" ? body.text : "";
    draftPayload = body && typeof body === "object" && "draft" in body ? body.draft : null;
  }

  const draft = coercePortfolioDraft(draftPayload);
  if (!draft) return errorResponse("Invalid portfolio draft payload.", 400);
  if (!text.trim()) return errorResponse("Paste resume text or upload a text resume.", 400);
  if (text.length > 120_000) return errorResponse("Resume import is limited to 120 KB.", 413);

  return NextResponse.json({
    draft: importResumeTextIntoDraft(text, draft),
  });
}
