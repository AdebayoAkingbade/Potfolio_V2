import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publishDraftForUser } from "@/lib/portfolio-engine/server/repository";
import { createDraft } from "@/lib/portfolio-engine/schema";
import type { PortfolioDraft } from "@/types/portfolio-engine";

function createValidDraft(id = "draft_1", name = "Alex Mercer", slug = "alex-mercer"): PortfolioDraft {
  const draft = createDraft();
  draft.id = id;
  draft.basics.name = name;
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
  draft.slug = slug;
  return draft;
}

function createMockSupabaseDatabase() {
  const drafts = new Map<string, PortfolioDraft>();
  const publications: Array<{
    id: string;
    source_draft_id: string;
    user_id: string;
    slug: string;
    data: unknown;
    version: number;
    score: number;
    published_at: string;
    deleted_at: string | null;
    is_live: boolean;
    idempotency_key: string | null;
    created_at: string;
    updated_at: string;
  }> = [];

  const client = {
    _drafts: drafts,
    _publications: publications,
    from: (table: string) => {
      if (table === "portfolio_accounts") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { plan: "pro" }, error: null }),
            }),
          }),
        };
      }

      if (table === "portfolio_team_members") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === "portfolio_drafts") {
        return {
          select: () => ({
            eq: (_col: string, val: string) => ({
              maybeSingle: async () => {
                const draft = drafts.get(val);
                return {
                  data: draft
                    ? {
                        id: draft.id,
                        user_id: "user_owner",
                        slug: draft.slug,
                        data: draft,
                        created_at: draft.createdAt,
                        updated_at: draft.updatedAt,
                      }
                    : null,
                  error: null,
                };
              },
            }),
          }),
          update: (updates: { slug?: string; data?: PortfolioDraft }) => ({
            eq: (_col: string, id: string) => {
              const existing = drafts.get(id);
              if (existing && updates.data) {
                drafts.set(id, updates.data);
              }
              return Promise.resolve({ data: null, error: null });
            },
          }),
        };
      }

      if (table === "portfolio_publications") {
        let currentFilterSlug: string | null = null;
        let excludeDraftId: string | null = null;
        let filterDraftId: string | null = null;
        let filterIdempotencyKey: string | null = null;

        const queryObj = {
          select: () => queryObj,
          eq: (col: string, val: unknown) => {
            if (col === "slug") currentFilterSlug = String(val);
            if (col === "source_draft_id") filterDraftId = String(val);
            if (col === "idempotency_key") filterIdempotencyKey = String(val);
            return queryObj;
          },
          neq: (col: string, val: string) => {
            if (col === "source_draft_id") excludeDraftId = val;
            return queryObj;
          },
          is: () => queryObj,
          order: () => queryObj,
          limit: () => queryObj,
          maybeSingle: async () => {
            let matched = publications.slice();
            if (currentFilterSlug) matched = matched.filter((p) => p.slug === currentFilterSlug && p.deleted_at === null);
            if (excludeDraftId) matched = matched.filter((p) => p.source_draft_id !== excludeDraftId);
            if (filterDraftId) matched = matched.filter((p) => p.source_draft_id === filterDraftId);
            if (filterIdempotencyKey) matched = matched.filter((p) => p.idempotency_key === filterIdempotencyKey);

            const sorted = matched.sort((a, b) => b.version - a.version);
            return { data: sorted[0] ?? null, error: null };
          },
          update: (updates: Partial<{ is_live: boolean; deleted_at: string }>) => ({
            eq: (col1: string, val1: string | boolean) => ({
              eq: (_col2: string, _val2: unknown) => {
                for (const p of publications) {
                  if (col1 === "source_draft_id" && p.source_draft_id === val1) {
                    Object.assign(p, updates);
                  }
                }
                return Promise.resolve({ data: null, error: null });
              },
            }),
          }),
          insert: (row: typeof publications[number]) => ({
            select: () => ({
              single: async () => {
                publications.push(row);
                return { data: row, error: null };
              },
            }),
          }),
        };

        return queryObj;
      }

      return {};
    },
  } as unknown as SupabaseClient & {
    _drafts: Map<string, PortfolioDraft>;
    _publications: typeof publications;
  };

  return client;
}

