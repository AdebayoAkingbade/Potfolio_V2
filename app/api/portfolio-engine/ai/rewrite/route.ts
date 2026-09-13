import { NextResponse } from "next/server";

import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { checkRateLimit } from "@/lib/portfolio-engine/server/rate-limit";
import { buildProjectSuggestion, buildSummarySuggestion } from "@/lib/portfolio-engine/writing-assistant";
import { sanitizeMultilineText } from "@/lib/portfolio-engine/sanitize";
import { coercePortfolioDraft } from "@/lib/portfolio-engine/validation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type RewriteTarget = "summary" | "project" | "experience";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getOutputText(response: unknown) {
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

export async function POST(request: Request) {
  const auth = await requirePortfolioEngineUser();
  if (!auth.ok) return errorResponse(auth.message, auth.status);

  const body = await request.json().catch(() => null);
  const draft = coercePortfolioDraft(
    body && typeof body === "object" && "draft" in body ? body.draft : null,
  );
  const target =
    body && typeof body === "object" && body.target === "project"
      ? ("project" satisfies RewriteTarget)
      : body && typeof body === "object" && body.target === "experience"
        ? ("experience" satisfies RewriteTarget)
        : ("summary" satisfies RewriteTarget);
  const tone =
    body && typeof body === "object" && typeof body.tone === "string"
      ? sanitizeMultilineText(body.tone, 80)
      : "clear, confident, and specific";
  const text =
    body && typeof body === "object" && typeof body.text === "string"
      ? sanitizeMultilineText(body.text, 1200)
      : "";
  const projectId =
    body && typeof body === "object" && typeof body.projectId === "string" ? body.projectId : "";
  const project = draft?.projects.find((item) => item.id === projectId) ?? draft?.projects[0];
  const fallback =
    target === "project" && draft && project
      ? buildProjectSuggestion(project, draft)
      : draft
        ? buildSummarySuggestion(draft)
        : text;

  if (!draft) return errorResponse("Invalid draft payload.", 400);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ rewrite: fallback, source: "local" });
  }

  const rateLimit = checkRateLimit(`portfolio-ai-rewrite:${auth.user.id}`, 20, 60 * 60 * 1000);
  if (!rateLimit.ok) return errorResponse("AI rewrite limit reached. Try again later.", 429);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.PORTFOLIO_ENGINE_AI_MODEL ?? "gpt-5-mini",
        store: false,
        max_output_tokens: 260,
        instructions:
          "Rewrite portfolio copy into concise, credible professional language. Preserve facts. Do not invent employers, credentials, metrics, clients, awards, dates, or links. Return plain text only.",
        input: `Target: ${target}\nTone: ${tone}\nName: ${draft.basics.name}\nTitle: ${draft.basics.title}\nSkills: ${draft.skills.join(", ")}\nCurrent text: ${text || fallback}`,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ rewrite: fallback, source: "local" });
    }

    const data = (await response.json()) as unknown;
    const rewrite = sanitizeMultilineText(getOutputText(data), 1100);
    return NextResponse.json({ rewrite: rewrite || fallback, source: rewrite ? "openai" : "local" });
  } catch {
    return NextResponse.json({ rewrite: fallback, source: "local" });
  }
}
