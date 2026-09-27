// ─────────────────────────────────────────────────────────────────────────────
// Career Intelligence Engine — Canonical Type Definitions
// Phase 2: Milestone 1
//
// One universal evidence model. Profession-specific interpretation lives in
// the profession registry (professions/). This file defines WHAT we store,
// not what it means for any particular career.
// ─────────────────────────────────────────────────────────────────────────────

// ── Schema versioning ────────────────────────────────────────────────────────

/** Current canonical Career Evidence Graph schema version.
 *  Increment when the shape changes in a breaking way. */
export const CAREER_GRAPH_VERSION = 1 as const;
export type CareerGraphVersion = typeof CAREER_GRAPH_VERSION;

// ── Evidence source provenance ────────────────────────────────────────────────

export type EvidenceSourceType =
  | "USER_ENTERED"
  | "RESUME"
  | "CV"
  | "GITHUB"
  | "IMPORTED_DOCUMENT"
  | "EXTERNAL_LINK"
  | "CERTIFICATE"
  | "PORTFOLIO_IMPORT"
  | "AI_SUGGESTED"
  | "SYSTEM_INFERRED"
  | "USER_VERIFIED";

export type VerificationStatus =
  | "UNVERIFIED"
  | "SOURCE_SUPPORTED"
  | "USER_CONFIRMED"
  | "CONFLICTING"
  | "NEEDS_REVIEW";

/** Tracks where a piece of evidence came from. */
export type EvidenceSource = {
  id: string;
  /** Coarse category of origin */
  sourceType: EvidenceSourceType;
  /** Optional identifier for the specific import session or document */
  sourceId?: string;
  /** Human-readable reference (e.g. "Resume uploaded 2024-01-01") */
  sourceReference?: string;
  createdAt: string;
};

// ── Claim epistemic model ─────────────────────────────────────────────────────

/** The epistemic status of a single claim. AI wording is never FACT. */
export type ClaimKind =
  | "FACT"           // User stated this; source-supported
  | "STRUCTURAL_INFERENCE"  // System classified this from context
  | "WORDING"        // AI-generated phrasing of a fact
  | "SUGGESTION"     // System or AI recommendation to fill a gap
  | "UNKNOWN";       // Information is absent or unverifiable

/** A single verifiable claim attached to a node. */
export type CareerClaim = {
  id: string;
  /** The actual value claimed */
  value: string;
  kind: ClaimKind;
  sourceType: EvidenceSourceType;
  sourceId?: string;
  confidence: number; // 0–1
  verificationStatus: VerificationStatus;
  createdAt: string;
  userVerifiedAt?: string;
};

// ── Privacy / visibility ──────────────────────────────────────────────────────

export type VisibilityIntent =
  | "PRIVATE"         // Never publish
  | "PORTFOLIO"       // Include in portfolio output
  | "PUBLIC"          // Fully public
  | "REVIEW_REQUIRED" // User must review before publishing
  | "STEALTH";        // Intentionally limited public disclosure for confidential/in-development work

// ── Deduplication / conflict state ───────────────────────────────────────────

export type DuplicateStatus =
  | "DISTINCT"
  | "PROBABLE_DUPLICATE"
  | "SUGGESTED_MERGE"
  | "CONFIRMED_MERGE";

export type ConflictField =
  | "DATE"
  | "TITLE"
  | "ORGANIZATION"
  | "METRIC"
  | "CREDENTIAL"
  | "GENERAL";

export type CareerConflict = {
  id: string;
  nodeIds: [string, string]; // IDs of the two nodes in conflict
  field: ConflictField;
  description: string;
  resolution?: "KEPT_FIRST" | "KEPT_SECOND" | "USER_RESOLVED" | "PENDING";
  createdAt: string;
};

// ── Metric / impact ───────────────────────────────────────────────────────────

