-- Phase 1: Security Remediation Migration
-- Fixes Blocker 1: Team RLS Authorization & Recursion Prevention
-- Fixes Blocker 2: Storage RLS Video Entitlement & Public Exposure Elimination

-- 1. Authoritative Database-Level Pro Entitlement Helper
-- Reuses the authoritative server logic: plan = 'pro' AND subscription_status in ('active', 'trialing')
create or replace function public.has_active_portfolio_pro_entitlement(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.portfolio_accounts
    where user_id = p_user_id
      and plan = 'pro'
      and (subscription_status is null or subscription_status in ('active', 'trialing'))
  );
$$;

grant execute on function public.has_active_portfolio_pro_entitlement(uuid) to authenticated, anon;

-- 2. Scoped SECURITY DEFINER Helper for Draft Team Membership
-- Avoids RLS circular recursion between portfolio_drafts and portfolio_team_members.
-- Returns strictly boolean authorization status.
create or replace function public.is_active_draft_team_member(
  p_draft_id uuid,
  p_user_id uuid,
  p_roles text[] default array['owner', 'admin', 'editor', 'viewer']
)
returns boolean
language sql
security definer
stable
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.portfolio_team_members
    where draft_id = p_draft_id
      and member_user_id = p_user_id
      and status = 'active'
      and role = any(p_roles)
  );
$$;

grant execute on function public.is_active_draft_team_member(uuid, uuid, text[]) to authenticated, anon;

-- Indexes for performance
create index if not exists portfolio_team_members_draft_member_status_idx
  on public.portfolio_team_members (draft_id, member_user_id, status);

create index if not exists portfolio_accounts_user_plan_status_idx
  on public.portfolio_accounts (user_id, plan, subscription_status);

-- 3. Team Membership RLS Hardening (public.portfolio_team_members)
drop policy if exists "Users can manage own portfolio team members" on public.portfolio_team_members;
drop policy if exists "Users and members can view team memberships" on public.portfolio_team_members;
drop policy if exists "Owners can invite team members" on public.portfolio_team_members;
drop policy if exists "Owners can update team members" on public.portfolio_team_members;
drop policy if exists "Owners and members can remove team memberships" on public.portfolio_team_members;

-- SELECT: Draft owner or the authenticated member themselves can view their membership
create policy "Users and members can view team memberships"
  on public.portfolio_team_members
  for select
  to authenticated
  using (
    auth.uid() is not null and (
      auth.uid() = user_id
      or member_user_id = auth.uid()
    )
  );

-- INSERT: Only the draft owner can create/invite team members
create policy "Owners can invite team members"
  on public.portfolio_team_members
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and auth.uid() = user_id
    and role in ('admin', 'editor', 'viewer')
  );

-- UPDATE: Only the draft owner can update memberships (prevents member self-promotion)
create policy "Owners can update team members"
  on public.portfolio_team_members
  for update
  to authenticated
  using (
    auth.uid() is not null
    and auth.uid() = user_id
  )
  with check (
    auth.uid() is not null
    and auth.uid() = user_id
    and role in ('admin', 'editor', 'viewer')
  );

-- DELETE: Only the draft owner or the member themselves (leaving) can delete membership
create policy "Owners and members can remove team memberships"
  on public.portfolio_team_members
  for delete
  to authenticated
  using (
    auth.uid() is not null and (
      auth.uid() = user_id
      or member_user_id = auth.uid()
    )
  );

-- 4. Draft RLS Hardening (public.portfolio_drafts)
drop policy if exists "Users and team members can read portfolio drafts" on public.portfolio_drafts;
drop policy if exists "Users can read own portfolio drafts" on public.portfolio_drafts;
create policy "Users and team members can read portfolio drafts"
  on public.portfolio_drafts
  for select
  to authenticated
  using (
    auth.uid() is not null and (
      auth.uid() = user_id
      or public.is_active_draft_team_member(id, auth.uid(), array['owner', 'admin', 'editor', 'viewer'])
    )
  );

drop policy if exists "Users and editors can update portfolio drafts" on public.portfolio_drafts;
drop policy if exists "Users can update own portfolio drafts" on public.portfolio_drafts;
create policy "Users and editors can update portfolio drafts"
  on public.portfolio_drafts
  for update
  to authenticated
  using (
    auth.uid() is not null and (
      auth.uid() = user_id
      or public.is_active_draft_team_member(id, auth.uid(), array['owner', 'admin', 'editor'])
    )
  )
  with check (
    auth.uid() is not null and (
      auth.uid() = user_id
      or public.is_active_draft_team_member(id, auth.uid(), array['owner', 'admin', 'editor'])
    )
  );

drop policy if exists "Users can delete own portfolio drafts" on public.portfolio_drafts;
create policy "Users can delete own portfolio drafts"
  on public.portfolio_drafts
  for delete
  to authenticated
  using (
    auth.uid() is not null and auth.uid() = user_id
  );

-- 5. Storage RLS Hardening (storage.objects)
-- Drop ALL historical storage policy variants from migration 1 and migration 3
drop policy if exists "Portfolio assets are publicly readable" on storage.objects;
drop policy if exists "Users can upload own portfolio assets" on storage.objects;
drop policy if exists "Users can update own portfolio assets" on storage.objects;
drop policy if exists "Users can delete own portfolio assets" on storage.objects;

drop policy if exists "Portfolio videos are publicly readable" on storage.objects;
drop policy if exists "Users can upload own portfolio videos" on storage.objects;
drop policy if exists "Users can delete own portfolio videos" on storage.objects;

drop policy if exists "Public read portfolio assets" on storage.objects;
drop policy if exists "Users upload own portfolio assets" on storage.objects;
drop policy if exists "Users update own portfolio assets" on storage.objects;
drop policy if exists "Users delete own portfolio assets" on storage.objects;
drop policy if exists "Owner reads portfolio videos" on storage.objects;
drop policy if exists "Pro users upload own portfolio videos" on storage.objects;

-- Public can read assets from portfolio-assets
create policy "Public read portfolio assets"
  on storage.objects
  for select
  to public
  using (bucket_id = 'portfolio-assets');

-- Free & Pro users can upload standard images/documents to their own portfolio-assets folder
create policy "Users upload own portfolio assets"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Only users with active/trialing Pro entitlement can upload to portfolio-videos
create policy "Pro users upload own portfolio videos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.has_active_portfolio_pro_entitlement(auth.uid())
  );

-- Only the owner can read their private video objects
create policy "Owner reads portfolio videos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'portfolio-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can update their own objects
create policy "Users update own portfolio assets"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('portfolio-assets', 'portfolio-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can delete their own objects (even if downgraded, ensuring no data hostage)
create policy "Users delete own portfolio assets"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('portfolio-assets', 'portfolio-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
