import type { Metadata } from "next";

import { PublicPortfolioClient } from "@/components/portfolio-engine/public-portfolio-client";
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
  return <PublicPortfolioClient slug={slug} />;
}
