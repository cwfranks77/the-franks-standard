-- Mandatory digital acceptance of all seller policies before any selling activity.

alter table public.profiles
  add column if not exists seller_policies_accepted_at timestamptz,
  add column if not exists seller_policies_version text,
  add column if not exists seller_policies_signer_name text;

comment on column public.profiles.seller_policies_version is 'Version string e.g. 2026-05-20 — must match current bundle to sell.';

create table if not exists public.seller_policy_acceptances (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  policy_version text not null,
  signer_legal_name text not null,
  documents_accepted jsonb not null default '[]'::jsonb,
  accepted_at timestamptz not null default now()
);

create index if not exists seller_policy_acceptances_seller_idx
  on public.seller_policy_acceptances (seller_id, accepted_at desc);

alter table public.seller_policy_acceptances enable row level security;

drop policy if exists "Sellers read own policy acceptances" on public.seller_policy_acceptances;
create policy "Sellers read own policy acceptances" on public.seller_policy_acceptances
  for select using (auth.uid() = seller_id);

-- Fast check for RLS on listings
create or replace function public.seller_policies_accepted (uid uuid)
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
      and p.seller_policies_accepted_at is not null
      and p.seller_policies_version is not null
      and p.seller_policies_version = '2026-05-20'
  );
$$;

-- Re-apply listing insert/update/delete with policy acceptance gate (requires 024 for profile_account_is_frozen)
drop policy if exists "Sellers insert own listing" on public.listings;
create policy "Sellers insert own listing" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and not public.profile_account_is_frozen (auth.uid())
    and public.seller_policies_accepted (auth.uid())
  );

drop policy if exists "Sellers update own listing" on public.listings;
create policy "Sellers update own listing" on public.listings
  for update using (
    auth.uid() = seller_id
    and not public.profile_account_is_frozen (auth.uid())
    and public.seller_policies_accepted (auth.uid())
  );

drop policy if exists "Sellers delete own listing" on public.listings;
create policy "Sellers delete own listing" on public.listings
  for delete using (
    auth.uid() = seller_id
    and not public.profile_account_is_frozen (auth.uid())
    and public.seller_policies_accepted (auth.uid())
  );
