import type {
  PortfolioAsset,
  PortfolioDraft,
  PortfolioExperience,
  PortfolioProject,
  PortfolioSocialLink,
} from "@/types/portfolio-engine";
import { createPortfolioSlug, slugify } from "@/lib/portfolio-engine/slug";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SAFE_IMAGE_DATA_URL = /^data:image\/(png|jpe?g|webp);base64,/i;

export function sanitizeText(value: string, maxLength = 1200) {
  return value.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeMultilineText(value: string, maxLength = 2400) {
  return value.replace(CONTROL_CHARS, "").trim().slice(0, maxLength);
}

export function sanitizeUrl(value: string) {
  const trimmed = sanitizeText(value, 500);
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (!["https:", "http:", "mailto:"].includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function sanitizeEmail(value: string) {
  const email = sanitizeText(value, 254).toLowerCase();
  if (!email) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function sanitizeSocialLink(link: PortfolioSocialLink): PortfolioSocialLink {
  return {
    id: sanitizeText(link.id, 80) || crypto.randomUUID(),
    label: sanitizeText(link.label, 40),
    url: sanitizeUrl(link.url),
  };
}

function sanitizeAsset(asset?: PortfolioAsset) {
  if (!asset) return undefined;
  if (!SAFE_IMAGE_DATA_URL.test(asset.dataUrl)) return undefined;

  return {
    id: sanitizeText(asset.id, 80) || crypto.randomUUID(),
    name: sanitizeText(asset.name, 120),
    mimeType: sanitizeText(asset.mimeType, 40),
    size: Number.isFinite(asset.size) ? asset.size : 0,
    dataUrl: asset.dataUrl,
  };
}

function sanitizeHighlights(highlights: string[]) {
  return highlights
    .map((item) => sanitizeText(item, 220))
    .filter(Boolean)
    .slice(0, 6);
}

function sanitizeExperience(experience: PortfolioExperience): PortfolioExperience {
  return {
    id: sanitizeText(experience.id, 80) || crypto.randomUUID(),
    role: sanitizeText(experience.role, 120),
    organization: sanitizeText(experience.organization, 120),
    start: sanitizeText(experience.start, 40),
    end: sanitizeText(experience.end, 40),
    summary: sanitizeMultilineText(experience.summary, 1000),
    highlights: sanitizeHighlights(experience.highlights),
  };
}

function sanitizeProject(project: PortfolioProject): PortfolioProject {
  return {
    id: sanitizeText(project.id, 80) || crypto.randomUUID(),
    title: sanitizeText(project.title, 140),
    role: sanitizeText(project.role, 120),
    summary: sanitizeMultilineText(project.summary, 1200),
    challenge: sanitizeMultilineText(project.challenge, 1200),
    outcome: sanitizeMultilineText(project.outcome, 1200),
    links: project.links
      .map(sanitizeSocialLink)
      .filter((link) => link.url)
      .slice(0, 4),
  };
}

export function sanitizeDraft(draft: PortfolioDraft): PortfolioDraft {
  const basics = draft.basics;
  const name = sanitizeText(basics.name, 120);
  const title = sanitizeText(basics.title, 120);

  return {
    ...draft,
    slug: slugify(draft.slug) || createPortfolioSlug(name, title),
    basics: {
      name,
      title,
      summary: sanitizeMultilineText(basics.summary, 1600),
      location: sanitizeText(basics.location, 120),
      email: sanitizeEmail(basics.email),
      phone: sanitizeText(basics.phone, 40),
      contactPreference: basics.contactPreference,
      socialLinks: basics.socialLinks
        .map(sanitizeSocialLink)
        .filter((link) => link.url)
        .slice(0, 6),
      profilePhoto: sanitizeAsset(basics.profilePhoto),
    },
    skills: draft.skills
      .map((skill) => sanitizeText(skill, 60))
      .filter(Boolean)
      .slice(0, 24),
    experience: draft.experience.map(sanitizeExperience).slice(0, 12),
    projects: draft.projects.map(sanitizeProject).slice(0, 12),
    updatedAt: new Date().toISOString(),
  };
}
