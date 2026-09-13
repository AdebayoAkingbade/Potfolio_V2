import type { PortfolioDraft, PublishedPortfolio } from "@/types/portfolio-engine";
import { sanitizeDraft } from "@/lib/portfolio-engine/sanitize";
import { calculatePortfolioScore } from "@/lib/portfolio-engine/scoring";
import { resolveSlugCollision } from "@/lib/portfolio-engine/slug";
import { validateDraftForPublish } from "@/lib/portfolio-engine/schema";

export function createPublishedSnapshot(
  draft: PortfolioDraft,
  existingSlugs: string[],
  previousVersion = 0,
) {
  const validation = validateDraftForPublish(draft);
  if (!validation.ok) {
    return {
      ok: false as const,
      errors: validation.errors,
      publication: null,
    };
  }

  const sanitized = sanitizeDraft(draft);
  const slug = resolveSlugCollision(
    sanitized.slug || `${sanitized.basics.name} ${sanitized.basics.title}`,
    existingSlugs,
  );
  const publishedAt = new Date().toISOString();
  const publication: PublishedPortfolio = {
    ...sanitized,
    slug,
    publicationId: crypto.randomUUID(),
    sourceDraftId: draft.id,
    version: previousVersion + 1,
    publishedAt,
    score: calculatePortfolioScore({ ...sanitized, slug }),
  };

  return {
    ok: true as const,
    errors: [],
    publication,
  };
}
