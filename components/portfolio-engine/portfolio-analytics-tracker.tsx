"use client";

import * as React from "react";

export function PortfolioAnalyticsTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    const startedAt = Date.now();

    fetch("/api/portfolio-engine/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, eventType: "view" }),
      keepalive: true,
    }).catch(() => undefined);

    const trackReadTime = () => {
      const readSeconds = Math.round((Date.now() - startedAt) / 1000);
      if (readSeconds < 5) return;

      fetch("/api/portfolio-engine/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, eventType: "read", readSeconds }),
        keepalive: true,
      }).catch(() => undefined);
    };
    const trackClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target) return;

      fetch("/api/portfolio-engine/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, eventType: "click", section: target.textContent?.trim() }),
        keepalive: true,
      }).catch(() => undefined);
    };

    window.addEventListener("click", trackClick);
    window.addEventListener("pagehide", trackReadTime);
    return () => {
      window.removeEventListener("click", trackClick);
      window.removeEventListener("pagehide", trackReadTime);
      trackReadTime();
    };
  }, [slug]);

  return null;
}