export type MetricCategory =
  | "REVENUE"
  | "COST_SAVINGS"
  | "CONVERSION"
  | "GROWTH"
  | "UPTIME"
  | "LATENCY"
  | "DELIVERY_TIME"
  | "CUSTOMER_SATISFACTION"
  | "CASE_VOLUME"
  | "RESEARCH_CITATIONS"
  | "STUDENTS_TAUGHT"
  | "PASS_RATE"
  | "PATIENT_VOLUME"
  | "PROCESS_IMPROVEMENT"
  | "RISK_REDUCTION"
  | "AUDIT_FINDINGS"
  | "CAMPAIGN_REACH"
  | "QUOTA_ATTAINMENT"
  | "RETENTION"
  | "TEAM_SIZE"
  | "FUNDING"
  | "PRODUCTION_OUTPUT"
  | "OTHER";

export type AchievementMetric = {
  category: MetricCategory;
  value?: number;
  unit?: string;
  baseline?: string;
  result?: string;
  timeframe?: string;
  /** Whether the metric was provided by the user or inferred */
  sourceKind: "USER_PROVIDED" | "SYSTEM_INFERRED";
};

/** A first-class achievement or impact node. NOT buried in job descriptions. */
export type CareerAchievement = {
  id: string;
  claim: string;           // What the user claims happened
  context?: string;        // Situation / background
  action?: string;         // What they did
  outcome?: string;        // What resulted
  metric?: AchievementMetric;
  scope?: string;          // Individual / team / org / industry
  timeframe?: string;
  confidence: number;      // 0–1, from evidence strength
  evidenceSources: EvidenceSource[];
  claims: CareerClaim[];
  visibility: VisibilityIntent;
  createdAt: string;
};

// ── Experience ────────────────────────────────────────────────────────────────

export type ExperienceRelationshipType =
  | "EMPLOYMENT"
  | "CONTRACT"
  | "FREELANCE"
  | "CONSULTING"
  | "INTERNSHIP"
  | "APPRENTICESHIP"
  | "CLINICAL_PLACEMENT"
  | "RESIDENCY"
  | "RESEARCH_APPOINTMENT"
  | "TEACHING_APPOINTMENT"
  | "VOLUNTEERING"
  | "ENTREPRENEURSHIP"
  | "LEADERSHIP"
  | "COMMUNITY_WORK"
  | "INDEPENDENT_PRACTICE"
  | "OTHER";

export type CareerExperience = {
  id: string;
  organization?: string;
  role?: string;
  relationshipType: ExperienceRelationshipType;
  startDate?: string;      // ISO or approximate ("2022", "Jan 2022")
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  remote?: boolean;
  responsibilities: string[];
  achievements: CareerAchievement[];
  skillsUsed: string[];    // References to CareerSkill.id or names
  relatedProjectIds: string[];
  relatedArtifactIds: string[];
  relatedTestimonialIds: string[];
  evidenceSources: EvidenceSource[];
  claims: CareerClaim[];
  duplicateStatus: DuplicateStatus;
  visibility: VisibilityIntent;
  createdAt: string;
};

// ── Education / Credentials ───────────────────────────────────────────────────

export type CredentialCategory =
  | "EDUCATION"
  | "CERTIFICATION"
  | "LICENSE"
  | "PROFESSIONAL_MEMBERSHIP"
  | "ACCREDITATION"
  | "CLEARANCE"
  | "TRAINING"
  | "COURSE"
  | "AWARD"
  | "HONOR"
  | "FELLOWSHIP";

export type CredentialStatus = "ACTIVE" | "EXPIRED" | "PENDING" | "REVOKED" | "UNKNOWN";

export type CareerCredential = {
  id: string;
  category: CredentialCategory;
  title: string;
  issuer?: string;
  issuedDate?: string;
  expiryDate?: string;
  credentialId?: string;   // Voluntarily supplied
  verificationUrl?: string;
  status: CredentialStatus;
  evidenceSources: EvidenceSource[];
  claims: CareerClaim[];
  visibility: VisibilityIntent;
  createdAt: string;
};

// ── Skills ────────────────────────────────────────────────────────────────────

export type SkillCategory =
  | "TECHNICAL"
  | "DOMAIN"
  | "SOFT"
  | "TOOL"
  | "LANGUAGE"
  | "METHODOLOGY"
  | "CLINICAL"
  | "LEGAL"
  | "FINANCIAL"
  | "CREATIVE"
  | "OTHER";

