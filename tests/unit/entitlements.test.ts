import { describe, it, expect } from "vitest";
import {
  coercePortfolioPlan,
  getPortfolioEntitlements,
  hasPortfolioFeature,
} from "@/lib/portfolio-engine/entitlements";
import {
  requireServerEntitlement,
  hasServerEntitlement,
} from "@/lib/portfolio-engine/server/entitlements";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Plan Security & Coercion", () => {
  it("coerces 'pro' strictly to 'pro'", () => {
    expect(coercePortfolioPlan("pro")).toBe("pro");
  });

  it("fails closed to 'free' for unknown, falsy, or elevated plan attempts", () => {
    expect(coercePortfolioPlan("free")).toBe("free");
    expect(coercePortfolioPlan(undefined)).toBe("free");
    expect(coercePortfolioPlan(null)).toBe("free");
    expect(coercePortfolioPlan("enterprise")).toBe("free");
    expect(coercePortfolioPlan("admin")).toBe("free");
    expect(coercePortfolioPlan("PRO")).toBe("free");
    expect(coercePortfolioPlan("")).toBe("free");
    expect(coercePortfolioPlan({})).toBe("free");
    expect(coercePortfolioPlan([])).toBe("free");
    expect(coercePortfolioPlan(true)).toBe("free");
    expect(coercePortfolioPlan(false)).toBe("free");
  });

  it("correctly partitions feature entitlements between Free and Pro", () => {
    const free = getPortfolioEntitlements("free");
    const pro = getPortfolioEntitlements("pro");

    expect(free.customDomains).toBe(false);
    expect(free.videoUploads).toBe(false);
    expect(free.teamSeats).toBe(false);
    expect(free.premiumTemplates).toBe(false);

    expect(pro.customDomains).toBe(true);
    expect(pro.videoUploads).toBe(true);
    expect(pro.teamSeats).toBe(true);
    expect(pro.premiumTemplates).toBe(true);
  });

  it("hasPortfolioFeature respects plan boundaries", () => {
    expect(hasPortfolioFeature("free", "videoUploads")).toBe(false);
    expect(hasPortfolioFeature("pro", "videoUploads")).toBe(true);
    expect(hasPortfolioFeature({ plan: "free" }, "customDomains")).toBe(false);
    expect(hasPortfolioFeature({ plan: "pro" }, "customDomains")).toBe(true);
  });

  it("server entitlement check rejects free tier users for Pro capabilities", async () => {
    const mockSupabaseFree = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-123", plan: "free", subscription_status: null },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const result = await requireServerEntitlement(mockSupabaseFree, "user-123", "videoUploads");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it("server entitlement check permits active Pro subscribers", async () => {
    const mockSupabasePro = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-456", plan: "pro", subscription_status: "active" },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const result = await requireServerEntitlement(mockSupabasePro, "user-456", "videoUploads");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan).toBe("pro");
    }
  });

  it("server entitlement check downgrades past_due/canceled subscriptions to Free", async () => {
    const mockSupabaseCanceled = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-789", plan: "pro", subscription_status: "canceled" },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const isEntitled = await hasServerEntitlement(mockSupabaseCanceled, "user-789", "customDomains");
    expect(isEntitled).toBe(false);
  });
});
