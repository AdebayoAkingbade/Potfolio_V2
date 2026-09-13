import type {
  ContactPreference,
  PortfolioAnalyticsSummary,
  PortfolioCustomDomain,
  DraftValidationResult,
  PortfolioDraft,
  PortfolioExportSettings,
  PortfolioExperience,
  PortfolioImportRecord,
  PortfolioProject,
  PortfolioSocialLink,
  PortfolioTemplateId,
  PortfolioTeam,
  PortfolioTeamMember,
  PortfolioVideoAsset,
  ProfessionKey,
} from "@/types/portfolio-engine";
import { getProfessionConfig } from "@/lib/portfolio-engine/professions";
import { createPortfolioSlug, slugify } from "@/lib/portfolio-engine/slug";

export const MAX_IMAGE_SIZE_BYTES = 1_000_000;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_VIDEO_SIZE_BYTES = 25_000_000;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const PORTFOLIO_DOMAIN_TARGET = "cname.vercel-dns.com";

function now() {
  return new Date().toISOString();
}

export function createSocialLink(label = "", url = ""): PortfolioSocialLink {
  return {
    id: crypto.randomUUID(),
    label,
    url,
  };
}

export function createImportRecord(
  source: PortfolioImportRecord["source"],
  label: string,
  detail: string,
  status: PortfolioImportRecord["status"] = "imported",
): PortfolioImportRecord {
  return {
    id: crypto.randomUUID(),
    source,
    label,
    detail,
    status,
    importedAt: now(),
  };
}

export function createPortfolioDomain(hostname: string): PortfolioCustomDomain {
  const cleanHostname = hostname
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();

  return {
    hostname: cleanHostname,
    status: cleanHostname ? "pending-verification" : "not-configured",
    verificationToken: `portfolio-engine=${slugify(cleanHostname) || crypto.randomUUID()}`,
    target: PORTFOLIO_DOMAIN_TARGET,
    connectedAt: cleanHostname ? now() : undefined,
    lastCheckedAt: now(),
  };
}

export function createAnalyticsSummary(): PortfolioAnalyticsSummary {
  return {
    views: 0,
    visitors: 0,
    clicks: 0,
    leads: 0,
    avgReadSeconds: 0,
    topReferrers: [],
    topSections: [],
    trend: [],
  };
}

export function createPortfolioTeam(
  draftId: string,
  ownerEmail = "",
  ownerName = "Owner",
): PortfolioTeam {
  const members: PortfolioTeamMember[] = ownerEmail
    ? [
        {
          id: `${draftId}-owner`,
          name: ownerName,
          email: ownerEmail,
          role: "owner",
          status: "active",
        },
      ]
    : [];

  return {
    id: `${draftId}-team`,
    name: "Solo workspace",
    agencyMode: false,
    seats: Math.max(1, members.length),
    members,
  };
}

export function createExportSettings(): PortfolioExportSettings {
  return {
    allowClone: false,
    preferredFormat: "json",
  };
}

export function createExperience(): PortfolioExperience {
  return {
    id: crypto.randomUUID(),
    role: "",
    organization: "",
    start: "",
    end: "",
    summary: "",
    highlights: [""],
  };
}

export function createProject(): PortfolioProject {
  return {
    id: crypto.randomUUID(),
    title: "",
    role: "",
    summary: "",
    challenge: "",
    outcome: "",
    links: [createSocialLink("Project", "")],
    videos: [],
  };
}

export function createVideoAsset(file: File, dataUrl?: string): PortfolioVideoAsset {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type,
    size: file.size,
    kind: "video",
    dataUrl,
    storageProvider: dataUrl ? "local" : undefined,
  };
}

export function createDraft(
  profession: ProfessionKey = "software-technology",
  templateId: PortfolioTemplateId = "signal",
): PortfolioDraft {
  const professionConfig = getProfessionConfig(profession);
  const timestamp = now();
  const draftId = crypto.randomUUID();

  return {
    id: draftId,
    portfolioVersion: 2,
    plan: "free",
    profession,
    templateId,
    slug: "",
    basics: {
      name: "",
      title: "",
      summary: "",
      location: "",
      email: "",
      phone: "",
      contactPreference: "email" satisfies ContactPreference,
      socialLinks: [createSocialLink("LinkedIn", ""), createSocialLink("Website", "")],
    },
    skills: professionConfig.suggestedSkills.slice(0, 6),
    experience: [createExperience()],
    projects: [createProject()],
    imports: [],
    analytics: createAnalyticsSummary(),
    team: createPortfolioTeam(draftId),
    exportSettings: createExportSettings(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function withPortfolioV2Defaults(
  draft: PortfolioDraft,
  ownerEmail = "",
): PortfolioDraft {
  const ownerName = draft.basics.name || "Owner";
  const defaultTeam = createPortfolioTeam(draft.id, ownerEmail, ownerName);
  const team = draft.team ?? defaultTeam;

  return {
    ...draft,
    portfolioVersion: 2,
    plan: draft.plan === "pro" ? "pro" : "free",
    projects: (Array.isArray(draft.projects) ? draft.projects : []).map((project) => ({
      ...project,
      videos: project.videos ?? [],
    })),
    imports: draft.imports ?? [],
    customDomain: draft.customDomain,
    analytics: draft.analytics ?? createAnalyticsSummary(),
    team: {
      ...defaultTeam,
      ...team,
      seats: Math.max(team.seats || defaultTeam.seats, team.members?.length || 1),
      members: team.members?.length ? team.members : defaultTeam.members,
    },
    exportSettings: draft.exportSettings ?? createExportSettings(),
  };
}

export function updateDraftSlug(draft: PortfolioDraft) {
  return {
    ...draft,
    slug: draft.slug || createPortfolioSlug(draft.basics.name, draft.basics.title),
  };
}

export function validateDraftForPublish(draft: PortfolioDraft): DraftValidationResult {
  const errors: string[] = [];

  if (!draft.basics.name.trim()) errors.push("Add your name.");
  if (!draft.basics.title.trim()) errors.push("Add a professional title.");
  if (draft.basics.summary.trim().length < 60)
    errors.push("Add a stronger summary of at least 60 characters.");
  if (!draft.basics.email.trim() && !draft.basics.phone.trim())
    errors.push("Add at least one contact method.");
  if (draft.skills.length < 3) errors.push("Add at least three skills.");

  const hasProject = draft.projects.some(
    (project) => project.title.trim() && project.summary.trim() && project.outcome.trim(),
  );
  if (!hasProject) errors.push("Add at least one project or case study with an outcome.");

  return {
    ok: errors.length === 0,
    errors,
  };
}
