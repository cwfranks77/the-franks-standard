-- Carrier-scan escrow release (Shippo / EasyPost webhooks) + audit trail.
-- Safe to re-run.

alter table public.orders add column if not exists tracking_provider text;
alter table public.orders add column if not exists external_tracker_id text;
alter table public.orders add column if not exists tracking_status text;
alter table public.orders add column if not exists carrier_scan_at timestamptz;
alter table public.orders add column if not exists vendor_payout_release_reason text;

create index if not exists orders_tracking_number_idx
  on public.orders (tracking_number)
  where tracking_number is not null and length(trim(tracking_number)) > 0;

create table if not exists public.order_tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null,
  event_type text not null,
  status text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_tracking_events_order_id_idx
  on public.order_tracking_events (order_id, created_at desc);

comment on column public.orders.carrier_scan_at is 'Carrier delivered scan timestamp (Shippo/EasyPost) when seller funds released.';
comment on column public.orders.vendor_payout_release_reason is 'carrier_delivery | buyer_confirm | supplier_delivered_fallback';
