import type { Project, ProjectVisibility } from "@/types/site";
import type { PortfolioProject } from "@/types/portfolio-engine";
import {
  sanitizeMultilineText,
  sanitizeText,
  sanitizeWebUrl,
  sanitizeVideoUrl,
} from "./sanitize";

export function isStealthProject(project: { visibility?: ProjectVisibility }): boolean {
  return project.visibility === "stealth";
}

export function isPrivateProject(project: { visibility?: ProjectVisibility }): boolean {
  return project.visibility === "private";
}

export function isPublicProject(project: { visibility?: ProjectVisibility }): boolean {
  return !project.visibility || project.visibility === "public";
}

/**
 * Public Data Projection for site-level Project entities.
 * Enforces a strict data minimization boundary:
 * - PRIVATE projects return null (completely excluded from public representation)
 * - STEALTH projects return an intentionally safe projection with NO confidential links,
 *   code snippets, secret architectures, or internal screenshots.
 * - PUBLIC projects return a sanitized public representation.
 */
export function getPublicProjectProjection(project: Project): Project | null {
  if (project.visibility === "private") {
    return null;
  }

  if (project.visibility === "stealth") {
    return {
      slug: sanitizeText(project.slug, 80),
      title: sanitizeText(project.title, 140),
      category: project.category,
      description:
        sanitizeMultilineText(project.safeDescription || project.description, 1200) ||
        "An AI-powered product currently under active development. Details are intentionally limited prior to public release.",
      safeDescription: sanitizeMultilineText(project.safeDescription, 1200),
      image: project.image,
      stack: (project.stack ?? []).map((tech) => sanitizeText(tech, 60)).slice(0, 10),
      metrics: (project.metrics ?? []).map((m) => sanitizeText(m, 80)).slice(0, 6),
      year: sanitizeText(project.year, 20),
      role: sanitizeText(project.role, 100),
      problem:
        "Proprietary AI initiative under active development. Architectural capabilities and engineering rigor are demonstrated while protecting unreleased product mechanics.",
      research: [],
      planning: [],
      architecture: [],
      systemDesign: [],
      challenges: [],
      solutions: [],
      performance: [],
      lessons: [],
      codeSnippet: "",
      gallery: [],
      // Redact sensitive URLs completely
      githubUrl: undefined,
      liveUrl: undefined,
      visibility: "stealth",
      statusText: sanitizeText(project.statusText, 80) || "AI Product · In Development",
      developmentStatus:
        sanitizeText(project.developmentStatus, 80) || "Currently in Development",
      capabilitiesDemonstrated: (project.capabilitiesDemonstrated ?? [
        "AI Product Development",
        "Product Architecture",
        "Full-Stack Engineering",
      ]).map((cap) => sanitizeText(cap, 80)),
      safeCtaLabel: sanitizeText(project.safeCtaLabel, 80) || "Details Available on Request",
    };
  }

  // PUBLIC project
  return {
    ...project,
    slug: sanitizeText(project.slug, 80),
    title: sanitizeText(project.title, 140),
    description: sanitizeMultilineText(project.description, 1200),
    githubUrl: project.githubUrl ? sanitizeWebUrl(project.githubUrl) || undefined : undefined,
    liveUrl: project.liveUrl ? sanitizeWebUrl(project.liveUrl) || undefined : undefined,
    visibility: "public",
  };
}

/**
 * Filter and project an array of site projects to public-safe projects.
 */
export function getPublicProjects(projects: Project[]): Project[] {
  return projects
    .map(getPublicProjectProjection)
    .filter((project): project is Project => project !== null);
}

/**
 * Public Data Projection for Portfolio Engine PortfolioProject entities.
 * - PRIVATE: returns null
 * - STEALTH: returns sanitized metadata, strips links and videos, preserves capability indicators
 * - PUBLIC: normal sanitized project
 */
export function sanitizeProjectForPublication(
  project: PortfolioProject,
): PortfolioProject | null {
  if (project.visibility === "private") {
    return null;
  }

  if (project.visibility === "stealth") {
    return {
      id: sanitizeText(project.id, 80) || crypto.randomUUID(),
      title: sanitizeText(project.title, 140),
      role: sanitizeText(project.role, 120),
      summary: sanitizeMultilineText(project.summary, 1200),
      challenge: "", // Stripped for stealth
      outcome:
        sanitizeMultilineText(project.outcome, 1200) || "In Active Development",
      links: [], // Sensitive public links removed
      videos: [], // Private videos removed
      visibility: "stealth",
      statusText: sanitizeText(project.statusText, 80) || "AI Product · In Development",
      safeCapabilities: (project.safeCapabilities ?? []).map((c) => sanitizeText(c, 80)).filter(Boolean),
    };
  }

  return {
    id: sanitizeText(project.id, 80) || crypto.randomUUID(),
    title: sanitizeText(project.title, 140),
    role: sanitizeText(project.role, 120),
    summary: sanitizeMultilineText(project.summary, 1200),
    challenge: sanitizeMultilineText(project.challenge, 1200),
    outcome: sanitizeMultilineText(project.outcome, 1200),
    links: (project.links ?? [])
      .map((link) => ({
        id: sanitizeText(link.id, 80) || crypto.randomUUID(),
        label: sanitizeText(link.label, 40),
        url: sanitizeWebUrl(link.url),
      }))
      .filter((link) => link.url)
      .slice(0, 4),
    videos: (project.videos ?? [])
      .map((video) => ({
        ...video,
        url: video.url ? sanitizeVideoUrl(video.url) : undefined,
      }))
      .filter((v) => Boolean(v.url || v.dataUrl))
      .slice(0, 3),
    visibility: "public",
    statusText: project.statusText ? sanitizeText(project.statusText, 80) : undefined,
    safeCapabilities: project.safeCapabilities?.map((c) => sanitizeText(c, 80)),
  };
}