/** Rich skill evidence — NOT just a string array. */
export type CareerSkill = {
  id: string;
  name: string;
  category: SkillCategory;
  /** Only set when user explicitly provides it — never auto-assigned */
  proficiencyLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  yearsOfExperience?: number;
  lastUsedYear?: number;
  evidenceSources: EvidenceSource[];
  relatedExperienceIds: string[];
  relatedProjectIds: string[];
  claims: CareerClaim[];
  createdAt: string;
};

// ── Projects / Case Studies ───────────────────────────────────────────────────

/**
 * Flexible project schema that supports different discipline structures.
 * The structureFields map holds discipline-specific keys:
 *   software: problem, architecture, implementation, technology, scale, outcome
 *   design: brief, research, constraints, exploration, designDecisions, testing, finalWork, outcome
 *   consulting: clientContext, problem, analysis, recommendation, implementation, businessOutcome
 *   research: researchQuestion, method, dataset, analysis, findings, publication
 */
export type CareerProject = {
  id: string;
  title: string;
  disciplineHint?: string;   // "software" | "design" | "consulting" | "research" | etc.
  role?: string;
  organizationContext?: string;
  startDate?: string;
  endDate?: string;
  /** Flexible structure — profession-specific keys */
  structureFields: Record<string, string>;
  /** Top-level summary for cross-profession display */
  summary?: string;
  outcome?: string;
  metrics: AchievementMetric[];
  skillsUsed: string[];
  artifactIds: string[];
  links: Array<{ label: string; url: string }>;
  evidenceSources: EvidenceSource[];
  claims: CareerClaim[];
  duplicateStatus: DuplicateStatus;
  visibility: VisibilityIntent;
  createdAt: string;
};

// ── Artifacts ─────────────────────────────────────────────────────────────────

export type ArtifactType =
  | "IMAGE"
  | "VIDEO"
  | "DOCUMENT"
  | "REPORT"
  | "PRESENTATION"
  | "GITHUB_REPOSITORY"
  | "DESIGN_FILE"
  | "ARTICLE"
  | "PUBLICATION"
  | "RESEARCH_PAPER"
  | "CASE_STUDY"
  | "CAMPAIGN"
  | "PHOTOGRAPHY"
  | "ARCHITECTURAL_DRAWING"
  | "LEGAL_WRITING"
  | "TEACHING_MATERIAL"
  | "TALK"
  | "CONFERENCE_APPEARANCE"
  | "PRESS_COVERAGE"
  | "PRODUCT_LAUNCH"
  | "CERTIFICATE"
  | "AWARD"
  | "OTHER";

export type CareerArtifact = {
  id: string;
  type: ArtifactType;
  title: string;
  description?: string;
  url?: string;
  storageRef?: string;      // Internal storage path
  ownership: "SELF" | "SHARED" | "CLIENT_WORK";
  relatedExperienceIds: string[];
  relatedProjectIds: string[];
  evidenceSources: EvidenceSource[];
  visibility: VisibilityIntent;
  createdAt: string;
};

// ── Testimonials ──────────────────────────────────────────────────────────────

export type TestimonialPermission = "PRIVATE" | "PORTFOLIO_USE" | "PUBLIC_USE";

export type CareerTestimonial = {
  id: string;
  quote: string;
  authorName?: string;
  authorRole?: string;
  authorOrganization?: string;
  relationship?: string;
  date?: string;
  source?: string;          // "LinkedIn" | "Email" | "Direct" etc.
  verificationStatus: VerificationStatus;
  permission: TestimonialPermission;
  evidenceSources: EvidenceSource[];
  visibility: VisibilityIntent;
  createdAt: string;
};

// ── Publications / Research ───────────────────────────────────────────────────

export type CareerPublication = {
  id: string;
  title: string;
  authors: string[];
  publication?: string;     // Journal / venue / platform
  publishedDate?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  citationCount?: number;   // Only if legitimately retrieved
  researchArea?: string;
  methods?: string;
  findings?: string;
  evidenceSources: EvidenceSource[];
  visibility: VisibilityIntent;
  createdAt: string;
};

// ── Professional identity ─────────────────────────────────────────────────────

export type CareerStage =
  | "STUDENT"
  | "GRADUATE"
  | "EARLY_CAREER"
  | "MID_CAREER"
  | "SENIOR"
  | "LEAD"
  | "EXECUTIVE"
  | "FOUNDER"
  | "INDEPENDENT"
  | "UNKNOWN";

