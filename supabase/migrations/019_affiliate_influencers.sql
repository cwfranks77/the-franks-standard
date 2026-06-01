-- Influencer / affiliate partners and signup attribution.

alter table public.profiles
  add column if not exists signup_affiliate_handle text,
  add column if not exists signup_affiliate_tier text;

create index if not exists profiles_signup_affiliate_handle_idx
  on public.profiles (signup_affiliate_handle)
  where signup_affiliate_handle is not null;

create table if not exists public.affiliate_partners (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  display_name text not null,
  tier text not null default 'nano' check (tier in ('nano', 'micro', 'macro')),
  platform text,
  contact_email text,
  landing_key text not null default 'sell',
  commission_model text,
  commission_notes text,
  status text not null default 'pending' check (status in ('pending', 'active', 'paused')),
  promo_code text,
  signups_count int not null default 0 check (signups_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_partners_status_idx on public.affiliate_partners (status);

alter table public.affiliate_partners enable row level security;

drop policy if exists "Affiliate partners public read active" on public.affiliate_partners;
create policy "Affiliate partners public read active" on public.affiliate_partners
  for select using (status = 'active');

-- CREATOR: affiliate tracking code (manual perks; same as outreach program).
insert into public.promo_codes (code, slug, label, max_uses, uses_count, benefit_months, active, program)
values (
  'CREATOR',
  'creator',
  'Creator / influencer affiliate tracking',
  2000,
  0,
  0,
  true,
  'outreach'
)
on conflict (code) do update set
  slug = excluded.slug,
  label = excluded.label,
  max_uses = excluded.max_uses,
  active = excluded.active,
  program = excluded.program;
