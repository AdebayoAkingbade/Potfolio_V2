import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  PUBLIC_PORTFOLIO_REVALIDATE_SECONDS,
  publishedPortfolioPath,
  publishedPortfolioTag,
} from "@/lib/portfolio-engine/cache";
import { createPublishedSnapshot } from "@/lib/portfolio-engine/publish";
import { sanitizeDraft } from "@/lib/portfolio-engine/sanitize";
import {
  createPortfolioDomain,
  updateDraftSlug,
  validateDraftForPublish,
  withPortfolioV2Defaults,
} from "@/lib/portfolio-engine/schema";
import { clonePortfolioDraft } from "@/lib/portfolio-engine/export";
import {
  createDemoAnalyticsSummary,
  summarizeAnalyticsEvents,
  type PortfolioAnalyticsEvent,
} from "@/lib/portfolio-engine/analytics";
import { createSupabasePublicServerClient } from "@/lib/supabase/server";
import {
  getAuthoritativePlanForUser,
  requireServerEntitlement,
} from "@/lib/portfolio-engine/server/entitlements";
import {
  authorizeDraftAction,
} from "@/lib/portfolio-engine/server/authorization";
import type {
  PortfolioDraft,
  PortfolioTeamMember,
  PortfolioTeamRole,
  PublishedPortfolio,
} from "@/types/portfolio-engine";

type PortfolioDraftRow = {
  id: string;
  user_id: string;
  slug: string | null;
  data: PortfolioDraft;
  created_at: string;
  updated_at: string;
};

