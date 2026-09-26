import { describe, it, expect } from "vitest";
import { createPublishedSnapshot } from "@/lib/portfolio-engine/publish";
import { createDraft } from "@/lib/portfolio-engine/schema";

describe("Publication Model & Snapshot Immutability", () => {
  function createValidDraft() {
    const draft = createDraft();
    draft.basics.name = "Alex Mercer";
    draft.basics.title = "Cloud Security Architect";
    draft.basics.summary =
      "Experienced architect specializing in multi-cloud security and zero trust architectures with proven results.";
    draft.basics.email = "alex@example.com";
    draft.skills = ["Cloud Security", "Kubernetes", "Zero Trust", "IAM"];
    draft.projects = [
      {
        id: "proj-1",
        title: "Enterprise Zero Trust Migration",
        role: "Lead Architect",
        summary: "Migrated 50 microservices to mutual TLS with zero downtime.",
        challenge: "Complex legacy network topology.",
        outcome: "Achieved SOC2 compliance and reduced breach surface by 80%.",
        links: [{ id: "l1", label: "Demo", url: "https://demo.example.com" }],
        videos: [],
      },
    ];
    draft.slug = "alex-mercer";
    return draft;
  }

  it("creates a published snapshot with incremented version", () => {
    const draft = createValidDraft();
    const snapshot = createPublishedSnapshot(draft, [], 0);
    expect(snapshot.ok).toBe(true);
    if (snapshot.ok && snapshot.publication) {
      expect(snapshot.publication.version).toBe(1);
      expect(snapshot.publication.basics.name).toBe("Alex Mercer");
      expect(snapshot.publication.publicationId).toBeDefined();
    }
  });

  it("increments version number sequentially from previous publication version", () => {
    const draft = createValidDraft();
    const snapshotV3 = createPublishedSnapshot(draft, [], 2);
    expect(snapshotV3.ok).toBe(true);
    if (snapshotV3.ok && snapshotV3.publication) {
      expect(snapshotV3.publication.version).toBe(3);
    }
  });

  it("allocates a collision-resistant unique slug when existing slugs conflict", () => {
    const draft = createValidDraft();
    const existingSlugs = ["alex-mercer", "alex-mercer-1"];
    const snapshot = createPublishedSnapshot(draft, existingSlugs, 0);

    expect(snapshot.ok).toBe(true);
    if (snapshot.ok && snapshot.publication) {
      expect(snapshot.publication.slug).toBe("alex-mercer-2");
    }
  });
});
