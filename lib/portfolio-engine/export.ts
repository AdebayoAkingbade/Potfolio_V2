import type { PortfolioDraft } from "@/types/portfolio-engine";
import {
  createAnalyticsSummary,
  createImportRecord,
  withPortfolioV2Defaults,
} from "@/lib/portfolio-engine/schema";
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
    analytics: createAnalyticsSummary(),
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
  const education = portfolio.education
    .map(
      (item) => `<article>
        <h3>${escapeHtml(item.credential || item.field || "Education")}</h3>
        <p>${escapeHtml(item.school || "")}</p>
        <p>${escapeHtml(item.summary || "")}</p>
      </article>`,
    )
    .join("");
  const certifications = portfolio.certifications
    .map(
      (item) => `<article>
        <h3>${escapeHtml(item.name || "Certification")}</h3>
        <p>${escapeHtml(item.issuer || "")}</p>
      </article>`,
    )
    .join("");
  const projects = portfolio.projects
    .filter((project) => project.visibility !== "private")
    .map((project) => {
      if (project.visibility === "stealth") {
        const badge = escapeHtml(project.statusText || "In Development · Stealth");
        const safeCaps = (project.safeCapabilities ?? [])
          .map((cap) => `<li>${escapeHtml(cap)}</li>`)
          .join("");
        return `<article>
          <div style="display:inline-block; font-size:12px; font-weight:600; padding:2px 8px; border-radius:4px; background:#fef3c7; color:#92400e; margin-bottom:8px;">${badge}</div>
          <h3>${escapeHtml(project.title || "Project")}</h3>
          <p>${escapeHtml(project.summary || "AI initiative currently under active development. Details are intentionally limited prior to public release.")}</p>
          ${safeCaps ? `<ul style="margin-top:8px;">${safeCaps}</ul>` : ""}
          <p style="font-size:13px; color:#6b7280; margin-top:8px;">Details available on request</p>
        </article>`;
      }

      return `<article>
        <h3>${escapeHtml(project.title || "Project")}</h3>
        <p>${escapeHtml(project.summary || "")}</p>
        <strong>${escapeHtml(project.outcome || "")}</strong>
      </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data: https:; img-src data: https: http:; media-src https: http:; connect-src 'none'; script-src 'none'; base-uri 'none'; form-action 'none';" />
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
      <section><h2>Education</h2>${education}</section>
      <section><h2>Certifications</h2>${certifications}</section>
      <section><h2>Selected Work</h2>${projects}</section>
    </main>
  </body>
</html>`;
}
