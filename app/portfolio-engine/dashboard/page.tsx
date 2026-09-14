import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Download,
  Github,
  Globe2,
  Linkedin,
  Mail,
  MousePointerClick,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createDemoAnalyticsSummary } from "@/lib/portfolio-engine/analytics";
import { getPortfolioPlanLabel } from "@/lib/portfolio-engine/entitlements";
import { getPortfolioEngineAuth } from "@/lib/portfolio-engine/server/auth";
import {
  getActiveDraftForUser,
  getAnalyticsSummaryForUser,
} from "@/lib/portfolio-engine/server/repository";
import type { PortfolioAnalyticsSummary } from "@/types/portfolio-engine";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Analytics Dashboard | Portfolio Engine",
  robots: {
    index: false,
    follow: false,
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-4xl font-semibold">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}

function AnalyticsBars({ summary }: { summary: PortfolioAnalyticsSummary }) {
  const maxViews = Math.max(...summary.trend.map((item) => item.views), 1);

  return (
    <div className="flex h-56 items-end gap-2 rounded-lg border border-border bg-card p-5">
      {summary.trend.map((item) => (
        <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-primary/70"
            style={{ height: `${Math.max(8, (item.views / maxViews) * 180)}px` }}
            title={`${item.date}: ${item.views} views`}
          />
          <span className="w-full truncate text-center text-[10px] text-muted-foreground">
            {item.date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

function RankedList({
  label,
  items,
}: {
  label: string;
  items: { label: string; value: number }[];
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-display text-2xl font-semibold">{label}</h2>
      <div className="mt-5 grid gap-4">
        {(items.length ? items : [{ label: "No events yet", value: 0 }]).map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>{item.label}</span>
              <span className="text-muted-foreground">{formatNumber(item.value)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function buildAnalyticsAdvice(summary: PortfolioAnalyticsSummary) {
  const advice: string[] = [];
  const topProject = summary.topProjects[0];
  const contactRate = summary.views ? Math.round((summary.contactClicks / summary.views) * 100) : 0;

  if (topProject && summary.projectViews) {
    const share = Math.round((topProject.value / summary.projectViews) * 100);
    advice.push(`${topProject.label} gets ${share}% of your project views.`);
  }

  if (summary.views >= 10 && contactRate < 8) {
    advice.push(
      `${formatNumber(summary.views)} people viewed your portfolio, but only ${formatNumber(
        summary.contactClicks,
      )} clicked Contact. Consider making the primary CTA more visible.`,
    );
  }

  if (summary.linkedinClicks > summary.githubClicks * 2 && summary.githubClicks < 5) {
    advice.push("LinkedIn is getting more attention than GitHub. Put stronger project proof near your GitHub link.");
  }

  return advice.length ? advice : ["Your portfolio has enough baseline activity for clearer recommendations soon."];
}

export default async function PortfolioEngineDashboardPage() {
  const auth = await getPortfolioEngineAuth();

  if (auth.configured && !auth.user) {
    redirect("/portfolio-engine/sign-in?next=/portfolio-engine/dashboard");
  }

  const draft = auth.configured && auth.user
    ? await getActiveDraftForUser(auth.supabase, auth.user.id).catch(() => null)
    : null;
  const analytics = auth.configured && auth.user
    ? await getAnalyticsSummaryForUser(auth.supabase, auth.user.id).catch(() => ({
        summary: createDemoAnalyticsSummary(),
        sample: true,
      }))
    : { summary: createDemoAnalyticsSummary(), sample: true };
  const summary = analytics.summary;
  const advice = buildAnalyticsAdvice(summary);

  return (
    <main className="min-h-screen pt-24">
      <section className="px-4 py-10">
        <div className="container">
          <Button asChild variant="outline">
            <Link href="/portfolio-engine/create">
              <ArrowLeft className="h-4 w-4" />
              Builder
            </Link>
          </Button>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{draft ? getPortfolioPlanLabel(draft.plan) : "Analytics"}</Badge>
                {analytics.sample ? <Badge variant="outline">Sample data</Badge> : null}
                {draft?.customDomain?.hostname ? (
                  <Badge variant="secondary">{draft.customDomain.hostname}</Badge>
                ) : null}
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold md:text-6xl">
                Portfolio analytics
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Track portfolio views, visitors, project views, CV downloads, contact intent,
                profile clicks, referrers, and practical growth signals from one dashboard.
              </p>
            </div>
            <Button asChild>
              <Link href="/portfolio-engine/create">Edit portfolio</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Views"
              value={formatNumber(summary.views)}
              detail="Total public portfolio page views over the current reporting window."
              icon={<BarChart3 className="h-5 w-5" />}
            />
            <MetricCard
              label="Visitors"
              value={formatNumber(summary.visitors)}
              detail="Unique visitor estimate based on request metadata."
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              label="Project views"
              value={formatNumber(summary.projectViews)}
              detail="Project cards seen by public visitors during the current reporting window."
              icon={<MousePointerClick className="h-5 w-5" />}
            />
            <MetricCard
              label="CV downloads"
              value={formatNumber(summary.cvDownloads)}
              detail="Resume or CV download intent from tracked portfolio links."
              icon={<Download className="h-5 w-5" />}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Contact clicks"
              value={formatNumber(summary.contactClicks)}
              detail="Email, phone, and primary contact clicks from published portfolios."
              icon={<Mail className="h-5 w-5" />}
            />
            <MetricCard
              label="LinkedIn clicks"
              value={formatNumber(summary.linkedinClicks)}
              detail="Outbound LinkedIn profile engagement from public portfolio pages."
              icon={<Linkedin className="h-5 w-5" />}
            />
            <MetricCard
              label="GitHub clicks"
              value={formatNumber(summary.githubClicks)}
              detail="Outbound GitHub profile or repository engagement from public pages."
              icon={<Github className="h-5 w-5" />}
            />
            <MetricCard
              label="All clicks"
              value={formatNumber(summary.clicks)}
              detail="All tracked outbound portfolio actions combined."
              icon={<MousePointerClick className="h-5 w-5" />}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold">30-day trend</h2>
              </div>
              <AnalyticsBars summary={summary} />
            </section>
            <article className="rounded-lg border border-border bg-card p-5">
              <Globe2 className="h-5 w-5 text-primary" />
              <h2 className="mt-4 font-display text-2xl font-semibold">Growth setup</h2>
              <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                <p>Plan: {draft ? getPortfolioPlanLabel(draft.plan) : "Not configured"}</p>
                <p>Domain: {draft?.customDomain?.hostname ?? "Not connected"}</p>
                <p>Team seats: {draft?.team.seats ?? 1}</p>
                <p>Clone/export: {draft?.exportSettings.allowClone ? "Enabled" : "Private"}</p>
                <p>Average read: {formatNumber(summary.avgReadSeconds)}s</p>
              </div>
            </article>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RankedList label="Top referrers" items={summary.topReferrers} />
            <RankedList label="Top sections" items={summary.topSections} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RankedList label="Most viewed projects" items={summary.topProjects} />
            <article className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-semibold">Contextual advice</h2>
              <div className="mt-5 grid gap-3">
                {advice.map((item) => (
                  <p
                    key={item}
                    className="rounded-md border border-border bg-background/60 p-3 text-sm text-muted-foreground"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
