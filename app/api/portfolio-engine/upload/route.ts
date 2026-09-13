import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/portfolio-engine/schema";
import type { PortfolioAsset } from "@/types/portfolio-engine";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const extensionsByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
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
  if (!formData) return errorResponse("Invalid upload payload.", 400);

  const file = formData.get("file");
  if (!(file instanceof File)) return errorResponse("Profile photo is required.", 400);

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return errorResponse("Profile photo must be a JPG, PNG, or WebP image.", 415);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return errorResponse("Profile photo must be 1 MB or smaller.", 413);
  }

  const extension = extensionsByMimeType[file.type];
  const draftId = safePathPart(formData.get("draftId"));
  const pathname = `${auth.user.id}/${draftId}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await auth.supabase.storage
    .from("portfolio-assets")
    .upload(pathname, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) return errorResponse(`Could not upload profile photo: ${error.message}`, 500);

  const { data: publicUrlData } = auth.supabase.storage
    .from("portfolio-assets")
    .getPublicUrl(data.path);

  const asset: PortfolioAsset = {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type,
    size: file.size,
    url: publicUrlData.publicUrl,
    pathname: data.path,
    storageProvider: "supabase",
  };

  return NextResponse.json({ asset });
}
