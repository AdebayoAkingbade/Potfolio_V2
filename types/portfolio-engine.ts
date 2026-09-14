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

export type PortfolioTemplateId =
  | "signal"
  | "atelier"
  | "ledger"
  | "stage"
  | "operator"
  | "gallery"
  | "pitch"
  | "agency";

export type PortfolioPlan = "free" | "pro";

export type PortfolioImportSource = "resume" | "github" | "clone";

export type PortfolioImportRecord = {
  id: string;
  source: PortfolioImportSource;
  label: string;
  status: "imported" | "partial" | "failed";
  detail: string;
  importedAt: string;
};

export type PortfolioCustomDomain = {
  hostname: string;
  status: "not-configured" | "pending-verification" | "active" | "error";
  verificationToken: string;
  target: string;
  connectedAt?: string;
  lastCheckedAt?: string;
  error?: string;
};

export type PortfolioAnalyticsDatum = {
  label: string;
  value: number;
};

export type PortfolioAnalyticsTrend = {
  date: string;
  views: number;
  visitors: number;
};

export type PortfolioAnalyticsSummary = {
  views: number;
  visitors: number;
  clicks: number;
  leads: number;
  projectViews: number;
  cvDownloads: number;
  contactClicks: number;
  linkedinClicks: number;
  githubClicks: number;
  avgReadSeconds: number;
  topReferrers: PortfolioAnalyticsDatum[];
  topSections: PortfolioAnalyticsDatum[];
  topProjects: PortfolioAnalyticsDatum[];
  trend: PortfolioAnalyticsTrend[];
};

export type PortfolioTeamRole = "owner" | "admin" | "editor" | "viewer";

export type PortfolioTeamMember = {
  id: string;
  name: string;
  email: string;
  role: PortfolioTeamRole;
  status: "active" | "invited";
  invitedAt?: string;
};

export type PortfolioTeam = {
  id: string;
  name: string;
  agencyMode: boolean;
  seats: number;
  members: PortfolioTeamMember[];
};

export type PortfolioExportSettings = {
  allowClone: boolean;
  preferredFormat: "json" | "html";
  lastExportedAt?: string;
};

export type ContactPreference = "email" | "linkedin" | "website" | "phone";

export type PortfolioAsset = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind?: "image" | "video" | "document";
  dataUrl?: string;
  url?: string;
  pathname?: string;
  storageProvider?: "local" | "supabase";
};

export type PortfolioVideoAsset = PortfolioAsset & {
  kind: "video";
  durationSeconds?: number;
  posterUrl?: string;
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

export type PortfolioEducation = {
  id: string;
  school: string;
  credential: string;
  field: string;
  start: string;
  end: string;
  summary: string;
};

export type PortfolioCertification = {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  url: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  role: string;
  summary: string;
  challenge: string;
  outcome: string;
  links: PortfolioSocialLink[];
  videos: PortfolioVideoAsset[];
};

export type PortfolioDraft = {
  portfolioVersion: 2;
  id: string;
  plan: PortfolioPlan;
  profession: ProfessionKey;
  templateId: PortfolioTemplateId;
  slug: string;
  basics: PortfolioBasics;
  skills: string[];
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
  certifications: PortfolioCertification[];
  projects: PortfolioProject[];
  imports: PortfolioImportRecord[];
  customDomain?: PortfolioCustomDomain;
  analytics: PortfolioAnalyticsSummary;
  team: PortfolioTeam;
  exportSettings: PortfolioExportSettings;
  createdAt: string;
  updatedAt: string;
};

export type PublishedPortfolio = PortfolioDraft & {
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
  tier: PortfolioPlan;
  category: "core" | "marketplace";
  creatorName: string;
  marketplaceBadge?: string;
  priceUsd?: number;
  supportsVideo?: boolean;
  usageCount?: number;
};

export type DraftValidationResult = {
  ok: boolean;
  errors: string[];
};
