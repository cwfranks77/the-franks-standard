-- SECTION 13: Search indexing, analytics, and behavior signals

-- Optional listing fields for richer search (safe no-op if already present)
alter table public.listings
  add column if not exists brand text,
  add column if not exists tags jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- Search analytics
-- ---------------------------------------------------------------------------
create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  query text not null default '',
  filters jsonb not null default '{}'::jsonb,
  results_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists search_events_created_idx on public.search_events (created_at desc);
create index if not exists search_events_query_idx on public.search_events (query, created_at desc);
create index if not exists search_events_user_idx on public.search_events (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Search indexes
-- ---------------------------------------------------------------------------
create table if not exists public.search_index_listings (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  title text not null default '',
  description text not null default '',
  category text,
  brand text,
  condition text,
  price numeric(12, 2),
  seller_id uuid references public.profiles (id) on delete cascade,
  tags jsonb not null default '[]'::jsonb,
  search_text text not null default '',
  rating_avg numeric(4, 2),
  indexed_at timestamptz not null default now()
);

create index if not exists search_index_listings_category_idx on public.search_index_listings (category);
create index if not exists search_index_listings_price_idx on public.search_index_listings (price);
create index if not exists search_index_listings_seller_idx on public.search_index_listings (seller_id);
create index if not exists search_index_listings_text_idx on public.search_index_listings using gin (to_tsvector('english', search_text));

create table if not exists public.search_index_stores (
  store_id uuid primary key references public.profiles (id) on delete cascade,
  store_name text not null default '',
  description text not null default '',
  categories jsonb not null default '[]'::jsonb,
  rating numeric(4, 2),
  featured_store boolean not null default false,
  search_text text not null default '',
  indexed_at timestamptz not null default now()
);

create index if not exists search_index_stores_text_idx on public.search_index_stores using gin (to_tsvector('english', search_text));
create index if not exists search_index_stores_rating_idx on public.search_index_stores (rating desc nulls last);

create table if not exists public.search_index_reviews (
  review_id uuid primary key,
  review_type text not null check (review_type in ('seller', 'buyer', 'platform')),
  text text not null default '',
  rating smallint not null,
  reviewer_id uuid references public.profiles (id) on delete set null,
  target_id uuid,
  search_text text not null default '',
  indexed_at timestamptz not null default now()
);

create index if not exists search_index_reviews_target_idx on public.search_index_reviews (target_id, review_type);
create index if not exists search_index_reviews_text_idx on public.search_index_reviews using gin (to_tsvector('english', search_text));

create table if not exists public.search_index_coa (
  coa_id uuid primary key,
  hash text not null,
  listing_id uuid references public.listings (id) on delete set null,
  uploader_id uuid references public.profiles (id) on delete set null,
  indexed_at timestamptz not null default now()
);

create index if not exists search_index_coa_hash_idx on public.search_index_coa (hash);
create index if not exists search_index_coa_listing_idx on public.search_index_coa (listing_id);

-- ---------------------------------------------------------------------------
-- Behavior signals for recommendations
-- ---------------------------------------------------------------------------
create table if not exists public.user_behavior_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  signal_type text not null,
  listing_id uuid references public.listings (id) on delete set null,
  store_id uuid references public.profiles (id) on delete set null,
  category text,
  price numeric(12, 2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_behavior_user_idx on public.user_behavior_signals (user_id, created_at desc);
create index if not exists user_behavior_type_idx on public.user_behavior_signals (signal_type, created_at desc);

-- ---------------------------------------------------------------------------
-- Trending scores cache (72h window, refreshed by indexer)
-- ---------------------------------------------------------------------------
create table if not exists public.listing_trending_scores (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  score numeric(12, 4) not null default 0,
  window_hours int not null default 72,
  factors jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists listing_trending_scores_score_idx on public.listing_trending_scores (score desc);

alter table public.search_events enable row level security;
alter table public.search_index_listings enable row level security;
alter table public.search_index_stores enable row level security;
alter table public.search_index_reviews enable row level security;
alter table public.search_index_coa enable row level security;
alter table public.user_behavior_signals enable row level security;
alter table public.listing_trending_scores enable row level security;

revoke all on table public.search_events from anon, authenticated, public;
revoke all on table public.search_index_listings from anon, authenticated, public;
revoke all on table public.search_index_stores from anon, authenticated, public;
revoke all on table public.search_index_reviews from anon, authenticated, public;
revoke all on table public.search_index_coa from anon, authenticated, public;
revoke all on table public.user_behavior_signals from anon, authenticated, public;
revoke all on table public.listing_trending_scores from anon, authenticated, public;

-- Public read on search indexes (marketplace browse/search)
grant select on table public.search_index_listings to anon, authenticated;
grant select on table public.search_index_stores to anon, authenticated;
grant select on table public.search_index_reviews to anon, authenticated;
grant select on table public.listing_trending_scores to anon, authenticated;

drop policy if exists "Public read search listings" on public.search_index_listings;
create policy "Public read search listings" on public.search_index_listings for select using (true);

drop policy if exists "Public read search stores" on public.search_index_stores;
create policy "Public read search stores" on public.search_index_stores for select using (true);

drop policy if exists "Public read trending" on public.listing_trending_scores;
create policy "Public read trending" on public.listing_trending_scores for select using (true);

drop policy if exists "Users read own behavior" on public.user_behavior_signals;
create policy "Users read own behavior" on public.user_behavior_signals for select using (auth.uid() = user_id);
