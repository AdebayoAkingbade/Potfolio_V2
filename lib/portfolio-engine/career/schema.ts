// ─────────────────────────────────────────────────────────────────────────────
// Career Evidence Graph — Schema validation + factory functions
// Phase 2: Milestone 1
//
// Runtime coercion follows the same pattern as lib/portfolio-engine/validation.ts
// (no external runtime-validator library — consistent with repository style).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AchievementMetric,
  ArtifactType,
  CareerAchievement,
  CareerArtifact,
  CareerClaim,
  CareerConflict,
  CareerCredential,
  CareerEvidenceGraph,
  CareerExperience,
  CareerGoal,
  CareerGoalType,
  CareerProject,
  CareerPublication,
  CareerSkill,
  CareerTestimonial,
  ClaimKind,
  CredentialCategory,
  CredentialStatus,
  DisclosureRiskFlag,
  DisclosureRiskLevel,
  DuplicateStatus,
  EmploymentPreference,
  EvidenceSource,
  EvidenceSourceType,
  ExperienceRelationshipType,
  MetricCategory,
  ProfessionIdentity,
  ProfessionalIdentity,
  SkillCategory,
  VisibilityIntent,
  VerificationStatus,
  CareerStage,
  AvailabilityStatus,
} from "./types";
import { CAREER_GRAPH_VERSION } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function uid(): string {
  return crypto.randomUUID();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function bool(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function strArr(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function coerceEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

// ── Allowed value sets ────────────────────────────────────────────────────────

const SOURCE_TYPES: readonly EvidenceSourceType[] = [
  "USER_ENTERED", "RESUME", "CV", "GITHUB", "IMPORTED_DOCUMENT",
  "EXTERNAL_LINK", "CERTIFICATE", "PORTFOLIO_IMPORT",
  "AI_SUGGESTED", "SYSTEM_INFERRED", "USER_VERIFIED",
];

const CLAIM_KINDS: readonly ClaimKind[] = [
  "FACT", "STRUCTURAL_INFERENCE", "WORDING", "SUGGESTION", "UNKNOWN",
];

const VERIFICATION_STATUSES: readonly VerificationStatus[] = [
  "UNVERIFIED", "SOURCE_SUPPORTED", "USER_CONFIRMED", "CONFLICTING", "NEEDS_REVIEW",
];

const VISIBILITY_INTENTS: readonly VisibilityIntent[] = [
  "PRIVATE", "PORTFOLIO", "PUBLIC", "REVIEW_REQUIRED", "STEALTH",
];

const DUPLICATE_STATUSES: readonly DuplicateStatus[] = [
  "DISTINCT", "PROBABLE_DUPLICATE", "SUGGESTED_MERGE", "CONFIRMED_MERGE",
];

const METRIC_CATEGORIES: readonly MetricCategory[] = [
  "REVENUE", "COST_SAVINGS", "CONVERSION", "GROWTH", "UPTIME",
  "LATENCY", "DELIVERY_TIME", "CUSTOMER_SATISFACTION", "CASE_VOLUME",
  "RESEARCH_CITATIONS", "STUDENTS_TAUGHT", "PASS_RATE", "PATIENT_VOLUME",
  "PROCESS_IMPROVEMENT", "RISK_REDUCTION", "AUDIT_FINDINGS", "CAMPAIGN_REACH",
  "QUOTA_ATTAINMENT", "RETENTION", "TEAM_SIZE", "FUNDING", "PRODUCTION_OUTPUT", "OTHER",
];

const EXPERIENCE_TYPES: readonly ExperienceRelationshipType[] = [
  "EMPLOYMENT", "CONTRACT", "FREELANCE", "CONSULTING", "INTERNSHIP",
  "APPRENTICESHIP", "CLINICAL_PLACEMENT", "RESIDENCY", "RESEARCH_APPOINTMENT",
  "TEACHING_APPOINTMENT", "VOLUNTEERING", "ENTREPRENEURSHIP", "LEADERSHIP",
  "COMMUNITY_WORK", "INDEPENDENT_PRACTICE", "OTHER",
];

const CREDENTIAL_CATEGORIES: readonly CredentialCategory[] = [
  "EDUCATION", "CERTIFICATION", "LICENSE", "PROFESSIONAL_MEMBERSHIP",
  "ACCREDITATION", "CLEARANCE", "TRAINING", "COURSE", "AWARD", "HONOR", "FELLOWSHIP",
];

const CREDENTIAL_STATUSES: readonly CredentialStatus[] = [
  "ACTIVE", "EXPIRED", "PENDING", "REVOKED", "UNKNOWN",
];

const SKILL_CATEGORIES: readonly SkillCategory[] = [
  "TECHNICAL", "DOMAIN", "SOFT", "TOOL", "LANGUAGE",
  "METHODOLOGY", "CLINICAL", "LEGAL", "FINANCIAL", "CREATIVE", "OTHER",
];

const ARTIFACT_TYPES: readonly ArtifactType[] = [
  "IMAGE", "VIDEO", "DOCUMENT", "REPORT", "PRESENTATION", "GITHUB_REPOSITORY",
  "DESIGN_FILE", "ARTICLE", "PUBLICATION", "RESEARCH_PAPER", "CASE_STUDY",
  "CAMPAIGN", "PHOTOGRAPHY", "ARCHITECTURAL_DRAWING", "LEGAL_WRITING",
  "TEACHING_MATERIAL", "TALK", "CONFERENCE_APPEARANCE", "PRESS_COVERAGE",
  "PRODUCT_LAUNCH", "CERTIFICATE", "AWARD", "OTHER",
];

const CAREER_STAGES: readonly CareerStage[] = [
  "STUDENT", "GRADUATE", "EARLY_CAREER", "MID_CAREER",
  "SENIOR", "LEAD", "EXECUTIVE", "FOUNDER", "INDEPENDENT", "UNKNOWN",
];

const GOAL_TYPES: readonly CareerGoalType[] = [
  "GET_HIRED", "FREELANCE", "CONSULTING", "ATTRACT_CLIENTS", "SHOWCASE_WORK",
  "BUILD_CREDIBILITY", "GRADUATE_JOB_SEARCH", "INTERNSHIP", "EXECUTIVE_PRESENCE",
  "RAISE_INVESTMENT", "SELL_SERVICES", "RESEARCH_VISIBILITY",
  "SPEAKING_OPPORTUNITIES", "COLLABORATION", "PERSONAL_BRAND", "OTHER",
];

const DISCLOSURE_RISK_LEVELS: readonly DisclosureRiskLevel[] = [
  "NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL",
];

// ── Evidence source factory / coercion ────────────────────────────────────────

export function createEvidenceSource(
  sourceType: EvidenceSourceType,
  options: { sourceId?: string; sourceReference?: string } = {},
): EvidenceSource {
  return {
    id: uid(),
    sourceType,
    sourceId: options.sourceId,
    sourceReference: options.sourceReference,
    createdAt: now(),
  };
}

function coerceEvidenceSource(value: unknown): EvidenceSource | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    sourceType: coerceEnum(value.sourceType, SOURCE_TYPES, "SYSTEM_INFERRED"),
    sourceId: str(value.sourceId) || undefined,
    sourceReference: str(value.sourceReference) || undefined,
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Claim factory / coercion ──────────────────────────────────────────────────

export function createClaim(
  value: string,
  kind: ClaimKind,
  sourceType: EvidenceSourceType,
  options: { confidence?: number; verified?: boolean } = {},
): CareerClaim {
  return {
    id: uid(),
    value,
    kind,
    sourceType,
    confidence: options.confidence ?? (kind === "FACT" ? 0.8 : kind === "STRUCTURAL_INFERENCE" ? 0.6 : 0.3),
    verificationStatus: options.verified ? "USER_CONFIRMED" : kind === "FACT" ? "SOURCE_SUPPORTED" : "UNVERIFIED",
    createdAt: now(),
    userVerifiedAt: options.verified ? now() : undefined,
  };
}

function coerceClaim(value: unknown): CareerClaim | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    value: str(value.value),
    kind: coerceEnum(value.kind, CLAIM_KINDS, "UNKNOWN"),
    sourceType: coerceEnum(value.sourceType, SOURCE_TYPES, "SYSTEM_INFERRED"),
    sourceId: str(value.sourceId) || undefined,
    confidence: Math.max(0, Math.min(1, num(value.confidence, 0.5))),
    verificationStatus: coerceEnum(value.verificationStatus, VERIFICATION_STATUSES, "UNVERIFIED"),
    createdAt: str(value.createdAt) || now(),
    userVerifiedAt: str(value.userVerifiedAt) || undefined,
  };
}

// ── Achievement factory / coercion ────────────────────────────────────────────

export function createAchievement(
  claim: string,
  sourceType: EvidenceSourceType = "USER_ENTERED",
): CareerAchievement {
  return {
    id: uid(),
    claim,
    confidence: 0.7,
    evidenceSources: [createEvidenceSource(sourceType)],
    claims: [createClaim(claim, "FACT", sourceType)],
    visibility: "PRIVATE",
    createdAt: now(),
  };
}

function coerceMetric(value: unknown): AchievementMetric | null {
  if (!isRecord(value)) return null;
  return {
    category: coerceEnum(value.category, METRIC_CATEGORIES, "OTHER"),
    value: typeof value.value === "number" ? value.value : undefined,
    unit: str(value.unit) || undefined,
    baseline: str(value.baseline) || undefined,
    result: str(value.result) || undefined,
    timeframe: str(value.timeframe) || undefined,
    sourceKind: value.sourceKind === "SYSTEM_INFERRED" ? "SYSTEM_INFERRED" : "USER_PROVIDED",
  };
}

function coerceAchievement(value: unknown): CareerAchievement | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    claim: str(value.claim),
    context: str(value.context) || undefined,
    action: str(value.action) || undefined,
    outcome: str(value.outcome) || undefined,
    metric: coerceMetric(value.metric) ?? undefined,
    scope: str(value.scope) || undefined,
    timeframe: str(value.timeframe) || undefined,
    confidence: Math.max(0, Math.min(1, num(value.confidence, 0.5))),
    evidenceSources: Array.isArray(value.evidenceSources)
      ? value.evidenceSources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    claims: Array.isArray(value.claims)
      ? value.claims.map(coerceClaim).filter((x): x is CareerClaim => x !== null)
      : [],
    visibility: coerceEnum(value.visibility, VISIBILITY_INTENTS, "PRIVATE"),
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Experience factory / coercion ─────────────────────────────────────────────

export function createExperienceNode(
  options: Partial<Pick<CareerExperience, "organization" | "role" | "relationshipType">> = {},
): CareerExperience {
  return {
    id: uid(),
    organization: options.organization,
    role: options.role,
    relationshipType: options.relationshipType ?? "EMPLOYMENT",
    isCurrent: false,
    responsibilities: [],
    achievements: [],
    skillsUsed: [],
    relatedProjectIds: [],
    relatedArtifactIds: [],
    relatedTestimonialIds: [],
    evidenceSources: [],
    claims: [],
    duplicateStatus: "DISTINCT",
    visibility: "PRIVATE",
    createdAt: now(),
  };
}

function coerceExperience(value: unknown): CareerExperience | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    organization: str(value.organization) || undefined,
    role: str(value.role) || undefined,
    relationshipType: coerceEnum(value.relationshipType, EXPERIENCE_TYPES, "EMPLOYMENT"),
    startDate: str(value.startDate) || undefined,
    endDate: str(value.endDate) || undefined,
    isCurrent: bool(value.isCurrent),
    location: str(value.location) || undefined,
    remote: typeof value.remote === "boolean" ? value.remote : undefined,
    responsibilities: strArr(value.responsibilities),
    achievements: Array.isArray(value.achievements)
      ? value.achievements.map(coerceAchievement).filter((x): x is CareerAchievement => x !== null)
      : [],
    skillsUsed: strArr(value.skillsUsed),
    relatedProjectIds: strArr(value.relatedProjectIds),
    relatedArtifactIds: strArr(value.relatedArtifactIds),
    relatedTestimonialIds: strArr(value.relatedTestimonialIds),
    evidenceSources: Array.isArray(value.evidenceSources)
      ? value.evidenceSources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    claims: Array.isArray(value.claims)
      ? value.claims.map(coerceClaim).filter((x): x is CareerClaim => x !== null)
      : [],
    duplicateStatus: coerceEnum(value.duplicateStatus, DUPLICATE_STATUSES, "DISTINCT"),
    visibility: coerceEnum(value.visibility, VISIBILITY_INTENTS, "PRIVATE"),
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Credential factory / coercion ─────────────────────────────────────────────

export function createCredentialNode(
  category: CredentialCategory = "EDUCATION",
  title = "",
): CareerCredential {
  return {
    id: uid(),
    category,
    title,
    status: "UNKNOWN",
    evidenceSources: [],
    claims: [],
    visibility: "PRIVATE",
    createdAt: now(),
  };
}

function coerceCredential(value: unknown): CareerCredential | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    category: coerceEnum(value.category, CREDENTIAL_CATEGORIES, "EDUCATION"),
    title: str(value.title),
    issuer: str(value.issuer) || undefined,
    issuedDate: str(value.issuedDate) || undefined,
    expiryDate: str(value.expiryDate) || undefined,
    credentialId: str(value.credentialId) || undefined,
    verificationUrl: str(value.verificationUrl) || undefined,
    status: coerceEnum(value.status, CREDENTIAL_STATUSES, "UNKNOWN"),
    evidenceSources: Array.isArray(value.evidenceSources)
      ? value.evidenceSources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    claims: Array.isArray(value.claims)
      ? value.claims.map(coerceClaim).filter((x): x is CareerClaim => x !== null)
      : [],
    visibility: coerceEnum(value.visibility, VISIBILITY_INTENTS, "PRIVATE"),
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Skill factory / coercion ──────────────────────────────────────────────────

export function createSkillNode(
  name: string,
  category: SkillCategory = "OTHER",
  sourceType: EvidenceSourceType = "USER_ENTERED",
): CareerSkill {
  return {
    id: uid(),
    name,
    category,
    evidenceSources: [createEvidenceSource(sourceType)],
    relatedExperienceIds: [],
    relatedProjectIds: [],
    claims: [createClaim(name, "FACT", sourceType)],
    createdAt: now(),
  };
}

function coerceSkill(value: unknown): CareerSkill | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    name: str(value.name),
    category: coerceEnum(value.category, SKILL_CATEGORIES, "OTHER"),
    proficiencyLevel: ["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"].includes(value.proficiencyLevel as string)
      ? value.proficiencyLevel as CareerSkill["proficiencyLevel"]
      : undefined,
    yearsOfExperience: typeof value.yearsOfExperience === "number" ? value.yearsOfExperience : undefined,
    lastUsedYear: typeof value.lastUsedYear === "number" ? value.lastUsedYear : undefined,
    evidenceSources: Array.isArray(value.evidenceSources)
      ? value.evidenceSources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    relatedExperienceIds: strArr(value.relatedExperienceIds),
    relatedProjectIds: strArr(value.relatedProjectIds),
    claims: Array.isArray(value.claims)
      ? value.claims.map(coerceClaim).filter((x): x is CareerClaim => x !== null)
      : [],
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Project factory / coercion ────────────────────────────────────────────────

export function createProjectNode(title = "", disciplineHint?: string): CareerProject {
  return {
    id: uid(),
    title,
    disciplineHint,
    structureFields: {},
    metrics: [],
    skillsUsed: [],
    artifactIds: [],
    links: [],
    evidenceSources: [],
    claims: [],
    duplicateStatus: "DISTINCT",
    visibility: "PRIVATE",
    createdAt: now(),
  };
}

function coerceProject(value: unknown): CareerProject | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    title: str(value.title),
    disciplineHint: str(value.disciplineHint) || undefined,
    role: str(value.role) || undefined,
    organizationContext: str(value.organizationContext) || undefined,
    startDate: str(value.startDate) || undefined,
    endDate: str(value.endDate) || undefined,
    structureFields: isRecord(value.structureFields)
      ? Object.fromEntries(Object.entries(value.structureFields).map(([k, v]) => [k, str(v)]))
      : {},
    summary: str(value.summary) || undefined,
    outcome: str(value.outcome) || undefined,
    metrics: Array.isArray(value.metrics)
      ? value.metrics.map(coerceMetric).filter((x): x is AchievementMetric => x !== null)
      : [],
    skillsUsed: strArr(value.skillsUsed),
    artifactIds: strArr(value.artifactIds),
    links: Array.isArray(value.links)
      ? value.links.filter(isRecord).map((l) => ({ label: str(l.label), url: str(l.url) }))
      : [],
    evidenceSources: Array.isArray(value.evidenceSources)
      ? value.evidenceSources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    claims: Array.isArray(value.claims)
      ? value.claims.map(coerceClaim).filter((x): x is CareerClaim => x !== null)
      : [],
    duplicateStatus: coerceEnum(value.duplicateStatus, DUPLICATE_STATUSES, "DISTINCT"),
    visibility: coerceEnum(value.visibility, VISIBILITY_INTENTS, "PRIVATE"),
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Artifact factory / coercion ───────────────────────────────────────────────

export function createArtifactNode(
  type: ArtifactType,
  title: string,
  url?: string,
): CareerArtifact {
  return {
    id: uid(),
    type,
    title,
    url,
    ownership: "SELF",
    relatedExperienceIds: [],
    relatedProjectIds: [],
    evidenceSources: [],
    visibility: "PRIVATE",
    createdAt: now(),
  };
}

function coerceArtifact(value: unknown): CareerArtifact | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    type: coerceEnum(value.type, ARTIFACT_TYPES, "OTHER"),
    title: str(value.title),
    description: str(value.description) || undefined,
    url: str(value.url) || undefined,
    storageRef: str(value.storageRef) || undefined,
    ownership: value.ownership === "SHARED" ? "SHARED" : value.ownership === "CLIENT_WORK" ? "CLIENT_WORK" : "SELF",
    relatedExperienceIds: strArr(value.relatedExperienceIds),
    relatedProjectIds: strArr(value.relatedProjectIds),
    evidenceSources: Array.isArray(value.evidenceSources)
      ? value.evidenceSources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    visibility: coerceEnum(value.visibility, VISIBILITY_INTENTS, "PRIVATE"),
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Testimonial factory / coercion ────────────────────────────────────────────

export function createTestimonialNode(quote: string): CareerTestimonial {
  return {
    id: uid(),
    quote,
    verificationStatus: "UNVERIFIED",
    permission: "PRIVATE",
    evidenceSources: [],
    visibility: "PRIVATE",
    createdAt: now(),
  };
}

function coerceTestimonial(value: unknown): CareerTestimonial | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    quote: str(value.quote),
    authorName: str(value.authorName) || undefined,
    authorRole: str(value.authorRole) || undefined,
    authorOrganization: str(value.authorOrganization) || undefined,
    relationship: str(value.relationship) || undefined,
    date: str(value.date) || undefined,
    source: str(value.source) || undefined,
    verificationStatus: coerceEnum(value.verificationStatus, VERIFICATION_STATUSES, "UNVERIFIED"),
    permission: value.permission === "PORTFOLIO_USE" ? "PORTFOLIO_USE"
      : value.permission === "PUBLIC_USE" ? "PUBLIC_USE"
      : "PRIVATE",
    evidenceSources: Array.isArray(value.evidenceSources)
      ? value.evidenceSources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    visibility: coerceEnum(value.visibility, VISIBILITY_INTENTS, "PRIVATE"),
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Publication factory / coercion ────────────────────────────────────────────

export function createPublicationNode(title: string): CareerPublication {
  return {
    id: uid(),
    title,
    authors: [],
    evidenceSources: [],
    visibility: "PRIVATE",
    createdAt: now(),
  };
}

function coercePublication(value: unknown): CareerPublication | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    title: str(value.title),
    authors: strArr(value.authors),
    publication: str(value.publication) || undefined,
    publishedDate: str(value.publishedDate) || undefined,
    doi: str(value.doi) || undefined,
    url: str(value.url) || undefined,
    abstract: str(value.abstract) || undefined,
    citationCount: typeof value.citationCount === "number" ? value.citationCount : undefined,
    researchArea: str(value.researchArea) || undefined,
    methods: str(value.methods) || undefined,
    findings: str(value.findings) || undefined,
    evidenceSources: Array.isArray(value.evidenceSources)
      ? value.evidenceSources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    visibility: coerceEnum(value.visibility, VISIBILITY_INTENTS, "PRIVATE"),
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Goal factory / coercion ───────────────────────────────────────────────────

export function createGoal(type: CareerGoalType, priority = 1): CareerGoal {
  const labels: Record<CareerGoalType, string> = {
    GET_HIRED: "Get hired",
    FREELANCE: "Find freelance work",
    CONSULTING: "Attract consulting engagements",
    ATTRACT_CLIENTS: "Attract clients",
    SHOWCASE_WORK: "Showcase my work",
    BUILD_CREDIBILITY: "Build professional credibility",
    GRADUATE_JOB_SEARCH: "Find a graduate role",
    INTERNSHIP: "Find an internship",
    EXECUTIVE_PRESENCE: "Build executive presence",
    RAISE_INVESTMENT: "Raise investment",
    SELL_SERVICES: "Sell services",
    RESEARCH_VISIBILITY: "Increase research visibility",
    SPEAKING_OPPORTUNITIES: "Get speaking opportunities",
    COLLABORATION: "Find collaborators",
    PERSONAL_BRAND: "Build personal brand",
    OTHER: "Other goal",
  };
  return {
    id: uid(),
    type,
    label: labels[type],
    priority,
    createdAt: now(),
  };
}

function coerceGoal(value: unknown): CareerGoal | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    type: coerceEnum(value.type, GOAL_TYPES, "OTHER"),
    label: str(value.label) || "Goal",
    description: str(value.description) || undefined,
    priority: Math.max(1, num(value.priority, 1)),
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Professional identity coercion ────────────────────────────────────────────

function coerceProfessionalIdentity(value: unknown): ProfessionalIdentity {
  const defaultIdentity: ProfessionalIdentity = {
    careerStage: "UNKNOWN",
    availability: "OPEN_TO_OPPORTUNITIES",
    contactMethods: [],
    professionalLinks: [],
    languages: [],
    professionalInterests: [],
  };
  if (!isRecord(value)) return defaultIdentity;

  const availabilities: readonly AvailabilityStatus[] = [
    "AVAILABLE_NOW", "AVAILABLE_SOON", "OPEN_TO_OPPORTUNITIES", "NOT_AVAILABLE",
  ];
  const employmentPrefs: readonly EmploymentPreference[] = [
    "FULL_TIME", "PART_TIME", "FREELANCE", "CONTRACT", "OPEN_TO_ALL", "NOT_LOOKING",
  ];

  return {
    name: str(value.name) || undefined,
    professionalHeadline: str(value.professionalHeadline) || undefined,
    currentRole: str(value.currentRole) || undefined,
    summary: str(value.summary) || undefined,
    location: str(value.location) || undefined,
    contactMethods: Array.isArray(value.contactMethods)
      ? value.contactMethods.filter(isRecord).map((m) => ({
          type: ["EMAIL","PHONE","LINKEDIN","WEBSITE","OTHER"].includes(m.type as string)
            ? m.type as "EMAIL"|"PHONE"|"LINKEDIN"|"WEBSITE"|"OTHER"
            : "OTHER",
          value: str(m.value),
          isPrimary: bool(m.isPrimary),
          visibility: coerceEnum(m.visibility, VISIBILITY_INTENTS, "PRIVATE"),
        }))
      : [],
    professionalLinks: Array.isArray(value.professionalLinks)
      ? value.professionalLinks.filter(isRecord).map((l) => ({ label: str(l.label), url: str(l.url) }))
      : [],
    yearsOfExperience: typeof value.yearsOfExperience === "number" ? value.yearsOfExperience : undefined,
    careerStage: coerceEnum(value.careerStage, CAREER_STAGES, "UNKNOWN"),
    availability: coerceEnum(value.availability, availabilities, "OPEN_TO_OPPORTUNITIES"),
    employmentPreference: coerceEnum(value.employmentPreference, employmentPrefs, "OPEN_TO_ALL"),
    workAuthorization: str(value.workAuthorization) || undefined,
    languages: strArr(value.languages),
    professionalInterests: strArr(value.professionalInterests),
  };
}

function coerceProfessionIdentity(value: unknown): ProfessionIdentity {
  if (!isRecord(value)) return { registryKey: null, familyKey: null };
  return {
    registryKey: str(value.registryKey) || null,
    familyKey: str(value.familyKey) || null,
    specializationKey: str(value.specializationKey) || null,
    custom: isRecord(value.custom) ? {
      title: str(value.custom.title),
      description: str(value.custom.description),
      audienceServed: str(value.custom.audienceServed) || undefined,
      outcomesDelivered: str(value.custom.outcomesDelivered) || undefined,
    } : undefined,
  };
}

// ── Conflict / disclosure flag coercions ──────────────────────────────────────

function coerceConflict(value: unknown): CareerConflict | null {
  if (!isRecord(value)) return null;
  const nodeIds = strArr(value.nodeIds);
  if (nodeIds.length < 2) return null;

  const conflictFields = ["DATE","TITLE","ORGANIZATION","METRIC","CREDENTIAL","GENERAL"] as const;
  return {
    id: str(value.id) || uid(),
    nodeIds: [nodeIds[0], nodeIds[1]],
    field: coerceEnum(value.field, conflictFields, "GENERAL"),
    description: str(value.description),
    resolution: ["KEPT_FIRST","KEPT_SECOND","USER_RESOLVED","PENDING"].includes(value.resolution as string)
      ? value.resolution as CareerConflict["resolution"]
      : undefined,
    createdAt: str(value.createdAt) || now(),
  };
}

function coerceDisclosureFlag(value: unknown): DisclosureRiskFlag | null {
  if (!isRecord(value)) return null;
  return {
    id: str(value.id) || uid(),
    nodeId: str(value.nodeId),
    nodeType: str(value.nodeType),
    riskLevel: coerceEnum(value.riskLevel, DISCLOSURE_RISK_LEVELS, "LOW"),
    reason: str(value.reason),
    patternMatched: str(value.patternMatched) || undefined,
    suggestedAction: str(value.suggestedAction),
    status: value.status === "USER_ACKNOWLEDGED" ? "USER_ACKNOWLEDGED"
      : value.status === "RESOLVED" ? "RESOLVED"
      : "PENDING_REVIEW",
    createdAt: str(value.createdAt) || now(),
  };
}

// ── Graph factory ─────────────────────────────────────────────────────────────

export function createCareerEvidenceGraph(
  draftId: string,
  registryKey: string | null = null,
  familyKey: string | null = null,
): CareerEvidenceGraph {
  const timestamp = now();
  return {
    careerGraphVersion: CAREER_GRAPH_VERSION,
    id: uid(),
    draftId,
    profession: { registryKey, familyKey },
    identity: {
      careerStage: "UNKNOWN",
      availability: "OPEN_TO_OPPORTUNITIES",
      contactMethods: [],
      professionalLinks: [],
      languages: [],
      professionalInterests: [],
    },
    goals: [],
    experience: [],
    credentials: [],
    skills: [],
    projects: [],
    artifacts: [],
    testimonials: [],
    publications: [],
    sources: [],
    conflicts: [],
    disclosureFlags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

// ── Runtime coercion of unknown data to a valid graph ────────────────────────

/**
 * Safe coercion from unknown JSON to a canonical CareerEvidenceGraph.
 * Returns null only if the top-level shape is completely wrong.
 */
export function coerceCareerEvidenceGraph(value: unknown): CareerEvidenceGraph | null {
  if (!isRecord(value)) return null;
  const timestamp = now();

  return {
    careerGraphVersion: CAREER_GRAPH_VERSION, // always upgrade to current
    id: str(value.id) || uid(),
    draftId: str(value.draftId),
    profession: coerceProfessionIdentity(value.profession),
    identity: coerceProfessionalIdentity(value.identity),
    goals: Array.isArray(value.goals)
      ? value.goals.map(coerceGoal).filter((x): x is CareerGoal => x !== null)
      : [],
    experience: Array.isArray(value.experience)
      ? value.experience.map(coerceExperience).filter((x): x is CareerExperience => x !== null)
      : [],
    credentials: Array.isArray(value.credentials)
      ? value.credentials.map(coerceCredential).filter((x): x is CareerCredential => x !== null)
      : [],
    skills: Array.isArray(value.skills)
      ? value.skills.map(coerceSkill).filter((x): x is CareerSkill => x !== null)
      : [],
    projects: Array.isArray(value.projects)
      ? value.projects.map(coerceProject).filter((x): x is CareerProject => x !== null)
      : [],
    artifacts: Array.isArray(value.artifacts)
      ? value.artifacts.map(coerceArtifact).filter((x): x is CareerArtifact => x !== null)
      : [],
    testimonials: Array.isArray(value.testimonials)
      ? value.testimonials.map(coerceTestimonial).filter((x): x is CareerTestimonial => x !== null)
      : [],
    publications: Array.isArray(value.publications)
      ? value.publications.map(coercePublication).filter((x): x is CareerPublication => x !== null)
      : [],
    sources: Array.isArray(value.sources)
      ? value.sources.map(coerceEvidenceSource).filter((x): x is EvidenceSource => x !== null)
      : [],
    conflicts: Array.isArray(value.conflicts)
      ? value.conflicts.map(coerceConflict).filter((x): x is CareerConflict => x !== null)
      : [],
    disclosureFlags: Array.isArray(value.disclosureFlags)
      ? value.disclosureFlags.map(coerceDisclosureFlag).filter((x): x is DisclosureRiskFlag => x !== null)
      : [],
    createdAt: str(value.createdAt) || timestamp,
    updatedAt: timestamp,
  };
}

/** Schema migration: bring any older graph to the current version.
 *  Currently a no-op since this is v1, but the hook is here for future versions. */
export function migrateCareerGraph(graph: CareerEvidenceGraph): CareerEvidenceGraph {
  if (graph.careerGraphVersion === CAREER_GRAPH_VERSION) return graph;
  // Future: add migration steps here per version bump
  return { ...graph, careerGraphVersion: CAREER_GRAPH_VERSION };
}

/** Validates that a graph is internally consistent.
 *  Returns an array of error messages (empty = valid). */
export function validateCareerGraph(graph: CareerEvidenceGraph): string[] {
  const errors: string[] = [];
  if (graph.careerGraphVersion !== CAREER_GRAPH_VERSION) {
    errors.push(`Schema version mismatch: expected ${CAREER_GRAPH_VERSION}, got ${graph.careerGraphVersion}`);
  }
  if (!graph.id) errors.push("Graph is missing an id.");
  if (!graph.draftId) errors.push("Graph is missing a draftId.");

  // Detect orphaned cross-references
  const projIds = new Set(graph.projects.map((p) => p.id));
  const artIds = new Set(graph.artifacts.map((a) => a.id));

  for (const proj of graph.projects) {
    for (const expId of proj.skillsUsed) {
      // skill IDs listed here are just strings — ok
      void expId;
    }
    for (const artId of proj.artifactIds) {
      if (!artIds.has(artId)) {
        errors.push(`Project "${proj.title}" references unknown artifact id: ${artId}`);
      }
    }
  }
  for (const exp of graph.experience) {
    for (const projId of exp.relatedProjectIds) {
      if (!projIds.has(projId)) {
        errors.push(`Experience "${exp.role ?? exp.organization}" references unknown project id: ${projId}`);
      }
    }
    for (const artId of exp.relatedArtifactIds) {
      if (!artIds.has(artId)) {
        errors.push(`Experience "${exp.role ?? exp.organization}" references unknown artifact id: ${artId}`);
      }
    }
  }
  for (const conflict of graph.conflicts) {
    const [a, b] = conflict.nodeIds;
    // We can only check if both are non-empty strings; actual node existence
    // would require full node lookup across all arrays (expensive, not needed here)
    if (!a || !b) errors.push(`Conflict ${conflict.id} has empty nodeIds.`);
  }

  // CRITICAL: AI WORDING claims must not be marked as FACT
  for (const exp of graph.experience) {
    for (const claim of exp.claims) {
      if (claim.kind === "WORDING" && claim.verificationStatus === "USER_CONFIRMED") {
        errors.push(`Experience claim ${claim.id}: AI WORDING is marked USER_CONFIRMED (not allowed).`);
      }
    }
  }

  return errors;
}

// ── Re-export allowed value sets for consumers ────────────────────────────────
export {
  SOURCE_TYPES,
  CLAIM_KINDS,
  VERIFICATION_STATUSES,
  VISIBILITY_INTENTS,
  DUPLICATE_STATUSES,
  METRIC_CATEGORIES,
  EXPERIENCE_TYPES,
  CREDENTIAL_CATEGORIES,
  CREDENTIAL_STATUSES,
  SKILL_CATEGORIES,
  ARTIFACT_TYPES,
  CAREER_STAGES,
  GOAL_TYPES,
  DISCLOSURE_RISK_LEVELS,
};
