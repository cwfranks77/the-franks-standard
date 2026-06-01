-- Audit automated fulfillment activity triggered by Stripe checkout webhooks.

create table if not exists public.order_fulfillment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  stripe_session_id text,
  customer_email text,
  product_sku text,
  distributor_id text,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'skipped', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_order_fulfillment_events_order
  on public.order_fulfillment_events (order_id, created_at desc);

alter table public.order_fulfillment_events enable row level security;