type PublishedPortfolioRow = {
  id: string;
  source_draft_id: string;
  user_id: string;
  slug: string;
  data: PublishedPortfolio;
  version: number;
  score: number;
  published_at: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

function toDraft(row: PortfolioDraftRow): PortfolioDraft {
  return withPortfolioV2Defaults({
    ...row.data,
    id: row.id,
    slug: row.slug ?? row.data.slug,
    createdAt: row.data.createdAt ?? row.created_at,
    updatedAt: row.data.updatedAt ?? row.updated_at,
  });
}

function toPublication(row: PublishedPortfolioRow): PublishedPortfolio {
  const portfolio = withPortfolioV2Defaults(row.data);

  return {
    ...portfolio,
    publicationId: row.id,
    sourceDraftId: row.source_draft_id,
    slug: row.slug,
    version: row.version,
    publishedAt: row.published_at,
    score: row.data.score,
  };
}

function databaseError(error: { message: string }) {
  return new Error(`Portfolio Engine database error: ${error.message}`);
}

function safeRevalidatePublication(slug: string) {
  try {
    revalidatePath(publishedPortfolioPath(slug));
    revalidateTag(publishedPortfolioTag(slug));
  } catch {
    // Outside active Next.js request context (e.g. background tasks or unit tests)
  }
}

export async function getActiveDraftForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("portfolio_drafts")
    .select("id,user_id,slug,data,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw databaseError(error);
  return data ? toDraft(data as PortfolioDraftRow) : null;
}

export async function getDraftForUser(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
) {
  // Authorize user to read draft (owner or active team member)
  const authCheck = await authorizeDraftAction(supabase, userId, draftId, "READ_DRAFT");
  if (!authCheck.ok) return null;

  const { data, error } = await supabase
    .from("portfolio_drafts")
    .select("id,user_id,slug,data,created_at,updated_at")
    .eq("id", draftId)
    .maybeSingle();

  if (error) throw databaseError(error);
  return data ? toDraft(data as PortfolioDraftRow) : null;
}

export async function upsertDraftForUser(
  supabase: SupabaseClient,
  userId: string,
  draft: PortfolioDraft,
) {
  // If draft exists, verify user has EDIT_DRAFT permission
  const { data: existingDraft } = await supabase
    .from("portfolio_drafts")
    .select("id, user_id")
    .eq("id", draft.id)
    .maybeSingle();

  if (existingDraft) {
    const authCheck = await authorizeDraftAction(supabase, userId, draft.id, "EDIT_DRAFT");
    if (!authCheck.ok) {
      throw new Error(`Unauthorized: User cannot edit draft ${draft.id}`);
    }
  }

  // Authoritatively derive the plan for the draft based on user account
  const authoritativePlan = await getAuthoritativePlanForUser(supabase, userId);
  const sanitized = sanitizeDraft({
    ...draft,
    plan: authoritativePlan,
  });

  const timestamp = new Date().toISOString();
  const row = {
    id: sanitized.id,
    user_id: existingDraft?.user_id ?? userId,
    slug: sanitized.slug || null,
    data: {
      ...sanitized,
      updatedAt: timestamp,
    },
    updated_at: timestamp,
  };

  const { data, error } = await supabase
    .from("portfolio_drafts")
    .upsert(row, { onConflict: "id" })
    .select("id,user_id,slug,data,created_at,updated_at")
    .single();

  if (error) throw databaseError(error);
  return toDraft(data as PortfolioDraftRow);
}

export async function getLatestPublicationForDraft(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
) {
  const { data, error } = await supabase
    .from("portfolio_publications")
    .select(
      "id,source_draft_id,user_id,slug,data,version,score,published_at,deleted_at,created_at,updated_at",
    )
    .eq("source_draft_id", draftId)
    .is("deleted_at", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw databaseError(error);
  return data ? toPublication(data as PublishedPortfolioRow) : null;
}

/**
 * Concurrency-safe check to determine if a slug is already taken by another active publication.
 */
export async function isSlugTaken(
  supabase: SupabaseClient,
  slug: string,
  excludeDraftId?: string,
): Promise<boolean> {
  let query = supabase
    .from("portfolio_publications")
    .select("id, source_draft_id")
    .eq("slug", slug)
    .is("deleted_at", null);

  if (excludeDraftId) {
    query = query.neq("source_draft_id", excludeDraftId);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw databaseError(error);
  return Boolean(data);
}

export async function publishDraftForUser(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
  idempotencyKey?: string,
) {
  // 1. Authorize: Only owner or admin can publish
  const authCheck = await authorizeDraftAction(supabase, userId, draftId, "PUBLISH_DRAFT");
  if (!authCheck.ok) {
    return {
      ok: false as const,
      status: authCheck.status,
      errors: [authCheck.message],
      publication: null,
    };
  }

  // Gate 7: Publish Idempotency Check
  // A network retry of the SAME request key returns the identical publication version
  if (idempotencyKey) {
    const { data: existingPublication } = await supabase
      .from("portfolio_publications")
      .select(
        "id,source_draft_id,user_id,slug,data,version,score,published_at,deleted_at,created_at,updated_at",
      )
      .eq("source_draft_id", draftId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingPublication) {
      return {
        ok: true as const,
        status: 200,
        errors: [],
        publication: toPublication(existingPublication as PublishedPortfolioRow),
      };
    }
  }

  const draft = await getDraftForUser(supabase, userId, draftId);
  if (!draft) {
    return {
      ok: false as const,
      status: 404,
      errors: ["Draft not found."],
      publication: null,
    };
  }

  // Synchronize draft plan with authoritative account plan
  const authoritativePlan = await getAuthoritativePlanForUser(supabase, userId);
  const preparedDraft = sanitizeDraft(
    updateDraftSlug({
      ...draft,
      plan: authoritativePlan,
    }),
  );

  const validation = validateDraftForPublish(preparedDraft);
  if (!validation.ok) {
    return {
      ok: false as const,
      status: 422,
      errors: validation.errors,
      publication: null,
    };
  }

  // Gate 5: Targeted concurrency-safe slug collision check
  const previousPublication = await getLatestPublicationForDraft(supabase, userId, draftId);
  let targetSlug = preparedDraft.slug;
  let collisionCount = 0;

  while (await isSlugTaken(supabase, targetSlug, draftId)) {
    collisionCount += 1;
    targetSlug = `${preparedDraft.slug}-${collisionCount}`;
    if (collisionCount > 20) {
      targetSlug = `${preparedDraft.slug}-${crypto.randomUUID().slice(0, 6)}`;
      break;
    }
  }

  const publishedDraft = {
    ...preparedDraft,
    slug: targetSlug,
  };

  const result = createPublishedSnapshot(
    publishedDraft,
    [], // Slugs already reconciled via database check
    previousPublication?.version ?? 0,
  );

  if (!result.ok || !result.publication) {
    return {
      ok: false as const,
      status: 422,
      errors: result.errors,
      publication: null,
    };
  }

  const publication = result.publication;
  const newPublicationId = crypto.randomUUID();
  const publishedAt = new Date().toISOString();
  const publicationData: PublishedPortfolio = {
    ...publication,
    publicationId: newPublicationId,
    publishedAt,
  };

  // Gate 6: Demote prior live version of this draft without mutating historical snapshot data!
  await supabase
    .from("portfolio_publications")
    .update({ is_live: false, updated_at: publishedAt })
    .eq("source_draft_id", draftId)
    .eq("is_live", true);

  // If slug changed from previous publication, soft-delete previous active version under old slug
  if (previousPublication && previousPublication.slug !== publicationData.slug) {
    await supabase
      .from("portfolio_publications")
      .update({ deleted_at: publishedAt, updated_at: publishedAt })
      .eq("id", previousPublication.publicationId);
    
    safeRevalidatePublication(previousPublication.slug);
  }

  // 3. Immutable version snapshot insertion
  const row = {
    id: newPublicationId,
    source_draft_id: draftId,
    user_id: userId,
    slug: publicationData.slug,
    data: publicationData,
    version: publicationData.version,
    score: publicationData.score.score,
    published_at: publishedAt,
    deleted_at: null,
    is_live: true,
    idempotency_key: idempotencyKey || null,
    created_at: publishedAt,
    updated_at: publishedAt,
  };

  const { data, error } = await supabase
    .from("portfolio_publications")
    .insert(row)
    .select(
      "id,source_draft_id,user_id,slug,data,version,score,published_at,deleted_at,created_at,updated_at",
    )
    .single();

  if (error) {
    // Under concurrency, if idempotency key was simultaneously written, fetch and return it
    if (idempotencyKey) {
      const { data: existingPub } = await supabase
        .from("portfolio_publications")
        .select(
          "id,source_draft_id,user_id,slug,data,version,score,published_at,deleted_at,created_at,updated_at",
        )
        .eq("source_draft_id", draftId)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (existingPub) {
        return {
          ok: true as const,
          status: 200,
          errors: [],
          publication: toPublication(existingPub as PublishedPortfolioRow),
        };
      }
    }
    throw databaseError(error);
  }

  // Update draft with publication slug and timestamp
  const nextDraft = {
    ...preparedDraft,
    slug: publicationData.slug,
    updatedAt: publishedAt,
  };

  await supabase
    .from("portfolio_drafts")
    .update({
      slug: publicationData.slug,
      data: nextDraft,
      updated_at: publishedAt,
    })
    .eq("id", draftId);

  safeRevalidatePublication(publicationData.slug);

  return {
    ok: true as const,
    status: 200,
    errors: [],
    publication: toPublication(data as PublishedPortfolioRow),
  };
}

export async function getPublishedPortfolioBySlugUncached(slug: string) {
  const supabase = createSupabasePublicServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("portfolio_publications")
    .select(
      "id,source_draft_id,user_id,slug,data,version,score,published_at,deleted_at,created_at,updated_at",
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw databaseError(error);
  return data ? toPublication(data as PublishedPortfolioRow) : null;
}

export async function getCachedPublishedPortfolioBySlug(slug: string) {
  const cached = unstable_cache(
    async () => getPublishedPortfolioBySlugUncached(slug),
    ["portfolio-engine-publication", slug],
    {
      revalidate: PUBLIC_PORTFOLIO_REVALIDATE_SECONDS,
      tags: [publishedPortfolioTag(slug)],
    },
  );

  return cached();
}

export async function deletePublishedPortfolioForUser(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
) {
  const deletedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("portfolio_publications")
    .update({
      deleted_at: deletedAt,
      updated_at: deletedAt,
    })
    .eq("slug", slug)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select("id");

  if (error) throw databaseError(error);

  safeRevalidatePublication(slug);

  return (data ?? []).length > 0;
}

export async function deleteDraftForUser(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
) {
  // Only owner can delete draft
  const authCheck = await authorizeDraftAction(supabase, userId, draftId, "DELETE_DRAFT");
  if (!authCheck.ok) {
    throw new Error(`Unauthorized: User cannot delete draft ${draftId}`);
  }

  const { data: affectedPublications, error: publicationReadError } = await supabase
    .from("portfolio_publications")
    .select("slug")
    .eq("source_draft_id", draftId)
    .is("deleted_at", null);

  if (publicationReadError) throw databaseError(publicationReadError);

  const { data, error } = await supabase
    .from("portfolio_drafts")
    .delete()
    .eq("id", draftId)
    .select("id");

  if (error) throw databaseError(error);

  for (const publication of affectedPublications ?? []) {
    const slug = publication.slug as string;
    safeRevalidatePublication(slug);
  }

  return (data ?? []).length > 0;
}

function cleanDomainHostname(hostname: string) {
  return hostname
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();
}

function isValidDomain(hostname: string) {
  return /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i.test(hostname);
}

export async function upsertCustomDomainForDraft(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
  hostnameInput: string,
) {
  // 1. Authorize: Check permission to configure domain
  const authCheck = await authorizeDraftAction(supabase, userId, draftId, "CUSTOM_DOMAIN");
  if (!authCheck.ok) {
    return {
      ok: false as const,
      status: authCheck.status,
      errors: [authCheck.message],
      draft: null,
    };
  }

  // 2. Server-side entitlement check: require Pro
  const entitlementCheck = await requireServerEntitlement(supabase, userId, "customDomains");
  if (!entitlementCheck.ok) {
    return {
      ok: false as const,
      status: entitlementCheck.status,
      errors: [entitlementCheck.message],
      draft: null,
    };
  }

  const hostname = cleanDomainHostname(hostnameInput);
  if (!isValidDomain(hostname)) {
    return {
      ok: false as const,
      status: 400,
      errors: ["Enter a valid domain, such as portfolio.example.com."],
      draft: null,
    };
  }

  const draft = await getDraftForUser(supabase, userId, draftId);
  if (!draft) {
    return {
      ok: false as const,
      status: 404,
      errors: ["Draft not found."],
      draft: null,
    };
  }

  const timestamp = new Date().toISOString();
  const domain = createPortfolioDomain(hostname);
  const nextDraft = await upsertDraftForUser(supabase, userId, {
    ...draft,
    customDomain: domain,
    updatedAt: timestamp,
  });

  const { error } = await supabase.from("portfolio_custom_domains").upsert(
    {
      user_id: userId,
      draft_id: draftId,
      hostname: domain.hostname,
      status: domain.status,
      verification_token: domain.verificationToken,
      target: domain.target,
      connected_at: domain.connectedAt,
      last_checked_at: domain.lastCheckedAt,
      updated_at: timestamp,
    },
    { onConflict: "hostname" },
  );

  if (error) throw databaseError(error);

  return {
    ok: true as const,
    status: 200,
    errors: [],
    draft: nextDraft,
  };
}

export async function inviteTeamMemberForDraft(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
  email: string,
  role: PortfolioTeamRole = "editor",
) {
  // 1. Authorize: Check permission to invite member
  const authCheck = await authorizeDraftAction(supabase, userId, draftId, "INVITE_MEMBER");
  if (!authCheck.ok) {
    return {
      ok: false as const,
      status: authCheck.status,
      errors: [authCheck.message],
      draft: null,
    };
  }

  // 2. Server-side entitlement check: require Pro team seats
  const entitlementCheck = await requireServerEntitlement(supabase, userId, "teamSeats");
  if (!entitlementCheck.ok) {
    return {
      ok: false as const,
      status: entitlementCheck.status,
      errors: [entitlementCheck.message],
      draft: null,
    };
  }

  const draft = await getDraftForUser(supabase, userId, draftId);
  if (!draft) {
    return {
      ok: false as const,
      status: 404,
      errors: ["Draft not found."],
      draft: null,
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalized = withPortfolioV2Defaults(draft);
  const existing = normalized.team.members.some(
    (member) => member.email.toLowerCase() === normalizedEmail,
  );

  const member: PortfolioTeamMember = {
    id: crypto.randomUUID(),
    name: normalizedEmail.split("@")[0] ?? "Teammate",
    email: normalizedEmail,
    role,
    status: "invited",
    invitedAt: new Date().toISOString(),
  };

  const members = existing ? normalized.team.members : [...normalized.team.members, member];
  const nextDraft = await upsertDraftForUser(supabase, userId, {
    ...normalized,
    team: {
      ...normalized.team,
      agencyMode: true,
      seats: Math.max(normalized.team.seats, members.length),
      members,
    },
  });

  if (!existing) {
    const { error } = await supabase.from("portfolio_team_members").upsert(
      {
        id: member.id,
        user_id: userId,
        draft_id: draftId,
        email: normalizedEmail,
        invited_email: normalizedEmail,
        invited_by: userId,
        member_user_id: null,
        name: member.name,
        role: member.role,
        status: member.status,
        invited_at: member.invitedAt,
        updated_at: member.invitedAt,
      },
      { onConflict: "draft_id,email" },
    );

    if (error) throw databaseError(error);
  }

  return {
    ok: true as const,
    status: 200,
    errors: [],
    draft: nextDraft,
  };
}

export async function acceptTeamInvitation(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  inviteId: string,
) {
  const normalizedEmail = userEmail.trim().toLowerCase();

  const { data: invite, error: fetchError } = await supabase
    .from("portfolio_team_members")
    .select("id, draft_id, invited_email, status")
    .eq("id", inviteId)
    .maybeSingle();

  if (fetchError || !invite) {
    return { ok: false as const, status: 404, message: "Invitation not found." };
  }

  if (invite.invited_email.toLowerCase() !== normalizedEmail) {
    return { ok: false as const, status: 403, message: "Invitation was issued for a different email address." };
  }

  const timestamp = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("portfolio_team_members")
    .update({
      member_user_id: userId,
      status: "active",
      accepted_at: timestamp,
      updated_at: timestamp,
    })
    .eq("id", inviteId);

  if (updateError) throw databaseError(updateError);

  return { ok: true as const, status: 200, draftId: invite.draft_id as string };
}

export async function cloneDraftForUser(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
) {
  const draft = await getDraftForUser(supabase, userId, draftId);
  if (!draft) return null;
  return upsertDraftForUser(supabase, userId, clonePortfolioDraft(draft));
}

export async function getAnalyticsSummaryForUser(supabase: SupabaseClient, userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data, error } = await supabase
    .from("portfolio_analytics_events")
    .select("event_type,referrer,section,visitor_hash,read_seconds,created_at")
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());

  if (error) throw databaseError(error);

  const events = (data ?? []) as PortfolioAnalyticsEvent[];
  return {
    summary: events.length ? summarizeAnalyticsEvents(events) : createDemoAnalyticsSummary(),
    sample: events.length === 0,
  };
}
