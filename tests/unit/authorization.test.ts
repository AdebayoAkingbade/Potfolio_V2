import { describe, it, expect } from "vitest";
import {
  isActionAllowed,
  authorizeDraftAction,
  resolveDraftAccess,
} from "@/lib/portfolio-engine/server/authorization";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Team Role Matrix & Authorization", () => {
  it("strictly enforces role capabilities according to the authorization matrix", () => {
    // Viewer
    expect(isActionAllowed("viewer", "READ_DRAFT")).toBe(true);
    expect(isActionAllowed("viewer", "VIEW_ANALYTICS")).toBe(true);
    expect(isActionAllowed("viewer", "EXPORT_PORTFOLIO")).toBe(true);
    expect(isActionAllowed("viewer", "EDIT_DRAFT")).toBe(false);
    expect(isActionAllowed("viewer", "UPLOAD_ASSET")).toBe(false);
    expect(isActionAllowed("viewer", "UPLOAD_VIDEO")).toBe(false);
    expect(isActionAllowed("viewer", "PUBLISH_DRAFT")).toBe(false);
    expect(isActionAllowed("viewer", "INVITE_MEMBER")).toBe(false);
    expect(isActionAllowed("viewer", "DELETE_DRAFT")).toBe(false);

    // Editor
    expect(isActionAllowed("editor", "READ_DRAFT")).toBe(true);
    expect(isActionAllowed("editor", "EDIT_DRAFT")).toBe(true);
    expect(isActionAllowed("editor", "UPLOAD_ASSET")).toBe(true);
    expect(isActionAllowed("editor", "UPLOAD_VIDEO")).toBe(false);
    expect(isActionAllowed("editor", "PUBLISH_DRAFT")).toBe(false);
    expect(isActionAllowed("editor", "CUSTOM_DOMAIN")).toBe(false);
    expect(isActionAllowed("editor", "INVITE_MEMBER")).toBe(false);
    expect(isActionAllowed("editor", "DELETE_DRAFT")).toBe(false);

    // Admin
    expect(isActionAllowed("admin", "READ_DRAFT")).toBe(true);
    expect(isActionAllowed("admin", "EDIT_DRAFT")).toBe(true);
    expect(isActionAllowed("admin", "UPLOAD_ASSET")).toBe(true);
    expect(isActionAllowed("admin", "UPLOAD_VIDEO")).toBe(true);
    expect(isActionAllowed("admin", "PUBLISH_DRAFT")).toBe(true);
    expect(isActionAllowed("admin", "CUSTOM_DOMAIN")).toBe(true);
    expect(isActionAllowed("admin", "INVITE_MEMBER")).toBe(true);
    expect(isActionAllowed("admin", "DELETE_DRAFT")).toBe(false);
    expect(isActionAllowed("admin", "CHANGE_ROLE")).toBe(false);

    // Owner
    expect(isActionAllowed("owner", "READ_DRAFT")).toBe(true);
    expect(isActionAllowed("owner", "EDIT_DRAFT")).toBe(true);
    expect(isActionAllowed("owner", "PUBLISH_DRAFT")).toBe(true);
    expect(isActionAllowed("owner", "DELETE_DRAFT")).toBe(true);
    expect(isActionAllowed("owner", "CHANGE_ROLE")).toBe(true);
  });

  it("authorizes draft owner directly", async () => {
    const mockSupabase = {
      from: (table: string) => {
        if (table === "portfolio_drafts") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { id: "draft-1", user_id: "owner-user-id" },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      },
    } as unknown as SupabaseClient;

    const access = await resolveDraftAccess(mockSupabase, "owner-user-id", "draft-1");
    expect(access.hasAccess).toBe(true);
    expect(access.role).toBe("owner");
    expect(access.isOwner).toBe(true);

    const action = await authorizeDraftAction(mockSupabase, "owner-user-id", "draft-1", "DELETE_DRAFT");
    expect(action.ok).toBe(true);
  });

  it("authorizes accepted team member bound to user ID", async () => {
    const mockSupabase = {
      from: (table: string) => {
        if (table === "portfolio_drafts") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { id: "draft-2", user_id: "other-user-id" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "portfolio_team_members") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { role: "editor", status: "active" },
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      },
    } as unknown as SupabaseClient;

    const access = await resolveDraftAccess(mockSupabase, "editor-user-id", "draft-2");
    expect(access.hasAccess).toBe(true);
    expect(access.role).toBe("editor");
    expect(access.isOwner).toBe(false);

    // Editor can edit
    const editCheck = await authorizeDraftAction(mockSupabase, "editor-user-id", "draft-2", "EDIT_DRAFT");
    expect(editCheck.ok).toBe(true);

    // Editor cannot publish
    const publishCheck = await authorizeDraftAction(mockSupabase, "editor-user-id", "draft-2", "PUBLISH_DRAFT");
    expect(publishCheck.ok).toBe(false);
    if (!publishCheck.ok) {
      expect(publishCheck.status).toBe(403);
    }
  });

  it("rejects unauthorized users with 404/denial", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const access = await resolveDraftAccess(mockSupabase, "attacker-user-id", "draft-3");
    expect(access.hasAccess).toBe(false);

    const action = await authorizeDraftAction(mockSupabase, "attacker-user-id", "draft-3", "READ_DRAFT");
    expect(action.ok).toBe(false);
    if (!action.ok) {
      expect(action.status).toBe(404);
    }
  });
});
