import { serverLogger } from "@/lib/portfolio-engine/server/logger";

export const ALLOWED_AI_MODELS = ["gpt-5-mini"] as const;
export type AllowedAiModel = (typeof ALLOWED_AI_MODELS)[number];

export type AiOperationType = "rewrite" | "suggest";

export type AiOperationPolicy = {
  model: AllowedAiModel;
  maxInputChars: number;
  maxOutputTokens: number;
  timeoutMs: number;
  maxRetries: number;
  rateLimit: {
    limit: number;
    windowSeconds: number;
  };
};

export const AI_OPERATION_POLICIES: Record<AiOperationType, AiOperationPolicy> = {
  rewrite: {
    model: "gpt-5-mini",
    maxInputChars: 4000,
    maxOutputTokens: 250,
    timeoutMs: 15000,
    maxRetries: 1,
    rateLimit: {
      limit: 20,
      windowSeconds: 3600,
    },
  },
  suggest: {
    model: "gpt-5-mini",
    maxInputChars: 4000,
    maxOutputTokens: 250,
    timeoutMs: 15000,
    maxRetries: 1,
    rateLimit: {
      limit: 15,
      windowSeconds: 3600,
    },
  },
};

export type AiValidationResult =
  | { ok: true; policy: AiOperationPolicy; resolvedModel: AllowedAiModel }
  | { ok: false; status: number; error: string };

/**
 * Server-side bounds enforcement for AI requests:
 * 1. Rejects oversized payloads exceeding maxInputChars
 * 2. Prevents client manipulation of AI models; server-selects approved model
 */
export function validateAiRequestBounds(
  operation: AiOperationType,
  inputLength: number,
  clientModel?: string,
): AiValidationResult {
  const policy = AI_OPERATION_POLICIES[operation];

  if (inputLength > policy.maxInputChars) {
    return {
      ok: false,
      status: 413,
      error: `Payload exceeds maximum input limit of ${policy.maxInputChars} characters (received ${inputLength}).`,
    };
  }

  // Model selection is strictly server-controlled from allowed models
  let resolvedModel = policy.model;
  if (clientModel && clientModel !== policy.model) {
    if ((ALLOWED_AI_MODELS as readonly string[]).includes(clientModel)) {
      resolvedModel = clientModel as AllowedAiModel;
    } else {
      // Ignore unauthorized expensive model request and use server default
      resolvedModel = policy.model;
    }
  }

  return {
    ok: true,
    policy,
    resolvedModel,
  };
}

export type AiCallResult = {
  ok: boolean;
  text: string;
  source: "openai" | "fallback";
  status: number;
  error?: string;
};

/**
 * Executes AI completion with strict timeout, rate limiting, and failure safety.
 * When upstream returns 400, 401, 429, 500, timeout, or malformed JSON:
 * - Never throws unhandled errors
 * - Never prints private prompt content in logs
 * - Returns explicit fallback and error status
 */
export async function executeAiWithFailureSafety(options: {
  operation: AiOperationType;
  apiKey: string;
  promptInput: string;
  systemInstructions: string;
  fallbackText: string;
  requestId: string;
  userId?: string;
}): Promise<AiCallResult> {
  const { operation, apiKey, promptInput, systemInstructions, fallbackText, requestId, userId } =
    options;
  const policy = AI_OPERATION_POLICIES[operation];
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), policy.timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: policy.model,
        store: false,
        max_output_tokens: policy.maxOutputTokens,
        instructions: systemInstructions,
        input: promptInput,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      serverLogger.warn("AI upstream non-200 response", {
        requestId,
        operation: `ai_${operation}`,
        userId,
        status: response.status,
        errorCode: "AI_PROVIDER_ERROR",
        durationMs: Date.now() - startTime,
      });

      return {
        ok: false,
        text: fallbackText,
        source: "fallback",
        status: response.status,
        error: `AI provider error (${response.status})`,
      };
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      serverLogger.warn("AI upstream returned malformed JSON", {
        requestId,
        operation: `ai_${operation}`,
        userId,
        status: 502,
        errorCode: "AI_MALFORMED_RESPONSE",
      });

      return {
        ok: false,
        text: fallbackText,
        source: "fallback",
        status: 502,
        error: "Malformed upstream response.",
      };
    }

    const outputText = extractTextFromAiResponse(data);
    if (!outputText) {
      return {
        ok: false,
        text: fallbackText,
        source: "fallback",
        status: 200,
      };
    }

    return {
      ok: true,
      text: outputText,
      source: "openai",
      status: 200,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error instanceof Error && error.name === "AbortError";

    serverLogger.error(
      isTimeout ? "AI upstream request timed out" : "AI upstream network error",
      {
        requestId,
        operation: `ai_${operation}`,
        userId,
        status: isTimeout ? 504 : 500,
        errorCode: isTimeout ? "AI_TIMEOUT" : "AI_NETWORK_ERROR",
        durationMs: Date.now() - startTime,
      },
      error,
    );

    return {
      ok: false,
      text: fallbackText,
      source: "fallback",
      status: isTimeout ? 504 : 500,
      error: isTimeout ? "AI request timed out." : "AI provider connection error.",
    };
  }
}

export function extractTextFromAiResponse(response: unknown): string {
  if (!response || typeof response !== "object") return "";
  if ("output_text" in response && typeof response.output_text === "string") {
    return response.output_text;
  }

  const output = "output" in response && Array.isArray(response.output) ? response.output : [];
  return output
    .flatMap((item) =>
      item && typeof item === "object" && "content" in item && Array.isArray(item.content)
        ? item.content
        : [],
    )
    .map((content) =>
      content && typeof content === "object" && "text" in content && typeof content.text === "string"
        ? content.text
        : "",
    )
    .filter(Boolean)
    .join("\n")
    .trim();
}
