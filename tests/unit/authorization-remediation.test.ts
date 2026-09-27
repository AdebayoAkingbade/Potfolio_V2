import { describe, it, expect } from "vitest";
import { getAuthoritativePlanForUser, hasServerEntitlement } from "@/lib/portfolio-engine/server/entitlements";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Phase 1 Remediation — Authoritative Pro Entitlement Resolver", () => {
  it("resolves active Pro account as pro", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-1", plan: "pro", subscription_status: "active" },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const plan = await getAuthoritativePlanForUser(mockSupabase, "user-1");
    expect(plan).toBe("pro");

    const entitled = await hasServerEntitlement(mockSupabase, "user-1", "videoUploads");
    expect(entitled).toBe(true);
  });

  it("resolves trialing Pro account as pro", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-2", plan: "pro", subscription_status: "trialing" },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const plan = await getAuthoritativePlanForUser(mockSupabase, "user-2");
    expect(plan).toBe("pro");

    const entitled = await hasServerEntitlement(mockSupabase, "user-2", "videoUploads");
    expect(entitled).toBe(true);
  });

  it("downgrades past_due Pro account to free", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-3", plan: "pro", subscription_status: "past_due" },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const plan = await getAuthoritativePlanForUser(mockSupabase, "user-3");
    expect(plan).toBe("free");

    const entitled = await hasServerEntitlement(mockSupabase, "user-3", "videoUploads");
    expect(entitled).toBe(false);
  });

  it("downgrades canceled Pro account to free", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-4", plan: "pro", subscription_status: "canceled" },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const plan = await getAuthoritativePlanForUser(mockSupabase, "user-4");
    expect(plan).toBe("free");

    const entitled = await hasServerEntitlement(mockSupabase, "user-4", "videoUploads");
    expect(entitled).toBe(false);
  });

  it("downgrades unpaid Pro account to free", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-5", plan: "pro", subscription_status: "unpaid" },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const plan = await getAuthoritativePlanForUser(mockSupabase, "user-5");
    expect(plan).toBe("free");

    const entitled = await hasServerEntitlement(mockSupabase, "user-5", "videoUploads");
    expect(entitled).toBe(false);
  });

  it("distinguishes Free entitlements from Pro entitlements", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: "user-free", plan: "free", subscription_status: null },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const plan = await getAuthoritativePlanForUser(mockSupabase, "user-free");
    expect(plan).toBe("free");

    // Free users have analytics
    const analyticsAllowed = await hasServerEntitlement(mockSupabase, "user-free", "analytics");
    expect(analyticsAllowed).toBe(true);

    // Free users cannot upload videos
    const videoAllowed = await hasServerEntitlement(mockSupabase, "user-free", "videoUploads");
    expect(videoAllowed).toBe(false);
  });
});
