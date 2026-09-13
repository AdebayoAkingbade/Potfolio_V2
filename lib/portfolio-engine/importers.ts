import type { PortfolioDraft } from "@/types/portfolio-engine";
import {
  createExperience,
  createImportRecord,
  createProject,
  createSocialLink,
  withPortfolioV2Defaults,
} from "@/lib/portfolio-engine/schema";
import { sanitizeMultilineText, sanitizeText, sanitizeUrl } from "@/lib/portfolio-engine/sanitize";

export type GitHubProfileImport = {
  login: string;
  name?: string | null;
  bio?: string | null;
  blog?: string | null;
  location?: string | null;
  html_url: string;
};

export type GitHubRepositoryImport = {
  name: string;
  description?: string | null;
  html_url: string;
  homepage?: string | null;
  language?: string | null;
  stargazers_count?: number;
  fork?: boolean;
  archived?: boolean;
  pushed_at?: string | null;
  topics?: string[];
};

const sectionHeadings = [
  "summary",
  "profile",
  "objective",
  "skills",
  "technical skills",
  "experience",
  "work experience",
  "employment",
  "projects",
  "selected projects",
  "education",
  "certifications",
  "awards",
];

function linesFromText(text: string) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeHeading(value: string) {
  return value.replace(/[:#-]/g, "").trim().toLowerCase();
}

function isSectionHeading(value: string) {
  return sectionHeadings.includes(normalizeHeading(value));
}

function collectSection(lines: string[], names: string[]) {
  const normalizedNames = new Set(names.map(normalizeHeading));
  const start = lines.findIndex((line) => normalizedNames.has(normalizeHeading(line)));
  if (start === -1) return "";

  const collected: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (isSectionHeading(line)) break;
    collected.push(line);
  }

  return collected.join("\n");
}

function splitCandidates(value: string) {
  return value
    .split(/[\n,;|•]+/g)
    .map((item) => sanitizeText(item.replace(/^[-*]\s*/, ""), 80))
    .filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function firstUsefulLine(lines: string[]) {
  return (
    lines.find(
      (line) =>
        line.length <= 80 &&
        !line.includes("@") &&
        !/^https?:\/\//i.test(line) &&
        !isSectionHeading(line),
    ) ?? ""
  );
}

function replaceEmptyDefaults<
  T extends { id: string; summary?: string; title?: string; role?: string },
>(
  existing: T[],
  imported: T[],
) {
  if (!imported.length) return existing;
  const hasUsefulExisting = existing.some(
    (item) => item.summary || item.title || item.role,
  );
  return hasUsefulExisting ? uniqueById([...imported, ...existing]) : imported;
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function importResumeTextIntoDraft(text: string, draft: PortfolioDraft): PortfolioDraft {
  const normalized = withPortfolioV2Defaults(draft);
  const safeText = sanitizeMultilineText(text, 120_000);
  const lines = linesFromText(safeText);
  const email = safeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = safeText.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0] ?? "";
  const urls = Array.from(safeText.matchAll(/https?:\/\/[^\s)]+/gi)).map((match) =>
    sanitizeUrl(match[0]),
  );
  const summary =
    collectSection(lines, ["summary", "profile", "objective"]) ||
    lines.slice(1, 5).join(" ");
  const skills = splitCandidates(collectSection(lines, ["skills", "technical skills"]));
  const experienceBlocks = collectSection(lines, ["experience", "work experience", "employment"])
    .split(/\n{2,}/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .slice(0, 4);
  const projectBlocks = collectSection(lines, ["projects", "selected projects"])
    .split(/\n{2,}/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .slice(0, 4);

  const importedExperience = experienceBlocks.map((block) => {
    const blockLines = linesFromText(block);
    return {
      ...createExperience(),
      role: sanitizeText(blockLines[0] ?? "", 120),
      organization: sanitizeText(blockLines[1] ?? "", 120),
      summary: sanitizeMultilineText(blockLines.slice(2).join(" ") || block, 900),
      highlights: splitCandidates(blockLines.slice(2).join("\n")).slice(0, 4),
    };
  });

  const importedProjects = projectBlocks.map((block) => {
    const blockLines = linesFromText(block);
    return {
      ...createProject(),
      title: sanitizeText(blockLines[0] ?? "", 140),
      role: normalized.basics.title,
      summary: sanitizeMultilineText(blockLines.slice(1).join(" ") || block, 900),
      outcome: sanitizeText(blockLines.find((line) => /\d|%|increased|reduced|saved/i.test(line)) ?? "", 240),
    };
  });

  const socialLinks = unique([
    ...normalized.basics.socialLinks.map((link) => link.url),
    ...urls,
  ])
    .filter(Boolean)
    .slice(0, 6)
    .map((url, index) => {
      const existing = normalized.basics.socialLinks.find((link) => link.url === url);
      return existing ?? createSocialLink(index === 0 ? "Website" : "Profile", url);
    });

  return {
    ...normalized,
    basics: {
      ...normalized.basics,
      name: normalized.basics.name || sanitizeText(firstUsefulLine(lines), 120),
      summary: normalized.basics.summary || sanitizeMultilineText(summary, 1200),
      email: normalized.basics.email || email,
      phone: normalized.basics.phone || sanitizeText(phone, 40),
      socialLinks: socialLinks.length ? socialLinks : normalized.basics.socialLinks,
    },
    skills: unique([...normalized.skills, ...skills]).slice(0, 24),
    experience: replaceEmptyDefaults(normalized.experience, importedExperience).slice(0, 12),
    projects: replaceEmptyDefaults(normalized.projects, importedProjects).slice(0, 12),
    imports: [
      createImportRecord(
        "resume",
        "Resume/CV import",
        `Imported ${skills.length} skills, ${importedExperience.length} experience entries, and ${importedProjects.length} projects.`,
        skills.length || importedExperience.length || importedProjects.length ? "imported" : "partial",
      ),
      ...normalized.imports,
    ].slice(0, 20),
    updatedAt: new Date().toISOString(),
  };
}

export function importGithubIntoDraft(
  profile: GitHubProfileImport,
  repositories: GitHubRepositoryImport[],
  draft: PortfolioDraft,
): PortfolioDraft {
  const normalized = withPortfolioV2Defaults(draft);
  const usefulRepositories = repositories
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .slice(0, 6);
  const languages = unique(
    usefulRepositories.flatMap((repo) => [repo.language ?? "", ...(repo.topics ?? [])]),
  );
  const githubLink = createSocialLink("GitHub", profile.html_url);
  const repoProjects = usefulRepositories.map((repo) => ({
    ...createProject(),
    title: repo.name.replace(/[-_]/g, " "),
    role: normalized.basics.title,
    summary:
      sanitizeMultilineText(repo.description ?? "", 500) ||
      `Open-source project maintained on GitHub with visible repository history and delivery proof.`,
    outcome:
      (repo.stargazers_count ?? 0) > 0
        ? `${repo.stargazers_count} GitHub stars`
        : repo.pushed_at
          ? `Recently maintained: ${repo.pushed_at.slice(0, 10)}`
          : "",
    links: [
      createSocialLink("Repository", repo.html_url),
      ...(repo.homepage ? [createSocialLink("Live", repo.homepage)] : []),
    ],
  }));

  return {
    ...normalized,
    basics: {
      ...normalized.basics,
      name: normalized.basics.name || sanitizeText(profile.name ?? profile.login, 120),
      summary:
        normalized.basics.summary ||
        sanitizeMultilineText(
          profile.bio ??
            `GitHub profile for ${profile.login}, imported with public repository proof.`,
          1200,
        ),
      location: normalized.basics.location || sanitizeText(profile.location ?? "", 120),
      socialLinks: uniqueById([githubLink, ...normalized.basics.socialLinks]).slice(0, 6),
    },
    skills: unique([...normalized.skills, ...languages]).slice(0, 24),
    projects: replaceEmptyDefaults(normalized.projects, repoProjects).slice(0, 12),
    imports: [
      createImportRecord(
        "github",
        `GitHub import: ${profile.login}`,
        `Imported ${usefulRepositories.length} repositories and ${languages.length} skill signals.`,
      ),
      ...normalized.imports,
    ].slice(0, 20),
    updatedAt: new Date().toISOString(),
  };
}
