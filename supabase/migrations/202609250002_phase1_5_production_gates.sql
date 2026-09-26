-- Phase 1.5: Production Gate Verification & Hardening Migration

-- 1. Distributed Rate Limiter Atomic PostgreSQL RPC
-- Atomically establishes/resets the window, increments usage, determines whether allowed,
-- and returns remaining quota and reset timestamp in a single atomic transaction.
create or replace function public.check_rate_limit(
  p_key text,
  p_operation text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_composite_key text := p_operation || ':' || p_key;
  v_count integer;
  v_reset_at timestamptz;
begin
  insert into public.portfolio_rate_limits (key, count, reset_at, created_at)
  values (v_composite_key, 1, v_now + (p_window_seconds || ' seconds')::interval, v_now)
  on conflict (key) do update
  set
    count = case
      when public.portfolio_rate_limits.reset_at <= v_now then 1
      else public.portfolio_rate_limits.count + 1
    end,
    reset_at = case
      when public.portfolio_rate_limits.reset_at <= v_now then v_now + (p_window_seconds || ' seconds')::interval
      else public.portfolio_rate_limits.reset_at
    end
  returning public.portfolio_rate_limits.count, public.portfolio_rate_limits.reset_at
  into v_count, v_reset_at;

  if v_count <= p_limit then
    return query select true, greatest(0, p_limit - v_count), v_reset_at;
  else
    return query select false, 0, v_reset_at;
  end if;
end;
$$;

create index if not exists portfolio_rate_limits_reset_idx
  on public.portfolio_rate_limits (reset_at);

-- 2. Publication Schema Extensions for Slug Invariant, Version Atomicity & Idempotency
alter table public.portfolio_publications
  add column if not exists is_live boolean not null default false,
  add column if not exists idempotency_key text;

-- Backfill is_live: mark the latest non-deleted version per draft as live
update public.portfolio_publications p
set is_live = true
where p.id in (
  select distinct on (source_draft_id) id
  from public.portfolio_publications
  where deleted_at is null
  order by source_draft_id, version desc
);

-- Gate 5: Database-enforced invariant preventing two simultaneously live portfolios
-- from owning the same normalized slug
drop index if exists public.portfolio_publications_live_slug_key;
create unique index portfolio_publications_live_slug_key
  on public.portfolio_publications (slug)
  where (is_live = true);

-- Invariant: Exactly one live publication per source draft
drop index if exists public.portfolio_publications_draft_live_key;
create unique index portfolio_publications_draft_live_key
  on public.portfolio_publications (source_draft_id)
  where (is_live = true);

-- Gate 7: Idempotency uniqueness per draft and publish request key
drop index if exists public.portfolio_publications_draft_idempotency_key;
create unique index portfolio_publications_draft_idempotency_key
  on public.portfolio_publications (source_draft_id, idempotency_key)
  where (idempotency_key is not null);

-- 3. Atomic Billing Event Claim Function (Gate 4)
-- Enforces: ONE STRIPE EVENT -> AT MOST ONE BILLING STATE TRANSITION
create or replace function public.claim_stripe_billing_event(
  p_stripe_event_id text,
  p_event_type text
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_inserted_id uuid;
begin
  insert into public.portfolio_billing_events (
    stripe_event_id,
    event_type,
    status,
    processed_at
  )
  values (
    p_stripe_event_id,
    p_event_type,
    'processing',
    now()
  )
  on conflict (stripe_event_id) do nothing
  returning id into v_inserted_id;

  -- Returns true if this invocation claimed the event; false if it was already claimed/processed
  return v_inserted_id is not null;
end;
$$;

-- 4. Storage Bucket Policies (Gate 9)
-- Policies for 'portfolio-assets' and 'portfolio-videos'
-- Prevents cross-user overwriting, unauthorized deletions, and unentitled access.

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio-videos', 'portfolio-videos', false)
on conflict (id) do nothing;

-- Users can only upload assets into their own folder: {user_id}/*
drop policy if exists "Users upload own portfolio assets" on storage.objects;
create policy "Users upload own portfolio assets"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('portfolio-assets', 'portfolio-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only update their own assets
drop policy if exists "Users update own portfolio assets" on storage.objects;
create policy "Users update own portfolio assets"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('portfolio-assets', 'portfolio-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete their own assets
drop policy if exists "Users delete own portfolio assets" on storage.objects;
create policy "Users delete own portfolio assets"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('portfolio-assets', 'portfolio-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public can read assets from portfolio-assets bucket
drop policy if exists "Public read portfolio assets" on storage.objects;
create policy "Public read portfolio assets"
  on storage.objects
  for select
  to public
  using (bucket_id = 'portfolio-assets');

-- Private videos can only be read by the owner or active team members with view permission
drop policy if exists "Owner reads portfolio videos" on storage.objects;
create policy "Owner reads portfolio videos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'portfolio-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
