import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PortfolioPreview } from "@/components/portfolio-engine/portfolio-preview";
import { PortfolioPreviewClient } from "@/components/portfolio-engine/portfolio-preview-client";
import { Button } from "@/components/ui/button";
import { getPortfolioEngineAuth } from "@/lib/portfolio-engine/server/auth";
import { getDraftForUser } from "@/lib/portfolio-engine/server/repository";

type PreviewPageProps = {
  params: Promise<{ portfolioId: string }>;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Portfolio Preview | Portfolio Engine",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortfolioPreviewPage({ params }: PreviewPageProps) {
  const { portfolioId } = await params;
  const auth = await getPortfolioEngineAuth();

  if (auth.configured && !auth.user) {
    redirect(
      `/portfolio-engine/sign-in?next=${encodeURIComponent(`/portfolio-engine/preview/${portfolioId}`)}`,
    );
  }

  if (!auth.configured || !auth.user) {
    return <PortfolioPreviewClient portfolioId={portfolioId} />;
  }

  const draft = await getDraftForUser(auth.supabase, auth.user.id, portfolioId);

  if (!draft) {
    return (
      <main className="container min-h-screen pt-28">
        <Button asChild variant="outline">
          <a href="/portfolio-engine/create">Back to builder</a>
        </Button>
        <div className="mt-8 rounded-lg border border-border bg-card p-8">
          <h1 className="font-display text-3xl font-semibold">Draft not found</h1>
          <p className="mt-3 text-muted-foreground">
            This draft does not exist or belongs to a different account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container min-h-screen pt-28">
      <Button asChild variant="outline">
        <a href="/portfolio-engine/create">Back to builder</a>
      </Button>
      <div className="mt-8">
        <PortfolioPreview portfolio={draft} />
      </div>
    </main>
  );
}
