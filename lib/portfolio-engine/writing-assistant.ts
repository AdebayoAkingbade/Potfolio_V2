import type { PortfolioDraft, PortfolioProject } from "@/types/portfolio-engine";
import { getProfessionConfig } from "@/lib/portfolio-engine/professions";
import { sanitizeText } from "@/lib/portfolio-engine/sanitize";

export function buildSummarySuggestion(draft: PortfolioDraft) {
  const profession = getProfessionConfig(draft.profession);
  const name = sanitizeText(draft.basics.name, 80) || "I";
  const title = sanitizeText(draft.basics.title, 100) || profession.label.toLowerCase();
  const strongestSkills = draft.skills.slice(0, 4).join(", ");
  const focus = profession.aiPromptConfig.focus.slice(0, 3).join(", ");

  return `${name} is a ${title} focused on ${focus}. The portfolio highlights practical proof across ${strongestSkills || "relevant skills"}, with selected work framed around the problem, contribution, outcome, and next level of impact.`;
}

export function buildProjectSuggestion(project: PortfolioProject, draft: PortfolioDraft) {
  const profession = getProfessionConfig(draft.profession);
  const title = sanitizeText(project.title, 100) || "Selected project";
  const role = sanitizeText(project.role, 100) || draft.basics.title || profession.label;
  const outcome =
    sanitizeText(project.outcome, 220) || "a clearer, more useful outcome for the audience.";

  return `${title} shows my work as ${role}. I focused on the core problem, made the delivery constraints visible, and connected the final result to ${outcome}`;
}
