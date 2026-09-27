import { describe, it, expect, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  checkMemoryRateLimit,
  checkDistributedRateLimit,
  hashRateLimitKey,
  resetMemoryRateLimits,
} from "@/lib/portfolio-engine/server/rate-limit";

describe("Distributed / In-Memory Rate Limiter", () => {
  beforeEach(() => {
    resetMemoryRateLimits();
  });

  it("permits requests within quota and decrements remaining counter", () => {
    const key = `test-user-${Date.now()}`;
    const r1 = checkMemoryRateLimit(key, 3, 10000);
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkMemoryRateLimit(key, 3, 10000);
    expect(r2.ok).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkMemoryRateLimit(key, 3, 10000);
    expect(r3.ok).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request must be rejected
    const r4 = checkMemoryRateLimit(key, 3, 10000);
    expect(r4.ok).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("hashes sensitive identifiers so raw user IDs and IPs are never exposed", () => {
    const rawIp = "192.168.1.105";
    const hashed = hashRateLimitKey(rawIp);
    expect(hashed).toHaveLength(32);
    expect(hashed).not.toContain(rawIp);

    const rawUserId = "user_abc123_sensitive_id";
    const hashedUser = hashRateLimitKey(rawUserId);
    expect(hashedUser).toHaveLength(32);
    expect(hashedUser).not.toContain(rawUserId);
  });

  it("enforces limits under simulated concurrency", async () => {
    const key = "concurrent-user";
    const limit = 10;
    const windowMs = 5000;

    // Simulate 50 simultaneous requests hitting the limiter concurrently
    const promises = Array.from({ length: 50 }, () =>
      checkDistributedRateLimit(null, key, limit, windowMs, "custom"),
    );

    const results = await Promise.all(promises);
    const allowed = results.filter((r) => r.ok);
    const rejected = results.filter((r) => !r.ok);

    expect(allowed).toHaveLength(limit);
    expect(rejected).toHaveLength(40);
  });

  it("isolates quotas across different operations for the same user", async () => {
    const rawUser = "user_shared_id";

    // Exhaust ai_rewrite quota
    for (let i = 0; i < 3; i++) {
      const res = await checkDistributedRateLimit(null, rawUser, 3, 5000, "ai_rewrite");
      expect(res.ok).toBe(true);
    }
    const rewriteBlocked = await checkDistributedRateLimit(null, rawUser, 3, 5000, "ai_rewrite");
    expect(rewriteBlocked.ok).toBe(false);

    // ai_suggest quota for the same user is completely independent and still allowed
    const suggestRes = await checkDistributedRateLimit(null, rawUser, 3, 5000, "ai_suggest");
    expect(suggestRes.ok).toBe(true);
    expect(suggestRes.remaining).toBe(2);
  });

  it("calls atomic PostgreSQL RPC check_rate_limit when Supabase client is present", async () => {
    let rpcCalledWith: Record<string, unknown> | null = null;

    const mockSupabase = {
      rpc: async (fn: string, params: Record<string, unknown>) => {
        if (fn === "check_rate_limit") {
          rpcCalledWith = params;
          return {
            data: [{ allowed: true, remaining: 4, reset_at: new Date(Date.now() + 60000).toISOString() }],
            error: null,
          };
        }
        return { data: null, error: { message: "unknown rpc" } };
      },
    } as unknown as SupabaseClient;

    const result = await checkDistributedRateLimit(
      mockSupabase,
      "user-rpc-test",
      5,
      60000,
      "ai_rewrite",
    );

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(4);
    expect(rpcCalledWith).not.toBeNull();
    const params = rpcCalledWith as unknown as Record<string, unknown>;
    expect(params.p_operation).toBe("ai_rewrite");
    expect(params.p_limit).toBe(5);
    expect(params.p_window_seconds).toBe(60);
  });
});
