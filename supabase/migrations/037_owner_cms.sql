-- ==============================================================================
-- MIGRATION: 037_owner_cms.sql
-- Owner-editable site marketing + dropship store catalog (B&C and partners).
-- Public read for live content; writes via service role from /api/ops/* only.
-- ==============================================================================

-- Marketing / homepage / ads copy
create table if not exists public.site_marketing_content (
  content_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_marketing_content enable row level security;

drop policy if exists "Public read site marketing" on public.site_marketing_content;
create policy "Public read site marketing"
  on public.site_marketing_content
  for select
  using (true);

-- Dropship partner stores
create table if not exists public.dropship_stores (
  id text primary key,
  slug text not null unique,
  name text not null,
  tagline text,
  accent text default '#d32f2f',
  is_live boolean not null default true,
  hero_json jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.dropship_stores enable row level security;

drop policy if exists "Public read live dropship stores" on public.dropship_stores;
create policy "Public read live dropship stores"
  on public.dropship_stores
  for select
  using (is_live = true);

-- Catalog line items per store
create table if not exists public.dropship_catalog_items (
  store_id text not null references public.dropship_stores(id) on delete cascade,
  item_id text not null,
  brand text,
  name text not null,
  tagline text,
  retail_price numeric(12, 2) not null default 0,
  wholesale_cost numeric(12, 2) not null default 0,
  category text,
  badge text,
  image text,
  specs jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (store_id, item_id)
);

create index if not exists idx_dropship_catalog_store on public.dropship_catalog_items(store_id, is_active, sort_order);

alter table public.dropship_catalog_items enable row level security;

drop policy if exists "Public read active catalog items" on public.dropship_catalog_items;
create policy "Public read active catalog items"
  on public.dropship_catalog_items
  for select
  using (
    is_active = true
    and exists (
      select 1 from public.dropship_stores s
      where s.id = dropship_catalog_items.store_id and s.is_live = true
    )
  );

-- Lock down distributors: remove anonymous insert (owner API uses service role)
drop policy if exists "Allow public vendor registration insert" on public.distributors;

-- Seed B&C store + default catalog (idempotent)
insert into public.dropship_stores (id, slug, name, tagline, accent, is_live, hero_json, sort_order)
values (
  'bc-performance-audio',
  'bc-performance-audio',
  'B&C Performance Audio',
  'Unmatched Power. Crystal Clarity. Competition Grade Sound.',
  '#d32f2f',
  true,
  '{"eyebrow":"Dropship partner store · The Franks Standard","slogan":"Unmatched Power. Crystal Clarity. Competition Grade Sound."}'::jsonb,
  0
)
on conflict (id) do nothing;

insert into public.dropship_catalog_items (store_id, item_id, brand, name, tagline, retail_price, wholesale_cost, category, badge, image, specs, sort_order)
values
  (
    'bc-performance-audio', 'prod-sub-12', 'Kicker', 'Solobaric L7S 12-Inch Subwoofer',
    'Square Cone Technology for Extreme Bass Output', 349.99, 210.00, 'Subwoofers', 'Hot Seller',
    '/img/hero-showcase-v2.svg',
    '["1500W Peak Power","Dual 4-Ohm Voice Coil","Signature Double Blue Stitching"]'::jsonb, 0
  ),
  (
    'bc-performance-audio', 'prod-amp-1200', 'Rockford Fosgate', 'Punch P1000X1BD Mono Amplifier',
    'Class-BD Constant Power Optimization Matrix', 429.99, 265.00, 'Amplifiers', 'Top Rated',
    '/img/hero-showcase-v2.svg',
    '["1000 Watts RMS @ 1-Ohm","Punch EQ Differential Control","Cast Aluminum Stealth Heatsink"]'::jsonb, 1
  )
on conflict (store_id, item_id) do nothing;

insert into public.site_marketing_content (content_key, payload)
values
  (
    'homepage',
    '{
      "heroRibbon": "Marketplace facilitator · seller-backed proof on collectibles",
      "heroTitleLine1": "If it is here,",
      "heroTitleLine2": "the seller put proof on file.",
      "heroTitleSub": "We screen and enforce — we do not certify or guarantee authenticity.",
      "heroLede": "The Franks Standard LLC is a marketplace facilitator. Collectible listings require seller-provided proof.",
      "facilitatorOneLiner": "Marketplace facilitator only — sellers back collectible listings.",
      "featuredStoreTitle": "B&C Performance Audio",
      "featuredStoreDesc": "Competition subwoofers & amplifiers — automated dropship checkout with split-payment.",
      "trustBlocks": [
        {"title":"Escrow protection","desc":"Buyer confirms delivery before funds release."},
        {"title":"COA & authenticity","desc":"Seller-backed proof tools on collectible listings."},
        {"title":"Dropship ready","desc":"Partner channels like B&C Performance Audio ship from wholesale."}
      ]
    }'::jsonb
  ),
  (
    'ads',
    '{
      "platforms": [
        {"id":"x","platform":"X (Twitter)","format":"Profile + pin tweet","text":"The Franks Standard — proof-first collectibles. COA · escrow · 4–5% fees.","image":"public/franks-pavilion.png","tip":"Change @handle in X settings."},
        {"id":"meta","platform":"Meta (Facebook / Instagram)","format":"Single image ad","text":"Buy collectibles with seller proof on file. Escrow checkout on The Franks Standard.","image":"public/franks-pavilion.png","tip":"Use 1080×1080 square creative."},
        {"id":"google","platform":"Google Search","format":"Responsive search ad","text":"Collectibles Marketplace | Seller Proof & Escrow | The Franks Standard","image":"N/A","tip":"Link to /browse and /sell."}
      ]
    }'::jsonb
  )
on conflict (content_key) do nothing;
