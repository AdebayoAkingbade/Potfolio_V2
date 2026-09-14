import { NextResponse } from "next/server";

import { importResumeTextIntoDraft } from "@/lib/portfolio-engine/importers";
import {
  extractResumeText,
  MAX_RESUME_TEXT_LENGTH,
} from "@/lib/portfolio-engine/server/resume-documents";
import { coercePortfolioDraft } from "@/lib/portfolio-engine/validation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

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
    if (file instanceof File) {
      try {
        text = await extractResumeText(file);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not read that resume.";
        return errorResponse(message, message.includes("limited") ? 413 : 415);
      }
    } else {
      text = typeof formData.get("text") === "string" ? String(formData.get("text")) : "";
    }
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
  if (!text.trim()) return errorResponse("Paste resume text or upload a resume.", 400);
  if (text.length > MAX_RESUME_TEXT_LENGTH) {
    return errorResponse("Resume import is limited to 120 KB of extracted text.", 413);
  }

  return NextResponse.json({
    draft: importResumeTextIntoDraft(text, draft),
  });
}
