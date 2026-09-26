import { createHmac, timingSafeEqual } from "node:crypto";

export type StripeSignatureVerification = {
  ok: boolean;
  reason?: "missing_header" | "missing_secret" | "malformed_header" | "stale_timestamp" | "invalid_signature";
};

/**
 * Validates Stripe-Signature header according to Stripe's cryptographic protocol:
 * Header: t=timestamp,v1=signature[,v1=secondary_signature]
 * Payload: ${timestamp}.${rawBody}
 * Timing-safe HMAC-SHA256 comparison.
 */
export function verifyStripeSignature(
  rawPayload: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
): StripeSignatureVerification {
  if (!header) return { ok: false, reason: "missing_header" };
  if (!secret) return { ok: false, reason: "missing_secret" };

  const parts = header.split(",");
  let timestamp = "";
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    const val = rest.join("=").trim();
    if (key.trim() === "t") timestamp = val;
    if (key.trim() === "v1") signatures.push(val);
  }

  if (!timestamp || signatures.length === 0) {
    return { ok: false, reason: "malformed_header" };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const eventSec = parseInt(timestamp, 10);
  if (isNaN(eventSec) || Math.abs(nowSec - eventSec) > toleranceSeconds) {
    return { ok: false, reason: "stale_timestamp" };
  }

  const signedPayload = `${timestamp}.${rawPayload}`;
  const expectedSignature = createHmac("sha256", secret).update(signedPayload).digest("hex");

  for (const sig of signatures) {
    if (sig.length === expectedSignature.length) {
      const match = timingSafeEqual(
        Buffer.from(sig, "hex"),
        Buffer.from(expectedSignature, "hex"),
      );
      if (match) return { ok: true };
    }
  }

  return { ok: false, reason: "invalid_signature" };
}
