export type ProfessionKey =
  | "software-technology"
  | "data-ai"
  | "product"
  | "design"
  | "marketing"
  | "writing"
  | "photography-video"
  | "architecture-engineering"
  | "business-consulting"
  | "finance"
  | "research-academia"
  | "students-graduates"
  | "freelancers"
  | "creative-arts"
  | "events-hospitality"
  | "education"
  | "sales"
  | "hr-recruitment"
  | "public-relations"
  | "legal"
  | "healthcare"
  | "entrepreneurs";

export type PortfolioTemplateId = "signal" | "atelier" | "ledger" | "stage";

export type ContactPreference = "email" | "linkedin" | "website" | "phone";

export type PortfolioAsset = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
};

export type PortfolioSocialLink = {
  id: string;
  label: string;
  url: string;
};

export type PortfolioBasics = {
  name: string;
  title: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  contactPreference: ContactPreference;
  socialLinks: PortfolioSocialLink[];
  profilePhoto?: PortfolioAsset;
};

export type PortfolioExperience = {
  id: string;
  role: string;
  organization: string;
  start: string;
  end: string;
  summary: string;
  highlights: string[];
};

export type PortfolioProject = {
  id: string;
  title: string;
  role: string;
  summary: string;
  challenge: string;
  outcome: string;
  links: PortfolioSocialLink[];
};

export type PortfolioDraft = {
  id: string;
  profession: ProfessionKey;
  templateId: PortfolioTemplateId;
  slug: string;
  basics: PortfolioBasics;
  skills: string[];
  experience: PortfolioExperience[];
  projects: PortfolioProject[];
  createdAt: string;
  updatedAt: string;
};

export type PublishedPortfolio = Omit<PortfolioDraft, "updatedAt"> & {
  publicationId: string;
  sourceDraftId: string;
  version: number;
  publishedAt: string;
  score: PortfolioScoreResult;
};

export type PortfolioScoreCheck = {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  status: "pass" | "partial" | "fail";
  detail: string;
};

export type PortfolioScoreResult = {
  score: number;
  level: "Needs work" | "Solid draft" | "Interview-ready" | "Standout";
  checks: PortfolioScoreCheck[];
};

export type ProfessionConfig = {
  key: ProfessionKey;
  label: string;
  description: string;
  suggestedSections: string[];
  suggestedSkills: string[];
  projectStructure: string[];
  onboardingQuestions: string[];
  aiPromptConfig: {
    roleContext: string;
    tone: string;
    focus: string[];
  };
  scoringRules: string[];
  recommendedTemplates: PortfolioTemplateId[];
};

export type PortfolioTemplate = {
  id: PortfolioTemplateId;
  name: string;
  description: string;
  bestFor: string[];
  accentClass: string;
  previewClass: string;
};

export type DraftValidationResult = {
  ok: boolean;
  errors: string[];
};
