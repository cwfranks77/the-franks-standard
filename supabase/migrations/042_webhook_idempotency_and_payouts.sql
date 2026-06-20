-- Integration scaffold compat: webhook idempotency + owner payout ledger.
-- Does NOT recreate public.orders or a separate sellers table — those already exist:
--   • Seller Stripe Connect → public.profiles.stripe_account_id (003_stripe_payments.sql)
--   • Marketplace orders   → public.orders (002 + 003 + 033)
-- Safe to re-run.

-- Read-only alias for scripts that expect a `sellers` table.
create or replace view public.sellers as
select
  p.id,
  p.stripe_account_id as connected_account_id,
  p.created_at
from public.profiles p;

comment on view public.sellers is
  'Compat view: seller Connect account id lives on profiles.stripe_account_id.';

-- Stripe webhook idempotency (service role / edge functions only).
create table if not exists public.webhook_events (
  event_id text primary key,
  processed_at timestamptz,
  payload jsonb
);

create index if not exists webhook_events_processed_at_idx
  on public.webhook_events (processed_at desc)
  where processed_at is not null;

alter table public.webhook_events enable row level security;
revoke all on table public.webhook_events from anon, authenticated, public;

comment on table public.webhook_events is
  'Dedupes Stripe webhook event.id before side effects run (stripe-webhook edge function).';

-- Owner-initiated seller payout ledger (Stripe transfer reference stored in reference).
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed')),
  reference text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists payouts_seller_id_idx on public.payouts (seller_id);
create index if not exists payouts_status_idx on public.payouts (status);

alter table public.payouts enable row level security;
revoke all on table public.payouts from anon, authenticated, public;

comment on table public.payouts is
  'Internal payout queue; profiles.stripe_account_id is the Connect destination.';
