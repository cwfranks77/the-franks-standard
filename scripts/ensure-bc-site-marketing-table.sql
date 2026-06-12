-- Idempotent: B&C owner panel storage (SEO, antique ledger, theme).
-- Safe to run multiple times (Supabase SQL editor or: supabase db query --linked).

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

insert into public.site_marketing_content (content_key, payload)
values (
  'antiqueLedger',
  '{
    "items": [
      {
        "id": "antique-01",
        "title": "Vintage Cast Iron Mechanical Bank",
        "purchase_price": 45,
        "sale_price": 175,
        "collected_sales_tax": 7.79,
        "income_tax_reserve": 32.5
      }
    ]
  }'::jsonb
)
on conflict (content_key) do nothing;

-- Refresh PostgREST schema cache after DDL (fixes "schema cache" errors on first deploy).
notify pgrst, 'reload schema';
