import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  LayoutTemplate,
  LineChart,
  LockKeyhole,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";

import { professionConfigs } from "@/lib/portfolio-engine/professions";
import { portfolioTemplates } from "@/lib/portfolio-engine/templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const examples = [
  {
    title: "Senior Backend Engineer",
    detail:
      "Case studies, system diagrams, reliability notes, API proof, and production metrics.",
    template: "Signal",
  },
  {
    title: "Product Manager",
    detail: "Roadmaps, discovery notes, experiment results, launch metrics, and decision logs.",
    template: "Stage",
  },
  {
    title: "Photographer",
    detail:
      "Visual galleries, client work, booking paths, creative direction, and testimonials.",
    template: "Atelier",
  },
];

const steps = [
  "Choose your profession",
  "Add profile, skills, experience, and projects",
  "Pick a template",
  "Preview, score, and publish",
];

const faqs = [
  {
    question: "Will generated portfolios live on this Vercel app?",
    answer:
      "Yes. Public portfolios are designed for the same application under /p/[slug], with a clean path to database-backed publishing.",
  },
  {
    question: "Do visitors need to know design or code?",
    answer:
      "No. The builder asks practical questions and turns the answers into a structured portfolio draft.",
  },
  {
    question: "Can this become a standalone SaaS later?",
    answer:
      "Yes. The profession config, scoring, templates, draft model, and public renderer are isolated from the host portfolio.",
  },
  {
    question: "Is AI required?",
    answer:
      "No. V1 works without external AI calls. The writing assistant is designed so a server-side AI route can be added later without exposing keys.",
  },
];

export function EngineLanding() {
  return (
    <main className="pt-24">
      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="absolute inset-0 -z-10 mesh-surface" />
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
            <div className="max-w-4xl">
              <Badge variant="secondary">Portfolio Engine</Badge>
              <h1 className="mt-6 text-balance font-display text-5xl font-semibold tracking-normal md:text-7xl">
                Build a portfolio that gets you noticed.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
                Create a professional portfolio website in minutes; no coding or design
                experience required.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/portfolio-engine/create">
                    Create My Portfolio, Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#examples">See Examples</a>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-glow">
              <div className="rounded-md border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Portfolio Score</p>
                    <p className="mt-1 font-display text-5xl font-semibold">86</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
                    <Star className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {["Strong positioning", "Project outcomes", "SEO-ready summary"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <p className="font-medium">Draft</p>
                  <p className="mt-1 text-muted-foreground">Private by default</p>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <p className="font-medium">Publish</p>
                  <p className="mt-1 text-muted-foreground">Snapshot-based</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="examples" className="section-pad">
        <div className="container">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
              Portfolio Examples
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
              Different careers, same proof-first standard.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {examples.map((example) => (
              <article
                key={example.title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <Badge>{example.template}</Badge>
                <h3 className="mt-5 font-display text-2xl font-semibold">{example.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{example.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad mesh-surface">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
                Templates By Profession
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
                Built from reusable career intelligence.
              </h2>
              <p className="mt-5 leading-8 text-muted-foreground">
                Each profession has suggested sections, skills, project structure, onboarding
                questions, scoring rules, and recommended templates.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {professionConfigs.map((profession) => (
                <div
                  key={profession.key}
                  className="rounded-md border border-border bg-card p-4 text-sm"
                >
                  <p className="font-semibold">{profession.label}</p>
                  <p className="mt-2 line-clamp-2 text-muted-foreground">
                    {profession.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <LayoutTemplate className="h-6 w-6 text-primary" />
            <h2 className="mt-5 font-display text-3xl font-semibold">How it works</h2>
            <div className="mt-6 grid gap-3">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-md border border-border p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-sm text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <article className="rounded-lg border border-border bg-card p-6">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <h2 className="mt-5 font-display text-3xl font-semibold">AI-assisted writing</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Improve summaries, responsibilities, project descriptions, SEO snippets, and
                missing proof prompts without making AI required for the core product.
              </p>
            </article>
            <article className="rounded-lg border border-border bg-card p-6">
              <Upload className="h-6 w-6 text-secondary" />
              <h2 className="mt-5 font-display text-3xl font-semibold">Resume-to-portfolio</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                V1 keeps the data entry path simple. Resume import is designed as a later
                upgrade with private uploads, parsing, validation, and review.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-pad mesh-surface">
        <div className="container grid gap-5 lg:grid-cols-3">
          <article className="rounded-lg border border-border bg-card p-6">
            <LineChart className="h-6 w-6 text-primary" />
            <h2 className="mt-5 font-display text-3xl font-semibold">Analytics preview</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              The architecture leaves room for Vercel Analytics, Speed Insights, traffic
              sources, conversion events, and portfolio performance trends.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card p-6">
            <BarChart3 className="h-6 w-6 text-secondary" />
            <h2 className="mt-5 font-display text-3xl font-semibold">Portfolio Score</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Score drafts by profile completeness, positioning, skills, experience, projects,
              external proof, and SEO readiness.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card p-6">
            <LockKeyhole className="h-6 w-6 text-accent" />
            <h2 className="mt-5 font-display text-3xl font-semibold">Free now, Pro later</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Free portfolios launch first. Pro can later add custom domains, AI credits,
              analytics, premium templates, and deeper integrations.
            </p>
          </article>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
                FAQ
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
                Built like a product, hosted inside the portfolio.
              </h2>
            </div>
            <div className="grid gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                  <p className="mt-3 leading-7 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="container overflow-hidden rounded-lg border border-border bg-card">
          <div className="mesh-surface p-6 md:p-10">
            <Sparkles className="h-7 w-7 text-primary" />
            <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold md:text-5xl">
              Start with a clean draft, then make it publishable.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/portfolio-engine/create">
                  Create My Portfolio, Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">Back to Akingbade</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-10">
        <div className="container flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Portfolio Engine by Akingbade.</p>
          <div className="flex flex-wrap gap-3">
            {portfolioTemplates.map((template) => (
              <Badge key={template.id} variant="outline">
                {template.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
