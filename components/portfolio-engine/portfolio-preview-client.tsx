"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PortfolioPreview } from "@/components/portfolio-engine/portfolio-preview";
import { Button } from "@/components/ui/button";
import { loadDraft } from "@/lib/portfolio-engine/storage";
import type { PortfolioDraft } from "@/types/portfolio-engine";

export function PortfolioPreviewClient({ portfolioId }: { portfolioId: string }) {
  const [draft, setDraft] = React.useState<PortfolioDraft | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setDraft(loadDraft(portfolioId));
    setLoaded(true);
  }, [portfolioId]);

  if (!loaded) {
    return (
      <main className="container min-h-screen pt-28 text-muted-foreground">
        Loading preview...
      </main>
    );
  }

  if (!draft) {
    return (
      <main className="container min-h-screen pt-28">
        <Button asChild variant="outline">
          <Link href="/portfolio-engine/create">
            <ArrowLeft className="h-4 w-4" />
            Back to builder
          </Link>
        </Button>
        <div className="mt-8 rounded-lg border border-border bg-card p-8">
          <h1 className="font-display text-3xl font-semibold">Draft not found</h1>
          <p className="mt-3 text-muted-foreground">
            This local draft is not available in this browser.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container min-h-screen pt-28">
      <Button asChild variant="outline">
        <Link href="/portfolio-engine/create">
          <ArrowLeft className="h-4 w-4" />
          Back to builder
        </Link>
      </Button>
      <div className="mt-8">
        <PortfolioPreview portfolio={draft} />
      </div>
    </main>
  );
}
