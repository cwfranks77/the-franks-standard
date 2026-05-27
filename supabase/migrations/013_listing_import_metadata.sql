-- Track imported listings (eBay skim, CSV) and skip duplicates per seller.

alter table public.listings
  add column if not exists import_source text;

alter table public.listings
  add column if not exists external_listing_id text;

create unique index if not exists listings_seller_external_import_uidx
  on public.listings (seller_id, external_listing_id)
  where external_listing_id is not null;
