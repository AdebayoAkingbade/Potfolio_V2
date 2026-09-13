import type { Metadata } from "next";

import { PortfolioAnalyticsTracker } from "@/components/portfolio-engine/portfolio-analytics-tracker";
import { PortfolioPreview } from "@/components/portfolio-engine/portfolio-preview";
import { PublicPortfolioClient } from "@/components/portfolio-engine/public-portfolio-client";
import { Button } from "@/components/ui/button";
import { getCachedPublishedPortfolioBySlug } from "@/lib/portfolio-engine/server/repository";
import { createMetadata } from "@/utils/metadata";

type PublicPortfolioPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { slug } = await params;

  return createMetadata({
    title: "Generated Portfolio",
    description: "A professional portfolio created with Portfolio Engine by Akingbade.",
    path: `/p/${slug}`,
  });
}

export default async function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { slug } = await params;
  const portfolio = await getCachedPublishedPortfolioBySlug(slug).catch(() => null);

  if (portfolio) {
    return (
      <main className="min-h-screen pt-24">
        <PortfolioAnalyticsTracker slug={slug} />
        <div className="container pb-8">
          <Button asChild variant="outline">
            <a href="/portfolio-engine">Built with Portfolio Engine</a>
          </Button>
        </div>
        <div className="container pb-20">
          <PortfolioPreview portfolio={portfolio} />
        </div>
      </main>
    );
  }

  return <PublicPortfolioClient slug={slug} />;
}
