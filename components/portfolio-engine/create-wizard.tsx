"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Globe2,
  ImagePlus,
  Plus,
  Save,
  Send,
  Trash2,
  WandSparkles,
} from "lucide-react";

import { PortfolioPreview } from "@/components/portfolio-engine/portfolio-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { professionConfigs, getProfessionConfig } from "@/lib/portfolio-engine/professions";
import { createPublishedSnapshot } from "@/lib/portfolio-engine/publish";
import { calculatePortfolioScore } from "@/lib/portfolio-engine/scoring";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  createDraft,
  createExperience,
  createProject,
  createSocialLink,
  updateDraftSlug,
  validateDraftForPublish,
} from "@/lib/portfolio-engine/schema";
import { sanitizeDraft } from "@/lib/portfolio-engine/sanitize";
import {
  listPublishedSlugs,
  loadActiveDraftId,
  loadDraft,
  loadPublicationsForDraft,
  saveDraft,
  savePublication,
} from "@/lib/portfolio-engine/storage";
import { portfolioTemplates } from "@/lib/portfolio-engine/templates";
import {
  buildProjectSuggestion,
  buildSummarySuggestion,
} from "@/lib/portfolio-engine/writing-assistant";
import { cn } from "@/lib/utils";
import type {
  PortfolioDraft,
  PortfolioExperience,
  PortfolioProject,
  PortfolioTemplateId,
  ProfessionKey,
  ContactPreference,
} from "@/types/portfolio-engine";

