-- Audit secure Stripe Connect margin split calculations before checkout/transfer.

create table if not exists public.stripe_margin_split_audits (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  listing_id uuid references public.listings (id) on delete set null,
  distributor_id uuid references public.distributors (id) on delete set null,
  distributor_name varchar(100),
  distributor_payout_account_id varchar(100),
  retail_price numeric(12,2) not null,
  wholesale_cost numeric(12,2) not null,
  stripe_processing_fee numeric(12,2) not null,
  platform_net_profit numeric(12,2) not null,
  amount_to_charge_customer integer not null,
  application_fee_amount integer not null,
  transfer_to_distributor integer not null,
  currency text not null default 'usd',
  status text not null default 'calculated'
    check (status in ('calculated', 'rejected')),
  created_by uuid references public.profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_stripe_margin_split_audits_created
  on public.stripe_margin_split_audits (created_at desc);

create index if not exists idx_stripe_margin_split_audits_product
  on public.stripe_margin_split_audits (product_id, created_at desc);

alter table public.stripe_margin_split_audits enable row level security;
