-- Fix: "Public profiles are readable" (USING true) exposed all seller rows to anon.
-- Public storefront pages use public_store_profiles view with safe columns only.

drop policy if exists "Public profiles are readable" on public.profiles;
drop policy if exists "Public read featured stores" on public.profiles;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create or replace view public.public_store_profiles
with (security_barrier = false) as
select
  id,
  full_name,
  store_name,
  store_slug,
  account_type,
  excellence_badge,
  seller_tier,
  founding_seller,
  created_at
from public.profiles
where nullif(trim(store_slug), '') is not null;

comment on view public.public_store_profiles is
  'Storefront-safe profile fields for anonymous marketplace browsing. No Stripe, debt, or enforcement fields.';

grant select on public.public_store_profiles to anon, authenticated;
