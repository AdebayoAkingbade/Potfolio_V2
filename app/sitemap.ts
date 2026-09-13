import type { MetadataRoute } from "next";

import { blogPosts, projects, siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/blog",
    "/portfolio-engine",
    ...projects.map((project) => `/projects/${project.slug}`),
  ];
  const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}`);

  return [...routes, ...blogRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
