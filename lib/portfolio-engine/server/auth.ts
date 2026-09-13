import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PortfolioEngineAuthState =
  | {
      configured: false;
      supabase: null;
      user: null;
    }
  | {
      configured: true;
      supabase: SupabaseClient;
      user: User | null;
    };

export async function getPortfolioEngineAuth(): Promise<PortfolioEngineAuthState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      configured: false,
      supabase: null,
      user: null,
    };
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return {
      configured: true,
      supabase,
      user: null,
    };
  }

  return {
    configured: true,
    supabase,
    user: data.user,
  };
}

export async function requirePortfolioEngineUser() {
  const auth = await getPortfolioEngineAuth();

  if (!auth.configured) {
    return {
      ok: false as const,
      status: 503,
      message: "Portfolio Engine backend is not configured.",
    };
  }

  if (!auth.user) {
    return {
      ok: false as const,
      status: 401,
      message: "Sign in to continue.",
    };
  }

  return {
    ok: true as const,
    supabase: auth.supabase,
    user: auth.user,
  };
}
