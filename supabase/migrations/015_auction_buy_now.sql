-- Auction listings with optional Buy It Now price (bid or instant purchase).

alter table public.listings
  add column if not exists buy_now_price numeric(12,2);

comment on column public.listings.buy_now_price is
  'When set on an auction listing, buyers can purchase at this price until the first bid is placed.';
