-- Auction listings and bids. Run in Supabase SQL Editor after prior migrations.

alter table public.listings
  add column if not exists sale_type text not null default 'fixed'
    check (sale_type in ('fixed', 'auction'));

alter table public.listings
  add column if not exists starting_bid numeric(12,2);

alter table public.listings
  add column if not exists reserve_price numeric(12,2);

alter table public.listings
  add column if not exists bid_increment numeric(12,2) not null default 1.00;

alter table public.listings
  add column if not exists auction_ends_at timestamptz;

alter table public.listings
  add column if not exists current_bid numeric(12,2);

alter table public.listings
  add column if not exists current_bidder_id uuid references public.profiles (id) on delete set null;

alter table public.listings
  add column if not exists bid_count integer not null default 0;

create index if not exists listings_sale_type_idx on public.listings (sale_type, status);

create table if not exists public.listing_bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  bidder_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists listing_bids_listing_id_idx on public.listing_bids (listing_id, created_at desc);

alter table public.listing_bids enable row level security;

drop policy if exists "Bids readable on published listings" on public.listing_bids;
create policy "Bids readable on published listings" on public.listing_bids
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'published' or l.seller_id = auth.uid())
    )
  );

drop policy if exists "Users read own bids" on public.listing_bids;
create policy "Users read own bids" on public.listing_bids
  for select using (auth.uid() = bidder_id);
