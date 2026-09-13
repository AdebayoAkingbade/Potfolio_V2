import type {
  ContactPreference,
  DraftValidationResult,
  PortfolioDraft,
  PortfolioExperience,
  PortfolioProject,
  PortfolioSocialLink,
  PortfolioTemplateId,
  ProfessionKey,
} from "@/types/portfolio-engine";
import { getProfessionConfig } from "@/lib/portfolio-engine/professions";
import { createPortfolioSlug } from "@/lib/portfolio-engine/slug";

export const MAX_IMAGE_SIZE_BYTES = 1_000_000;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function now() {
  return new Date().toISOString();
}

export function createSocialLink(label = "", url = ""): PortfolioSocialLink {
  return {
    id: crypto.randomUUID(),
    label,
    url,
  };
}

export function createExperience(): PortfolioExperience {
  return {
    id: crypto.randomUUID(),
    role: "",
    organization: "",
    start: "",
    end: "",
    summary: "",
    highlights: [""],
  };
}

export function createProject(): PortfolioProject {
  return {
    id: crypto.randomUUID(),
    title: "",
    role: "",
    summary: "",
    challenge: "",
    outcome: "",
    links: [createSocialLink("Project", "")],
  };
}

export function createDraft(
  profession: ProfessionKey = "software-technology",
  templateId: PortfolioTemplateId = "signal",
): PortfolioDraft {
  const professionConfig = getProfessionConfig(profession);
  const timestamp = now();

  return {
    id: crypto.randomUUID(),
    profession,
    templateId,
    slug: "",
    basics: {
      name: "",
      title: "",
      summary: "",
      location: "",
      email: "",
      phone: "",
      contactPreference: "email" satisfies ContactPreference,
      socialLinks: [createSocialLink("LinkedIn", ""), createSocialLink("Website", "")],
    },
    skills: professionConfig.suggestedSkills.slice(0, 6),
    experience: [createExperience()],
    projects: [createProject()],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateDraftSlug(draft: PortfolioDraft) {
  return {
    ...draft,
    slug: draft.slug || createPortfolioSlug(draft.basics.name, draft.basics.title),
  };
}

export function validateDraftForPublish(draft: PortfolioDraft): DraftValidationResult {
  const errors: string[] = [];

  if (!draft.basics.name.trim()) errors.push("Add your name.");
  if (!draft.basics.title.trim()) errors.push("Add a professional title.");
  if (draft.basics.summary.trim().length < 60)
    errors.push("Add a stronger summary of at least 60 characters.");
  if (!draft.basics.email.trim() && !draft.basics.phone.trim())
    errors.push("Add at least one contact method.");
  if (draft.skills.length < 3) errors.push("Add at least three skills.");

  const hasProject = draft.projects.some(
    (project) => project.title.trim() && project.summary.trim() && project.outcome.trim(),
  );
  if (!hasProject) errors.push("Add at least one project or case study with an outcome.");

  return {
    ok: errors.length === 0,
    errors,
  };
}
