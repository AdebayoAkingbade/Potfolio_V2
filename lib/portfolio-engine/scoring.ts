import type {
  PortfolioDraft,
  PortfolioScoreCheck,
  PortfolioScoreResult,
} from "@/types/portfolio-engine";

function scoreCheck(
  key: string,
  label: string,
  points: number,
  maxPoints: number,
  detail: string,
): PortfolioScoreCheck {
  return {
    key,
    label,
    points,
    maxPoints,
    detail,
    status: points === maxPoints ? "pass" : points > 0 ? "partial" : "fail",
  };
}

function countFilled(values: string[]) {
  return values.filter((value) => value.trim().length > 0).length;
}

export function calculatePortfolioScore(draft: PortfolioDraft): PortfolioScoreResult {
  const checks: PortfolioScoreCheck[] = [];
  const basics = draft.basics;

  const profileFields = countFilled([
    basics.name,
    basics.title,
    basics.summary,
    basics.location,
    basics.email || basics.phone,
  ]);
  checks.push(
    scoreCheck(
      "profile",
      "Profile completeness",
      Math.min(20, profileFields * 4),
      20,
      "Name, title, summary, location, and contact path should be clear.",
    ),
  );

  checks.push(
    scoreCheck(
      "summary",
      "Positioning strength",
      basics.summary.trim().length >= 160 ? 15 : basics.summary.trim().length >= 60 ? 8 : 0,
      15,
      "A strong summary says who you help, what you do, and what proof you bring.",
    ),
  );

  checks.push(
    scoreCheck(
      "skills",
      "Skill signal",
      draft.skills.length >= 8
        ? 15
        : draft.skills.length >= 4
          ? 9
          : draft.skills.length >= 1
            ? 4
            : 0,
      15,
      "A focused skill list helps recruiters and clients classify the portfolio quickly.",
    ),
  );

  const completeExperience = draft.experience.filter(
    (item) => item.role && item.organization && item.summary,
  ).length;
  checks.push(
    scoreCheck(
      "experience",
      "Experience proof",
      completeExperience >= 2 ? 15 : completeExperience === 1 ? 9 : 0,
      15,
      "Experience should show role, organization, context, and responsibility.",
    ),
  );

  const completeProjects = draft.projects.filter(
    (item) => item.title && item.summary && item.outcome,
  ).length;
  checks.push(
    scoreCheck(
      "projects",
      "Project evidence",
      completeProjects >= 3 ? 20 : completeProjects === 2 ? 14 : completeProjects === 1 ? 8 : 0,
      20,
      "Projects should include context, your role, and outcomes.",
    ),
  );

  const hasProof =
    draft.projects.some((project) => project.links.length > 0) || basics.socialLinks.length > 0;
  checks.push(
    scoreCheck(
      "proof",
      "External proof",
      hasProof ? 10 : 0,
      10,
      "Links to work, profiles, publications, or demos make the portfolio more trustworthy.",
    ),
  );

  const hasSeoSlug = draft.slug.trim().length > 0 && draft.slug.length <= 72;
  checks.push(
    scoreCheck(
      "seo",
      "SEO readiness",
      hasSeoSlug ? 5 : 0,
      5,
      "A clean slug and concise profile copy help public pages rank and share well.",
    ),
  );

  const score = checks.reduce((total, check) => total + check.points, 0);
  const level =
    score >= 88
      ? "Standout"
      : score >= 72
        ? "Interview-ready"
        : score >= 48
          ? "Solid draft"
          : "Needs work";

  return { score, level, checks };
}
