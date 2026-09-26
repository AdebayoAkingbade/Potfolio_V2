import type { SupabaseClient } from "@supabase/supabase-js";
import type { PortfolioTeamRole } from "@/types/portfolio-engine";

export type PortfolioAction =
  | "READ_DRAFT"
  | "EDIT_DRAFT"
  | "UPLOAD_ASSET"
  | "UPLOAD_VIDEO"
  | "PUBLISH_DRAFT"
  | "CUSTOM_DOMAIN"
  | "INVITE_MEMBER"
  | "REMOVE_MEMBER"
  | "CHANGE_ROLE"
  | "DELETE_DRAFT"
  | "VIEW_ANALYTICS"
  | "EXPORT_PORTFOLIO";

const ROLE_PERMISSIONS: Record<PortfolioTeamRole, Set<PortfolioAction>> = {
  owner: new Set<PortfolioAction>([
    "READ_DRAFT",
    "EDIT_DRAFT",
    "UPLOAD_ASSET",
    "UPLOAD_VIDEO",
    "PUBLISH_DRAFT",
    "CUSTOM_DOMAIN",
    "INVITE_MEMBER",
    "REMOVE_MEMBER",
    "CHANGE_ROLE",
    "DELETE_DRAFT",
    "VIEW_ANALYTICS",
    "EXPORT_PORTFOLIO",
  ]),
  admin: new Set<PortfolioAction>([
    "READ_DRAFT",
    "EDIT_DRAFT",
    "UPLOAD_ASSET",
    "UPLOAD_VIDEO",
    "PUBLISH_DRAFT",
    "CUSTOM_DOMAIN",
    "INVITE_MEMBER",
    "REMOVE_MEMBER",
    "VIEW_ANALYTICS",
    "EXPORT_PORTFOLIO",
  ]),
  editor: new Set<PortfolioAction>([
    "READ_DRAFT",
    "EDIT_DRAFT",
    "UPLOAD_ASSET",
    "VIEW_ANALYTICS",
    "EXPORT_PORTFOLIO",
  ]),
  viewer: new Set<PortfolioAction>([
    "READ_DRAFT",
    "VIEW_ANALYTICS",
    "EXPORT_PORTFOLIO",
  ]),
};

export function isActionAllowed(role: PortfolioTeamRole, action: PortfolioAction): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export type UserDraftAccess = {
  hasAccess: boolean;
  role: PortfolioTeamRole | null;
  isOwner: boolean;
};

/**
 * Resolves a user's role on a given draft:
 * 1. Owner check: if portfolio_drafts.user_id === userId -> "owner"
 * 2. Team membership check: portfolio_team_members where draft_id === draftId AND member_user_id === userId AND status === "active"
 */
export async function resolveDraftAccess(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
): Promise<UserDraftAccess> {
  // 1. Check if user is the direct owner of the draft
  const { data: draft, error: draftError } = await supabase
    .from("portfolio_drafts")
    .select("id, user_id")
    .eq("id", draftId)
    .maybeSingle();

  if (!draftError && draft && draft.user_id === userId) {
    return {
      hasAccess: true,
      role: "owner",
      isOwner: true,
    };
  }

  // 2. Check team membership bound to immutable member_user_id
  const { data: membership, error: memberError } = await supabase
    .from("portfolio_team_members")
    .select("role, status")
    .eq("draft_id", draftId)
    .eq("member_user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (!memberError && membership && membership.role) {
    const role = membership.role as PortfolioTeamRole;
    return {
      hasAccess: true,
      role,
      isOwner: false,
    };
  }

  return {
    hasAccess: false,
    role: null,
    isOwner: false,
  };
}

export async function authorizeDraftAction(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
  action: PortfolioAction,
): Promise<{ ok: true; role: PortfolioTeamRole; isOwner: boolean } | { ok: false; status: 403 | 404; message: string }> {
  const access = await resolveDraftAccess(supabase, userId, draftId);

  if (!access.hasAccess || !access.role) {
    return {
      ok: false,
      status: 404,
      message: "Draft not found or access denied.",
    };
  }

  if (!isActionAllowed(access.role, action)) {
    return {
      ok: false,
      status: 403,
      message: `Your role (${access.role}) is not authorized to perform action '${action}'.`,
    };
  }

  return {
    ok: true,
    role: access.role,
    isOwner: access.isOwner,
  };
}
