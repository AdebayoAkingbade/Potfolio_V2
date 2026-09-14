"use client";

import * as React from "react";

export function PortfolioAnalyticsTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    const startedAt = Date.now();
    const trackedProjects = new Set<string>();

    const track = (payload: {
      eventType: string;
      section?: string | null;
      readSeconds?: number;
    }) => {
      fetch("/api/portfolio-engine/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...payload }),
        keepalive: true,
      }).catch(() => undefined);
    };

    track({ eventType: "view" });

    const trackReadTime = () => {
      const readSeconds = Math.round((Date.now() - startedAt) / 1000);
      if (readSeconds < 5) return;

      track({ eventType: "read", readSeconds });
    };
    const trackClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target) return;
      const eventType = target.getAttribute("data-portfolio-event") || "click";
      const section = target.getAttribute("data-portfolio-section") || target.textContent?.trim();

      track({ eventType, section });
    };
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const title = entry.target.getAttribute("data-portfolio-project");
                if (!title || trackedProjects.has(title)) continue;
                trackedProjects.add(title);
                track({ eventType: "project_view", section: title });
              }
            },
            { threshold: 0.55 },
          )
        : null;

    document.querySelectorAll("[data-portfolio-project]").forEach((element) => {
      observer?.observe(element);
    });

    window.addEventListener("click", trackClick);
    window.addEventListener("pagehide", trackReadTime);
    return () => {
      observer?.disconnect();
      window.removeEventListener("click", trackClick);
      window.removeEventListener("pagehide", trackReadTime);
      trackReadTime();
    };
  }, [slug]);

  return null;
}
