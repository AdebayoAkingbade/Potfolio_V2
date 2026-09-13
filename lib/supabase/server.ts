import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env.configured) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; middleware and route handlers refresh them.
        }
      },
    },
  });
}

export function createSupabasePublicServerClient() {
  const env = getSupabasePublicEnv();
  if (!env.configured) return null;

  return createClient(env.url, env.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
