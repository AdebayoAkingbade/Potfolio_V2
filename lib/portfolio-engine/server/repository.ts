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
  const { data, error } = await supabase
    .from("portfolio_drafts")
    .select("id,user_id,slug,data,created_at,updated_at")
    .eq("id", draftId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw databaseError(error);
  return data ? toDraft(data as PortfolioDraftRow) : null;
}

export async function upsertDraftForUser(
  supabase: SupabaseClient,
  userId: string,
  draft: PortfolioDraft,
) {
  const sanitized = sanitizeDraft(draft);
  const timestamp = new Date().toISOString();
  const row = {
    id: sanitized.id,
    user_id: userId,
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

async function getLatestPublicationForDraft(
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
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw databaseError(error);
  return data ? toPublication(data as PublishedPortfolioRow) : null;
}

async function listLivePublishedSlugs(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("portfolio_publications")
    .select("slug")
    .is("deleted_at", null);

  if (error) throw databaseError(error);
  return (data ?? []).map((row) => row.slug as string);
}

export async function publishDraftForUser(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
) {
  const draft = await getDraftForUser(supabase, userId, draftId);
  if (!draft) {
    return {
      ok: false as const,
      status: 404,
      errors: ["Draft not found."],
      publication: null,
    };
  }

  const preparedDraft = sanitizeDraft(updateDraftSlug(draft));
  const validation = validateDraftForPublish(preparedDraft);
  if (!validation.ok) {
    return {
      ok: false as const,
      status: 422,
      errors: validation.errors,
      publication: null,
    };
  }

  const previousPublication = await getLatestPublicationForDraft(supabase, userId, draftId);
  const existingSlugs = (await listLivePublishedSlugs(supabase)).filter(
    (slug) => slug !== previousPublication?.slug,
  );
  const result = createPublishedSnapshot(
    preparedDraft,
    existingSlugs,
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
  const publicationId = previousPublication?.publicationId ?? publication.publicationId;
  const publishedAt = new Date().toISOString();
  const publicationData: PublishedPortfolio = {
    ...publication,
    publicationId,
    publishedAt,
  };

  const row = {
    id: publicationId,
    source_draft_id: draftId,
    user_id: userId,
    slug: publicationData.slug,
    data: publicationData,
    version: publicationData.version,
    score: publicationData.score.score,
    published_at: publishedAt,
    deleted_at: null,
    updated_at: publishedAt,
  };

  const writeQuery = previousPublication
    ? supabase
        .from("portfolio_publications")
        .update(row)
        .eq("id", publicationId)
        .eq("user_id", userId)
        .select(
          "id,source_draft_id,user_id,slug,data,version,score,published_at,deleted_at,created_at,updated_at",
        )
        .single()
    : supabase
        .from("portfolio_publications")
        .insert(row)
        .select(
          "id,source_draft_id,user_id,slug,data,version,score,published_at,deleted_at,created_at,updated_at",
        )
        .single();

  const { data, error } = await writeQuery;
  if (error) throw databaseError(error);

  const nextDraft = {
    ...preparedDraft,
    slug: publicationData.slug,
    updatedAt: publishedAt,
  };

  const { error: draftError } = await supabase
    .from("portfolio_drafts")
    .update({
      slug: publicationData.slug,
      data: nextDraft,
      updated_at: publishedAt,
    })
    .eq("id", draftId)
    .eq("user_id", userId);

  if (draftError) throw databaseError(draftError);

  revalidatePath(publishedPortfolioPath(publicationData.slug));
  revalidateTag(publishedPortfolioTag(publicationData.slug));
  if (previousPublication?.slug && previousPublication.slug !== publicationData.slug) {
    revalidatePath(publishedPortfolioPath(previousPublication.slug));
    revalidateTag(publishedPortfolioTag(previousPublication.slug));
  }

  return {
    ok: true as const,
    status: 200,
    errors: [],
    publication: toPublication(data as PublishedPortfolioRow),
  };
}

async function getPublishedPortfolioBySlugUncached(slug: string) {
  const supabase = createSupabasePublicServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("portfolio_publications")
    .select(
      "id,source_draft_id,user_id,slug,data,version,score,published_at,deleted_at,created_at,updated_at",
    )
    .eq("slug", slug)
    .is("deleted_at", null)
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

  revalidatePath(publishedPortfolioPath(slug));
  revalidateTag(publishedPortfolioTag(slug));

  return (data ?? []).length > 0;
}

export async function deleteDraftForUser(
  supabase: SupabaseClient,
  userId: string,
  draftId: string,
) {
  const { data: affectedPublications, error: publicationReadError } = await supabase
    .from("portfolio_publications")
    .select("slug")
    .eq("source_draft_id", draftId)
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (publicationReadError) throw databaseError(publicationReadError);

  const { data, error } = await supabase
    .from("portfolio_drafts")
    .delete()
    .eq("id", draftId)
    .eq("user_id", userId)
    .select("id");

  if (error) throw databaseError(error);

  for (const publication of affectedPublications ?? []) {
    const slug = publication.slug as string;
    revalidatePath(publishedPortfolioPath(slug));
    revalidateTag(publishedPortfolioTag(slug));
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
    plan: "pro",
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
  const draft = await getDraftForUser(supabase, userId, draftId);
  if (!draft) {
    return {
      ok: false as const,
      status: 404,
      errors: ["Draft not found."],
      draft: null,
    };
  }

  const normalized = withPortfolioV2Defaults(draft);
  const existing = normalized.team.members.some(
    (member) => member.email.toLowerCase() === email.toLowerCase(),
  );
  const member: PortfolioTeamMember = {
    id: crypto.randomUUID(),
    name: email.split("@")[0] ?? "Teammate",
    email,
    role,
    status: "invited",
    invitedAt: new Date().toISOString(),
  };
  const members = existing ? normalized.team.members : [...normalized.team.members, member];
  const nextDraft = await upsertDraftForUser(supabase, userId, {
    ...normalized,
    plan: "pro",
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
        email: member.email,
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
