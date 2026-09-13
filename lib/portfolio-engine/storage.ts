import type { PortfolioDraft, PublishedPortfolio } from "@/types/portfolio-engine";
import { calculatePortfolioScore } from "@/lib/portfolio-engine/scoring";
import { coercePortfolioDraft } from "@/lib/portfolio-engine/validation";

const DRAFTS_KEY = "portfolio-engine:drafts:v1";
const ACTIVE_DRAFT_KEY = "portfolio-engine:active-draft:v1";
const PUBLICATIONS_KEY = "portfolio-engine:publications:v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadDrafts() {
  return readJson<unknown[]>(DRAFTS_KEY, [])
    .map(coercePortfolioDraft)
    .filter((draft): draft is PortfolioDraft => Boolean(draft));
}

export function loadDraft(draftId: string) {
  return loadDrafts().find((draft) => draft.id === draftId) ?? null;
}

export function loadActiveDraftId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_DRAFT_KEY);
}

export function saveDraft(draft: PortfolioDraft) {
  if (typeof window === "undefined") return;

  const drafts = loadDrafts();
  const nextDrafts = drafts.some((item) => item.id === draft.id)
    ? drafts.map((item) => (item.id === draft.id ? draft : item))
    : [draft, ...drafts];

  writeJson(DRAFTS_KEY, nextDrafts);
  window.localStorage.setItem(ACTIVE_DRAFT_KEY, draft.id);
}

export function loadPublications() {
  return readJson<unknown[]>(PUBLICATIONS_KEY, [])
    .map((value) => {
      const draft = coercePortfolioDraft(value);
      if (!draft || !value || typeof value !== "object") return null;

      const record = value as Record<string, unknown>;
      const publishedAt =
        typeof record.publishedAt === "string" ? record.publishedAt : draft.updatedAt;

      return {
        ...draft,
        publicationId:
          typeof record.publicationId === "string" ? record.publicationId : crypto.randomUUID(),
        sourceDraftId:
          typeof record.sourceDraftId === "string" ? record.sourceDraftId : draft.id,
        version: typeof record.version === "number" ? record.version : 1,
        publishedAt,
        score:
          record.score && typeof record.score === "object"
            ? (record.score as PublishedPortfolio["score"])
            : calculatePortfolioScore(draft),
      };
    })
    .filter((publication): publication is PublishedPortfolio => Boolean(publication));
}

export function savePublication(publication: PublishedPortfolio) {
  if (typeof window === "undefined") return;

  const publications = loadPublications();
  const withoutPreviousForSlug = publications.filter((item) => item.slug !== publication.slug);
  writeJson(PUBLICATIONS_KEY, [publication, ...withoutPreviousForSlug]);
}

export function loadPublicationBySlug(slug: string) {
  return loadPublications().find((publication) => publication.slug === slug) ?? null;
}

export function loadPublicationsForDraft(draftId: string) {
  return loadPublications().filter((publication) => publication.sourceDraftId === draftId);
}

export function deleteLocalPortfolio(slug: string) {
  const publications = loadPublications().filter((publication) => publication.slug !== slug);
  writeJson(PUBLICATIONS_KEY, publications);
}

export function listPublishedSlugs() {
  return loadPublications().map((publication) => publication.slug);
}
