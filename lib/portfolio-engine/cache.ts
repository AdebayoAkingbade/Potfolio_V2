export const PUBLIC_PORTFOLIO_REVALIDATE_SECONDS = 3600;

export function publishedPortfolioPath(slug: string) {
  return `/p/${slug}`;
}

export function publishedPortfolioTag(portfolioId: string, version: number) {
  return `portfolio:${portfolioId}:published:${version}`;
}
