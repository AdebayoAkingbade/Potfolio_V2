export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function createPortfolioSlug(name: string, title: string) {
  const base = slugify(`${name} ${title}`);
  return base || `portfolio-${Date.now().toString(36)}`;
}

export function resolveSlugCollision(preferredSlug: string, existingSlugs: string[]) {
  const used = new Set(existingSlugs.map((slug) => slug.toLowerCase()));
  const base = slugify(preferredSlug) || `portfolio-${Date.now().toString(36)}`;

  if (!used.has(base)) return base;

  let index = 2;
  let candidate = `${base}-${index}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${base}-${index}`;
  }

  return candidate;
}
