-- Buyer reviews + public leaderboard view + award fee overrides.

alter table public.profiles
  add column if not exists award_fee_bps integer;

alter table public.profiles
  add column if not exists award_fee_until timestamptz;

alter table public.profiles
  add column if not exists excellence_badge text;

comment on column public.profiles.award_fee_bps is
  'When set and award_fee_until > now(), overrides tier fee bps (0 = waived platform fee).';

create table if not exists public.seller_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (order_id)
);

create index if not exists seller_reviews_seller_id_idx
  on public.seller_reviews (seller_id, created_at desc);

alter table public.seller_reviews enable row level security;

drop policy if exists "Seller reviews are public" on public.seller_reviews;
create policy "Seller reviews are public" on public.seller_reviews
  for select using (true);

drop policy if exists "Buyers insert review for own completed order" on public.seller_reviews;
create policy "Buyers insert review for own completed order" on public.seller_reviews
  for insert with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.buyer_id = auth.uid()
        and o.seller_id = seller_id
        and o.status in ('pending', 'paid', 'shipped', 'delivered')
    )
  );

-- Aggregated leaderboard for homepage / top-sellers page (public read).
create or replace view public.seller_leaderboard as
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
