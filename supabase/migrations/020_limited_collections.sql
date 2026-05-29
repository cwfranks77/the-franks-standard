-- Niche collections & limited-edition listings.

alter table public.listings
  add column if not exists is_limited_edition boolean not null default false,
  add column if not exists collection_slug text,
  add column if not exists collection_label text;

create index if not exists listings_limited_edition_idx
  on public.listings (is_limited_edition)
  where is_limited_edition = true and status = 'published';

create index if not exists listings_collection_slug_idx
  on public.listings (collection_slug)
  where collection_slug is not null and status = 'published';

comment on column public.listings.is_limited_edition is 'Limited edition / exclusive drop — show Limited badge on browse';
comment on column public.listings.collection_slug is 'Niche or floor-drop campaign slug (see utils/nicheCollections.js)';
comment on column public.listings.collection_label is 'Short badge label e.g. Floor Drop #001';
