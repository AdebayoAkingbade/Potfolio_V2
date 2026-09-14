import type { Metadata } from "next";

import { PortfolioAnalyticsTracker } from "@/components/portfolio-engine/portfolio-analytics-tracker";
import { PortfolioPreview } from "@/components/portfolio-engine/portfolio-preview";
import { PublicPortfolioClient } from "@/components/portfolio-engine/public-portfolio-client";
import { Button } from "@/components/ui/button";
import { hasPortfolioFeature } from "@/lib/portfolio-engine/entitlements";
import { getCachedPublishedPortfolioBySlug } from "@/lib/portfolio-engine/server/repository";
import { absoluteUrl } from "@/lib/utils";
import { createMetadata } from "@/utils/metadata";

type PublicPortfolioPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getCachedPublishedPortfolioBySlug(slug).catch(() => null);

  if (!portfolio) {
    return {
      ...createMetadata({
        title: "Portfolio unavailable",
        description: "This Portfolio Engine portfolio is unavailable.",
        path: `/p/${slug}`,
      }),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return createMetadata({
    title: `${portfolio.basics.name} - ${portfolio.basics.title || "Portfolio"}`,
    description:
      portfolio.basics.summary ||
      `Professional portfolio for ${portfolio.basics.name || portfolio.slug}.`,
    path: `/p/${portfolio.slug}`,
  });
}

export default async function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { slug } = await params;
  const portfolio = await getCachedPublishedPortfolioBySlug(slug).catch(() => null);

  if (portfolio) {
    const portfolioUrl = absoluteUrl(`/p/${portfolio.slug}`);
    const sameAs = portfolio.basics.socialLinks
      .map((link) => link.url)
      .filter(Boolean)
      .slice(0, 6);
    const schema = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: `${portfolio.basics.name} Portfolio`,
      url: portfolioUrl,
      about: {
        "@type": "Person",
        name: portfolio.basics.name,
        jobTitle: portfolio.basics.title,
        description: portfolio.basics.summary,
        email: portfolio.basics.email || undefined,
        telephone: portfolio.basics.phone || undefined,
        sameAs: sameAs.length ? sameAs : undefined,
      },
    };

    return (
      <main className="min-h-screen pt-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <PortfolioAnalyticsTracker slug={slug} />
        {!hasPortfolioFeature(portfolio, "removeBranding") ? (
          <div className="container pb-8">
            <Button asChild variant="outline">
              <a href="/portfolio-engine">Built with Portfolio Engine</a>
            </Button>
          </div>
        ) : null}
        <div className="container pb-20">
          <PortfolioPreview portfolio={portfolio} />
        </div>
      </main>
    );
  }

  return <PublicPortfolioClient slug={slug} />;
}
