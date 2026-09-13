import type {
  PortfolioAnalyticsDatum,
  PortfolioAnalyticsSummary,
  PortfolioAsset,
  PortfolioCustomDomain,
  PortfolioDraft,
  PortfolioExportSettings,
  PortfolioExperience,
  PortfolioImportRecord,
  PortfolioProject,
  PortfolioSocialLink,
  PortfolioTeam,
  PortfolioTeamMember,
  PortfolioVideoAsset,
} from "@/types/portfolio-engine";
import { createPortfolioSlug, slugify } from "@/lib/portfolio-engine/slug";
import {
  PORTFOLIO_DOMAIN_TARGET,
  createAnalyticsSummary,
  createExportSettings,
  createPortfolioTeam,
  withPortfolioV2Defaults,
} from "@/lib/portfolio-engine/schema";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SAFE_IMAGE_DATA_URL = /^data:image\/(png|jpe?g|webp);base64,/i;
const SAFE_VIDEO_DATA_URL = /^data:video\/(mp4|webm|quicktime);base64,/i;

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

function sanitizeDomainHostname(value: string) {
  return sanitizeText(value, 253)
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "")
    .replace(/^\.+|\.+$/g, "");
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

function sanitizeAsset(asset?: PortfolioAsset): PortfolioAsset | undefined {
  if (!asset) return undefined;
  const dataUrl = asset.dataUrl && SAFE_IMAGE_DATA_URL.test(asset.dataUrl) ? asset.dataUrl : "";
  const url = asset.url ? sanitizeUrl(asset.url) : "";
  if (!dataUrl && !url) return undefined;
  const kind: PortfolioAsset["kind"] =
    asset.kind === "video" || asset.kind === "document" ? asset.kind : "image";

  return {
    id: sanitizeText(asset.id, 80) || crypto.randomUUID(),
    name: sanitizeText(asset.name, 120),
    mimeType: sanitizeText(asset.mimeType, 40),
    size: Number.isFinite(asset.size) ? asset.size : 0,
    kind,
    dataUrl: dataUrl || undefined,
    url: url || undefined,
    pathname: asset.pathname ? sanitizeText(asset.pathname, 500) : undefined,
    storageProvider: asset.storageProvider === "supabase" ? "supabase" : "local",
  };
}

function sanitizeVideoAsset(asset: PortfolioVideoAsset): PortfolioVideoAsset | null {
  const dataUrl = asset.dataUrl && SAFE_VIDEO_DATA_URL.test(asset.dataUrl) ? asset.dataUrl : "";
  const url = asset.url ? sanitizeUrl(asset.url) : "";
  if (!dataUrl && !url) return null;

  return {
    id: sanitizeText(asset.id, 80) || crypto.randomUUID(),
    name: sanitizeText(asset.name, 120),
    mimeType: sanitizeText(asset.mimeType, 60),
    size: Number.isFinite(asset.size) ? Math.max(0, asset.size) : 0,
    kind: "video",
    dataUrl: dataUrl || undefined,
    url: url || undefined,
    pathname: asset.pathname ? sanitizeText(asset.pathname, 500) : undefined,
    storageProvider: asset.storageProvider === "supabase" ? "supabase" : "local",
    durationSeconds:
      typeof asset.durationSeconds === "number"
        ? Math.max(0, Math.min(asset.durationSeconds, 60 * 60 * 4))
        : undefined,
    posterUrl: asset.posterUrl ? sanitizeUrl(asset.posterUrl) : undefined,
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
    videos: (project.videos ?? [])
      .map(sanitizeVideoAsset)
      .filter((asset): asset is PortfolioVideoAsset => Boolean(asset))
      .slice(0, 3),
  };
}

function sanitizeImportRecord(record: PortfolioImportRecord): PortfolioImportRecord {
  const source =
    record.source === "github" || record.source === "resume" || record.source === "clone"
      ? record.source
      : "resume";
  const status =
    record.status === "failed" || record.status === "partial" || record.status === "imported"
      ? record.status
      : "imported";

  return {
    id: sanitizeText(record.id, 80) || crypto.randomUUID(),
    source,
    label: sanitizeText(record.label, 120),
    status,
    detail: sanitizeText(record.detail, 260),
    importedAt: sanitizeText(record.importedAt, 40) || new Date().toISOString(),
  };
}

function sanitizeCustomDomain(domain?: PortfolioCustomDomain) {
  if (!domain) return undefined;

  const hostname = sanitizeDomainHostname(domain.hostname);
  if (!hostname) return undefined;

  const status = ["pending-verification", "active", "error", "not-configured"].includes(
    domain.status,
  )
    ? domain.status
    : "pending-verification";

  return {
    hostname,
    status,
    verificationToken: sanitizeText(domain.verificationToken, 180),
    target: sanitizeDomainHostname(domain.target) || PORTFOLIO_DOMAIN_TARGET,
    connectedAt: domain.connectedAt ? sanitizeText(domain.connectedAt, 40) : undefined,
    lastCheckedAt: domain.lastCheckedAt ? sanitizeText(domain.lastCheckedAt, 40) : undefined,
    error: domain.error ? sanitizeText(domain.error, 180) : undefined,
  };
}

