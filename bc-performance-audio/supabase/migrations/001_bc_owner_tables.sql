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
