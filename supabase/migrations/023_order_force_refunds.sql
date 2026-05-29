-- Ops-initiated buyer refunds (Stripe + audit trail)

alter table public.orders
  add column if not exists stripe_refund_id text;

alter table public.orders
  add column if not exists refunded_at timestamptz;

alter table public.orders
  add column if not exists refund_reason text;

alter table public.orders
  add column if not exists refund_amount numeric(12, 2);

alter table public.orders
  add column if not exists refund_initiated_by text;

comment on column public.orders.refund_initiated_by is 'ops | stripe_webhook | seller';

create table if not exists public.order_refund_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  stripe_refund_id text,
  amount numeric(12, 2) not null,
  currency text not null default 'usd',
  reason text not null,
  ops_note text,
  authenticity_report_id uuid references public.authenticity_reports (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_refund_events_order_id_idx
  on public.order_refund_events (order_id, created_at desc);

alter table public.order_refund_events enable row level security;

-- Link refunds to authenticity report workflow
alter table public.authenticity_reports drop constraint if exists authenticity_reports_status_check;
alter table public.authenticity_reports add constraint authenticity_reports_status_check
  check (status in ('open', 'under_review', 'confirmed', 'dismissed', 'resolved_refunded'));
