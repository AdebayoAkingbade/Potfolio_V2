import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/portfolio-engine/create/:path*",
    "/portfolio-engine/preview/:path*",
    "/portfolio-engine/auth/:path*",
    "/api/portfolio-engine/:path*",
  ],
};
