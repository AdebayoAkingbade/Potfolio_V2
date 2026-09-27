import { describe, it, expect } from "vitest";
import {
  getPublicProjectProjection,
  getPublicProjects,
  sanitizeProjectForPublication,
} from "@/lib/portfolio-engine/visibility";
import { renderPortfolioExportHtml } from "@/lib/portfolio-engine/export";
import { sanitizeDraft } from "@/lib/portfolio-engine/sanitize";
import { calculatePortfolioScore } from "@/lib/portfolio-engine/scoring";
import { createDraft, createProject } from "@/lib/portfolio-engine/schema";
import { projects } from "@/data/site";
import { rawProjects } from "@/data/projects-private";
import type { Project } from "@/types/site";

describe("Project Visibility & Confidential / Stealth Mode", () => {
  const SECRET_VERCEL_URL = "https://kudipal-secret-staging-preview-9823.vercel.app";
  const SECRET_GITHUB_URL = "https://github.com/internal-corp/aguard-core-private-9823";
  const SECRET_TECH_DESC = "INTERNAL_CONFIDENTIAL_FILTER_ALGORITHM_WEIGHTS_XYZ_8472";
  const SECRET_IMPL_NOTE = "PRIVATE_IMPLEMENTATION_STEP_NEVER_LEAK_ABC_8472";
  const SECRET_CODE_SNIPPET = "const proprietaryAISecretKey = 'CRITICAL_INTERNAL_PROMPT_8472';";

  const stealthFixture: Project = {
    slug: "stealth-ai-engine",
    title: "Stealth AI Engine",
    category: "AI",
    description: "An AI-powered product currently under active development.",
    safeDescription: "An AI-powered product currently under active development. Details are intentionally limited prior to public release.",
    image: "/images/projects/atlas-observability.png",
    stack: ["TypeScript", "Next.js", "AI Integration", "System Design"],
    metrics: ["In Development", "Private Beta"],
    githubUrl: SECRET_GITHUB_URL,
    liveUrl: SECRET_VERCEL_URL,
    year: "2026",
    role: "Founder / Product Engineer",
    problem: SECRET_TECH_DESC,
    research: [SECRET_IMPL_NOTE],
    planning: ["Secret milestone 1", "Secret milestone 2"],
    architecture: ["Secret internal routing bus", "Secret vector cluster"],
    systemDesign: ["Secret multi-tenant isolation"],
    challenges: ["Proprietary optimization challenges"],
    solutions: ["Proprietary algorithmic solutions"],
    performance: ["Internal benchmark scores"],
    lessons: ["Internal post-mortem takeaways"],
    codeSnippet: SECRET_CODE_SNIPPET,
    gallery: ["/images/private/workflow-diagram.png"],
    visibility: "stealth",
    statusText: "AI Product · In Development",
    developmentStatus: "Currently in Development",
    safeCtaLabel: "Details Available on Request",
    capabilitiesDemonstrated: [
      "AI Product Development",
      "Product Architecture",
      "Full-Stack Engineering",
    ],
  };

  const privateFixture: Project = {
    slug: "classified-initiative",
    title: "Classified Initiative PRIVATE_PROJECT_SECRET_8472",
    category: "Security",
    description: "PRIVATE_PROJECT_SECRET_8472 confidential data",
    image: "/images/projects/kinetic-planner.png",
    stack: ["Go", "Cryptography"],
    metrics: ["Internal Only"],
    githubUrl: "https://github.com/secret/classified-repo-PRIVATE_PROJECT_SECRET_8472",
    liveUrl: "https://internal-env-PRIVATE_PROJECT_SECRET_8472.vercel.app",
    year: "2026",
    role: "Security Architect",
    problem: "PRIVATE_PROJECT_SECRET_8472 problem",
    research: [],
    planning: [],
    architecture: [],
    systemDesign: [],
    challenges: [],
    solutions: [],
    performance: [],
    lessons: [],
    codeSnippet: "const secret = 'PRIVATE_PROJECT_SECRET_8472';",
    gallery: [],
    visibility: "private",
  };

  const publicFixture: Project = {
    slug: "public-open-source",
    title: "Public Open Source Platform",
    category: "Fintech",
    description: "A publicly accessible open source payment gateway and dashboard.",
    image: "/images/projects/orbit-commerce.png",
    stack: ["React", "Node.js", "PostgreSQL"],
    metrics: ["99.9% Uptime", "50k Daily Transactions"],
    githubUrl: "https://github.com/public-org/open-platform",
    liveUrl: "https://open-platform.example.com",
    year: "2025",
    role: "Lead Engineer",
    problem: "Merchants need reliable payment orchestration.",
    research: ["Benchmarked latency across 5 regional gateways"],
    planning: ["Drafted idempotency specifications"],
    architecture: ["Event-driven worker pool with dead-letter queue"],
    systemDesign: ["Sharded PostgreSQL with read replicas"],
    challenges: ["Handling webhook retries gracefully"],
    solutions: ["Distributed Redis locking for settlement events"],
    performance: ["Under 45ms median API response"],
    lessons: ["Always verify webhook signatures before queueing"],
    codeSnippet: "const payment = await gateway.process(order);",
    gallery: ["/images/projects/orbit-commerce.png"],
    visibility: "public",
  };

  describe("Leakage Tests: Zero Sensitive Values in Public Projections", () => {
    it("strips private Vercel, GitHub, descriptions, notes, and code snippets from public project projection", () => {
      const projection = getPublicProjectProjection(stealthFixture);
      expect(projection).not.toBeNull();

      const serialized = JSON.stringify(projection);

      // Verify zero occurrences of every confidential marker
      expect(serialized).not.toContain(SECRET_VERCEL_URL);
      expect(serialized).not.toContain(SECRET_GITHUB_URL);
      expect(serialized).not.toContain(SECRET_TECH_DESC);
      expect(serialized).not.toContain(SECRET_IMPL_NOTE);
      expect(serialized).not.toContain(SECRET_CODE_SNIPPET);

      // Verify public links are strictly undefined
      expect(projection?.githubUrl).toBeUndefined();
      expect(projection?.liveUrl).toBeUndefined();
      expect(projection?.codeSnippet).toBe("");
      expect(projection?.gallery).toEqual([]);
      expect(projection?.architecture).toEqual([]);

      // Verify safe signals and capabilities are preserved
      expect(projection?.visibility).toBe("stealth");
      expect(projection?.statusText).toBe("AI Product · In Development");
      expect(projection?.capabilitiesDemonstrated).toContain("AI Product Development");
      expect(projection?.capabilitiesDemonstrated).toContain("Product Architecture");
      expect(projection?.capabilitiesDemonstrated).toContain("Full-Stack Engineering");
    });

    it("strips confidential links and private assets in Portfolio Engine sanitization", () => {
      const pProject = createProject();
      pProject.title = "Stealth Portfolio Tool";
      pProject.visibility = "stealth";
      pProject.links = [
        { id: "1", label: "Dev Vercel", url: SECRET_VERCEL_URL },
        { id: "2", label: "Private Repo", url: SECRET_GITHUB_URL },
      ];
      pProject.challenge = SECRET_IMPL_NOTE;

      const sanitized = sanitizeProjectForPublication(pProject);
      expect(sanitized).not.toBeNull();

      const serialized = JSON.stringify(sanitized);
      expect(serialized).not.toContain(SECRET_VERCEL_URL);
      expect(serialized).not.toContain(SECRET_GITHUB_URL);
      expect(serialized).not.toContain(SECRET_IMPL_NOTE);
      expect(sanitized?.links).toEqual([]);
      expect(sanitized?.challenge).toBe("");
    });

    it("never emits confidential URLs or sensitive snippets in static export HTML", () => {
      const draft = createDraft();
      draft.basics.name = "Adebayo Akingbade";
      const stealthP = createProject();
      stealthP.title = "Stealth AI Platform";
      stealthP.visibility = "stealth";
      stealthP.summary = "Intentionally confidential AI initiative under active development.";
      stealthP.links = [
        { id: "1", label: "Secret Vercel", url: SECRET_VERCEL_URL },
        { id: "2", label: "Secret GitHub", url: SECRET_GITHUB_URL },
      ];
      stealthP.safeCapabilities = ["AI Product Development", "System Design"];
      draft.projects = [stealthP];

      const html = renderPortfolioExportHtml(draft);

      expect(html).not.toContain(SECRET_VERCEL_URL);
      expect(html).not.toContain(SECRET_GITHUB_URL);
      expect(html).not.toContain(SECRET_TECH_DESC);
      expect(html).not.toContain(SECRET_IMPL_NOTE);
      expect(html).not.toContain(SECRET_CODE_SNIPPET);

      // Must render an intentional stealth badge and safe capability items
      expect(html).toContain("AI Product · In Development");
      expect(html).toContain("AI Product Development");
      expect(html).toContain("Details available on request");
    });
  });

  describe("Private Project Test: Complete Absence from Public Output", () => {
    it("returns null for private projects in public projection", () => {
      const projection = getPublicProjectProjection(privateFixture);
      expect(projection).toBeNull();
    });

    it("completely omits private projects from getPublicProjects collection", () => {
      const all = [publicFixture, privateFixture, stealthFixture];
      const publicOnly = getPublicProjects(all);

      expect(publicOnly).toHaveLength(2);
      expect(publicOnly.some((p) => p.slug === privateFixture.slug)).toBe(false);

      const serialized = JSON.stringify(publicOnly);
      expect(serialized).not.toContain("PRIVATE_PROJECT_SECRET_8472");
    });

    it("excludes private projects in sanitizeDraft and static export", () => {
      const draft = createDraft();
      const privateProj = createProject();
      privateProj.title = "PRIVATE_PROJECT_SECRET_8472 Project";
      privateProj.summary = "PRIVATE_PROJECT_SECRET_8472 summary";
      privateProj.visibility = "private";
      privateProj.links = [{ id: "1", label: "Private", url: "https://secret.com/PRIVATE_PROJECT_SECRET_8472" }];

      draft.projects = [privateProj];

      const sanitized = sanitizeDraft(draft);
      expect(sanitized.projects).toHaveLength(0);
      expect(JSON.stringify(sanitized)).not.toContain("PRIVATE_PROJECT_SECRET_8472");

      const html = renderPortfolioExportHtml(draft);
      expect(html).not.toContain("PRIVATE_PROJECT_SECRET_8472");
    });
  });

  describe("Public Project Regression: Legitimate URLs & Details Preserved", () => {
    it("preserves public demo, repository, and case study details for PUBLIC projects", () => {
      const projection = getPublicProjectProjection(publicFixture);
      expect(projection).not.toBeNull();
      expect(projection?.githubUrl).toBe("https://github.com/public-org/open-platform");
      expect(projection?.liveUrl).toBe("https://open-platform.example.com/");
      expect(projection?.codeSnippet).toBe("const payment = await gateway.process(order);");
      expect(projection?.challenges).toHaveLength(1);
      expect(projection?.solutions).toHaveLength(1);
    });
  });

  describe("Career Intelligence & Maturity Scoring with Stealth Initiatives", () => {
    it("does not penalize maturity or evidence scores when projects are in stealth", () => {
      const draft = createDraft();
      draft.basics.name = "Adebayo";
      draft.basics.title = "Staff AI Engineer";
      draft.basics.summary =
        "Experienced engineer designing resilient distributed systems, enterprise platforms, and intelligent AI products. Proven track record across high-volume environments.";
      draft.skills = ["TypeScript", "Python", "System Design", "AI", "React", "Next.js", "PostgreSQL", "Docker"];
      draft.experience = [
        {
          id: "exp-1",
          organization: "Ecobank",
          role: "Senior Engineer",
          start: "2022",
          end: "Present",
          summary: "Led frontend and admin systems for regional banking products.",
          highlights: ["Led regional banking admin systems"],
        },
        {
          id: "exp-2",
          organization: "Tech Co",
          role: "Software Engineer",
          start: "2020",
          end: "2022",
          summary: "Built scalable web applications and integrations.",
          highlights: ["Built scalable web applications"],
        },
      ];

      const stealthProject1 = createProject();
      stealthProject1.title = "Kudipal";
      stealthProject1.role = "Founder / Product Engineer";
      stealthProject1.summary = "AI-powered product under active development.";
      stealthProject1.visibility = "stealth";
      stealthProject1.links = []; // Public links hidden

      const stealthProject2 = createProject();
      stealthProject2.title = "AGuard AI";
      stealthProject2.role = "Founder / Product Engineer";
      stealthProject2.summary = "AI initiative for safe digital experiences.";
      stealthProject2.visibility = "stealth";
      stealthProject2.links = []; // Public links hidden

      const publicProject = createProject();
      publicProject.title = "Ecobank Business App";
      publicProject.summary = "Banking administration andmaker-checker workflows.";
      publicProject.outcome = "Processed millions in daily transaction controls.";
      publicProject.visibility = "public";

      draft.projects = [stealthProject1, stealthProject2, publicProject];

      const scoreResult = calculatePortfolioScore(draft);

      const projectEvidenceCheck = scoreResult.checks.find((c) => c.key === "projects");
      const proofCheck = scoreResult.checks.find((c) => c.key === "proof");

      // Stealth projects count towards complete project evidence
      expect(projectEvidenceCheck?.points).toBe(20);
      expect(projectEvidenceCheck?.status).toBe("pass");

      // Stealth projects count towards external proof without losing points
      expect(proofCheck?.points).toBe(10);
      expect(proofCheck?.status).toBe("pass");
    });
  });

  describe("Real Portfolio Data Gate: Kudipal and AGuard AI", () => {
    it("configures Kudipal as stealth and strips the Vercel preview link from the public projection", () => {
      const publicKudipal = projects.find((p) => p.slug === "kudipal");
      expect(publicKudipal).toBeDefined();
      expect(publicKudipal?.visibility).toBe("stealth");
      expect(publicKudipal?.liveUrl).toBeUndefined();
      expect(publicKudipal?.githubUrl).toBeUndefined();
      expect(publicKudipal?.codeSnippet).toBe("");
      expect(publicKudipal?.description).toContain("An AI-powered product currently under active development");

      // Verify the Vercel development URL does NOT exist anywhere in the public project serialization
      const serialized = JSON.stringify(publicKudipal);
      expect(serialized).not.toContain("nigeria-first-ai-ops-copilot.vercel.app");

      // But verify owner retains the private URL in rawProjects
      const rawKudipal = rawProjects.find((p) => p.slug === "kudipal");
      expect(rawKudipal?.liveUrl).toBe("https://nigeria-first-ai-ops-copilot.vercel.app/");
    });

    it("configures AGuard AI as stealth and strips the repository link from the public projection", () => {
      const publicAGuard = projects.find((p) => p.slug === "aguard-ai-filter");
      expect(publicAGuard).toBeDefined();
      expect(publicAGuard?.visibility).toBe("stealth");
      expect(publicAGuard?.githubUrl).toBeUndefined();
      expect(publicAGuard?.liveUrl).toBeUndefined();
      expect(publicAGuard?.codeSnippet).toBe("");
      expect(publicAGuard?.description).toContain("An AI initiative currently being developed around safer and more intelligent digital experiences");

      // Verify the repository URL does NOT exist anywhere in the public project serialization
      const serialized = JSON.stringify(publicAGuard);
      expect(serialized).not.toContain("github.com/AdebayoAkingbade/AGuard");

      // But verify owner retains the private repository in rawProjects
      const rawAGuard = rawProjects.find((p) => p.slug === "aguard-ai-filter");
      expect(rawAGuard?.githubUrl).toBe("https://github.com/AdebayoAkingbade/AGuard");
    });

    it("preserves public links for non-stealth projects in the real portfolio", () => {
      const publicProjectsInSite = projects.filter((p) => p.visibility === "public" || !p.visibility);
      expect(publicProjectsInSite.length).toBeGreaterThan(0);
      const withLiveOrGit = publicProjectsInSite.some((p) => p.liveUrl || p.githubUrl);
      expect(withLiveOrGit).toBe(true);
    });
  });
});
