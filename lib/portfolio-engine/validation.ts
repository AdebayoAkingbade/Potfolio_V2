import type {
  PortfolioAnalyticsDatum,
  PortfolioAnalyticsSummary,
  ContactPreference,
  PortfolioAsset,
  PortfolioCustomDomain,
  PortfolioDraft,
  PortfolioExportSettings,
  PortfolioExperience,
  PortfolioImportRecord,
  PortfolioImportSource,
  PortfolioPlan,
  PortfolioProject,
  PortfolioSocialLink,
  PortfolioTemplateId,
  PortfolioTeam,
  PortfolioTeamMember,
  PortfolioTeamRole,
  PortfolioVideoAsset,
  ProfessionKey,
} from "@/types/portfolio-engine";
import { professionConfigs } from "@/lib/portfolio-engine/professions";
import {
  PORTFOLIO_DOMAIN_TARGET,
  createAnalyticsSummary,
  createDraft,
  createExperience,
  createExportSettings,
  createProject,
  createSocialLink,
} from "@/lib/portfolio-engine/schema";
import { portfolioTemplates } from "@/lib/portfolio-engine/templates";

const professionKeys = new Set(professionConfigs.map((profession) => profession.key));
const templateIds = new Set(portfolioTemplates.map((template) => template.id));
const contactPreferences = new Set<ContactPreference>(["email", "linkedin", "website", "phone"]);
const portfolioPlans = new Set<PortfolioPlan>(["free", "pro"]);
const importSources = new Set<PortfolioImportSource>(["resume", "github", "clone"]);
const teamRoles = new Set<PortfolioTeamRole>(["owner", "admin", "editor", "viewer"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function idValue(value: unknown) {
  return stringValue(value) || crypto.randomUUID();
}

function professionValue(value: unknown): ProfessionKey {
  return professionKeys.has(value as ProfessionKey)
    ? (value as ProfessionKey)
    : "software-technology";
}

function templateValue(value: unknown): PortfolioTemplateId {
  return templateIds.has(value as PortfolioTemplateId) ? (value as PortfolioTemplateId) : "signal";
}

function contactPreferenceValue(value: unknown): ContactPreference {
  return contactPreferences.has(value as ContactPreference) ? (value as ContactPreference) : "email";
}

function planValue(value: unknown): PortfolioPlan {
  return portfolioPlans.has(value as PortfolioPlan) ? (value as PortfolioPlan) : "free";
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function socialLinkValue(value: unknown): PortfolioSocialLink {
  if (!isRecord(value)) return createSocialLink();

  return {
    id: idValue(value.id),
    label: stringValue(value.label),
    url: stringValue(value.url),
  };
}

function assetValue(value: unknown): PortfolioAsset | undefined {
  if (!isRecord(value)) return undefined;

  const dataUrl = stringValue(value.dataUrl);
  const url = stringValue(value.url);
  if (!dataUrl && !url) return undefined;

  return {
    id: idValue(value.id),
    name: stringValue(value.name),
    mimeType: stringValue(value.mimeType),
    size: typeof value.size === "number" ? value.size : 0,
    kind:
      value.kind === "video" || value.kind === "document" || value.kind === "image"
        ? value.kind
        : undefined,
    dataUrl: dataUrl || undefined,
    url: url || undefined,
    pathname: stringValue(value.pathname) || undefined,
    storageProvider: value.storageProvider === "supabase" ? "supabase" : "local",
  };
}

function videoAssetValue(value: unknown): PortfolioVideoAsset | null {
  if (!isRecord(value)) return null;

  const dataUrl = stringValue(value.dataUrl);
  const url = stringValue(value.url);
  if (!dataUrl && !url) return null;

  return {
    id: idValue(value.id),
    name: stringValue(value.name),
    mimeType: stringValue(value.mimeType),
    size: numberValue(value.size),
    kind: "video",
    dataUrl: dataUrl || undefined,
    url: url || undefined,
    pathname: stringValue(value.pathname) || undefined,
    storageProvider: value.storageProvider === "supabase" ? "supabase" : "local",
    durationSeconds:
      typeof value.durationSeconds === "number" ? value.durationSeconds : undefined,
    posterUrl: stringValue(value.posterUrl) || undefined,
  };
}

function experienceValue(value: unknown): PortfolioExperience {
  if (!isRecord(value)) return createExperience();

  return {
    id: idValue(value.id),
    role: stringValue(value.role),
    organization: stringValue(value.organization),
    start: stringValue(value.start),
    end: stringValue(value.end),
    summary: stringValue(value.summary),
    highlights: stringArray(value.highlights),
  };
}

function projectValue(value: unknown): PortfolioProject {
  if (!isRecord(value)) return createProject();

  return {
    id: idValue(value.id),
    title: stringValue(value.title),
    role: stringValue(value.role),
    summary: stringValue(value.summary),
    challenge: stringValue(value.challenge),
    outcome: stringValue(value.outcome),
    links: Array.isArray(value.links) ? value.links.map(socialLinkValue) : [],
    videos: Array.isArray(value.videos)
      ? value.videos
          .map(videoAssetValue)
          .filter((asset): asset is PortfolioVideoAsset => Boolean(asset))
      : [],
  };
}

function importRecordValue(value: unknown): PortfolioImportRecord | null {
  if (!isRecord(value)) return null;

  return {
    id: idValue(value.id),
    source: importSources.has(value.source as PortfolioImportSource)
      ? (value.source as PortfolioImportSource)
      : "resume",
    label: stringValue(value.label),
    status:
      value.status === "partial" || value.status === "failed" || value.status === "imported"
        ? value.status
        : "imported",
    detail: stringValue(value.detail),
    importedAt: stringValue(value.importedAt) || new Date().toISOString(),
  };
}

function customDomainValue(value: unknown): PortfolioCustomDomain | undefined {
  if (!isRecord(value)) return undefined;
  const hostname = stringValue(value.hostname);
  if (!hostname) return undefined;

  return {
    hostname,
    status:
      value.status === "active" ||
      value.status === "error" ||
      value.status === "not-configured" ||
      value.status === "pending-verification"
        ? value.status
        : "pending-verification",
    verificationToken: stringValue(value.verificationToken),
    target: stringValue(value.target) || PORTFOLIO_DOMAIN_TARGET,
    connectedAt: stringValue(value.connectedAt) || undefined,
    lastCheckedAt: stringValue(value.lastCheckedAt) || undefined,
    error: stringValue(value.error) || undefined,
  };
}

function analyticsDatumValue(value: unknown): PortfolioAnalyticsDatum | null {
  if (!isRecord(value)) return null;

  return {
    label: stringValue(value.label),
    value: numberValue(value.value),
  };
}

function analyticsSummaryValue(value: unknown): PortfolioAnalyticsSummary {
  if (!isRecord(value)) return createAnalyticsSummary();

  return {
    views: numberValue(value.views),
    visitors: numberValue(value.visitors),
    clicks: numberValue(value.clicks),
    leads: numberValue(value.leads),
    avgReadSeconds: numberValue(value.avgReadSeconds),
    topReferrers: Array.isArray(value.topReferrers)
      ? value.topReferrers
          .map(analyticsDatumValue)
          .filter((item): item is PortfolioAnalyticsDatum => Boolean(item))
      : [],
    topSections: Array.isArray(value.topSections)
      ? value.topSections
          .map(analyticsDatumValue)
          .filter((item): item is PortfolioAnalyticsDatum => Boolean(item))
      : [],
    trend: Array.isArray(value.trend)
      ? value.trend
          .filter(isRecord)
          .map((item) => ({
            date: stringValue(item.date),
            views: numberValue(item.views),
            visitors: numberValue(item.visitors),
          }))
      : [],
  };
}

function teamMemberValue(value: unknown): PortfolioTeamMember | null {
  if (!isRecord(value)) return null;
  const email = stringValue(value.email);
  if (!email) return null;

  return {
    id: idValue(value.id),
    name: stringValue(value.name),
    email,
    role: teamRoles.has(value.role as PortfolioTeamRole)
      ? (value.role as PortfolioTeamRole)
      : "viewer",
    status: value.status === "active" ? "active" : "invited",
    invitedAt: stringValue(value.invitedAt) || undefined,
  };
}

function teamValue(value: unknown, draftId: string): PortfolioTeam {
  if (!isRecord(value)) {
    return {
      id: `${draftId}-team`,
      name: "Solo workspace",
      agencyMode: false,
      seats: 1,
      members: [],
    };
  }

  const members = Array.isArray(value.members)
    ? value.members
        .map(teamMemberValue)
        .filter((member): member is PortfolioTeamMember => Boolean(member))
    : [];

  return {
    id: idValue(value.id),
    name: stringValue(value.name) || "Solo workspace",
    agencyMode: Boolean(value.agencyMode),
    seats: Math.max(1, Math.round(numberValue(value.seats) || members.length || 1)),
    members,
  };
}

function exportSettingsValue(value: unknown): PortfolioExportSettings {
  if (!isRecord(value)) return createExportSettings();

  return {
    allowClone: Boolean(value.allowClone),
    preferredFormat: value.preferredFormat === "html" ? "html" : "json",
    lastExportedAt: stringValue(value.lastExportedAt) || undefined,
  };
}

export function coercePortfolioDraft(value: unknown): PortfolioDraft | null {
  if (!isRecord(value)) return null;

  const profession = professionValue(value.profession);
  const draft = createDraft(profession, templateValue(value.templateId));
  const basics = isRecord(value.basics) ? value.basics : {};
  const draftId = idValue(value.id);

  return {
    ...draft,
    id: draftId,
    portfolioVersion: 2,
    plan: planValue(value.plan),
    profession,
    templateId: templateValue(value.templateId),
    slug: stringValue(value.slug),
    basics: {
      name: stringValue(basics.name),
      title: stringValue(basics.title),
      summary: stringValue(basics.summary),
      location: stringValue(basics.location),
      email: stringValue(basics.email),
      phone: stringValue(basics.phone),
      contactPreference: contactPreferenceValue(basics.contactPreference),
      socialLinks: Array.isArray(basics.socialLinks)
        ? basics.socialLinks.map(socialLinkValue)
        : draft.basics.socialLinks,
      profilePhoto: assetValue(basics.profilePhoto),
    },
    skills: stringArray(value.skills),
    experience: Array.isArray(value.experience)
      ? value.experience.map(experienceValue)
      : draft.experience,
    projects: Array.isArray(value.projects) ? value.projects.map(projectValue) : draft.projects,
    imports: Array.isArray(value.imports)
      ? value.imports
          .map(importRecordValue)
          .filter((record): record is PortfolioImportRecord => Boolean(record))
      : [],
    customDomain: customDomainValue(value.customDomain),
    analytics: analyticsSummaryValue(value.analytics),
    team: teamValue(value.team, draftId || draft.id),
    exportSettings: exportSettingsValue(value.exportSettings),
    createdAt: stringValue(value.createdAt) || draft.createdAt,
    updatedAt: stringValue(value.updatedAt) || draft.updatedAt,
  };
}
