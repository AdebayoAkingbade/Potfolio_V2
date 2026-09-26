import { NextResponse } from "next/server";

import { createSupabasePublicServerClient } from "@/lib/supabase/server";
import { getRequestId, serverLogger } from "@/lib/portfolio-engine/server/logger";
import { verifyStripeSignature } from "@/lib/portfolio-engine/server/stripe-signature";
import type { StripeSignatureVerification } from "@/lib/portfolio-engine/server/stripe-signature";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Re-export type for test imports — this is the only export allowed by Next.js besides HTTP methods
export type { StripeSignatureVerification };

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const startTime = Date.now();

  const isProduction = process.env.NODE_ENV === "production";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");

  // Gate 2: In production, missing secret MUST fail-closed
  if (!webhookSecret) {
    if (isProduction) {
      serverLogger.error("Stripe webhook received in production without STRIPE_WEBHOOK_SECRET", {
        requestId,
        operation: "stripe_webhook",
        status: 500,
        errorCode: "INTERNAL_ERROR",
      });
      return NextResponse.json(
        { error: "Stripe webhook configuration failure: missing webhook secret." },
        { status: 500 },
      );
    }

    // In development / test, require explicit test bypass header or test secret
    const isExplicitTestBypass =
      process.env.NODE_ENV === "test" &&
      request.headers.get("x-test-bypass-stripe") === "true";

    if (!isExplicitTestBypass) {
      return NextResponse.json(
        { error: "Missing STRIPE_WEBHOOK_SECRET. Request rejected." },
        { status: 400 },
      );
    }
  } else {
    // Gate 3: Cryptographic verification of Stripe header with raw payload
    const verification = verifyStripeSignature(rawBody, signatureHeader, webhookSecret);
    if (!verification.ok) {
      serverLogger.warn("Stripe webhook signature rejected", {
        requestId,
        operation: "stripe_webhook",
        status: 400,
        errorCode: "FORBIDDEN",
        metadata: { reason: verification.reason },
      });
      return NextResponse.json(
        { error: `Invalid Stripe signature: ${verification.reason}` },
        { status: 400 },
      );
    }
  }

  const event = JSON.parse(rawBody || "{}") as {
    id?: string;
    type?: string;
    data?: { object?: Record<string, unknown> };
  };

  if (!event.id || !event.type) {
    return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
  }

  const supabase = createSupabasePublicServerClient();
  if (!supabase) {
    serverLogger.error("Supabase unconfigured during webhook delivery", {
      requestId,
      operation: "stripe_webhook",
      status: 503,
      errorCode: "INTERNAL_ERROR",
    });
    return NextResponse.json({ error: "Backend unconfigured." }, { status: 503 });
  }

  const timestamp = new Date().toISOString();

  // Gate 4: Atomic event claiming BEFORE billing state transition
  // Database uniqueness on stripe_event_id guarantees at most ONE process claims the event
  let claimed = false;

  try {
    const { data: rpcClaim, error: rpcError } = await supabase.rpc("claim_stripe_billing_event", {
      p_stripe_event_id: event.id,
      p_event_type: event.type,
    });

    if (!rpcError && typeof rpcClaim === "boolean") {
      claimed = rpcClaim;
    } else {
      // Fallback: Atomic insert with onConflict ignore
      const { data: inserted, error: insertError } = await supabase
        .from("portfolio_billing_events")
        .insert({
          stripe_event_id: event.id,
          event_type: event.type,
          status: "processing",
          processed_at: timestamp,
        })
        .select("id")
        .maybeSingle();

      claimed = !insertError && Boolean(inserted);
    }
  } catch {
    claimed = false;
  }

  // If already claimed or processed, return idempotent response immediately
  if (!claimed) {
    serverLogger.info("Duplicate Stripe webhook deduplicated", {
      requestId,
      operation: "stripe_webhook",
      status: 200,
      metadata: { eventId: event.id, eventType: event.type },
    });
    return NextResponse.json({ received: true, deduplicated: true });
  }

  const eventObject = event.data?.object ?? {};

  try {
    if (event.type === "checkout.session.completed") {
      const clientReferenceId =
        typeof eventObject.client_reference_id === "string" ? eventObject.client_reference_id : "";
      const customerId = typeof eventObject.customer === "string" ? eventObject.customer : null;
      const subscriptionId =
        typeof eventObject.subscription === "string" ? eventObject.subscription : null;

      let targetUserId = "";

      const { data: userAccount } = await supabase
        .from("portfolio_accounts")
        .select("user_id")
        .eq("user_id", clientReferenceId)
        .maybeSingle();

      if (userAccount) {
        targetUserId = userAccount.user_id as string;
      } else {
        const { data: draft } = await supabase
          .from("portfolio_drafts")
          .select("user_id")
          .eq("id", clientReferenceId)
          .maybeSingle();

        if (draft) {
          targetUserId = draft.user_id as string;
        }
      }

      if (targetUserId) {
        await supabase.from("portfolio_accounts").upsert({
          user_id: targetUserId,
          plan: "pro",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: "active",
          updated_at: timestamp,
        });
      }
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      const customerId = typeof eventObject.customer === "string" ? eventObject.customer : null;
      const subscriptionId = typeof eventObject.id === "string" ? eventObject.id : null;
      const status = typeof eventObject.status === "string" ? eventObject.status : "active";
      const isPro = status === "active" || status === "trialing";

      if (customerId || subscriptionId) {
        let query = supabase.from("portfolio_accounts").update({
          plan: isPro ? "pro" : "free",
          subscription_status: status,
          stripe_subscription_id: subscriptionId,
          updated_at: timestamp,
        });

        if (customerId) {
          query = query.eq("stripe_customer_id", customerId);
        } else if (subscriptionId) {
          query = query.eq("stripe_subscription_id", subscriptionId);
        }

        await query;
      }
    } else if (event.type === "customer.subscription.deleted") {
      const customerId = typeof eventObject.customer === "string" ? eventObject.customer : null;
      const subscriptionId = typeof eventObject.id === "string" ? eventObject.id : null;

      let query = supabase.from("portfolio_accounts").update({
        plan: "free",
        subscription_status: "canceled",
        updated_at: timestamp,
      });

      if (customerId) {
        query = query.eq("stripe_customer_id", customerId);
      } else if (subscriptionId) {
        query = query.eq("stripe_subscription_id", subscriptionId);
      }

      await query;
    }

    // Mark billing event as successfully completed
    await supabase
      .from("portfolio_billing_events")
      .update({ status: "processed" })
      .eq("stripe_event_id", event.id);

    serverLogger.info("Stripe webhook processed successfully", {
      requestId,
      operation: "stripe_webhook",
      status: 200,
      durationMs: Date.now() - startTime,
      metadata: { eventId: event.id, eventType: event.type },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    serverLogger.error(
      "Error processing Stripe webhook",
      {
        requestId,
        operation: "stripe_webhook",
        status: 500,
        errorCode: "INTERNAL_ERROR",
        durationMs: Date.now() - startTime,
      },
      error,
    );
    return NextResponse.json({ error: "Webhook processing error." }, { status: 500 });
  }
}
