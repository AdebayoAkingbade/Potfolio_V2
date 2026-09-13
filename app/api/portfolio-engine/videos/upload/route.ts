import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/portfolio-engine/schema";
import type { PortfolioVideoAsset } from "@/types/portfolio-engine";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const extensionsByMimeType: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function safePathPart(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "draft";
  return value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80) || "draft";
}

export async function POST(request: Request) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const formData = await request.formData().catch(() => null);
  if (!formData) return errorResponse("Invalid video upload payload.", 400);

  const file = formData.get("file");
  if (!(file instanceof File)) return errorResponse("Video file is required.", 400);

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return errorResponse("Video must be an MP4, WebM, or MOV file.", 415);
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return errorResponse("Video uploads are limited to 25 MB.", 413);
  }

  const extension = extensionsByMimeType[file.type];
  const draftId = safePathPart(formData.get("draftId"));
  const projectId = safePathPart(formData.get("projectId"));
  const pathname = `${auth.user.id}/${draftId}/${projectId}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await auth.supabase.storage
    .from("portfolio-videos")
    .upload(pathname, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) return errorResponse(`Could not upload video: ${error.message}`, 500);

  const { data: publicUrlData } = auth.supabase.storage
    .from("portfolio-videos")
    .getPublicUrl(data.path);

  const asset: PortfolioVideoAsset = {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type,
    size: file.size,
    kind: "video",
    url: publicUrlData.publicUrl,
    pathname: data.path,
    storageProvider: "supabase",
  };

  return NextResponse.json({ asset });
}