export type EmploymentPreference =
  | "FULL_TIME"
  | "PART_TIME"
  | "FREELANCE"
  | "CONTRACT"
  | "OPEN_TO_ALL"
  | "NOT_LOOKING";

export type AvailabilityStatus =
  | "AVAILABLE_NOW"
  | "AVAILABLE_SOON"
  | "OPEN_TO_OPPORTUNITIES"
  | "NOT_AVAILABLE";

export type ContactMethod = {
  type: "EMAIL" | "PHONE" | "LINKEDIN" | "WEBSITE" | "OTHER";
  value: string;
  isPrimary: boolean;
  visibility: VisibilityIntent;
};

export type ProfessionalIdentity = {
  name?: string;
  professionalHeadline?: string;
  currentRole?: string;
  summary?: string;
  location?: string;            // Voluntarily disclosed
  contactMethods: ContactMethod[];
  professionalLinks: Array<{ label: string; url: string }>;
  yearsOfExperience?: number;   // Derived from evidence or user-supplied
  careerStage: CareerStage;
  availability: AvailabilityStatus;
  employmentPreference?: EmploymentPreference;
  workAuthorization?: string;   // Voluntarily supplied
  languages: string[];
  professionalInterests: string[];
};

// ── Career Goals ──────────────────────────────────────────────────────────────

export type CareerGoalType =
  | "GET_HIRED"
  | "FREELANCE"
  | "CONSULTING"
  | "ATTRACT_CLIENTS"
  | "SHOWCASE_WORK"
  | "BUILD_CREDIBILITY"
  | "GRADUATE_JOB_SEARCH"
  | "INTERNSHIP"
  | "EXECUTIVE_PRESENCE"
  | "RAISE_INVESTMENT"
  | "SELL_SERVICES"
  | "RESEARCH_VISIBILITY"
  | "SPEAKING_OPPORTUNITIES"
  | "COLLABORATION"
  | "PERSONAL_BRAND"
  | "OTHER";

export type CareerGoal = {
  id: string;
  type: CareerGoalType;
  label: string;
  description?: string;
  priority: number;           // 1 = highest
  createdAt: string;
};

// ── Profession identity ───────────────────────────────────────────────────────

/**
 * User's self-identified profession. The registry provides intelligence on top.
 * Supports custom/unknown professions via the `custom` field.
 */
export type ProfessionIdentity = {
  /** Registry key — null for custom professions */
  registryKey: string | null;
  familyKey: string | null;
  specializationKey?: string | null;
  /** User-supplied description when registryKey is null */
  custom?: {
    title: string;
    description: string;
    audienceServed?: string;
    outcomesDelivered?: string;
  };
};

// ── Disclosure risk ───────────────────────────────────────────────────────────

export type DisclosureRiskLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DisclosureRiskFlag = {
  id: string;
  nodeId: string;             // Which node triggered the flag
  nodeType: string;           // "experience" | "project" | "artifact" | etc.
  riskLevel: DisclosureRiskLevel;
  reason: string;
  patternMatched?: string;    // e.g. "patient_identifier_pattern"
  suggestedAction: string;
  status: "PENDING_REVIEW" | "USER_ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
};

// ── The canonical Career Evidence Graph ──────────────────────────────────────

export type CareerEvidenceGraph = {
  /** Schema version for safe migration */
  careerGraphVersion: CareerGraphVersion;
  id: string;
  /** Links to the owning PortfolioDraft id for compatibility */
  draftId: string;

  profession: ProfessionIdentity;
  identity: ProfessionalIdentity;
  goals: CareerGoal[];

  experience: CareerExperience[];
  credentials: CareerCredential[];
  skills: CareerSkill[];
  projects: CareerProject[];
  artifacts: CareerArtifact[];
  testimonials: CareerTestimonial[];
  publications: CareerPublication[];

  /** Registered source documents */
  sources: EvidenceSource[];

  /** Cross-node conflict registry */
  conflicts: CareerConflict[];

  /** Disclosure risk flags — user must review before publishing */
  disclosureFlags: DisclosureRiskFlag[];

  createdAt: string;
  updatedAt: string;
};
