-- Per-seller dropship setup (any provider they choose). Platform does not assign a supplier.
-- Safe to re-run.

create table if not exists public.seller_dropship_settings (
  seller_id uuid primary key references public.profiles (id) on delete cascade,
  setup_complete boolean not null default false,
  setup_step integer not null default 0,
  preferred_provider_key text,
  preferred_provider_name text,
  fulfillment_mode text not null default 'manual',
  provider_account_email text,
  provider_account_ref text,
  supplier_portal_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seller_dropship_settings drop constraint if exists seller_dropship_settings_fulfillment_mode_check;
alter table public.seller_dropship_settings add constraint seller_dropship_settings_fulfillment_mode_check
  check (fulfillment_mode in ('manual', 'integrated'));

create table if not exists public.seller_dropship_secrets (
  seller_id uuid primary key references public.profiles (id) on delete cascade,
  flxpoint_api_key text,
  inventory_source_api_key text,
  doba_supplier_id text,
  doba_warehouse_id text,
  updated_at timestamptz not null default now()
);

alter table public.seller_dropship_settings enable row level security;
alter table public.seller_dropship_secrets enable row level security;

drop policy if exists "Seller dropship settings own" on public.seller_dropship_settings;
create policy "Seller dropship settings own" on public.seller_dropship_settings
  for all to authenticated using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists "Seller dropship secrets own" on public.seller_dropship_secrets;
create policy "Seller dropship secrets own" on public.seller_dropship_secrets
  for all to authenticated using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

alter table public.dropship_orders add column if not exists seller_id uuid references public.profiles (id) on delete set null;
alter table public.dropship_orders add column if not exists fulfillment_mode text not null default 'manual';

create index if not exists dropship_orders_seller_id_idx on public.dropship_orders (seller_id);

alter table public.dropship_orders drop constraint if exists dropship_orders_provider_status_check;
alter table public.dropship_orders add constraint dropship_orders_provider_status_check
  check (provider_status in (
    'queued', 'submitted', 'acknowledged', 'shipped', 'delivered', 'cancelled', 'error',
    'manual_fulfillment', 'awaiting_seller'
  ));

drop policy if exists "Dropship orders seller read own" on public.dropship_orders;
create policy "Dropship orders seller read own" on public.dropship_orders
  for select to authenticated using (
    seller_id = auth.uid()
    or exists (
      select 1 from public.orders o
      where o.id = dropship_orders.order_id
        and (o.seller_id = auth.uid() or o.buyer_id = auth.uid())
    )
  );
