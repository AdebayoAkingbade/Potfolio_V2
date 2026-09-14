import type { PortfolioDraft, PortfolioPlan, PortfolioTemplate } from "@/types/portfolio-engine";

export type PortfolioFeature =
  | "customDomains"
  | "premiumTemplates"
  | "advancedAi"
  | "analytics"
  | "resumeGeneration"
  | "removeBranding"
  | "multiplePortfolios"
  | "cvImport"
  | "githubImport"
  | "videoUploads"
  | "teamSeats";

type EntitlementSet = Record<PortfolioFeature, boolean>;

export const PORTFOLIO_PRO_PRICE_NGN = 3000;
export const PORTFOLIO_PRO_PRICE_LABEL = "NGN 3,000";

const proEntitlements: EntitlementSet = {
  customDomains: true,
  premiumTemplates: true,
  advancedAi: true,
  analytics: true,
  resumeGeneration: true,
  removeBranding: true,
  multiplePortfolios: true,
  cvImport: true,
  githubImport: true,
  videoUploads: true,
  teamSeats: true,
};

const freeEntitlements: EntitlementSet = {
  customDomains: false,
  premiumTemplates: false,
  advancedAi: false,
  analytics: true,
  resumeGeneration: true,
  removeBranding: false,
  multiplePortfolios: false,
  cvImport: true,
  githubImport: true,
  videoUploads: false,
  teamSeats: false,
};

export const portfolioFeatureLabels: Record<PortfolioFeature, string> = {
  customDomains: "Custom domains",
  premiumTemplates: "Premium templates",
  advancedAi: "Advanced AI",
  analytics: "Analytics",
  resumeGeneration: "Resume generation",
  removeBranding: "Remove branding",
  multiplePortfolios: "Multiple portfolios",
  cvImport: "CV import",
  githubImport: "GitHub import",
  videoUploads: "Video uploads",
  teamSeats: "Team seats",
};

export function getPortfolioEntitlements(plan: PortfolioPlan): EntitlementSet {
  return plan === "pro" ? proEntitlements : freeEntitlements;
}

export function coercePortfolioPlan(plan: unknown): PortfolioPlan {
  return plan === "free" ? "free" : "pro";
}

export function hasPortfolioFeature(
  planOrDraft: PortfolioPlan | Pick<PortfolioDraft, "plan">,
  feature: PortfolioFeature,
) {
  const plan = typeof planOrDraft === "string" ? planOrDraft : planOrDraft.plan;
  return getPortfolioEntitlements(plan)[feature];
}

export function isTemplateAvailableForPlan(template: PortfolioTemplate, plan: PortfolioPlan) {
  return template.tier !== "pro" || hasPortfolioFeature(plan, "premiumTemplates");
}

export function getPortfolioPlanLabel(plan: PortfolioPlan) {
  return plan === "pro" ? "Pro" : "Free";
}

export function isHostedCheckoutConfigured() {
  return Boolean(process.env.STRIPE_PRO_CHECKOUT_URL);
}
