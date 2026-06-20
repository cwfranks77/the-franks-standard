-- SECTION 4: Business logic (store plans, spotlight, compliance, reviews, support follow-up).

-- ----- Profile compliance & promotion columns -----
alter table public.profiles
  add column if not exists contact_phone text,
  add column if not exists contact_email text,
  add column if not exists terms_accepted boolean not null default false,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists monitoring_consent boolean not null default false,
  add column if not exists monitoring_consent_at timestamptz,
  add column if not exists featured_store boolean not null default false,
  add column if not exists active_store boolean not null default true;

comment on column public.profiles.featured_store is
  'When true, store is promoted on marketplace homepage (backend flag only).';
comment on column public.profiles.active_store is
  'Seller store eligible for daily spotlight lottery when true.';

-- BC Audio featured store (by slug or name pattern; safe if profile not yet created).
update public.profiles
set featured_store = true
where featured_store = false
  and (
    lower(coalesce(store_slug, '')) in ('bc-audio', 'bc-performance-audio', 'bcpoweraudio', 'b-c-performance-audio')
    or lower(coalesce(store_name, '')) like '%b&c performance audio%'
    or lower(coalesce(store_name, '')) like '%bc performance audio%'
  );

-- ----- Subscription plans -----
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  duration_days integer,
  price_cents integer not null default 0,
  features jsonb not null default '[]'::jsonb,
  commission_override_bps integer,
  is_default_paid boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.seller_subscriptions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id) on delete restrict,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'active'
    check (status in ('active', 'expired', 'cancelled')),
  auto_renew boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists seller_subscriptions_one_active_idx
  on public.seller_subscriptions (seller_id)
  where status = 'active';

create index if not exists seller_subscriptions_expires_idx
  on public.seller_subscriptions (expires_at)
  where status = 'active';

insert into public.subscription_plans (slug, name, duration_days, price_cents, features, is_default_paid)
values
  (
    'starter_free_90',
    'Starter Free 90',
    90,
    0,
    '["full_store_access","unlimited_listings","basic_analytics","no_commission_changes"]'::jsonb,
    false
  ),
  (
    'marketplace_standard',
    'Marketplace Standard',
    null,
    2900,
    '["full_store_access","unlimited_listings","basic_analytics"]'::jsonb,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  duration_days = excluded.duration_days,
  price_cents = excluded.price_cents,
  features = excluded.features,
  is_default_paid = excluded.is_default_paid;

alter table public.subscription_plans enable row level security;
alter table public.seller_subscriptions enable row level security;

drop policy if exists "Anyone can read active subscription plans" on public.subscription_plans;
create policy "Anyone can read active subscription plans"
  on public.subscription_plans for select
  using (active = true);

drop policy if exists "Sellers read own subscriptions" on public.seller_subscriptions;
create policy "Sellers read own subscriptions"
  on public.seller_subscriptions for select
  using (auth.uid() = seller_id);

-- ----- Daily store spotlight -----
create table if not exists public.daily_spotlight (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.profiles (id) on delete cascade,
  spotlight_date date not null unique,
  created_at timestamptz not null default now()
);

create index if not exists daily_spotlight_store_idx on public.daily_spotlight (store_id);

alter table public.daily_spotlight enable row level security;

drop policy if exists "Public read daily spotlight" on public.daily_spotlight;
create policy "Public read daily spotlight"
  on public.daily_spotlight for select
  using (true);

drop policy if exists "Public read featured stores" on public.profiles;
create policy "Public read featured stores"
  on public.profiles for select
  using (featured_store = true or auth.uid() = id);

-- ----- Review system -----
create table if not exists public.seller_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  text text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.buyer_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  text text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  text text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists seller_reviews_seller_idx on public.seller_reviews (seller_id, created_at desc);
create index if not exists buyer_reviews_buyer_idx on public.buyer_reviews (buyer_id, created_at desc);
create index if not exists platform_reviews_created_idx on public.platform_reviews (created_at desc);

alter table public.seller_reviews enable row level security;
alter table public.buyer_reviews enable row level security;
alter table public.platform_reviews enable row level security;

drop policy if exists "Public read seller reviews" on public.seller_reviews;
create policy "Public read seller reviews"
  on public.seller_reviews for select using (true);

drop policy if exists "Public read buyer reviews" on public.buyer_reviews;
create policy "Public read buyer reviews"
  on public.buyer_reviews for select using (true);

drop policy if exists "Public read platform reviews" on public.platform_reviews;
create policy "Public read platform reviews"
  on public.platform_reviews for select using (true);

-- ----- Support follow-up & ratings -----
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'contact_messages'
  ) then
    create table public.contact_messages (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references public.profiles (id) on delete set null,
      name text,
      email text not null,
      subject text,
      message text not null,
      status text not null default 'open' check (status in ('open', 'closed')),
      closed_at timestamptz,
      created_at timestamptz not null default now()
    );
  else
    alter table public.contact_messages
      add column if not exists status text not null default 'open',
      add column if not exists closed_at timestamptz,
      add column if not exists user_id uuid references public.profiles (id) on delete set null;
  end if;
