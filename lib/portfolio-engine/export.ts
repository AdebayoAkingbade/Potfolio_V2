import type { PortfolioDraft } from "@/types/portfolio-engine";
import { createImportRecord, withPortfolioV2Defaults } from "@/lib/portfolio-engine/schema";
import { sanitizeDraft } from "@/lib/portfolio-engine/sanitize";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function clonePortfolioDraft(draft: PortfolioDraft): PortfolioDraft {
  const source = withPortfolioV2Defaults(draft);
  const timestamp = new Date().toISOString();

  return {
    ...source,
    id: crypto.randomUUID(),
    slug: "",
    customDomain: undefined,
    imports: [
      createImportRecord("clone", source.basics.name || "Portfolio", "Cloned from an existing draft."),
      ...source.imports,
    ].slice(0, 20),
    analytics: {
      views: 0,
      visitors: 0,
      clicks: 0,
      leads: 0,
      avgReadSeconds: 0,
      topReferrers: [],
      topSections: [],
      trend: [],
    },
    team: {
      ...source.team,
      id: `${crypto.randomUUID()}-team`,
      members: source.team.members.filter((member) => member.role === "owner"),
      agencyMode: source.team.agencyMode,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function renderPortfolioExportHtml(draft: PortfolioDraft) {
  const portfolio = sanitizeDraft(draft);
  const links = portfolio.basics.socialLinks
    .map(
      (link) =>
        `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(
          link.label || link.url,
        )}</a>`,
    )
    .join("");
  const skills = portfolio.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("");
  const experience = portfolio.experience
    .map(
      (item) => `<article>
        <h3>${escapeHtml(item.role || "Role")}</h3>
        <p>${escapeHtml(item.organization || "")}</p>
        <p>${escapeHtml(item.summary || "")}</p>
      </article>`,
    )
    .join("");
  const projects = portfolio.projects
    .map(
      (project) => `<article>
        <h3>${escapeHtml(project.title || "Project")}</h3>
        <p>${escapeHtml(project.summary || "")}</p>
        <strong>${escapeHtml(project.outcome || "")}</strong>
      </article>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(portfolio.basics.name || "Portfolio")}</title>
    <style>
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #111827; background: #f8fafc; }
      main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 56px 0; }
      header, section { border: 1px solid #d1d5db; border-radius: 8px; background: white; padding: 28px; margin-bottom: 20px; }
      h1 { font-size: clamp(40px, 8vw, 72px); line-height: 0.95; margin: 0; }
      h2 { margin: 0 0 16px; }
      article { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px; }
      ul { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }
      li { border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 10px; }
      a { color: #047857; margin-right: 12px; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${escapeHtml(portfolio.basics.name || "Your Name")}</h1>
        <p>${escapeHtml(portfolio.basics.title || "")}</p>
        <p>${escapeHtml(portfolio.basics.summary || "")}</p>
        <nav>${links}</nav>
      </header>
      <section><h2>Skills</h2><ul>${skills}</ul></section>
      <section><h2>Experience</h2>${experience}</section>
      <section><h2>Selected Work</h2>${projects}</section>
    </main>
  </body>
</html>`;
}
