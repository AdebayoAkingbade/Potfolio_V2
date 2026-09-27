"use client";

import * as React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Send,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { PortfolioDraft } from "@/types/portfolio-engine";
import {
  analyzeCareerIntelligence,
  type CareerIntelligenceAnalysis,
  type NextBestQuestion,
} from "@/lib/portfolio-engine/career/intelligence";
import {
  DEMO_PROFILES_META,
  type DemoProfileKey,
} from "@/lib/portfolio-engine/career/demo-profiles";

interface CareerIntelligencePanelProps {
  draft: PortfolioDraft;
  onUpdateDraft?: (updater: (draft: PortfolioDraft) => PortfolioDraft) => void;
  onLoadDemoProfile?: (demoKey: DemoProfileKey) => void;
  className?: string;
}

export function CareerIntelligencePanel({
  draft,
  onUpdateDraft,
  onLoadDemoProfile,
  className = "",
}: CareerIntelligencePanelProps) {
  const analysis: CareerIntelligenceAnalysis = React.useMemo(() => {
    return analyzeCareerIntelligence(draft);
  }, [draft]);

  const [activeTab, setActiveTab] = React.useState<"strengths" | "gaps" | "questions" | "aiReview">("strengths");
  const [answeringQuestionId, setAnsweringQuestionId] = React.useState<string | null>(null);
  const [answerInput, setAnswerInput] = React.useState("");
  const [answerSuccessNotice, setAnswerSuccessNotice] = React.useState("");

  const handleApplyAnswer = (question: NextBestQuestion) => {
    if (!answerInput.trim() || !onUpdateDraft) return;

    onUpdateDraft((current) => {
      const updated = { ...current };
      const answer = answerInput.trim();

      if (question.targetField === "summary") {
        updated.basics = {
          ...updated.basics,
          summary: updated.basics.summary ? `${updated.basics.summary} ${answer}` : answer,
        };
      } else if (question.targetField === "skills") {
        if (!updated.skills.includes(answer)) {
          updated.skills = [...updated.skills, answer];
        }
      } else if (question.targetField === "experience" && updated.experience.length > 0) {
        updated.experience = updated.experience.map((exp, idx) => {
          if (idx === 0) {
            return {
              ...exp,
              highlights: [...(exp.highlights || []), answer],
            };
          }
          return exp;
        });
      } else if (question.targetField === "projects" && updated.projects.length > 0) {
        updated.projects = updated.projects.map((proj, idx) => {
          if (idx === 0) {
            return {
              ...proj,
              outcome: proj.outcome ? `${proj.outcome} ${answer}` : answer,
            };
          }
          return proj;
        });
      }

      return updated;
    });

    setAnswerSuccessNotice(`Added your response to your ${question.targetField}!`);
    setAnswerInput("");
    setAnsweringQuestionId(null);
    setTimeout(() => setAnswerSuccessNotice(""), 4000);
  };

  return (
    <section
      aria-label="Career Intelligence"
      className={`rounded-xl border border-primary/30 bg-card/95 shadow-lg backdrop-blur-sm overflow-hidden ${className}`}
    >
      {/* Top Banner: Quick Demo Profiles */}
      {onLoadDemoProfile ? (
        <div className="bg-primary/5 border-b border-border/80 px-4 py-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Executive Demo Switcher:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_PROFILES_META.map((meta) => {
                const isActive =
                  (meta.profession === "software-technology" && draft.profession === "software-technology") ||
                  (meta.profession === "healthcare" && draft.profession === "healthcare") ||
                  (meta.profession === "sales" && draft.profession === "sales") ||
                  (meta.profession === "students-graduates" && draft.profession === "students-graduates");

                return (
                  <Button
                    key={meta.key}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={`h-7 px-2.5 text-xs font-medium transition-all ${
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:border-primary/50"
                    }`}
                    onClick={() => onLoadDemoProfile(meta.key)}
                  >
                    {meta.key === "software-engineer" && "💻 "}
                    {meta.key === "nurse" && "🩺 "}
                    {meta.key === "sales-executive" && "💼 "}
                    {meta.key === "student-graduate" && "🎓 "}
                    {meta.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Header: Readiness Score & Pillars */}
      <div className="p-5 sm:p-6 border-b border-border/80">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Score & Profession Badge */}
          <div className="flex items-start gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 shadow-inner">
              <span className="font-display text-2xl font-bold text-foreground">
                {analysis.maturityScore}
              </span>
              <span className="absolute -bottom-2 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
                / 100
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
                  {analysis.professionLabel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {analysis.readinessLevel}
                </Badge>
              </div>
              <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-foreground">
                Career Intelligence & Readiness Audit
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                Profession-aware analysis evaluating real evidence, system architecture, clinical acuity, commercial metrics, and portfolio maturity.
              </p>
            </div>
          </div>

          {/* AI Career Review Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant={activeTab === "aiReview" ? "default" : "outline"}
              className="gap-2 text-xs h-9 border-primary/40"
              onClick={() => setActiveTab("aiReview")}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              AI Career Review
            </Button>
          </div>
        </div>

        {/* 4 Profession-Specific Pillars */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {analysis.pillars.map((pillar) => (
            <div
              key={pillar.key}
              className="rounded-lg border border-border/70 bg-background/50 p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground truncate">
                    {pillar.label}
                  </span>
                  <Badge
                    variant={pillar.status === "pass" ? "default" : "outline"}
                    className="text-[10px] px-1 py-0 h-4 shrink-0"
                  >
                    {pillar.points}/{pillar.maxPoints}
                  </Badge>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      pillar.points >= 20 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${(pillar.points / pillar.maxPoints) * 100}%` }}
                  />
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-muted-foreground line-clamp-2">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Answer Success Alert */}
      {answerSuccessNotice ? (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-5 py-2.5 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{answerSuccessNotice}</span>
        </div>
      ) : null}

      {/* Tabs Bar */}
      <div className="flex border-b border-border/80 bg-muted/40 px-5 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("strengths")}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors ${
            activeTab === "strengths"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Strengths ({analysis.strengths.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gaps")}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors ${
            activeTab === "gaps"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Critical Gaps ({analysis.criticalGaps.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors ${
            activeTab === "questions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Next-Best Questions ({analysis.nextBestQuestions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("aiReview")}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors ${
            activeTab === "aiReview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Executive Verdict
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 sm:p-6">
        {/* Tab 1: Strengths */}
        {activeTab === "strengths" ? (
          <div className="space-y-3">
            {analysis.strengths.map((strength, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-4 flex items-start gap-3.5"
              >
                <div className="rounded-full bg-emerald-500/10 p-1 text-emerald-500 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {strength.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                      {strength.evidenceKey}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {strength.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Tab 2: Critical Gaps */}
        {activeTab === "gaps" ? (
          <div className="space-y-3">
            {analysis.criticalGaps.map((gap, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-4 flex items-start gap-3.5"
              >
                <div className="rounded-full bg-amber-500/10 p-1 text-amber-500 shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {gap.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    <span className="font-medium text-foreground">Recruiter Impact: </span>
                    {gap.impact}
                  </p>
                  <p className="mt-1.5 text-xs text-primary font-medium flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>Action: {gap.recommendedAction}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Tab 3: Next-Best Questions */}
        {activeTab === "questions" ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              These questions target the highest-leverage missing evidence for your profession. Answering them strengthens your readiness score immediately.
            </p>
            <div className="space-y-3">
              {analysis.nextBestQuestions.map((q) => {
                const isAnswering = answeringQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            Target: {q.targetField}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {q.category}
                          </Badge>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-foreground">
                          {q.question}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">Why this matters: </span>
                          {q.whyItMatters}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={isAnswering ? "secondary" : "outline"}
                        className="text-xs shrink-0"
                        onClick={() => {
                          if (isAnswering) {
                            setAnsweringQuestionId(null);
                          } else {
                            setAnsweringQuestionId(q.id);
                            setAnswerInput("");
                          }
                        }}
                      >
                        {isAnswering ? "Cancel" : "Answer"}
                      </Button>
                    </div>

                    {/* Interactive Answer Input */}
                    {isAnswering ? (
                      <div className="mt-4 border-t border-border/80 pt-3">
                        <label className="block text-xs font-medium text-foreground">
                          Your Answer (will be added to {q.targetField}):
                        </label>
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            placeholder={q.suggestedInputPlaceholder || "Type your evidence here..."}
                            className="text-xs h-9"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleApplyAnswer(q);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 px-3 gap-1.5 bg-primary text-primary-foreground"
                            onClick={() => handleApplyAnswer(q)}
                            disabled={!answerInput.trim()}
                          >
                            <Send className="h-3.5 w-3.5" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Tab 4: AI Career Review / Executive Verdict */}
        {activeTab === "aiReview" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Executive Critique & Recommendation</span>
              </div>
              <p className="mt-2 text-xs leading-6 text-foreground">
                {analysis.aiReview.executiveVerdict}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Primary Competitive Edge
                </span>
                <p className="mt-1.5 text-xs leading-5 text-foreground">
                  {analysis.aiReview.competitiveEdge}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Highest-ROI Next Action
                </span>
                <p className="mt-1.5 text-xs leading-5 text-foreground">
                  {analysis.aiReview.priorityImprovement}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Recommended Tone: </span>
                {analysis.aiReview.recommendedTone}
              </div>
              <Badge variant="outline" className="text-[11px]">
                {analysis.aiReview.readinessSummary}
              </Badge>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
