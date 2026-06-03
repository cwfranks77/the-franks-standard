-- Marketplace: separate platform charges + Connect transfers + manual payout escrow.
-- Safe to re-run.

alter table public.listings add column if not exists dropship_shipping_cost numeric(12,2);

alter table public.orders add column if not exists supplier_shipping_cost numeric(12,2) not null default 0;
alter table public.orders add column if not exists vendor_escrow_amount numeric(12,2);
alter table public.orders add column if not exists stripe_vendor_payout_id text;
alter table public.orders add column if not exists vendor_payout_released_at timestamptz;
alter table public.orders add column if not exists separate_charges boolean not null default false;

alter table public.profiles add column if not exists stripe_manual_payouts boolean not null default false;

comment on column public.orders.separate_charges is 'Platform charge + Connect transfer(s); vendor bank payout held until delivery/confirm.';
comment on column public.orders.vendor_escrow_amount is 'Item cost + shipping (dropship) or seller_payout (direct) transferred to Connect on payment.';
