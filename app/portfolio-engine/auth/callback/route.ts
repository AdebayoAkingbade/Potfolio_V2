import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const redirectTo = next?.startsWith("/") ? next : "/portfolio-engine/create";
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/portfolio-engine/setup", requestUrl.origin));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  }

  return NextResponse.redirect(
    new URL("/portfolio-engine/sign-in?error=callback", requestUrl.origin),
  );
}
