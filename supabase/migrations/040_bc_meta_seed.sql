-- Seed B&C search + social share defaults (owner panel SEO tab).
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