describe("Gate 5: Public Slug Uniqueness", () => {
  it("resolves slug collisions when two independent drafts claim the same normalized slug", async () => {
    const mockDb = createMockSupabaseDatabase();

    // Draft A
    const draftA = createValidDraft("draft_a", "John Doe", "john-doe");
    mockDb._drafts.set(draftA.id, draftA);

    // Draft B
    const draftB = createValidDraft("draft_b", "John Doe", "john-doe");
    mockDb._drafts.set(draftB.id, draftB);

    // Publish Draft A -> wins "john-doe"
    const resA = await publishDraftForUser(mockDb, "user_owner", "draft_a");
    expect(resA.ok).toBe(true);
    expect(resA.publication?.slug).toBe("john-doe");

    // Publish Draft B -> database slug collision resolved to "john-doe-1"
    const resB = await publishDraftForUser(mockDb, "user_owner", "draft_b");
    expect(resB.ok).toBe(true);
    expect(resB.publication?.slug).toBe("john-doe-1");

    // Both publications are live with unique slugs
    const liveSlugs = mockDb._publications.filter((p) => p.is_live).map((p) => p.slug);
    expect(liveSlugs).toEqual(["john-doe", "john-doe-1"]);
  });
});

describe("Gate 6: Publication Version Atomicity & Historical Snapshot Immutability", () => {
  it("generates sequential versions without mutating historical snapshots", async () => {
    const mockDb = createMockSupabaseDatabase();

    const draft = createValidDraft("draft_v_test", "Jane Developer", "jane-developer");
    mockDb._drafts.set(draft.id, draft);

    // 1. Publish V1
    const p1 = await publishDraftForUser(mockDb, "user_owner", draft.id);
    expect(p1.ok).toBe(true);
    expect(p1.publication?.version).toBe(1);

    const v1SnapshotJson = JSON.stringify(mockDb._publications[0]?.data);

    // 2. Modify draft and publish V2
    const currentDraft = mockDb._drafts.get(draft.id)!;
    currentDraft.basics.summary =
      "Updated V2 Summary with new metrics and extensive cloud infrastructure achievements.";
    mockDb._drafts.set(draft.id, currentDraft);

    const p2 = await publishDraftForUser(mockDb, "user_owner", draft.id);
    expect(p2.ok).toBe(true);
    expect(p2.publication?.version).toBe(2);

    const v2SnapshotJson = JSON.stringify(mockDb._publications[1]?.data);

    // Verify V1 snapshot remains 100% byte-identical and unmutated
    expect(JSON.stringify(mockDb._publications[0]?.data)).toBe(v1SnapshotJson);
    expect((mockDb._publications[0]?.data as { basics: { summary: string } }).basics.summary).toContain(
      "Experienced architect specializing",
    );

    // 3. Modify draft and publish V3
    currentDraft.basics.summary =
      "Refined V3 Summary with additional enterprise leadership experience across platforms.";
    mockDb._drafts.set(draft.id, currentDraft);

    const p3 = await publishDraftForUser(mockDb, "user_owner", draft.id);
    expect(p3.ok).toBe(true);
    expect(p3.publication?.version).toBe(3);

    // Verify V1 and V2 remain unmutated after V3
    expect(JSON.stringify(mockDb._publications[0]?.data)).toBe(v1SnapshotJson);
    expect(JSON.stringify(mockDb._publications[1]?.data)).toBe(v2SnapshotJson);
  });
});

describe("Gate 7: Publish Idempotency", () => {
  it("returns existing version on network retry of same request key, but increments version on new key", async () => {
    const mockDb = createMockSupabaseDatabase();

    const draft = createValidDraft("draft_idempotent_test", "Alex Cloud", "alex-cloud");
    mockDb._drafts.set(draft.id, draft);

    // 1. First publish with request key "REQ_ABC_1" -> creates V1
    const res1 = await publishDraftForUser(mockDb, "user_owner", draft.id, "REQ_ABC_1");
    expect(res1.ok).toBe(true);
    expect(res1.publication?.version).toBe(1);
    expect(mockDb._publications).toHaveLength(1);

    // 2. Network retry with the SAME request key "REQ_ABC_1" -> returns V1 without inserting new version
    const resRetry = await publishDraftForUser(mockDb, "user_owner", draft.id, "REQ_ABC_1");
    expect(resRetry.ok).toBe(true);
    expect(resRetry.publication?.version).toBe(1);
    expect(resRetry.publication?.publicationId).toBe(res1.publication?.publicationId);
    expect(mockDb._publications).toHaveLength(1); // No new row created!

    // 3. Intentional subsequent publish with NEW request key "REQ_XYZ_2" -> creates V2
    const res2 = await publishDraftForUser(mockDb, "user_owner", draft.id, "REQ_XYZ_2");
    expect(res2.ok).toBe(true);
    expect(res2.publication?.version).toBe(2);
    expect(mockDb._publications).toHaveLength(2);
  });
});
