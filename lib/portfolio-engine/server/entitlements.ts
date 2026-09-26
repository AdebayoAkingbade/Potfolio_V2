import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getPortfolioEntitlements,
  type PortfolioFeature,
} from "@/lib/portfolio-engine/entitlements";
import type { PortfolioPlan } from "@/types/portfolio-engine";

export type PortfolioAccountRecord = {
  user_id: string;
  plan: PortfolioPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status?: string | null;
  ai_credits_used: number;
  ai_credits_reset_at: string | null;
  team_name: string | null;
  agency_seats: number;
  created_at: string;
  updated_at: string;
};

const VALID_PRO_STATUSES = new Set(["active", "trialing"]);

export async function getUserAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<PortfolioAccountRecord | null> {
  const { data, error } = await supabase
    .from("portfolio_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    plan: data.plan === "pro" ? "pro" : "free",
  } as PortfolioAccountRecord;
}

export async function getAuthoritativePlanForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<PortfolioPlan> {
  const account = await getUserAccount(supabase, userId);
  if (!account) return "free";

  if (account.plan !== "pro") return "free";

  // If subscription_status is tracked, require it to be active or trialing
  if (account.subscription_status && !VALID_PRO_STATUSES.has(account.subscription_status)) {
    return "free";
  }

  return "pro";
}

export async function hasServerEntitlement(
  supabase: SupabaseClient,
  userId: string,
  feature: PortfolioFeature,
): Promise<boolean> {
  const plan = await getAuthoritativePlanForUser(supabase, userId);
  return getPortfolioEntitlements(plan)[feature] === true;
}

export async function requireServerEntitlement(
  supabase: SupabaseClient,
  userId: string,
  feature: PortfolioFeature,
): Promise<{ ok: true; plan: PortfolioPlan } | { ok: false; status: 403; message: string }> {
  const plan = await getAuthoritativePlanForUser(supabase, userId);
  const entitled = getPortfolioEntitlements(plan)[feature] === true;

  if (!entitled) {
    return {
      ok: false,
      status: 403,
      message: `Feature '${feature}' requires an active Pro subscription.`,
    };
  }

  return { ok: true, plan };
}
