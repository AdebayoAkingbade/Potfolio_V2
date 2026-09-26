import { describe, it, expect } from "vitest";
import { renderPortfolioExportHtml } from "@/lib/portfolio-engine/export";
import { createDraft } from "@/lib/portfolio-engine/schema";

describe("Static HTML Export & Safety (Gate 12)", () => {
  it("escapes user-provided content and embeds deliberate, strict CSP", () => {
    const draft = createDraft();
    draft.basics.name = "<script>alert('pwned')</script>";
    draft.basics.title = "Lead Security <Engineer>";
    draft.basics.summary = "Built high-scale platforms with 99.99% reliability & secure defaults.";

    const html = renderPortfolioExportHtml(draft);

    // Must contain escaped HTML entities
    expect(html).toContain("&lt;script&gt;alert(&#039;pwned&#039;)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert('pwned')</script>");
    expect(html).toContain("Lead Security &lt;Engineer&gt;");

    // Must contain strict Content-Security-Policy meta tag
    expect(html).toContain('<meta http-equiv="Content-Security-Policy"');
    expect(html).toContain("default-src 'none'");
    expect(html).toContain("style-src 'unsafe-inline'");
    expect(html).toContain("img-src data: https: http:");
    expect(html).toContain("font-src data: https:");
    expect(html).toContain("media-src https: http:");
    expect(html).toContain("connect-src 'none'");
    expect(html).toContain("script-src 'none'");
    expect(html).toContain("base-uri 'none'");
    expect(html).toContain("form-action 'none'");
  });

  it("produces zero inline or external script tags in the exported document", () => {
    const draft = createDraft();
    draft.basics.name = "Safe Export";
    const html = renderPortfolioExportHtml(draft);

    expect(html).not.toMatch(/<script\b/i);
    // Ensure no event handler attributes (onclick=, onload=, onerror=, etc.) are present.
    // Uses \b word boundary to avoid false positives on attributes like content=, font-src=, etc.
    expect(html).not.toMatch(/\bon\w+=/i);
  });
});
