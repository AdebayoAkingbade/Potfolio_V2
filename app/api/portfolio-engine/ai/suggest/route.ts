import { NextResponse } from "next/server";

import { buildProjectSuggestion, buildSummarySuggestion } from "@/lib/portfolio-engine/writing-assistant";
import { sanitizeMultilineText } from "@/lib/portfolio-engine/sanitize";
import { requirePortfolioEngineUser } from "@/lib/portfolio-engine/server/auth";
import { checkRateLimit } from "@/lib/portfolio-engine/server/rate-limit";
import { coercePortfolioDraft } from "@/lib/portfolio-engine/validation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type SuggestionKind = "summary" | "project-summary";

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
  const kind =
    body && typeof body === "object" && body.kind === "project-summary"
      ? "project-summary"
      : ("summary" satisfies SuggestionKind);

  if (!draft) return errorResponse("Invalid draft payload.", 400);

  const projectId =
    body && typeof body === "object" && typeof body.projectId === "string" ? body.projectId : "";
  const project = draft.projects.find((item) => item.id === projectId) ?? draft.projects[0];
  const fallback =
    kind === "project-summary" && project
      ? buildProjectSuggestion(project, draft)
      : buildSummarySuggestion(draft);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestion: fallback, source: "local" });
  }

  const rateLimit = checkRateLimit(`portfolio-ai:${auth.user.id}`, 12, 60 * 60 * 1000);
  if (!rateLimit.ok) return errorResponse("AI suggestion limit reached. Try again later.", 429);

  const model = process.env.PORTFOLIO_ENGINE_AI_MODEL ?? "gpt-5-mini";
  const prompt =
    kind === "project-summary"
      ? `Improve this portfolio project summary without inventing facts.\n\nProfession: ${draft.profession}\nName: ${draft.basics.name}\nTitle: ${draft.basics.title}\nProject: ${project?.title}\nRole: ${project?.role}\nCurrent summary: ${project?.summary}\nChallenge: ${project?.challenge}\nOutcome: ${project?.outcome}`
      : `Improve this professional portfolio summary without inventing facts.\n\nProfession: ${draft.profession}\nName: ${draft.basics.name}\nTitle: ${draft.basics.title}\nLocation: ${draft.basics.location}\nSkills: ${draft.skills.join(", ")}\nCurrent summary: ${draft.basics.summary}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 220,
        instructions:
          "You write concise, credible portfolio copy. Do not use HTML. Do not invent employers, metrics, credentials, clients, or outcomes. Keep the answer under 90 words.",
        input: prompt,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("OpenAI suggestion failed", details);
      return NextResponse.json({
        suggestion: fallback,
        source: "local",
        warning: "AI provider failed, so Portfolio Engine used the local writing assistant.",
      });
    }

    const data = (await response.json()) as unknown;
    const suggestion = sanitizeMultilineText(getOutputText(data), 900);
    return NextResponse.json({
      suggestion: suggestion || fallback,
      source: suggestion ? "openai" : "local",
    });
  } catch (error) {
    console.error("OpenAI suggestion request failed", error);
    return NextResponse.json({
      suggestion: fallback,
      source: "local",
      warning: "AI provider failed, so Portfolio Engine used the local writing assistant.",
    });
  }
}
