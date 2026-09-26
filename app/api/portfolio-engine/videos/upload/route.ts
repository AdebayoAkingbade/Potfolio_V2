import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { requireServerEntitlement } from "@/lib/portfolio-engine/server/entitlements";
import { authorizeDraftAction } from "@/lib/portfolio-engine/server/authorization";
import { ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from "@/lib/portfolio-engine/schema";
import { getRequestId, serverLogger } from "@/lib/portfolio-engine/server/logger";
import type { PortfolioVideoAsset } from "@/types/portfolio-engine";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const extensionsByMimeType: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

function safePathPart(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "draft";
  return value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80) || "draft";
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const startTime = Date.now();

  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) {
    serverLogger.warn("Unauthorized video upload attempt", {
      requestId,
      operation: "video_upload",
      status: auth.status,
      errorCode: "AUTH_REQUIRED",
    });
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  // 1. Authoritative server-side entitlement check for Pro video uploads
  const entitlementCheck = await requireServerEntitlement(auth.supabase, auth.user.id, "videoUploads");
  if (!entitlementCheck.ok) {
    serverLogger.warn("Video upload rejected due to missing entitlement", {
      requestId,
      operation: "video_upload",
      userId: auth.user.id,
      status: entitlementCheck.status,
      errorCode: "ENTITLEMENT_REQUIRED",
    });
    return NextResponse.json({ error: entitlementCheck.message }, { status: entitlementCheck.status });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid video upload payload." }, { status: 400 });
  }

  const draftId = safePathPart(formData.get("draftId"));
  const projectId = safePathPart(formData.get("projectId"));

  // 2. Authorize user to upload video to this draft
  const draftAuth = await authorizeDraftAction(auth.supabase, auth.user.id, draftId, "UPLOAD_VIDEO");
  if (!draftAuth.ok) {
    return NextResponse.json({ error: draftAuth.message }, { status: draftAuth.status });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Video file is required." }, { status: 400 });
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Video must be an MP4, WebM, or MOV file." }, { status: 415 });
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return NextResponse.json({ error: "Video uploads are limited to 25 MB." }, { status: 413 });
  }

  const extension = extensionsByMimeType[file.type] ?? "mp4";
  const pathname = `${auth.user.id}/${draftId}/${projectId}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await auth.supabase.storage
    .from("portfolio-videos")
    .upload(pathname, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    serverLogger.error("Storage error during video upload", {
      requestId,
      operation: "video_upload",
      userId: auth.user.id,
      status: 500,
      durationMs: Date.now() - startTime,
    }, error);
    return NextResponse.json({ error: `Could not upload video: ${error.message}` }, { status: 500 });
  }

  const { data: publicUrlData } = auth.supabase.storage
    .from("portfolio-videos")
    .getPublicUrl(data.path);

  const asset: PortfolioVideoAsset = {
    id: crypto.randomUUID(),
    name: file.name.slice(0, 100),
    mimeType: file.type,
    size: file.size,
    kind: "video",
    url: publicUrlData.publicUrl,
    pathname: data.path,
    storageProvider: "supabase",
  };

  serverLogger.info("Video upload successful", {
    requestId,
    operation: "video_upload",
    userId: auth.user.id,
    status: 200,
    durationMs: Date.now() - startTime,
    metadata: { sizeBytes: file.size, mimeType: file.type },
  });

  return NextResponse.json({ asset });
}
