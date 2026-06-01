-- Supabase Advisor: RLS on coa_serial_sequences, security_invoker leaderboard,
-- Auth RLS init plan (wrap auth.uid() in subselect for stable per-query eval).

-- ----- Internal COA serial counter (edge functions / service role only) -----
alter table public.coa_serial_sequences enable row level security;

revoke all on table public.coa_serial_sequences from anon, authenticated, public;

comment on table public.coa_serial_sequences is
  'Internal year-scoped COA counters; no client access. Updated by issue-coa-certificate edge function.';

-- ----- Leaderboard view: respect caller RLS on underlying tables -----
drop view if exists public.seller_leaderboard;

create view public.seller_leaderboard
with (security_invoker = true)
as
select
  p.id as seller_id,
  coalesce(nullif(trim(p.store_name), ''), nullif(trim(p.full_name), ''), 'Seller') as display_name,
  p.store_slug,
  p.excellence_badge,
  p.award_fee_bps,
  p.award_fee_until,
  count(distinct o.id) filter (
    where o.status in ('paid', 'shipped', 'delivered')
  )::integer as completed_sales,
  coalesce(round(avg(sr.rating)::numeric, 2), 0)::numeric as rating_avg,
  count(sr.id)::integer as review_count,
  count(sr.id) filter (where sr.rating >= 4)::integer as positive_reviews,
  max(o.paid_at) as last_sale_at
from public.profiles p
left join public.orders o on o.seller_id = p.id
left join public.seller_reviews sr on sr.seller_id = p.id
where exists (
  select 1 from public.listings l
  where l.seller_id = p.id and l.status = 'published'
)
group by p.id, p.store_name, p.full_name, p.store_slug, p.excellence_badge, p.award_fee_bps, p.award_fee_until;

grant select on public.seller_leaderboard to anon, authenticated;

-- ----- profiles -----
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using ((select auth.uid()) = id);

-- ----- listings -----
drop policy if exists "Listings read" on public.listings;
create policy "Listings read" on public.listings
  for select using (
    status = 'published' or (select auth.uid()) = seller_id
  );

drop policy if exists "Sellers insert own listing" on public.listings;
create policy "Sellers insert own listing" on public.listings
  for insert with check (
    (select auth.uid()) = seller_id
    and not public.profile_account_is_frozen ((select auth.uid()))
    and public.seller_policies_accepted ((select auth.uid()))
  );

drop policy if exists "Sellers update own listing" on public.listings;
create policy "Sellers update own listing" on public.listings
  for update using (
    (select auth.uid()) = seller_id
    and not public.profile_account_is_frozen ((select auth.uid()))
    and public.seller_policies_accepted ((select auth.uid()))
  );

drop policy if exists "Sellers delete own listing" on public.listings;
create policy "Sellers delete own listing" on public.listings
  for delete using (
    (select auth.uid()) = seller_id
    and not public.profile_account_is_frozen ((select auth.uid()))
    and public.seller_policies_accepted ((select auth.uid()))
  );

-- ----- orders -----
drop policy if exists "Orders visible to buyer or seller" on public.orders;
create policy "Orders visible to buyer or seller"
  on public.orders
  for select
  using ((select auth.uid()) = buyer_id or (select auth.uid()) = seller_id);

drop policy if exists "Buyer can create own orders" on public.orders;
create policy "Buyer can create own orders"
  on public.orders
  for insert
  with check ((select auth.uid()) = buyer_id);

drop policy if exists "Seller can update own orders" on public.orders;
create policy "Seller can update own orders"
  on public.orders
  for update
  using ((select auth.uid()) = seller_id);

-- ----- promo_redemptions -----
drop policy if exists "Users read own redemptions" on public.promo_redemptions;
create policy "Users read own redemptions" on public.promo_redemptions
  for select using ((select auth.uid()) = user_id);

-- ----- listing_bids -----
drop policy if exists "Bids readable on published listings" on public.listing_bids;
create policy "Bids readable on published listings" on public.listing_bids
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'published' or l.seller_id = (select auth.uid()))
    )
  );

drop policy if exists "Users read own bids" on public.listing_bids;
create policy "Users read own bids" on public.listing_bids
  for select using ((select auth.uid()) = bidder_id);
