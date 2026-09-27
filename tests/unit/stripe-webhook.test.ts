import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";

let mockSupabaseInstance: unknown = null;

vi.mock("@/lib/supabase/server", () => ({
  createSupabasePublicServerClient: () => mockSupabaseInstance,
}));

import { verifyStripeSignature } from "@/lib/portfolio-engine/server/stripe-signature";
import { POST } from "@/lib/../app/api/portfolio-engine/billing/webhook/route";

function generateStripeHeader(payload: string, secret: string, timestampSec: number): string {
  const signedPayload = `${timestampSec}.${payload}`;
  const sig = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return `t=${timestampSec},v1=${sig}`;
}

describe("Stripe Webhook Signature & Fail-Closed Behavior (Gates 2 & 3)", () => {
  const secret = "whsec_test_secret_abc1234567890xyz";
  const samplePayload = JSON.stringify({
    id: "evt_test_123",
    type: "checkout.session.completed",
    data: { object: { client_reference_id: "user_test_1", customer: "cus_123" } },
  });

  it("accepts valid signatures matching Stripe cryptographic format", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const header = generateStripeHeader(samplePayload, secret, nowSec);

    const result = verifyStripeSignature(samplePayload, header, secret);
    expect(result.ok).toBe(true);
  });

  it("accepts signatures when multiple v1 keys are present (Stripe key roll-over)", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const signedPayload = `${nowSec}.${samplePayload}`;
    const validSig = createHmac("sha256", secret).update(signedPayload).digest("hex");
    const oldSig = createHmac("sha256", "whsec_old_secret").update(signedPayload).digest("hex");
    const header = `t=${nowSec},v1=${oldSig},v1=${validSig}`;

    const result = verifyStripeSignature(samplePayload, header, secret);
    expect(result.ok).toBe(true);
  });

  it("rejects invalid / tampered signatures with 400 reason", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const tamperedPayload = JSON.stringify({ id: "evt_tampered" });
    const header = generateStripeHeader(samplePayload, secret, nowSec);

    const result = verifyStripeSignature(tamperedPayload, header, secret);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_signature");
  });

  it("rejects stale signatures older than tolerance window (5 minutes)", () => {
    const staleTimeSec = Math.floor(Date.now() / 1000) - 400; // 400s old (> 300s window)
    const header = generateStripeHeader(samplePayload, secret, staleTimeSec);

    const result = verifyStripeSignature(samplePayload, header, secret);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("stale_timestamp");
  });

  it("fails closed in production if STRIPE_WEBHOOK_SECRET is unconfigured", async () => {
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      // NODE_ENV is read-only in TypeScript typings; use defineProperty to override in tests
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const req = new Request("http://localhost:3000/api/portfolio-engine/billing/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: samplePayload,
      });

      const response = await POST(req);
      expect(response.status).toBe(500);

      const json = await response.json();
      expect(json.error).toContain("configuration failure");
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = "test";
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    }
  });
});

describe("Billing Event Atomicity & Idempotency (Gate 4)", () => {
  const secret = "whsec_test_secret_abc1234567890xyz";
  const claimedEvents = new Set<string>();

  beforeEach(() => {
    claimedEvents.clear();
    process.env.STRIPE_WEBHOOK_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    mockSupabaseInstance = null;
  });

  it("enforces AT MOST ONE billing mutation per Stripe event under concurrency", async () => {
    let mutationCount = 0;

    mockSupabaseInstance = {
      rpc: async (fn: string, params: { p_stripe_event_id: string }) => {
        if (fn === "claim_stripe_billing_event") {
          if (claimedEvents.has(params.p_stripe_event_id)) {
            return { data: false, error: null };
          }
          claimedEvents.add(params.p_stripe_event_id);
          return { data: true, error: null };
        }
        return { data: null, error: { message: "unknown rpc" } };
      },
      from: (table: string) => {
        if (table === "portfolio_accounts") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { user_id: "user_test_1" }, error: null }),
              }),
            }),
            upsert: async () => {
              mutationCount += 1;
              return { data: null, error: null };
            },
          };
        }
        if (table === "portfolio_billing_events") {
          return {
            update: () => ({
              eq: async () => ({ data: null, error: null }),
            }),
          };
        }
        return {};
      },
    };

    const eventId = "evt_concurrent_test_999";
    const payload = JSON.stringify({
      id: eventId,
      type: "checkout.session.completed",
      data: { object: { client_reference_id: "user_test_1", customer: "cus_123" } },
    });

    const nowSec = Math.floor(Date.now() / 1000);
    const header = generateStripeHeader(payload, secret, nowSec);

    const makeRequest = () =>
      POST(
        new Request("http://localhost:3000/api/portfolio-engine/billing/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "stripe-signature": header,
          },
          body: payload,
        }),
      );

    // Concurrently deliver the SAME Stripe event twice
    const [res1, res2] = await Promise.all([makeRequest(), makeRequest()]);

    const json1 = await res1.json();
    const json2 = await res2.json();

    // Exactly one must perform mutation, the other is deduplicated
    expect(mutationCount).toBe(1);
    expect([json1, json2]).toContainEqual({ received: true, deduplicated: true });
    expect([json1, json2]).toContainEqual({ received: true });
  });
});