const steps = [
  "Profession",
  "Basics",
  "Skills",
  "Experience",
  "Projects",
  "Template",
  "Preview",
  "Publish",
];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(value: string[]) {
  return value.join("\n");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function PortfolioCreateWizard() {
  const router = useRouter();
  const [draft, setDraft] = React.useState<PortfolioDraft>(() => createDraft());
  const [step, setStep] = React.useState(0);
  const [hydrated, setHydrated] = React.useState(false);
  const [saveState, setSaveState] = React.useState("Loading draft");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState("");
  const profession = getProfessionConfig(draft.profession);
  const score = calculatePortfolioScore(draft);
  const isLastStep = step === steps.length - 1;

  React.useEffect(() => {
    const activeDraftId = loadActiveDraftId();
    const activeDraft = activeDraftId ? loadDraft(activeDraftId) : null;
    setDraft(activeDraft ?? createDraft());
    setHydrated(true);
    setSaveState(activeDraft ? "Draft restored" : "New draft ready");
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;

    setSaveState("Saving");
    const timer = window.setTimeout(() => {
      saveDraft(draft);
      setSaveState("Saved in this browser");
    }, 350);

    return () => window.clearTimeout(timer);
  }, [draft, hydrated]);

  const updateDraft = React.useCallback(
    (updater: (current: PortfolioDraft) => PortfolioDraft) => {
      setDraft((current) => updater({ ...current, updatedAt: new Date().toISOString() }));
      setErrors([]);
    },
    [],
  );

  const setProfession = (professionKey: ProfessionKey) => {
    const nextProfession = getProfessionConfig(professionKey);
    updateDraft((current) => ({
      ...current,
      profession: professionKey,
      templateId: nextProfession.recommendedTemplates[0],
      skills: Array.from(new Set([...current.skills, ...nextProfession.suggestedSkills])).slice(
        0,
        12,
      ),
    }));
  };

  const updateBasics = (key: keyof PortfolioDraft["basics"], value: string) => {
    updateDraft((current) => ({
      ...current,
      basics: {
        ...current.basics,
        [key]: value,
      },
    }));
  };

  const updateSocialLink = (linkId: string, key: "label" | "url", value: string) => {
    updateDraft((current) => ({
      ...current,
      basics: {
        ...current.basics,
        socialLinks: current.basics.socialLinks.map((link) =>
          link.id === linkId ? { ...link, [key]: value } : link,
        ),
      },
    }));
  };

  const removeSocialLink = (linkId: string) => {
    updateDraft((current) => ({
      ...current,
      basics: {
        ...current.basics,
        socialLinks: current.basics.socialLinks.filter((link) => link.id !== linkId),
      },
    }));
  };

  const addSkill = (skill: string) => {
    const cleanSkill = skill.trim();
    if (!cleanSkill) return;

    updateDraft((current) => ({
      ...current,
      skills: Array.from(new Set([...current.skills, cleanSkill])).slice(0, 24),
    }));
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateDraft((current) => ({
      ...current,
      skills: current.skills.filter((item) => item !== skill),
    }));
  };

  const updateExperience = (
    experienceId: string,
    updater: (experience: PortfolioExperience) => PortfolioExperience,
  ) => {
    updateDraft((current) => ({
      ...current,
      experience: current.experience.map((item) =>
        item.id === experienceId ? updater(item) : item,
      ),
    }));
  };

  const updateProject = (
    projectId: string,
    updater: (project: PortfolioProject) => PortfolioProject,
  ) => {
    updateDraft((current) => ({
      ...current,
      projects: current.projects.map((item) => (item.id === projectId ? updater(item) : item)),
    }));
  };

  const handlePhoto = (file?: File) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(["Profile photo must be a JPG, PNG, or WebP image."]);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors(["Profile photo must be 1 MB or smaller for the V1 local builder."]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setErrors(["Could not read that image."]);
        return;
      }

      updateDraft((current) => ({
        ...current,
        basics: {
          ...current.basics,
          profilePhoto: {
            id: crypto.randomUUID(),
            name: file.name,
            mimeType: file.type,
            size: file.size,
            dataUrl: reader.result as string,
          },
        },
      }));
    };
    reader.onerror = () => setErrors(["Could not read that image."]);
    reader.readAsDataURL(file);
  };

  const goNext = () => {
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const publish = () => {
    const preparedDraft = sanitizeDraft(updateDraftSlug(draft));
    const validation = validateDraftForPublish(preparedDraft);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    const previousPublication = loadPublicationsForDraft(preparedDraft.id).sort(
      (a, b) => b.version - a.version,
    )[0];
    const existingSlugs = listPublishedSlugs().filter(
      (slug) => slug !== previousPublication?.slug,
    );
    const result = createPublishedSnapshot(
      preparedDraft,
      existingSlugs,
      previousPublication?.version ?? 0,
    );

    if (!result.ok || !result.publication) {
      setErrors(result.errors);
      return;
    }

    savePublication(result.publication);
    saveDraft({ ...preparedDraft, slug: result.publication.slug });
    router.push(`/p/${result.publication.slug}`);
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {professionConfigs.map((item) => {
            const active = draft.profession === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setProfession(item.key)}
                aria-pressed={active}
                className={cn(
                  "min-h-[150px] rounded-lg border border-border bg-card p-5 text-left transition hover:border-primary/60 hover:bg-primary/5",
                  active && "border-primary bg-primary/10",
                )}
              >
                <p className="font-display text-xl font-semibold">{item.label}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name">
                <Input
                  value={draft.basics.name}
                  onChange={(event) => updateBasics("name", event.target.value)}
                />
              </Field>
              <Field label="Professional title">
                <Input
                  value={draft.basics.title}
                  onChange={(event) => updateBasics("title", event.target.value)}
                />
              </Field>
              <Field label="Location">
                <Input
                  value={draft.basics.location}
                  onChange={(event) => updateBasics("location", event.target.value)}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={draft.basics.email}
                  onChange={(event) => updateBasics("email", event.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={draft.basics.phone}
                  onChange={(event) => updateBasics("phone", event.target.value)}
                />
              </Field>
              <label className="block">
                <span className="text-sm font-medium">Preferred contact</span>
                <select
                  value={draft.basics.contactPreference}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      basics: {
                        ...current.basics,
                        contactPreference: event.target.value as ContactPreference,
                      },
                    }))
                  }
                  className="mt-2 flex h-11 w-full rounded-md border border-border bg-background/70 px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="email">Email</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="website">Website</option>
                  <option value="phone">Phone</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Profile photo</span>
                <span className="mt-2 flex min-h-11 items-center gap-3 rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                  <ImagePlus className="h-4 w-4 text-primary" />
                  <input
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    onChange={(event) => handlePhoto(event.target.files?.[0])}
                    className="w-full text-sm"
                  />
                </span>
              </label>
            </div>
            <Field label="Summary">
              <Textarea
                value={draft.basics.summary}
                onChange={(event) => updateBasics("summary", event.target.value)}
                className="min-h-36"
              />
            </Field>
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => updateBasics("summary", buildSummarySuggestion(draft))}
            >
              <WandSparkles className="h-4 w-4" />
              Improve summary
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display text-xl font-semibold">Social links</h3>
            <div className="mt-5 space-y-3">
              {draft.basics.socialLinks.map((link) => (
                <div key={link.id} className="grid gap-2">
                  <Input
                    value={link.label}
                    onChange={(event) => updateSocialLink(link.id, "label", event.target.value)}
                    placeholder="Label"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={link.url}
                      onChange={(event) => updateSocialLink(link.id, "url", event.target.value)}
                      placeholder="https://..."
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => removeSocialLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() =>
                updateDraft((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    socialLinks: [...current.basics.socialLinks, createSocialLink()],
                  },
                }))
              }
            >
              <Plus className="h-4 w-4" />
              Add link
            </Button>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display text-2xl font-semibold">Your skills</h3>
            <div className="mt-5 flex gap-2">
              <Input
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Add a skill"
              />
              <Button type="button" onClick={() => addSkill(skillInput)}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {draft.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-sm hover:border-primary"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display text-xl font-semibold">Suggested</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {profession.suggestedSkills.map((skill) => (
                <Button
                  key={skill}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="grid gap-4">
          {draft.experience.map((experience, index) => (
            <article
              key={experience.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="font-display text-xl font-semibold">Experience {index + 1}</h3>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      experience: current.experience.filter(
                        (item) => item.id !== experience.id,
                      ),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Role">
                  <Input
                    value={experience.role}
                    onChange={(event) =>
                      updateExperience(experience.id, (item) => ({
                        ...item,
                        role: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Organization">
                  <Input
                    value={experience.organization}
                    onChange={(event) =>
                      updateExperience(experience.id, (item) => ({
                        ...item,
                        organization: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Start">
                  <Input
                    value={experience.start}
                    onChange={(event) =>
                      updateExperience(experience.id, (item) => ({
                        ...item,
                        start: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="End">
                  <Input
                    value={experience.end}
                    onChange={(event) =>
                      updateExperience(experience.id, (item) => ({
                        ...item,
                        end: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Summary">
                  <Textarea
                    value={experience.summary}
                    onChange={(event) =>
                      updateExperience(experience.id, (item) => ({
                        ...item,
                        summary: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Highlights">
                  <Textarea
                    value={joinLines(experience.highlights)}
                    onChange={(event) =>
                      updateExperience(experience.id, (item) => ({
                        ...item,
                        highlights: splitLines(event.target.value),
                      }))
                    }
                    placeholder="One achievement per line"
                  />
                </Field>
              </div>
            </article>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() =>
              updateDraft((current) => ({
                ...current,
                experience: [...current.experience, createExperience()],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Add experience
          </Button>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="grid gap-4">
          {draft.projects.map((project, index) => (
            <article key={project.id} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="font-display text-xl font-semibold">Project {index + 1}</h3>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      projects: current.projects.filter((item) => item.id !== project.id),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Project title">
                  <Input
                    value={project.title}
                    onChange={(event) =>
                      updateProject(project.id, (item) => ({
                        ...item,
                        title: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Your role">
                  <Input
                    value={project.role}
                    onChange={(event) =>
                      updateProject(project.id, (item) => ({
                        ...item,
                        role: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <Field label="Summary">
                  <Textarea
                    value={project.summary}
                    onChange={(event) =>
                      updateProject(project.id, (item) => ({
                        ...item,
                        summary: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Challenge">
                  <Textarea
                    value={project.challenge}
                    onChange={(event) =>
                      updateProject(project.id, (item) => ({
                        ...item,
                        challenge: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Outcome">
                  <Textarea
                    value={project.outcome}
                    onChange={(event) =>
                      updateProject(project.id, (item) => ({
                        ...item,
                        outcome: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
              <div className="mt-5 grid gap-3">
                {project.links.map((link) => (
                  <div key={link.id} className="grid gap-2 md:grid-cols-[180px_1fr_auto]">
                    <Input
                      value={link.label}
                      onChange={(event) =>
                        updateProject(project.id, (item) => ({
                          ...item,
                          links: item.links.map((projectLink) =>
                            projectLink.id === link.id
                              ? { ...projectLink, label: event.target.value }
                              : projectLink,
                          ),
                        }))
                      }
                      placeholder="Label"
                    />
                    <Input
                      value={link.url}
                      onChange={(event) =>
                        updateProject(project.id, (item) => ({
                          ...item,
                          links: item.links.map((projectLink) =>
                            projectLink.id === link.id
                              ? { ...projectLink, url: event.target.value }
                              : projectLink,
                          ),
                        }))
                      }
                      placeholder="https://..."
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        updateProject(project.id, (item) => ({
                          ...item,
                          links: item.links.filter((projectLink) => projectLink.id !== link.id),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    updateProject(project.id, (item) => ({
                      ...item,
                      links: [...item.links, createSocialLink("Project", "")],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add project link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    updateProject(project.id, (item) => ({
                      ...item,
                      summary: buildProjectSuggestion(item, draft),
                    }))
                  }
                >
                  <WandSparkles className="h-4 w-4" />
                  Improve summary
                </Button>
              </div>
            </article>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() =>
              updateDraft((current) => ({
                ...current,
                projects: [...current.projects, createProject()],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Add project
          </Button>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {portfolioTemplates.map((template) => {
            const active = draft.templateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() =>
                  updateDraft((current) => ({
                    ...current,
                    templateId: template.id as PortfolioTemplateId,
                  }))
                }
                aria-pressed={active}
                className={cn(
                  "rounded-lg border border-border bg-card p-5 text-left transition hover:border-primary",
                  active && template.previewClass,
                )}
              >
                <p className="font-display text-2xl font-semibold">{template.name}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {template.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {template.bestFor.slice(0, 3).map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (step === 6) {
      return (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Portfolio Score</p>
            <p className="mt-2 font-display text-5xl font-semibold">{score.score}</p>
            <p className="mt-1 text-primary">{score.level}</p>
            <div className="mt-5 space-y-3">
              {score.checks.map((check) => (
                <div
                  key={check.key}
                  className="rounded-md border border-border bg-background/60 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{check.label}</p>
                    <Badge variant={check.status === "pass" ? "default" : "outline"}>
                      {check.points}/{check.maxPoints}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{check.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <PortfolioPreview portfolio={draft} compact />
        </div>
      );
    }

    const validation = validateDraftForPublish(sanitizeDraft(updateDraftSlug(draft)));
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <PortfolioPreview portfolio={draft} compact />
        <div className="rounded-lg border border-border bg-card p-5">
          <Globe2 className="h-6 w-6 text-primary" />
          <h3 className="mt-5 font-display text-2xl font-semibold">Ready to publish</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Publishing creates a snapshot at your portfolio slug. Draft edits stay private until
            you publish again.
          </p>
          <div className="mt-5 rounded-md border border-border bg-background/60 p-3 text-sm text-muted-foreground">
            /p/{updateDraftSlug(draft).slug || "your-name"}
          </div>
          {!validation.ok ? (
            <div className="mt-5 rounded-md border border-secondary/50 bg-secondary/10 p-4">
              <p className="font-medium">Before publishing</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {validation.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-primary/50 bg-primary/10 p-4 text-sm">
              Your draft passes the V1 publish checks.
            </div>
          )}
          <Button type="button" size="lg" className="mt-5 w-full" onClick={publish}>
            <Send className="h-4 w-4" />
            Publish portfolio
          </Button>
        </div>
      </div>
    );
  };

  return (
    <main className="pt-24">
      <section className="px-4 py-10">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Button asChild variant="outline">
                <Link href="/portfolio-engine">
                  <ArrowLeft className="h-4 w-4" />
                  Portfolio Engine
                </Link>
              </Button>
              <h1 className="mt-6 font-display text-4xl font-semibold md:text-6xl">
                Create your portfolio
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Build a structured professional portfolio from your role, proof, and outcomes.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              <Save className="h-4 w-4 text-primary" />
              {hydrated ? saveState : "Loading draft"}
            </div>
          </div>

          <div className="mb-8 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex min-w-max gap-2">
              {steps.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(index)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:border-primary",
                    step === index && "border-primary bg-primary/10 text-foreground",
                  )}
                >
                  {index < step ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{profession.label}</Badge>
                  <Badge variant="secondary">{steps[step]}</Badge>
                  <Badge variant="outline">Score {score.score}</Badge>
                </div>
                <h2 className="mt-4 font-display text-3xl font-semibold">{profession.label}</h2>
                <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                  {profession.description}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/portfolio-engine/preview/${draft.id}`}>
                  <Eye className="h-4 w-4" />
                  Preview draft
                </Link>
              </Button>
            </div>
          </div>

          {errors.length > 0 ? (
            <div className="mb-6 rounded-lg border border-secondary/50 bg-secondary/10 p-4">
              <p className="font-medium">Needs attention</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {renderStep()}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {isLastStep ? (
              <Button type="button" onClick={publish}>
                <Send className="h-4 w-4" />
                Publish portfolio
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
