import { describe, it, expect } from "vitest";
import {
  sanitizeText,
  sanitizeMultilineText,
  sanitizeWebUrl,
  sanitizeHyperlinkUrl,
  sanitizeImageUrl,
  sanitizeVideoUrl,
  sanitizePhone,
  sanitizeEmail,
  sanitizeDraft,
} from "@/lib/portfolio-engine/sanitize";
import { createDraft } from "@/lib/portfolio-engine/schema";

describe("Context-Aware Input & URL Sanitization (Gate 11)", () => {
  it("strictly restricts web URLs to HTTP/HTTPS and rejects mailto, tel, and data schemes", () => {
    expect(sanitizeWebUrl("https://example.com/project")).toBe("https://example.com/project");
    expect(sanitizeWebUrl("http://localhost:3000/demo")).toBe("http://localhost:3000/demo");

    // mailto and tel MUST be rejected in web URL contexts (projects, websites, certs)
    expect(sanitizeWebUrl("mailto:user@example.com")).toBe("");
    expect(sanitizeWebUrl("tel:+1234567890")).toBe("");
    expect(sanitizeWebUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeWebUrl("data:text/html,<script>alert(1)</script>")).toBe("");
  });

  it("permits mailto and tel only in generic hyperlink contexts (social / contact)", () => {
    expect(sanitizeHyperlinkUrl("https://linkedin.com/in/user")).toBe("https://linkedin.com/in/user");
    expect(sanitizeHyperlinkUrl("mailto:user@example.com")).toBe("mailto:user@example.com");
    expect(sanitizeHyperlinkUrl("tel:+1234567890")).toBe("tel:+1234567890");
    expect(sanitizeHyperlinkUrl("javascript:alert(1)")).toBe("");
  });

  it("enforces media URL constraints: rejects mailto and tel in image and video sources", () => {
    // Valid HTTPS images accepted
    expect(sanitizeImageUrl("https://cdn.example.com/photo.webp")).toBe("https://cdn.example.com/photo.webp");
    // mailto and tel MUST NOT be allowed in image src
    expect(sanitizeImageUrl("mailto:admin@example.com")).toBe("");
    expect(sanitizeImageUrl("tel:+1234567890")).toBe("");
    expect(sanitizeImageUrl("javascript:alert(1)")).toBe("");

    // Valid video URLs accepted
    expect(sanitizeVideoUrl("https://cdn.example.com/demo.mp4")).toBe("https://cdn.example.com/demo.mp4");
    // tel and mailto MUST NOT be allowed in video media
    expect(sanitizeVideoUrl("tel:+1234567890")).toBe("");
    expect(sanitizeVideoUrl("mailto:admin@example.com")).toBe("");
    expect(sanitizeVideoUrl("javascript:alert(1)")).toBe("");
  });

  it("permits safe base64 image data URLs only for validated images, denying non-images", () => {
    const validDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    expect(sanitizeImageUrl(validDataUrl)).toBe(validDataUrl);

    // Malicious or non-image data URLs are rejected
    expect(sanitizeImageUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe("");
    expect(sanitizeImageUrl("data:application/javascript;base64,YWxlcnQoMSk=")).toBe("");
  });

  it("validates and formats telephone numbers while rejecting dangerous inputs", () => {
    expect(sanitizePhone("+1 (555) 123-4567")).toBe("+1 (555) 123-4567");
    expect(sanitizePhone("tel:+44 20 7183 8750")).toBe("+44 20 7183 8750");
    expect(sanitizePhone("0123456789")).toBe("0123456789");

    // Malicious or invalid values rejected
    expect(sanitizePhone("javascript:alert(1)")).toBe("");
    expect(sanitizePhone("Call me maybe")).toBe("");
    expect(sanitizePhone("<script>123</script>")).toBe("");
  });

  it("strips ASCII control characters from text inputs", () => {
    const malicious = "John\u0000Doe\u0007\u001B[31mEngineer";
    expect(sanitizeText(malicious)).toBe("JohnDoe[31mEngineer");
    expect(sanitizeMultilineText("Line 1\u0000\nLine 2\u0007")).toBe("Line 1\nLine 2");
  });

  it("validates and normalizes emails", () => {
    expect(sanitizeEmail("Test@Example.Com ")).toBe("test@example.com");
    expect(sanitizeEmail("invalid-email")).toBe("");
    expect(sanitizeEmail("name@domain")).toBe("");
    expect(sanitizeEmail("<script>@evil.com")).toBe("");
  });

  it("sanitizes an entire draft object recursively with context-aware URL protection", () => {
    const draft = createDraft();
    draft.basics.name = " Jane Doe \u0000 ";
    draft.basics.email = "Jane@Domain.com";
    draft.basics.phone = "+1 (555) 987-6543";
    draft.basics.socialLinks = [
      { id: "1", label: "Malicious", url: "javascript:alert(document.cookie)" },
      { id: "2", label: "LinkedIn", url: "https://linkedin.com/in/janedoe" },
      { id: "3", label: "Email", url: "mailto:jane@domain.com" },
    ];
    draft.basics.profilePhoto = {
      id: "photo-1",
      name: "avatar.jpg",
      mimeType: "image/jpeg",
      size: 1024,
      kind: "image",
      url: "mailto:hacker@evil.com", // Dangerous: mailto in image src! Must be stripped!
      storageProvider: "supabase",
    };
    draft.projects = [
      {
        id: "p1",
        title: "Project Alpha",
        role: "Lead",
        summary: "Summary text",
        challenge: "Challenge text",
        outcome: "Outcome text",
        links: [
          { id: "l1", label: "Web", url: "https://example.com" },
          { id: "l2", label: "Mail Link", url: "mailto:contact@project.com" }, // Denied in project links!
        ],
        videos: [
          {
            id: "v1",
            name: "demo.mp4",
            mimeType: "video/mp4",
            size: 2048,
            kind: "video",
            url: "tel:+1234567890", // Dangerous: tel in video src! Must be stripped!
            storageProvider: "supabase",
          },
        ],
      },
    ];

    const cleaned = sanitizeDraft(draft);
    expect(cleaned.basics.name).toBe("Jane Doe");
    expect(cleaned.basics.email).toBe("jane@domain.com");
    expect(cleaned.basics.phone).toBe("+1 (555) 987-6543");

    // Social links allowed https and mailto, but stripped javascript
    expect(cleaned.basics.socialLinks).toHaveLength(2);
    expect(cleaned.basics.socialLinks[0].url).toBe("https://linkedin.com/in/janedoe");
    expect(cleaned.basics.socialLinks[1].url).toBe("mailto:jane@domain.com");

    // Profile photo: mailto was rejected, so url is empty/undefined
    expect(cleaned.basics.profilePhoto).toBeUndefined();

    // Project links: mailto was rejected in project web link context
    expect(cleaned.projects[0].links).toHaveLength(1);
    expect(cleaned.projects[0].links[0].url).toBe("https://example.com/");

    // Project video: tel scheme was rejected, video object omitted
    expect(cleaned.projects[0].videos).toHaveLength(0);
  });
});
