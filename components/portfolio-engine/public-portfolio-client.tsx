"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PortfolioPreview } from "@/components/portfolio-engine/portfolio-preview";
import { Button } from "@/components/ui/button";
import { hasPortfolioFeature } from "@/lib/portfolio-engine/entitlements";
import { loadPublicationBySlug } from "@/lib/portfolio-engine/storage";
import type { PublishedPortfolio } from "@/types/portfolio-engine";

export function PublicPortfolioClient({ slug }: { slug: string }) {
  const [portfolio, setPortfolio] = React.useState<PublishedPortfolio | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setPortfolio(loadPublicationBySlug(slug));
    setLoaded(true);
  }, [slug]);

  if (!loaded) {
    return (
      <main className="container min-h-screen pt-28 text-muted-foreground">
        Loading portfolio...
      </main>
    );
  }

  if (!portfolio) {
    return (
      <main className="container min-h-screen pt-28">
        <Button asChild variant="outline">
          <Link href="/portfolio-engine">
            <ArrowLeft className="h-4 w-4" />
            Portfolio Engine
          </Link>
        </Button>
        <div className="mt-8 rounded-lg border border-border bg-card p-8">
          <h1 className="font-display text-3xl font-semibold">Portfolio unavailable</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            This local publication is only available in the browser where it was published.
            Server-backed portfolios publish from signed-in accounts.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24">
      {!hasPortfolioFeature(portfolio, "removeBranding") ? (
        <div className="container pb-8">
          <Button asChild variant="outline">
            <Link href="/portfolio-engine">
              <ArrowLeft className="h-4 w-4" />
              Built with Portfolio Engine
            </Link>
          </Button>
        </div>
      ) : null}
      <div className="container pb-20">
        <PortfolioPreview portfolio={portfolio} />
      </div>
    </main>
  );
}
