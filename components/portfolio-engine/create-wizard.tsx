"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Crown,
  Download,
  Eye,
  FileText,
  Github,
  Globe2,
  ImagePlus,
  LineChart,
  Plus,
  Rocket,
  Save,
  Send,
  Trash2,
  UploadCloud,
  Users,
  Video,
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
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  createPortfolioDomain,
  createDraft,
  createExperience,
  createProject,
  createSocialLink,
  createVideoAsset,
  updateDraftSlug,
  validateDraftForPublish,
  withPortfolioV2Defaults,
} from "@/lib/portfolio-engine/schema";
import { clonePortfolioDraft, renderPortfolioExportHtml } from "@/lib/portfolio-engine/export";
import { importResumeTextIntoDraft } from "@/lib/portfolio-engine/importers";
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
  PortfolioVideoAsset,
  ProfessionKey,
  ContactPreference,
} from "@/types/portfolio-engine";

const steps = [
  "Profession",
  "Imports",
  "Basics",
  "Skills",
  "Experience",
  "Projects",
  "Template",
  "Growth",
  "Preview",
  "Publish",
];

type PersistenceMode = "local" | "server";

type PortfolioCreateWizardProps = {
  initialDraft?: PortfolioDraft;
  persistenceMode?: PersistenceMode;
  userEmail?: string;
};

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(value: string[]) {
  return value.join("\n");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read that file."));
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  return body && typeof body === "object" && typeof body.error === "string"
    ? body.error
    : fallback;
}

