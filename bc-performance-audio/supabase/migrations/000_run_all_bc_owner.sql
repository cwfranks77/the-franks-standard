-- B&C Performance Audio — run entire owner setup in Supabase SQL editor

-- ===== 001_bc_owner_tables.sql =====
-- BC Audio owner tables (auctions, disputes, payouts, audit)
-- Run once in Supabase SQL editor or via CLI.

create table if not exists bc_auctions (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  seller_id text,
  title text not null default 'Auction item',
  start_time timestamptz not null,
  end_time timestamptz not null,
  reserve_price numeric(12,2) not null default 0,
  buy_now_price numeric(12,2),
  min_increment numeric(12,2) not null default 1,
  status text not null default 'scheduled' check (status in ('scheduled','active','closed','cancelled')),
  extended_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists bc_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references bc_auctions(id) on delete cascade,
  bidder_id text,
  bidder_email text,
  amount numeric(12,2) not null,
  is_auto boolean not null default false,
  placed_at timestamptz not null default now()
);

create index if not exists bc_bids_auction_amount_idx on bc_bids (auction_id, amount desc);

create table if not exists bc_disputes (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
  buyer_email text,
  seller_id text,
  reason text not null,
  evidence jsonb,
  status text not null default 'open' check (status in ('open','under_review','resolved','rejected')),
  resolution jsonb,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists bc_payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id text not null,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  reference text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists bc_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text,
  actor_id text,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create table if not exists bc_seller_accounts (
  seller_id text primary key,
  connected_account_id text not null,
  email text,
  updated_at timestamptz not null default now()
);


-- ===== 002_bc_customer_accounts.sql =====
-- Customer accounts must be approved before checkout (owner approves in ops panel)

create table if not exists bc_customer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null,
  full_name text,
  phone text,
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists bc_customer_profiles_status_idx on bc_customer_profiles (status);
create index if not exists bc_customer_profiles_email_idx on bc_customer_profiles (email);

-- Owner-editable app download links (optional cloud copy)
-- Also available via site-content key bcAppSettings


-- ===== 003_site_content_and_rls.sql =====
-- Site marketing content + customer profile policies (run after 001 and 002)

create table if not exists site_marketing_content (
  content_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table bc_customer_profiles enable row level security;

drop policy if exists bc_customer_read_own on bc_customer_profiles;
create policy bc_customer_read_own on bc_customer_profiles
  for select using (auth.uid() = user_id);

drop policy if exists bc_customer_insert_own on bc_customer_profiles;
create policy bc_customer_insert_own on bc_customer_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists bc_customer_update_own on bc_customer_profiles;
create policy bc_customer_update_own on bc_customer_profiles
  for update using (auth.uid() = user_id);

-- Public read for published marketing keys (anon can read storefront copy)
alter table site_marketing_content enable row level security;

drop policy if exists site_marketing_public_read on site_marketing_content;
create policy site_marketing_public_read on site_marketing_content
  for select using (true);


