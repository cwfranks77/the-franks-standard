-- Full account freeze when seller is at fault and platform advances a buyer refund.
-- Frozen until debt is repaid; ops may still ban after repayment.

alter table public.profiles
  add column if not exists account_frozen_at timestamptz,
  add column if not exists account_freeze_reason text,
  add column if not exists seller_debt_balance numeric(12, 2),
  add column if not exists seller_debt_order_id uuid references public.orders (id) on delete set null,
  add column if not exists seller_debt_recorded_at timestamptz,
  add column if not exists seller_debt_paid_at timestamptz,
  add column if not exists seller_debt_status text not null default 'none';

alter table public.profiles drop constraint if exists profiles_seller_debt_status_check;
alter table public.profiles add constraint profiles_seller_debt_status_check
  check (seller_debt_status in ('none', 'pending', 'paid', 'waived', 'written_off'));

alter table public.orders
  add column if not exists escrow_frozen_at timestamptz,
  add column if not exists escrow_freeze_reason text;

create table if not exists public.seller_debt_events (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  event_type text not null check (event_type in ('freeze', 'payment', 'waive', 'ban_after_debt', 'lift_freeze')),
  amount numeric(12, 2),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists seller_debt_events_seller_idx
  on public.seller_debt_events (seller_id, created_at desc);

alter table public.seller_debt_events enable row level security;

comment on column public.profiles.account_frozen_at is 'All marketplace activity blocked (buy, sell, edit listings, escrow release) until seller_debt cleared.';
comment on column public.profiles.seller_debt_balance is 'Amount seller owes platform after ops forced refund.';

-- RLS: block listing mutations while account frozen (debt unpaid)
create or replace function public.profile_account_is_frozen (uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.account_frozen_at is not null
      and p.seller_debt_status = 'pending'
      and p.seller_debt_paid_at is null
  );
$$;

drop policy if exists "Sellers insert own listing" on public.listings;
create policy "Sellers insert own listing" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and not public.profile_account_is_frozen (auth.uid())
  );

drop policy if exists "Sellers update own listing" on public.listings;
create policy "Sellers update own listing" on public.listings
  for update using (
    auth.uid() = seller_id
    and not public.profile_account_is_frozen (auth.uid())
  );

drop policy if exists "Sellers delete own listing" on public.listings;
create policy "Sellers delete own listing" on public.listings
  for delete using (
    auth.uid() = seller_id
    and not public.profile_account_is_frozen (auth.uid())
  );