function downloadText(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function PortfolioCreateWizard({
  initialDraft,
  persistenceMode = "local",
  userEmail = "",
}: PortfolioCreateWizardProps) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<PortfolioDraft>(() =>
    withPortfolioV2Defaults(initialDraft ?? createDraft(), userEmail),
  );
  const [step, setStep] = React.useState(0);
  const [hydrated, setHydrated] = React.useState(false);
  const [saveState, setSaveState] = React.useState("Loading draft");
  const [actionState, setActionState] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState("");
  const [resumeText, setResumeText] = React.useState("");
  const [githubUsername, setGithubUsername] = React.useState("");
  const [domainInput, setDomainInput] = React.useState(initialDraft?.customDomain?.hostname ?? "");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const profession = getProfessionConfig(draft.profession);
  const score = calculatePortfolioScore(draft);
  const isLastStep = step === steps.length - 1;
  const isServerMode = persistenceMode === "server";

  React.useEffect(() => {
    if (isServerMode) {
      const nextDraft = withPortfolioV2Defaults(initialDraft ?? createDraft(), userEmail);
      setDraft(nextDraft);
      setDomainInput(nextDraft.customDomain?.hostname ?? "");
      setHydrated(true);
      setSaveState(initialDraft ? "Draft restored from account" : "New account draft ready");
      return;
    }

    const activeDraftId = loadActiveDraftId();
    const activeDraft = activeDraftId ? loadDraft(activeDraftId) : null;
    const nextDraft = withPortfolioV2Defaults(activeDraft ?? createDraft(), userEmail);
    setDraft(nextDraft);
    setDomainInput(nextDraft.customDomain?.hostname ?? "");
    setHydrated(true);
    setSaveState(activeDraft ? "Draft restored" : "New draft ready");
  }, [initialDraft, isServerMode, userEmail]);

  React.useEffect(() => {
    if (!hydrated) return;

    setSaveState(isServerMode ? "Saving to account" : "Saving");
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (!isServerMode) {
        saveDraft(draft);
        setSaveState("Saved in this browser");
        return;
      }

      fetch("/api/portfolio-engine/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(await readError(response, "Could not save draft."));
          setSaveState("Saved to account");
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setSaveState("Save failed");
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [draft, hydrated, isServerMode]);

  const updateDraft = React.useCallback(
    (updater: (current: PortfolioDraft) => PortfolioDraft) => {
      setDraft((current) =>
        withPortfolioV2Defaults(
          updater({ ...current, updatedAt: new Date().toISOString() }),
          userEmail,
        ),
      );
      setErrors([]);
    },
    [userEmail],
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

  const handlePhoto = async (file?: File) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(["Profile photo must be a JPG, PNG, or WebP image."]);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors(["Profile photo must be 1 MB or smaller."]);
      return;
    }

    if (isServerMode) {
      setActionState("Uploading profile photo");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("draftId", draft.id);

      const response = await fetch("/api/portfolio-engine/upload", {
        method: "POST",
        body: formData,
      }).catch(() => null);

      if (response?.ok) {
        const data = (await response.json()) as { asset?: PortfolioDraft["basics"]["profilePhoto"] };
        if (data.asset) {
          updateDraft((current) => ({
            ...current,
            basics: {
              ...current.basics,
              profilePhoto: data.asset,
            },
          }));
          setActionState("Profile photo uploaded");
          return;
        }
      }

      setActionState("");
      setErrors(["Could not upload that image."]);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateDraft((current) => ({
        ...current,
        basics: {
          ...current.basics,
          profilePhoto: {
            id: crypto.randomUUID(),
            name: file.name,
            mimeType: file.type,
            size: file.size,
            kind: "image",
            dataUrl,
          },
        },
      }));
    } catch {
      setErrors(["Could not read that image."]);
    }
  };

  const handleProjectVideo = async (projectId: string, file?: File) => {
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setErrors(["Video must be an MP4, WebM, or MOV file."]);
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setErrors(["Video uploads are limited to 25 MB."]);
      return;
    }

    if (isServerMode) {
      setActionState("Uploading project video");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("draftId", draft.id);
      formData.append("projectId", projectId);

      const response = await fetch("/api/portfolio-engine/videos/upload", {
        method: "POST",
        body: formData,
      }).catch(() => null);

      if (response?.ok) {
        const data = (await response.json()) as { asset?: PortfolioVideoAsset };
        const asset = data.asset;
        if (asset) {
          updateProject(projectId, (project) => ({
            ...project,
            videos: [...project.videos, asset].slice(0, 3),
          }));
          setActionState("Project video uploaded");
          return;
        }
      }

      setActionState("");
      setErrors(["Could not upload that video."]);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateProject(projectId, (project) => ({
        ...project,
        videos: [...project.videos, createVideoAsset(file, dataUrl)].slice(0, 3),
      }));
    } catch {
      setErrors(["Could not read that video."]);
    }
  };

  const rewriteSummary = async () => {
    const fallback = buildSummarySuggestion(draft);

    if (!isServerMode) {
      updateBasics("summary", fallback);
      return;
    }

    setActionState("Rewriting with OpenAI");
    const response = await fetch("/api/portfolio-engine/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draft,
        target: "summary",
        text: draft.basics.summary,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      setActionState("");
      setErrors([response ? await readError(response, "Could not rewrite summary.") : "Could not rewrite summary."]);
      return;
    }

    const data = (await response.json()) as { rewrite?: string; source?: string };
    updateBasics("summary", data.rewrite || fallback);
    setActionState(data.source === "openai" ? "Rewritten with OpenAI" : "Local rewrite applied");
  };

  const rewriteProjectSummary = async (project: PortfolioProject) => {
    const fallback = buildProjectSuggestion(project, draft);

    if (!isServerMode) {
      updateProject(project.id, (item) => ({
        ...item,
        summary: fallback,
      }));
      return;
    }

    setActionState("Rewriting project with OpenAI");
    const response = await fetch("/api/portfolio-engine/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draft,
        target: "project",
        projectId: project.id,
        text: project.summary,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      setActionState("");
      setErrors([
        response ? await readError(response, "Could not rewrite project summary.") : "Could not rewrite project summary.",
      ]);
      return;
    }

    const data = (await response.json()) as { rewrite?: string; source?: string };
    updateProject(project.id, (item) => ({
      ...item,
      summary: data.rewrite || fallback,
    }));
    setActionState(data.source === "openai" ? "Rewritten with OpenAI" : "Local rewrite applied");
  };

  const importResume = async () => {
    if (!resumeText.trim()) {
      setErrors(["Paste resume text or upload a text resume."]);
      return;
    }

    if (!isServerMode) {
      updateDraft(() => importResumeTextIntoDraft(resumeText, draft));
      setActionState("Resume imported");
      setStep(2);
      return;
    }

    setActionState("Importing resume");
    const response = await fetch("/api/portfolio-engine/import/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft, text: resumeText }),
    }).catch(() => null);

    if (!response?.ok) {
      setActionState("");
      setErrors([response ? await readError(response, "Could not import resume.") : "Could not import resume."]);
      return;
    }

    const data = (await response.json()) as { draft?: PortfolioDraft };
    if (data.draft) {
      setDraft(withPortfolioV2Defaults(data.draft, userEmail));
      setActionState("Resume imported");
      setStep(2);
    }
  };

  const importResumeFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 120_000) {
      setErrors(["Resume import is limited to 120 KB for text uploads."]);
      return;
    }

    setResumeText(await file.text());
    setActionState("Resume text loaded");
  };

  const importGithub = async () => {
    if (!githubUsername.trim()) {
      setErrors(["Enter a GitHub username."]);
      return;
    }

    setActionState("Importing GitHub");
    const response = await fetch("/api/portfolio-engine/import/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft, username: githubUsername }),
    }).catch(() => null);

    if (!response?.ok) {
      setActionState("");
      setErrors([response ? await readError(response, "Could not import GitHub profile.") : "Could not import GitHub profile."]);
      return;
    }

    const data = (await response.json()) as { draft?: PortfolioDraft };
    if (data.draft) {
      setDraft(withPortfolioV2Defaults(data.draft, userEmail));
      setActionState("GitHub imported");
      setStep(5);
    }
  };

  const connectDomain = async () => {
    if (!domainInput.trim()) {
      setErrors(["Enter a custom domain."]);
      return;
    }

    if (!isServerMode) {
      updateDraft((current) => ({
        ...current,
        plan: "pro",
        customDomain: createPortfolioDomain(domainInput),
      }));
      setActionState("Domain staged");
      return;
    }

    setActionState("Connecting domain");
    const response = await fetch("/api/portfolio-engine/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: draft.id, hostname: domainInput }),
    }).catch(() => null);

    if (!response?.ok) {
      setActionState("");
      setErrors([response ? await readError(response, "Could not connect domain.") : "Could not connect domain."]);
      return;
    }

    const data = (await response.json()) as { draft?: PortfolioDraft };
    if (data.draft) setDraft(withPortfolioV2Defaults(data.draft, userEmail));
    setActionState("Domain verification ready");
  };

  const inviteTeammate = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(["Enter a valid teammate email."]);
      return;
    }

    if (!isServerMode) {
      updateDraft((current) => ({
        ...current,
        plan: "pro",
        team: {
          ...current.team,
          agencyMode: true,
          seats: Math.max(current.team.seats, current.team.members.length + 1),
          members: [
            ...current.team.members,
            {
              id: crypto.randomUUID(),
              name: email.split("@")[0],
              email,
              role: "editor",
              status: "invited",
              invitedAt: new Date().toISOString(),
            },
          ],
        },
      }));
      setInviteEmail("");
      setActionState("Teammate invited");
      return;
    }

    setActionState("Inviting teammate");
    const response = await fetch("/api/portfolio-engine/team/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: draft.id, email, role: "editor" }),
    }).catch(() => null);

    if (!response?.ok) {
      setActionState("");
      setErrors([response ? await readError(response, "Could not invite teammate.") : "Could not invite teammate."]);
      return;
    }

    const data = (await response.json()) as { draft?: PortfolioDraft };
    if (data.draft) setDraft(withPortfolioV2Defaults(data.draft, userEmail));
    setInviteEmail("");
    setActionState("Teammate invited");
  };

  const startCheckout = async () => {
    if (!isServerMode) {
      updateDraft((current) => ({ ...current, plan: "pro" }));
      setActionState("Pro preview enabled");
      return;
    }

    setActionState("Opening Pro checkout");
    const response = await fetch("/api/portfolio-engine/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId: draft.id }),
    }).catch(() => null);

    if (!response?.ok) {
      setActionState("");
      setErrors([response ? await readError(response, "Could not start checkout.") : "Could not start checkout."]);
      return;
    }

    const data = (await response.json()) as { checkoutUrl?: string | null; message?: string };
    updateDraft((current) => ({ ...current, plan: "pro" }));
    if (data.checkoutUrl) {
      window.location.assign(data.checkoutUrl);
      return;
    }
    setActionState(data.message ?? "Pro preview enabled");
  };

  const exportPortfolio = (format: "json" | "html") => {
    updateDraft((current) => ({
      ...current,
      exportSettings: {
        ...current.exportSettings,
        preferredFormat: format,
        lastExportedAt: new Date().toISOString(),
      },
    }));

    if (isServerMode) {
      window.location.href = `/api/portfolio-engine/drafts/${draft.id}/export?format=${format}`;
      return;
    }

    const safeSlug = draft.slug || draft.basics.name.toLowerCase().replace(/\s+/g, "-") || "portfolio";
    if (format === "html") {
      downloadText(`${safeSlug}.html`, renderPortfolioExportHtml(draft), "text/html");
      return;
    }
    downloadText(`${safeSlug}.json`, JSON.stringify(sanitizeDraft(draft), null, 2), "application/json");
  };

  const cloneDraft = async () => {
    if (!isServerMode) {
      const cloned = clonePortfolioDraft(draft);
      saveDraft(cloned);
      setDraft(withPortfolioV2Defaults(cloned, userEmail));
      setStep(0);
      setActionState("Draft cloned");
      return;
    }

    setActionState("Cloning draft");
    const response = await fetch(`/api/portfolio-engine/drafts/${draft.id}/clone`, {
      method: "POST",
    }).catch(() => null);

    if (!response?.ok) {
      setActionState("");
      setErrors([response ? await readError(response, "Could not clone draft.") : "Could not clone draft."]);
      return;
    }

    const data = (await response.json()) as { draft?: PortfolioDraft };
    if (data.draft) {
      setDraft(withPortfolioV2Defaults(data.draft, userEmail));
      setStep(0);
      setActionState("Draft cloned");
    }
  };

  const goNext = () => {
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const publish = async () => {
    const preparedDraft = sanitizeDraft(updateDraftSlug(draft));
    const validation = validateDraftForPublish(preparedDraft);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    if (isServerMode) {
      setActionState("Publishing portfolio");

      const saveResponse = await fetch("/api/portfolio-engine/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: preparedDraft }),
      }).catch(() => null);

      if (!saveResponse?.ok) {
        setActionState("");
        setErrors([
          saveResponse
            ? await readError(saveResponse, "Could not save before publishing.")
            : "Could not save before publishing.",
        ]);
        return;
      }

      const publishResponse = await fetch(
        `/api/portfolio-engine/drafts/${preparedDraft.id}/publish`,
        { method: "POST" },
      ).catch(() => null);

      if (!publishResponse?.ok) {
        setActionState("");
        const message = publishResponse
          ? await readError(publishResponse, "Could not publish portfolio.")
          : "Could not publish portfolio.";
        setErrors([message]);
        return;
      }

      const data = (await publishResponse.json()) as { url?: string };
      router.push(data.url ?? `/p/${preparedDraft.slug}`);
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
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-semibold">Resume/CV import</h3>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-medium">Resume file</span>
                <span className="mt-2 flex min-h-11 items-center gap-3 rounded-md border border-border bg-background/70 px-3 py-2 text-sm">
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <input
                    type="file"
                    accept=".txt,.md,.text"
                    onChange={(event) => importResumeFile(event.target.files?.[0])}
                    className="w-full text-sm"
                  />
                </span>
              </label>
              <Field label="Resume text">
                <Textarea
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value)}
                  className="min-h-56"
                  placeholder="Name, summary, skills, experience, projects..."
                />
              </Field>
              <Button type="button" onClick={importResume} className="w-fit">
                <FileText className="h-4 w-4" />
                Import resume
              </Button>
            </div>
          </article>

          <article className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-semibold">GitHub import</h3>
            </div>
            <div className="mt-5 flex gap-2">
              <Input
                value={githubUsername}
                onChange={(event) => setGithubUsername(event.target.value)}
                placeholder="github-username"
              />
              <Button type="button" onClick={importGithub}>
                <Github className="h-4 w-4" />
                Import
              </Button>
            </div>
            <div className="mt-6 rounded-md border border-border bg-background/60 p-4">
              <p className="text-sm font-medium">Import history</p>
              <div className="mt-4 grid gap-3">
                {draft.imports.length ? (
                  draft.imports.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="mt-1 text-muted-foreground">{item.detail}</p>
                      </div>
                      <Badge variant={item.status === "imported" ? "default" : "outline"}>
                        {item.source}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No imports yet.</p>
                )}
              </div>
            </div>
          </article>
        </div>
      );
    }

    if (step === 2) {
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
              onClick={rewriteSummary}
            >
              <WandSparkles className="h-4 w-4" />
              Rewrite summary
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

    if (step === 3) {
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

    if (step === 4) {
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

    if (step === 5) {
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
              <div className="mt-5 rounded-md border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Project videos</p>
                </div>
                <label className="mt-3 flex min-h-11 items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm">
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <input
                    type="file"
                    accept={ALLOWED_VIDEO_TYPES.join(",")}
                    onChange={(event) => handleProjectVideo(project.id, event.target.files?.[0])}
                    className="w-full text-sm"
                  />
                </label>
                {project.videos.length ? (
                  <div className="mt-3 grid gap-2">
                    {project.videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm"
                      >
                        <span className="truncate">{video.name}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            updateProject(project.id, (item) => ({
                              ...item,
                              videos: item.videos.filter((asset) => asset.id !== video.id),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
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
                  onClick={() => rewriteProjectSummary(project)}
                >
                  <WandSparkles className="h-4 w-4" />
                  Rewrite summary
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

    if (step === 6) {
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
                    plan: template.tier === "pro" ? "pro" : current.plan,
                    templateId: template.id as PortfolioTemplateId,
                  }))
                }
                aria-pressed={active}
                className={cn(
                  "rounded-lg border border-border bg-card p-5 text-left transition hover:border-primary",
                  active && template.previewClass,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl font-semibold">{template.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{template.creatorName}</p>
                  </div>
                  <Badge variant={template.tier === "pro" ? "secondary" : "outline"}>
                    {template.tier === "pro"
                      ? `$${template.priceUsd ?? 0}`
                      : "Free"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {template.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {template.marketplaceBadge ? (
                    <Badge variant="secondary">{template.marketplaceBadge}</Badge>
                  ) : null}
                  {template.supportsVideo ? <Badge variant="outline">Video</Badge> : null}
                  {template.bestFor.slice(0, 3).map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {template.usageCount?.toLocaleString() ?? 0} portfolios
                </p>
              </button>
            );
          })}
        </div>
      );
    }

    if (step === 7) {
      return (
        <div className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-display text-2xl font-semibold">Pro plan</h3>
              </div>
              <Badge variant={draft.plan === "pro" ? "default" : "outline"}>
                {draft.plan === "pro" ? "Pro" : "Free"}
              </Badge>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
              {[
                "OpenAI rewrite credits",
                "Custom domains",
                "Advanced analytics",
                "Marketplace templates",
                "Video uploads",
                "Team seats",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </p>
              ))}
            </div>
            <Button type="button" className="mt-5" onClick={startCheckout}>
              <Rocket className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </article>

          <article className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-semibold">Custom domain</h3>
            </div>
            <div className="mt-5 flex gap-2">
              <Input
                value={domainInput}
                onChange={(event) => setDomainInput(event.target.value)}
                placeholder="portfolio.example.com"
              />
              <Button type="button" onClick={connectDomain}>
                Connect
              </Button>
            </div>
            {draft.customDomain ? (
              <div className="mt-5 rounded-md border border-border bg-background/60 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{draft.customDomain.hostname}</p>
                  <Badge variant="outline">{draft.customDomain.status}</Badge>
                </div>
                <p className="mt-3 text-muted-foreground">CNAME {draft.customDomain.target}</p>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                  <code className="min-w-0 flex-1 truncate text-xs">
                    {draft.customDomain.verificationToken}
                  </code>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      navigator.clipboard.writeText(draft.customDomain?.verificationToken ?? "")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </article>

          <article className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-semibold">Team/agency</h3>
            </div>
            <div className="mt-5 flex gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="teammate@example.com"
              />
              <Button type="button" onClick={inviteTeammate}>
                Invite
              </Button>
            </div>
            <div className="mt-5 grid gap-2">
              {draft.team.members.length ? (
                draft.team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">{member.email}</span>
                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Solo workspace</p>
              )}
            </div>
          </article>

          <article className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <LineChart className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl font-semibold">Analytics and exports</h3>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button asChild variant="outline">
                <Link href="/portfolio-engine/dashboard">
                  <LineChart className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={cloneDraft}>
                <Copy className="h-4 w-4" />
                Clone draft
              </Button>
              <Button type="button" variant="outline" onClick={() => exportPortfolio("json")}>
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button type="button" variant="outline" onClick={() => exportPortfolio("html")}>
                <Download className="h-4 w-4" />
                Export HTML
              </Button>
            </div>
            <label className="mt-5 flex items-center gap-3 rounded-md border border-border bg-background/60 p-3 text-sm">
              <input
                type="checkbox"
                checked={draft.exportSettings.allowClone}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    exportSettings: {
                      ...current.exportSettings,
                      allowClone: event.target.checked,
                    },
                  }))
                }
                className="h-4 w-4"
              />
              Public portfolio cloning
            </label>
          </article>
        </div>
      );
    }

    if (step === 8) {
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
              Your draft passes the V2 publish checks.
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
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <Save className="h-4 w-4 text-primary" />
                {hydrated ? saveState : "Loading draft"}
              </div>
              {actionState ? (
                <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
                  <WandSparkles className="h-4 w-4 text-primary" />
                  {actionState}
                </div>
              ) : null}
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
                  <Badge variant="outline">{isServerMode ? "Server" : "Local"}</Badge>
                  <Badge variant={draft.plan === "pro" ? "secondary" : "outline"}>
                    {draft.plan === "pro" ? "Pro" : "Free"}
                  </Badge>
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
