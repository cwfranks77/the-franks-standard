-- SECTION 12: Payments, payouts, refunds, ledger, and monthly statements

-- ---------------------------------------------------------------------------
-- Payment event log (immutable lifecycle)
-- ---------------------------------------------------------------------------
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  amount numeric(12, 2),
  currency text not null default 'USD',
  stripe_event_id text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_order_idx on public.payment_events (order_id, created_at desc);
create index if not exists payment_events_type_idx on public.payment_events (event_type, created_at desc);
create index if not exists payment_events_stripe_pi_idx on public.payment_events (stripe_payment_intent_id);

-- ---------------------------------------------------------------------------
-- Refund workflow events
-- ---------------------------------------------------------------------------
create table if not exists public.refund_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  refund_request_id uuid,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  amount numeric(12, 2),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists refund_events_order_idx on public.refund_events (order_id, created_at desc);

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12, 2) not null,
  reason text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied', 'processed', 'escalated')),
  seller_response_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists refund_requests_order_idx on public.refund_requests (order_id);
create index if not exists refund_requests_status_idx on public.refund_requests (status, seller_response_deadline);

-- Stripe refund audit (referenced by forceRefund.ts)
create table if not exists public.order_refund_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  stripe_refund_id text,
  amount numeric(12, 2) not null,
  currency text not null default 'usd',
  reason text,
  ops_note text,
  authenticity_report_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists order_refund_events_order_idx on public.order_refund_events (order_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Accounting ledger
-- ---------------------------------------------------------------------------
create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  entry_type text not null check (entry_type in ('credit', 'debit')),
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null,
  reference_id uuid,
  reference_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_user_idx on public.ledger_entries (user_id, created_at desc);
create index if not exists ledger_entries_ref_idx on public.ledger_entries (reference_type, reference_id);
create index if not exists ledger_entries_category_idx on public.ledger_entries (category, created_at desc);

-- ---------------------------------------------------------------------------
-- Monthly statements
-- ---------------------------------------------------------------------------
create table if not exists public.monthly_statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  statement_month date not null,
  total_sales numeric(12, 2) not null default 0,
  total_fees numeric(12, 2) not null default 0,
  total_payouts numeric(12, 2) not null default 0,
  total_refunds numeric(12, 2) not null default 0,
  disputes_summary jsonb not null default '{}'::jsonb,
  fraud_holds_summary jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, statement_month)
);

create index if not exists monthly_statements_month_idx on public.monthly_statements (statement_month desc);

-- ---------------------------------------------------------------------------
-- Extend payouts for Section 12
-- ---------------------------------------------------------------------------
alter table public.payouts
  add column if not exists order_id uuid references public.orders (id) on delete set null,
  add column if not exists fee numeric(12, 2) not null default 0,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists hold_reason text,
  add column if not exists scheduled_at timestamptz;

-- Expand status values (keep legacy paid/failed)
alter table public.payouts drop constraint if exists payouts_status_check;
alter table public.payouts add constraint payouts_status_check
  check (status in ('pending', 'scheduled', 'released', 'held', 'paid', 'failed'));

create index if not exists payouts_order_idx on public.payouts (order_id);

-- ---------------------------------------------------------------------------
-- Order tax breakdown + seller payout flags
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists shipping_zip text,
  add column if not exists tax_breakdown jsonb,
  add column if not exists fee_bps int,
  add column if not exists finalized_at timestamptz;

alter table public.profiles
  add column if not exists trusted_seller_payouts boolean not null default false,
  add column if not exists seller_first_sale_at timestamptz;

-- ---------------------------------------------------------------------------
-- RLS — service role only for financial tables
-- ---------------------------------------------------------------------------
alter table public.payment_events enable row level security;
alter table public.refund_events enable row level security;
alter table public.refund_requests enable row level security;
alter table public.order_refund_events enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.monthly_statements enable row level security;

revoke all on table public.payment_events from anon, authenticated, public;
revoke all on table public.refund_events from anon, authenticated, public;
revoke all on table public.refund_requests from anon, authenticated, public;
revoke all on table public.order_refund_events from anon, authenticated, public;
revoke all on table public.ledger_entries from anon, authenticated, public;
revoke all on table public.monthly_statements from anon, authenticated, public;

-- Buyers can read own refund requests
drop policy if exists "Buyers read own refund requests" on public.refund_requests;
create policy "Buyers read own refund requests"
  on public.refund_requests for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
