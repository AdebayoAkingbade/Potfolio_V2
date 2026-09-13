import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portfolio-engine/create", "/portfolio-engine/preview"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
