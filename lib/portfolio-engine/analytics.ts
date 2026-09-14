import type { PortfolioAnalyticsSummary } from "@/types/portfolio-engine";
import { createAnalyticsSummary } from "@/lib/portfolio-engine/schema";

export type PortfolioAnalyticsEvent = {
  event_type: string;
  referrer: string | null;
  section: string | null;
  visitor_hash: string | null;
  read_seconds: number | null;
  created_at: string;
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function increment(map: Map<string, number>, key: string, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function topValues(map: Map<string, number>) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }));
}

export function summarizeAnalyticsEvents(
  events: PortfolioAnalyticsEvent[],
): PortfolioAnalyticsSummary {
  if (!events.length) return createAnalyticsSummary();

  const referrers = new Map<string, number>();
  const sections = new Map<string, number>();
  const projects = new Map<string, number>();
  const visitors = new Set<string>();
  const trend = new Map<string, { views: number; visitors: Set<string> }>();
  let views = 0;
  let clicks = 0;
  let leads = 0;
  let projectViews = 0;
  let cvDownloads = 0;
  let contactClicks = 0;
  let linkedinClicks = 0;
  let githubClicks = 0;
  let totalReadSeconds = 0;
  let readSamples = 0;

  for (const event of events) {
    const type = event.event_type || "view";
    const day = dayKey(new Date(event.created_at));
    const visitor = event.visitor_hash || `${day}:anonymous`;
    const dayTrend = trend.get(day) ?? { views: 0, visitors: new Set<string>() };

    visitors.add(visitor);
    dayTrend.visitors.add(visitor);

    if (type === "view") {
      views += 1;
      dayTrend.views += 1;
    }
    if (type === "project_view") {
      projectViews += 1;
      if (event.section) increment(projects, event.section);
    }
    if (type === "cv_download") cvDownloads += 1;
    if (type === "contact_click") {
      contactClicks += 1;
      leads += 1;
    }
    if (type === "linkedin_click") linkedinClicks += 1;
    if (type === "github_click") githubClicks += 1;
    if (type === "click") clicks += 1;
    if (type === "lead") leads += 1;
    if (event.referrer) increment(referrers, event.referrer);
    if (event.section) increment(sections, event.section);
    if (typeof event.read_seconds === "number" && Number.isFinite(event.read_seconds)) {
      totalReadSeconds += event.read_seconds;
      readSamples += 1;
    }

    trend.set(day, dayTrend);
  }

  return {
    views,
    visitors: visitors.size,
    clicks: clicks + contactClicks + linkedinClicks + githubClicks + cvDownloads,
    leads,
    projectViews,
    cvDownloads,
    contactClicks,
    linkedinClicks,
    githubClicks,
    avgReadSeconds: readSamples ? Math.round(totalReadSeconds / readSamples) : 0,
    topReferrers: topValues(referrers),
    topSections: topValues(sections),
    topProjects: topValues(projects),
    trend: Array.from(trend.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, value]) => ({
        date,
        views: value.views,
        visitors: value.visitors.size,
      })),
  };
}

export function createDemoAnalyticsSummary(seed = 1): PortfolioAnalyticsSummary {
  const today = new Date();
  const trend = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));
    const wave = (index + seed) % 5;
    return {
      date: dayKey(date),
      views: 16 + wave * 4 + index,
      visitors: 8 + wave * 2 + Math.round(index / 2),
    };
  });
  const views = trend.reduce((total, item) => total + item.views, 0);
  const visitors = trend.reduce((total, item) => total + item.visitors, 0);

  return {
    views,
    visitors,
    clicks: Math.round(views * 0.18),
    leads: Math.round(views * 0.045),
    projectViews: Math.round(views * 0.58),
    cvDownloads: Math.round(views * 0.035),
    contactClicks: Math.round(views * 0.05),
    linkedinClicks: Math.round(views * 0.07),
    githubClicks: Math.round(views * 0.06),
    avgReadSeconds: 86,
    topReferrers: [
      { label: "LinkedIn", value: Math.round(views * 0.34) },
      { label: "GitHub", value: Math.round(views * 0.22) },
      { label: "Direct", value: Math.round(views * 0.19) },
    ],
    topSections: [
      { label: "Selected Work", value: Math.round(views * 0.42) },
      { label: "Experience", value: Math.round(views * 0.25) },
      { label: "Contact", value: Math.round(views * 0.12) },
    ],
    topProjects: [
      { label: "Data Visualization", value: Math.round(views * 0.27) },
      { label: "Commerce Platform", value: Math.round(views * 0.18) },
      { label: "AI Workflow", value: Math.round(views * 0.13) },
    ],
    trend,
  };
}
