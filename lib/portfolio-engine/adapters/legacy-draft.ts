// ─────────────────────────────────────────────────────────────────────────────
// Adapter: Legacy PortfolioDraft → CareerEvidenceGraph
// Phase 2: Milestone 2
//
// Non-destructive translation. The original PortfolioDraft is preserved.
// All claims are marked SOURCE_SUPPORTED (from user's portfolio data),
// not FACT (would require independent verification).
// ─────────────────────────────────────────────────────────────────────────────

import type { PortfolioDraft } from "@/types/portfolio-engine";
import type { CareerEvidenceGraph, SkillCategory } from "../career/types";
import {
  createCareerEvidenceGraph,
  createEvidenceSource,
  createClaim,
  createExperienceNode,
  createCredentialNode,
  createSkillNode,
  createProjectNode,
} from "../career/schema";

/** Translate an existing V2 PortfolioDraft to the canonical CareerEvidenceGraph.
 *  The draft is not mutated; the graph is independent. */
export function adaptLegacyDraftToGraph(draft: PortfolioDraft): CareerEvidenceGraph {
  const SOURCE_TYPE = "PORTFOLIO_IMPORT" as const;
  const sourceRef = `Portfolio draft id=${draft.id}`;

  const graph = createCareerEvidenceGraph(
    draft.id,
    draft.profession,
    // Legacy profession key doubles as family — registry will refine this
    draft.profession,
  );

  // ── Identity ────────────────────────────────────────────────────────────────
  graph.identity = {
    name: draft.basics.name || undefined,
    professionalHeadline: draft.basics.title || undefined,
    summary: draft.basics.summary || undefined,
    location: draft.basics.location || undefined,
    contactMethods: [
      ...(draft.basics.email ? [{
        type: "EMAIL" as const,
        value: draft.basics.email,
        isPrimary: draft.basics.contactPreference === "email",
        visibility: "PRIVATE" as const,
      }] : []),
      ...(draft.basics.phone ? [{
        type: "PHONE" as const,
        value: draft.basics.phone,
        isPrimary: draft.basics.contactPreference === "phone",
        visibility: "PRIVATE" as const,
      }] : []),
    ],
    professionalLinks: draft.basics.socialLinks
      .filter((link) => link.url.trim())
      .map((link) => ({ label: link.label, url: link.url })),
    careerStage: "UNKNOWN",
    availability: "OPEN_TO_OPPORTUNITIES",
    languages: [],
    professionalInterests: [],
  };

  // ── Skills ──────────────────────────────────────────────────────────────────
  graph.skills = draft.skills.filter(Boolean).map((skillName) => {
    const skill = createSkillNode(skillName, inferSkillCategory(skillName), SOURCE_TYPE);
    skill.evidenceSources = [createEvidenceSource(SOURCE_TYPE, { sourceId: draft.id, sourceReference: sourceRef })];
    skill.claims = [createClaim(skillName, "FACT", SOURCE_TYPE)];
    return skill;
  });

  // ── Experience ───────────────────────────────────────────────────────────────
  graph.experience = draft.experience
    .filter((exp) => exp.role || exp.organization)
    .map((exp) => {
      const node = createExperienceNode({
        organization: exp.organization || undefined,
        role: exp.role || undefined,
        relationshipType: "EMPLOYMENT",
      });
      node.startDate = exp.start || undefined;
      node.endDate = exp.end || undefined;
      node.isCurrent = !exp.end || /present|current/i.test(exp.end);
      node.responsibilities = exp.highlights.filter(Boolean);
      node.evidenceSources = [createEvidenceSource(SOURCE_TYPE, { sourceId: draft.id, sourceReference: sourceRef })];
      if (exp.summary) {
        node.claims = [createClaim(exp.summary, "FACT", SOURCE_TYPE)];
      }
      return node;
    });

  // ── Credentials (education + certifications) ─────────────────────────────────
  graph.credentials = [
    ...draft.education.filter((edu) => edu.school || edu.credential).map((edu) => {
      const node = createCredentialNode("EDUCATION", edu.credential || edu.school);
      node.issuer = edu.school || undefined;
      node.issuedDate = edu.end || edu.start || undefined;
      node.status = "UNKNOWN";
      node.evidenceSources = [createEvidenceSource(SOURCE_TYPE, { sourceId: draft.id, sourceReference: sourceRef })];
      if (edu.credential) {
        node.claims = [createClaim(edu.credential, "FACT", SOURCE_TYPE)];
      }
      return node;
    }),
    ...draft.certifications.filter((cert) => cert.name).map((cert) => {
      const node = createCredentialNode("CERTIFICATION", cert.name);
      node.issuer = cert.issuer || undefined;
      node.issuedDate = cert.issuedAt || undefined;
      node.expiryDate = cert.expiresAt || undefined;
      node.verificationUrl = cert.url || undefined;
      node.status = cert.expiresAt && new Date(cert.expiresAt) < new Date() ? "EXPIRED" : "UNKNOWN";
      node.evidenceSources = [createEvidenceSource(SOURCE_TYPE, { sourceId: draft.id, sourceReference: sourceRef })];
      node.claims = [createClaim(cert.name, "FACT", SOURCE_TYPE)];
      return node;
    }),
  ];

  // ── Projects ─────────────────────────────────────────────────────────────────
  graph.projects = draft.projects
    .filter((proj) => proj.title || proj.summary)
    .map((proj) => {
      const node = createProjectNode(proj.title);
      node.role = proj.role || undefined;
      node.summary = proj.summary || undefined;
      node.outcome = proj.outcome || undefined;
      node.structureFields = {
        ...(proj.challenge ? { challenge: proj.challenge } : {}),
        ...(proj.summary ? { summary: proj.summary } : {}),
      };
      node.links = proj.links
        .filter((l) => l.url)
        .map((l) => ({ label: l.label, url: l.url }));
      node.evidenceSources = [createEvidenceSource(SOURCE_TYPE, { sourceId: draft.id, sourceReference: sourceRef })];
      if (proj.title) {
        node.claims = [createClaim(proj.title, "FACT", SOURCE_TYPE)];
      }
      if (proj.visibility === "stealth") {
        node.visibility = "STEALTH";
      } else if (proj.visibility === "private") {
        node.visibility = "PRIVATE";
      } else {
        node.visibility = "PORTFOLIO";
      }
      return node;
    });

  // ── Source registry ───────────────────────────────────────────────────────────
  graph.sources = [
    createEvidenceSource(SOURCE_TYPE, {
      sourceId: draft.id,
      sourceReference: sourceRef,
    }),
  ];

  graph.updatedAt = new Date().toISOString();
  return graph;
}

/** Naively infer a skill category based on name and profession. Not authoritative. */
function inferSkillCategory(
  name: string,
): SkillCategory {
  const lower = name.toLowerCase();
  if (/typescript|javascript|python|rust|go|java|c\+\+|swift|kotlin|sql|bash/.test(lower)) return "TECHNICAL";
  if (/react|next|vue|angular|tailwind|css|html/.test(lower)) return "TECHNICAL";
  if (/figma|sketch|photoshop|illustrator|after effects|premiere/.test(lower)) return "TOOL";
  if (/french|spanish|arabic|mandarin|portuguese|german|english/.test(lower)) return "LANGUAGE";
  if (/agile|scrum|kanban|lean|six sigma/.test(lower)) return "METHODOLOGY";
  if (/communication|leadership|problem.solving|teamwork/.test(lower)) return "SOFT";
  return "DOMAIN";
}
