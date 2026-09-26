-- Phase 1: Security, Data Integrity & Production Foundation Migration

-- 1. Extend portfolio_accounts with subscription lifecycle fields
alter table public.portfolio_accounts
  add column if not exists subscription_status text check (subscription_status in ('active', 'past_due', 'canceled', 'trialing', 'unpaid', 'incomplete')),
  add column if not exists stripe_current_period_end timestamptz;

-- 2. Extend portfolio_team_members for immutable user identity binding
alter table public.portfolio_team_members
  add column if not exists member_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists invited_email text,
  add column if not exists invited_by uuid references auth.users(id) on delete set null;

-- Backfill invited_email from email if needed
update public.portfolio_team_members
set invited_email = email
where invited_email is null and email is not null;

create index if not exists portfolio_team_members_member_draft_idx
  on public.portfolio_team_members (member_user_id, draft_id);

create index if not exists portfolio_team_members_invited_email_idx
  on public.portfolio_team_members (invited_email);

-- 3. Stripe Webhook Idempotency Table
create table if not exists public.portfolio_billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  processed_at timestamptz not null default now(),
  status text not null default 'processed'
);

alter table public.portfolio_billing_events enable row level security;

-- Only service role / server can read/write billing events
drop policy if exists "Service role manages billing events" on public.portfolio_billing_events;
create policy "Service role manages billing events"
  on public.portfolio_billing_events
  for all
  to authenticated
  using (false);

-- 4. Distributed Rate Limits Table
create table if not exists public.portfolio_rate_limits (
  key text primary key,
  count integer not null default 1,
  reset_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.portfolio_rate_limits enable row level security;

drop policy if exists "Service role manages rate limits" on public.portfolio_rate_limits;
create policy "Service role manages rate limits"
  on public.portfolio_rate_limits
  for all
  to authenticated, anon
  using (true)
  with check (true);

-- 5. Hardened RLS Policies for portfolio_drafts (Owner + Active Team Members)
drop policy if exists "Users can read own portfolio drafts" on public.portfolio_drafts;
create policy "Users and team members can read portfolio drafts"
  on public.portfolio_drafts
  for select
  to authenticated
  using (
    auth.uid() is not null and (
      auth.uid() = user_id
      or id in (
        select draft_id from public.portfolio_team_members
        where member_user_id = auth.uid() and status = 'active'
      )
    )
  );

drop policy if exists "Users can update own portfolio drafts" on public.portfolio_drafts;
create policy "Users and editors can update portfolio drafts"
  on public.portfolio_drafts
  for update
  to authenticated
  using (
    auth.uid() is not null and (
      auth.uid() = user_id
      or id in (
        select draft_id from public.portfolio_team_members
        where member_user_id = auth.uid() and status = 'active' and role in ('admin', 'editor')
      )
    )
  )
  with check (
    auth.uid() is not null and (
      auth.uid() = user_id
      or id in (
        select draft_id from public.portfolio_team_members
        where member_user_id = auth.uid() and status = 'active' and role in ('admin', 'editor')
      )
    )
  );

-- 6. Enforce immutable publication snapshots (version uniqueness)
alter table public.portfolio_publications
  drop constraint if exists portfolio_publications_draft_version_key;

alter table public.portfolio_publications
  add constraint portfolio_publications_draft_version_key
  unique (source_draft_id, version);