function sanitizeAnalyticsDatum(item: PortfolioAnalyticsDatum): PortfolioAnalyticsDatum {
  return {
    label: sanitizeText(item.label, 80),
    value: Number.isFinite(item.value) ? Math.max(0, Math.round(item.value)) : 0,
  };
}

function sanitizeAnalyticsSummary(summary?: PortfolioAnalyticsSummary): PortfolioAnalyticsSummary {
  const fallback = createAnalyticsSummary();
  if (!summary) return fallback;

  return {
    views: Number.isFinite(summary.views) ? Math.max(0, Math.round(summary.views)) : 0,
    visitors: Number.isFinite(summary.visitors) ? Math.max(0, Math.round(summary.visitors)) : 0,
    clicks: Number.isFinite(summary.clicks) ? Math.max(0, Math.round(summary.clicks)) : 0,
    leads: Number.isFinite(summary.leads) ? Math.max(0, Math.round(summary.leads)) : 0,
    avgReadSeconds: Number.isFinite(summary.avgReadSeconds)
      ? Math.max(0, Math.round(summary.avgReadSeconds))
      : 0,
    topReferrers: (summary.topReferrers ?? []).map(sanitizeAnalyticsDatum).slice(0, 8),
    topSections: (summary.topSections ?? []).map(sanitizeAnalyticsDatum).slice(0, 8),
    trend: (summary.trend ?? [])
      .map((item) => ({
        date: sanitizeText(item.date, 20),
        views: Number.isFinite(item.views) ? Math.max(0, Math.round(item.views)) : 0,
        visitors: Number.isFinite(item.visitors) ? Math.max(0, Math.round(item.visitors)) : 0,
      }))
      .filter((item) => item.date)
      .slice(-30),
  };
}

function sanitizeTeamMember(member: PortfolioTeamMember): PortfolioTeamMember {
  const role = ["owner", "admin", "editor", "viewer"].includes(member.role)
    ? member.role
    : "viewer";

  return {
    id: sanitizeText(member.id, 80) || crypto.randomUUID(),
    name: sanitizeText(member.name, 100),
    email: sanitizeEmail(member.email),
    role,
    status: member.status === "active" ? "active" : "invited",
    invitedAt: member.invitedAt ? sanitizeText(member.invitedAt, 40) : undefined,
  };
}

function sanitizeTeam(team: PortfolioTeam | undefined, draft: PortfolioDraft): PortfolioTeam {
  const fallback = createPortfolioTeam(draft.id, draft.basics.email, draft.basics.name || "Owner");
  if (!team) return fallback;

  const members = (team.members ?? [])
    .map(sanitizeTeamMember)
    .filter((member) => member.email)
    .slice(0, 25);

  return {
    id: sanitizeText(team.id, 80) || fallback.id,
    name: sanitizeText(team.name, 100) || fallback.name,
    agencyMode: Boolean(team.agencyMode),
    seats: Math.max(1, Math.min(50, Math.round(team.seats || members.length || 1))),
    members,
  };
}

function sanitizeExportSettings(settings?: PortfolioExportSettings): PortfolioExportSettings {
  const fallback = createExportSettings();
  if (!settings) return fallback;

  return {
    allowClone: Boolean(settings.allowClone),
    preferredFormat: settings.preferredFormat === "html" ? "html" : "json",
    lastExportedAt: settings.lastExportedAt
      ? sanitizeText(settings.lastExportedAt, 40)
      : undefined,
  };
}

export function sanitizeDraft(draft: PortfolioDraft): PortfolioDraft {
  const normalized = withPortfolioV2Defaults(draft);
  const basics = normalized.basics;
  const name = sanitizeText(basics.name, 120);
  const title = sanitizeText(basics.title, 120);

  return {
    ...normalized,
    portfolioVersion: 2,
    plan: normalized.plan === "pro" ? "pro" : "free",
    slug: slugify(normalized.slug) || createPortfolioSlug(name, title),
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
    skills: normalized.skills
      .map((skill) => sanitizeText(skill, 60))
      .filter(Boolean)
      .slice(0, 24),
    experience: normalized.experience.map(sanitizeExperience).slice(0, 12),
    projects: normalized.projects.map(sanitizeProject).slice(0, 12),
    imports: normalized.imports.map(sanitizeImportRecord).slice(0, 20),
    customDomain: sanitizeCustomDomain(normalized.customDomain),
    analytics: sanitizeAnalyticsSummary(normalized.analytics),
    team: sanitizeTeam(normalized.team, normalized),
    exportSettings: sanitizeExportSettings(normalized.exportSettings),
    updatedAt: new Date().toISOString(),
  };
}