end $$;

create table if not exists public.support_followup_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_type text not null check (source_type in ('dispute', 'contact', 'call', 'ticket')),
  source_id text not null,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  sent_at timestamptz not null default now(),
  email_dispatched_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.support_ratings (
  id uuid primary key default gen_random_uuid(),
  followup_id uuid not null references public.support_followup_emails (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  issue_resolved text not null check (issue_resolved in ('yes', 'no', 'partial')),
  comments text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists support_followup_token_idx on public.support_followup_emails (token);
create index if not exists support_ratings_user_idx on public.support_ratings (user_id, created_at desc);

alter table public.support_followup_emails enable row level security;
alter table public.support_ratings enable row level security;

-- ----- Assign Starter Free 90 when seller completes onboarding -----
create or replace function public.assign_starter_free_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starter_id uuid;
begin
  if tg_op = 'UPDATE'
    and old.seller_policies_accepted_at is null
    and new.seller_policies_accepted_at is not null then
    select id into starter_id from public.subscription_plans where slug = 'starter_free_90' limit 1;
    if starter_id is not null and not exists (
      select 1 from public.seller_subscriptions s where s.seller_id = new.id
    ) then
      insert into public.seller_subscriptions (seller_id, plan_id, expires_at, status)
      values (new.id, starter_id, now() + interval '90 days', 'active');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_assign_starter_plan on public.profiles;
create trigger profiles_assign_starter_plan
  after update on public.profiles
  for each row
  execute function public.assign_starter_free_plan();

-- ----- Marketplace compliance enforcement (listings + messages) -----
create or replace function public.enforce_marketplace_profile_requirements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prof record;
  user_email text;
begin
  select p.contact_phone, p.contact_email, p.terms_accepted, p.monitoring_consent
  into prof
  from public.profiles p
  where p.id = new.seller_id;

  if prof is null then
    raise exception 'Contact information required.' using errcode = 'P0001';
  end if;

  select u.email into user_email from auth.users u where u.id = new.seller_id;

  if coalesce(nullif(trim(prof.contact_phone), ''), '') = ''
     or coalesce(nullif(trim(prof.contact_email), ''), nullif(trim(user_email), ''), '') is null then
    raise exception 'Contact information required.' using errcode = 'P0001';
  end if;

  if prof.terms_accepted is distinct from true then
    raise exception 'Terms and conditions must be accepted.' using errcode = 'P0001';
  end if;

  if prof.monitoring_consent is distinct from true then
    raise exception 'Monitoring consent is required.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists listings_compliance_guard on public.listings;
create trigger listings_compliance_guard
  before insert or update of status on public.listings
  for each row
  when (new.status = 'published')
  execute function public.enforce_marketplace_profile_requirements();

create or replace function public.enforce_message_sender_requirements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prof record;
  user_email text;
begin
  select p.contact_phone, p.contact_email, p.terms_accepted, p.monitoring_consent
  into prof
  from public.profiles p
  where p.id = new.sender_id;

  if prof is null then
    raise exception 'Contact information required.' using errcode = 'P0001';
  end if;

  select u.email into user_email from auth.users u where u.id = new.sender_id;

  if coalesce(nullif(trim(prof.contact_phone), ''), '') = ''
     or coalesce(nullif(trim(prof.contact_email), ''), nullif(trim(user_email), ''), '') is null then
    raise exception 'Contact information required.' using errcode = 'P0001';
  end if;

  if prof.terms_accepted is distinct from true then
    raise exception 'Terms and conditions must be accepted.' using errcode = 'P0001';
  end if;

  if prof.monitoring_consent is distinct from true then
    raise exception 'Monitoring consent is required.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists platform_messages_compliance_guard on public.platform_messages;
create trigger platform_messages_compliance_guard
  before insert on public.platform_messages
  for each row
  execute function public.enforce_message_sender_requirements();

-- Support follow-up emails are queued by resolveDispute edge logic and support-followup-dispatch cron.
