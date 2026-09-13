create extension if not exists pgcrypto;

create table if not exists public.portfolio_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_drafts_user_updated_idx
  on public.portfolio_drafts (user_id, updated_at desc);

alter table public.portfolio_drafts enable row level security;

drop policy if exists "Users can read own portfolio drafts" on public.portfolio_drafts;
create policy "Users can read own portfolio drafts"
  on public.portfolio_drafts
  for select
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can insert own portfolio drafts" on public.portfolio_drafts;
create policy "Users can insert own portfolio drafts"
  on public.portfolio_drafts
  for insert
  to authenticated
  with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can update own portfolio drafts" on public.portfolio_drafts;
create policy "Users can update own portfolio drafts"
  on public.portfolio_drafts
  for update
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can delete own portfolio drafts" on public.portfolio_drafts;
create policy "Users can delete own portfolio drafts"
  on public.portfolio_drafts
  for delete
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id);

create table if not exists public.portfolio_publications (
  id uuid primary key default gen_random_uuid(),
  source_draft_id uuid not null references public.portfolio_drafts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  data jsonb not null,
  version integer not null default 1,
  score integer not null default 0,
  published_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portfolio_publications_live_slug_key
  on public.portfolio_publications (slug)
  where deleted_at is null;

create index if not exists portfolio_publications_user_updated_idx
  on public.portfolio_publications (user_id, updated_at desc);

create index if not exists portfolio_publications_draft_version_idx
  on public.portfolio_publications (source_draft_id, version desc);

alter table public.portfolio_publications enable row level security;

drop policy if exists "Public can read live published portfolios" on public.portfolio_publications;
create policy "Public can read live published portfolios"
  on public.portfolio_publications
  for select
  to anon, authenticated
  using (deleted_at is null);

drop policy if exists "Users can insert own published portfolios" on public.portfolio_publications;
create policy "Users can insert own published portfolios"
  on public.portfolio_publications
  for insert
  to authenticated
  with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can update own published portfolios" on public.portfolio_publications;
create policy "Users can update own published portfolios"
  on public.portfolio_publications
  for update
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can delete own published portfolios" on public.portfolio_publications;
create policy "Users can delete own published portfolios"
  on public.portfolio_publications
  for delete
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  1000000,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio assets are publicly readable" on storage.objects;
create policy "Portfolio assets are publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-assets');

drop policy if exists "Users can upload own portfolio assets" on storage.objects;
create policy "Users can upload own portfolio assets"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own portfolio assets" on storage.objects;
create policy "Users can update own portfolio assets"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'portfolio-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own portfolio assets" on storage.objects;
create policy "Users can delete own portfolio assets"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create table if not exists public.portfolio_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  ai_credits_used integer not null default 0,
  ai_credits_reset_at timestamptz,
  team_name text,
  agency_seats integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_accounts enable row level security;

drop policy if exists "Users can read own portfolio account" on public.portfolio_accounts;
create policy "Users can read own portfolio account"
  on public.portfolio_accounts
  for select
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can update own portfolio account" on public.portfolio_accounts;
create policy "Users can update own portfolio account"
  on public.portfolio_accounts
  for update
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can insert own portfolio account" on public.portfolio_accounts;
create policy "Users can insert own portfolio account"
  on public.portfolio_accounts
  for insert
  to authenticated
  with check (auth.uid() is not null and auth.uid() = user_id);

create table if not exists public.portfolio_custom_domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_id uuid not null references public.portfolio_drafts(id) on delete cascade,
  hostname text not null unique,
  status text not null default 'pending-verification'
    check (status in ('not-configured', 'pending-verification', 'active', 'error')),
  verification_token text not null,
  target text not null,
  connected_at timestamptz,
  last_checked_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_custom_domains_user_idx
  on public.portfolio_custom_domains (user_id, updated_at desc);

alter table public.portfolio_custom_domains enable row level security;

drop policy if exists "Users can manage own portfolio domains" on public.portfolio_custom_domains;
create policy "Users can manage own portfolio domains"
  on public.portfolio_custom_domains
  for all
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

create table if not exists public.portfolio_team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_id uuid not null references public.portfolio_drafts(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'editor' check (role in ('owner', 'admin', 'editor', 'viewer')),
  status text not null default 'invited' check (status in ('active', 'invited')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (draft_id, email)
);

create index if not exists portfolio_team_members_user_idx
  on public.portfolio_team_members (user_id, updated_at desc);

alter table public.portfolio_team_members enable row level security;

drop policy if exists "Users can manage own portfolio team members" on public.portfolio_team_members;
create policy "Users can manage own portfolio team members"
  on public.portfolio_team_members
  for all
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

create table if not exists public.portfolio_analytics_events (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid references public.portfolio_publications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  event_type text not null default 'view',
  referrer text,
  section text,
  visitor_hash text,
  read_seconds integer,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_analytics_events_user_created_idx
  on public.portfolio_analytics_events (user_id, created_at desc);

create index if not exists portfolio_analytics_events_slug_created_idx
  on public.portfolio_analytics_events (slug, created_at desc);

alter table public.portfolio_analytics_events enable row level security;

drop policy if exists "Users can read own portfolio analytics" on public.portfolio_analytics_events;
create policy "Users can read own portfolio analytics"
  on public.portfolio_analytics_events
  for select
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Public can insert portfolio analytics events" on public.portfolio_analytics_events;
create policy "Public can insert portfolio analytics events"
  on public.portfolio_analytics_events
  for insert
  to anon, authenticated
  with check (true);

create table if not exists public.portfolio_template_marketplace (
  id text primary key,
  name text not null,
  creator_name text not null,
  tier text not null default 'pro' check (tier in ('free', 'pro')),
  price_usd integer,
  category text not null default 'marketplace',
  description text not null,
  usage_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_template_marketplace enable row level security;

drop policy if exists "Public can read portfolio marketplace templates" on public.portfolio_template_marketplace;
create policy "Public can read portfolio marketplace templates"
  on public.portfolio_template_marketplace
  for select
  to anon, authenticated
  using (true);

create table if not exists public.portfolio_clone_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_id uuid not null references public.portfolio_drafts(id) on delete cascade,
  action text not null check (action in ('clone', 'export-json', 'export-html')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_clone_exports_user_created_idx
  on public.portfolio_clone_exports (user_id, created_at desc);

alter table public.portfolio_clone_exports enable row level security;

drop policy if exists "Users can manage own portfolio clone exports" on public.portfolio_clone_exports;
create policy "Users can manage own portfolio clone exports"
  on public.portfolio_clone_exports
  for all
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-videos',
  'portfolio-videos',
  true,
  25000000,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio videos are publicly readable" on storage.objects;
create policy "Portfolio videos are publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-videos');

drop policy if exists "Users can upload own portfolio videos" on storage.objects;
create policy "Users can upload own portfolio videos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own portfolio videos" on storage.objects;
create policy "Users can delete own portfolio videos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

insert into public.portfolio_template_marketplace
  (id, name, creator_name, tier, price_usd, category, description, usage_count, metadata)
values
  (
    'operator',
    'Operator',
    'Akingbade Studio',
    'pro',
    29,
    'marketplace',
    'A dense execution dashboard for senior operators, founders, and consultants.',
    410,
    '{"badge":"Agency favorite"}'::jsonb
  ),
  (
    'gallery',
    'Gallery',
    'Akingbade Studio',
    'pro',
    39,
    'marketplace',
    'A visual-first template for video, photography, art direction, and launches.',
    365,
    '{"badge":"Video ready","supportsVideo":true}'::jsonb
  ),
  (
    'pitch',
    'Pitch',
    'Portfolio Engine',
    'pro',
    19,
    'marketplace',
    'A conversion-focused layout for freelancers, sales leaders, and founders.',
    590,
    '{"badge":"Lead capture"}'::jsonb
  ),
  (
    'agency',
    'Agency',
    'Portfolio Engine',
    'pro',
    49,
    'marketplace',
    'A multi-person showcase for studios, collectives, and client delivery teams.',
    280,
    '{"badge":"Team accounts","supportsVideo":true}'::jsonb
  )
on conflict (id) do update
set
  name = excluded.name,
  creator_name = excluded.creator_name,
  tier = excluded.tier,
  price_usd = excluded.price_usd,
  category = excluded.category,
  description = excluded.description,
  usage_count = excluded.usage_count,
  metadata = excluded.metadata,
  updated_at = now();
