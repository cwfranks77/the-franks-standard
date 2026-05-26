-- Dropship payment split: platform fee + supplier wholesale + seller margin (Stripe transfers).
-- Safe to re-run.

alter table public.listings add column if not exists dropship_wholesale_cost numeric(12,2);

alter table public.orders add column if not exists listing_mode text;
alter table public.orders add column if not exists supplier_cost numeric(12,2) not null default 0;
alter table public.orders add column if not exists seller_margin numeric(12,2);
alter table public.orders add column if not exists stripe_supplier_transfer_id text;
alter table public.orders add column if not exists stripe_seller_transfer_id text;
alter table public.orders add column if not exists supplier_transfer_at timestamptz;
alter table public.orders add column if not exists seller_transfer_at timestamptz;

create index if not exists orders_listing_mode_idx on public.orders (listing_mode);
