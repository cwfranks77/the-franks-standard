-- Integrity hold: pause all seller marketplace activity while ops reviews authenticity disputes.
-- Sellers contact info@thefranksstandard.com to submit evidence. Distinct from debt freeze (024).

alter table public.profiles
  add column if not exists integrity_hold_at timestamptz,
  add column if not exists integrity_hold_reason text,
  add column if not exists integrity_hold_listing_id uuid references public.listings (id) on delete set null,
  add column if not exists integrity_hold_expires_at timestamptz;

comment on column public.profiles.integrity_hold_at is 'Seller cannot buy/sell/list until hold lifted or expires; may still email platform for appeals.';
comment on column public.profiles.integrity_hold_expires_at is 'Default 14 days from hold; ops may extend or lift early.';

create table if not exists public.integrity_hold_events (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  event_type text not null check (event_type in ('hold', 'extend', 'lift', 'ban_after_hold')),
  reason text,
  expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists integrity_hold_events_seller_idx
  on public.integrity_hold_events (seller_id, created_at desc);

alter table public.integrity_hold_events enable row level security;

create or replace function public.profile_integrity_hold_active (uid uuid)
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
      and p.integrity_hold_at is not null
      and (p.integrity_hold_expires_at is null or p.integrity_hold_expires_at > now())
  );
$$;

-- Extend debt freeze helper to block listing mutations during integrity hold too.
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
      and (
        (
          p.account_frozen_at is not null
          and p.seller_debt_status = 'pending'
          and p.seller_debt_paid_at is null
        )
        or (
          p.integrity_hold_at is not null
          and (p.integrity_hold_expires_at is null or p.integrity_hold_expires_at > now())
        )
      )
  );
$$;
