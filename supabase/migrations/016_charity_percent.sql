-- Partial charity donations (1–100% of sale proceeds).

alter table public.listings
  add column if not exists charity_percent smallint;

alter table public.listings drop constraint if exists listings_charity_percent_check;
alter table public.listings add constraint listings_charity_percent_check
  check (charity_percent is null or (charity_percent >= 1 and charity_percent <= 100));

-- Existing full-donation listings default to 100%.
update public.listings
set charity_percent = 100
where donate_proceeds = true
  and charity_key is not null
  and charity_percent is null;

alter table public.orders
  add column if not exists charity_percent smallint;

comment on column public.listings.charity_percent is
  'Share of sale proceeds donated to charity_key (1–100). NULL when not donating.';
