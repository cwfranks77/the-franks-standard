-- Idempotent: B&C owner panel SEO / social settings storage.
-- Safe to run multiple times (Supabase SQL editor or: supabase db execute).

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

insert into public.site_marketing_content (content_key, payload)
values (
  'bcMeta',
  '{
    "title": "B&C Performance Audio LLC | Competition Subwoofers & Car Audio Amplifiers",
    "description": "Shop competition subwoofers, monoblock amplifiers, Sundown, Kicker, Rockford Fosgate, and Taramps from B&C Performance Audio LLC — Louisiana checkout with dropship fulfillment.",
    "image": "https://www.bcpoweraudio.com/img/hero-showcase-v2.svg",
    "parentCompany": "B&C Performance Audio LLC",
    "url": "https://www.bcpoweraudio.com"
  }'::jsonb
)
on conflict (content_key) do nothing;
