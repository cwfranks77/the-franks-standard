-- Outreach attribution on signup (postcard, /go/*, UTM, ref).

alter table public.profiles
  add column if not exists signup_ref text,
  add column if not exists signup_campaign text,
  add column if not exists signup_promo text,
  add column if not exists signup_utm_source text,
  add column if not exists signup_utm_medium text,
  add column if not exists signup_utm_campaign text,
  add column if not exists signup_utm_content text,
  add column if not exists signup_landing_path text,
  add column if not exists signup_first_touch_at timestamptz;

create index if not exists profiles_signup_ref_idx on public.profiles (signup_ref)
  where signup_ref is not null;

create index if not exists profiles_signup_campaign_idx on public.profiles (signup_campaign)
  where signup_campaign is not null;

-- STORE90: tracking / partner code (manual store onboarding; not auto-redeemed like FOUNDERS10).
insert into public.promo_codes (code, slug, label, max_uses, uses_count, benefit_months, active, program)
values (
  'STORE90',
  'store90',
  'Store partner outreach — track mail & partner signups',
  500,
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
