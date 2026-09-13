import type { Metadata } from "next";

import { PortfolioPreviewClient } from "@/components/portfolio-engine/portfolio-preview-client";

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
  return <PortfolioPreviewClient portfolioId={portfolioId} />;
}
