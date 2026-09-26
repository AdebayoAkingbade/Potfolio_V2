import { createHash } from "node:crypto";

export type StandardErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "ENTITLEMENT_REQUIRED"
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "AI_PROVIDER_ERROR"
  | "AI_MALFORMED_RESPONSE"
  | "AI_TIMEOUT"
  | "AI_NETWORK_ERROR"
  | "PUBLISH_CONFLICT"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export type LogContext = {
  requestId: string;
  operation: string;
  userId?: string;
  status?: number;
  durationMs?: number;
  errorCode?: StandardErrorCode;
  errorCategory?: string;
  metadata?: Record<string, unknown>;
};

function hashUserId(userId?: string): string | undefined {
  if (!userId) return undefined;
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

export function getRequestId(request?: Request): string {
  if (!request) return crypto.randomUUID();
  const existing = request.headers.get("x-request-id");
  return existing && existing.trim().length > 0 ? existing.slice(0, 64) : crypto.randomUUID();
}

/**
 * Structured safe logger that prevents PII, prompts, resume text, and API keys from entering stdout/stderr.
 */
export const serverLogger = {
  info(message: string, context: LogContext) {
    const payload = {
      level: "INFO",
      timestamp: new Date().toISOString(),
      message,
      requestId: context.requestId,
      operation: context.operation,
      userHash: hashUserId(context.userId),
      status: context.status,
      durationMs: context.durationMs,
      metadata: context.metadata,
    };
    console.log(JSON.stringify(payload));
  },

  warn(message: string, context: LogContext) {
    const payload = {
      level: "WARN",
      timestamp: new Date().toISOString(),
      message,
      requestId: context.requestId,
      operation: context.operation,
      userHash: hashUserId(context.userId),
      status: context.status,
      errorCode: context.errorCode,
      errorCategory: context.errorCategory,
      metadata: context.metadata,
    };
    console.warn(JSON.stringify(payload));
  },

  error(message: string, context: LogContext, error?: unknown) {
    const errorCategory =
      error instanceof Error ? error.name : typeof error === "string" ? "Error" : "UnknownError";

    const payload = {
      level: "ERROR",
      timestamp: new Date().toISOString(),
      message,
      requestId: context.requestId,
      operation: context.operation,
      userHash: hashUserId(context.userId),
      status: context.status,
      errorCode: context.errorCode ?? "INTERNAL_ERROR",
      errorCategory: context.errorCategory ?? errorCategory,
      metadata: context.metadata,
    };
    console.error(JSON.stringify(payload));
  },
};
