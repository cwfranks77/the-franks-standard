-- SECTION 8: Database schema alignment (idempotent — safe on fresh or existing databases).
-- TFS uses public.profiles as the marketplace user/store record (no separate auth.users row duplication).

-- ---------------------------------------------------------------------------
-- 1. platform_activity_events
-- ---------------------------------------------------------------------------
create table if not exists public.platform_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  event_type text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  device_fingerprint text,
  created_at timestamptz not null default now(),
  -- legacy columns used by edge functions and activity logger
  action text,
  action_category text,
  user_display_name text,
  user_agent text
);

alter table public.platform_activity_events
  add column if not exists event_type text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists ip_address text,
  add column if not exists device_fingerprint text,
  add column if not exists action text,
  add column if not exists action_category text,
  add column if not exists user_display_name text,
  add column if not exists user_agent text;

create index if not exists platform_activity_events_user_idx
  on public.platform_activity_events (user_id, created_at desc);

create index if not exists platform_activity_events_event_type_idx
  on public.platform_activity_events (event_type, created_at desc);

create index if not exists platform_activity_events_created_at_idx
  on public.platform_activity_events (created_at desc);

alter table public.platform_activity_events enable row level security;

-- ---------------------------------------------------------------------------
-- 2. violation_events
-- ---------------------------------------------------------------------------
create table if not exists public.violation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  violation_type text not null default 'unknown',
  severity text not null default 'minor',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.violation_events
  add column if not exists evidence jsonb not null default '{}'::jsonb;

-- Backfill Section 8 evidence from legacy scanner columns when empty
update public.violation_events
set evidence = jsonb_strip_nulls(jsonb_build_object(
  'matches', matches,
  'metadata', metadata,
  'content_excerpt', content_excerpt,
  'source_type', source_type,
  'source_id', source_id,
  'action_taken', action_taken,
  'ip_address', ip_address,
  'device_fingerprint', device_fingerprint
))
where evidence = '{}'::jsonb
  and (
    matches is not null
    or metadata is not null
    or content_excerpt is not null
  );

create index if not exists violation_events_user_id_idx
  on public.violation_events (user_id, created_at desc);

create index if not exists violation_events_type_idx
  on public.violation_events (violation_type, created_at desc);

create index if not exists violation_events_created_at_idx
  on public.violation_events (created_at desc);

alter table public.violation_events enable row level security;

-- ---------------------------------------------------------------------------
-- 3. fraud_cases
-- ---------------------------------------------------------------------------
create table if not exists public.fraud_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  severity text not null default 'high',
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  law_enforcement_prepared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fraud_cases
  add column if not exists industry_alert_prepared boolean not null default false;

create index if not exists fraud_cases_user_id_idx on public.fraud_cases (user_id);
create index if not exists fraud_cases_created_at_idx on public.fraud_cases (created_at desc);

alter table public.fraud_cases enable row level security;

-- ---------------------------------------------------------------------------
-- 4. dispute_cases
-- ---------------------------------------------------------------------------
create table if not exists public.dispute_cases (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  description text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dispute_cases_buyer_idx on public.dispute_cases (buyer_id);
create index if not exists dispute_cases_seller_idx on public.dispute_cases (seller_id);
create index if not exists dispute_cases_created_at_idx on public.dispute_cases (created_at desc);

alter table public.dispute_cases enable row level security;

-- ---------------------------------------------------------------------------
-- 5. coa_files
-- ---------------------------------------------------------------------------
create table if not exists public.coa_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  listing_id uuid references public.listings (id) on delete set null,
  file_url text,
  hash text,
  device_fingerprint text,
  ip_address text,
  created_at timestamptz not null default now()
);

alter table public.coa_files
  add column if not exists user_id uuid references public.profiles (id) on delete set null,
  add column if not exists listing_id uuid references public.listings (id) on delete set null,
  add column if not exists file_url text,
  add column if not exists hash text,
  add column if not exists device_fingerprint text,
  add column if not exists ip_address text,
  add column if not exists uploader_id uuid references public.profiles (id) on delete set null,
  add column if not exists storage_path text,
  add column if not exists coa_serial text;

update public.coa_files
set user_id = coalesce(user_id, uploader_id)
where user_id is null and uploader_id is not null;

update public.coa_files
set file_url = coalesce(file_url, storage_path)
where file_url is null and storage_path is not null;

create index if not exists coa_files_user_idx on public.coa_files (user_id);
create index if not exists coa_files_listing_idx on public.coa_files (listing_id);

alter table public.coa_files enable row level security;

-- ---------------------------------------------------------------------------
-- 6. coa_hashes
-- ---------------------------------------------------------------------------
create table if not exists public.coa_hashes (
  id uuid primary key default gen_random_uuid(),
  coa_id uuid,
  hash text,
  created_at timestamptz not null default now()
);

alter table public.coa_hashes
  add column if not exists coa_id uuid,
  add column if not exists hash text,
  add column if not exists coa_file_id uuid references public.coa_files (id) on delete cascade,
  add column if not exists hash_sha256 text;

update public.coa_hashes
set coa_id = coalesce(coa_id, coa_file_id),
    hash = coalesce(hash, hash_sha256)
where coa_id is null or hash is null;

create index if not exists coa_hashes_coa_id_idx on public.coa_hashes (coa_id);

alter table public.coa_hashes enable row level security;

-- ---------------------------------------------------------------------------
-- 7. coa_listing_links
-- ---------------------------------------------------------------------------
create table if not exists public.coa_listing_links (
  id uuid primary key default gen_random_uuid(),
  coa_id uuid,
  listing_id uuid references public.listings (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.coa_listing_links
  add column if not exists coa_id uuid,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists coa_file_id uuid references public.coa_files (id) on delete cascade,
  add column if not exists linked_at timestamptz;

update public.coa_listing_links
set coa_id = coalesce(coa_id, coa_file_id),
    created_at = coalesce(created_at, linked_at, now())
where coa_id is null or created_at is null;

create index if not exists coa_listing_links_coa_idx on public.coa_listing_links (coa_id);
create index if not exists coa_listing_links_listing_idx on public.coa_listing_links (listing_id);

alter table public.coa_listing_links enable row level security;

-- ---------------------------------------------------------------------------
-- 8. coa_evidence_logs
-- ---------------------------------------------------------------------------
create table if not exists public.coa_evidence_logs (
  id uuid primary key default gen_random_uuid(),
  coa_id uuid,
  action text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.coa_evidence_logs
  add column if not exists coa_id uuid,
  add column if not exists action text,
  add column if not exists coa_file_id uuid references public.coa_files (id) on delete set null,
  add column if not exists event_type text;

update public.coa_evidence_logs
set coa_id = coalesce(coa_id, coa_file_id),
    action = coalesce(action, event_type)
where coa_id is null or action is null;

create index if not exists coa_evidence_logs_coa_idx on public.coa_evidence_logs (coa_id);
create index if not exists coa_evidence_logs_created_at_idx on public.coa_evidence_logs (created_at desc);

alter table public.coa_evidence_logs enable row level security;

-- ---------------------------------------------------------------------------
-- 9. law_enforcement_reports
-- ---------------------------------------------------------------------------
create table if not exists public.law_enforcement_reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid,
  report_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.law_enforcement_reports
  add column if not exists case_id uuid,
  add column if not exists report_json jsonb not null default '{}'::jsonb,
  add column if not exists fraud_case_id uuid references public.fraud_cases (id) on delete cascade,
  add column if not exists report jsonb not null default '{}'::jsonb;

update public.law_enforcement_reports
set case_id = coalesce(case_id, fraud_case_id),
    report_json = case
      when report_json = '{}'::jsonb and report is not null and report <> '{}'::jsonb then report
      else report_json
    end
where case_id is null or report_json = '{}'::jsonb;

create index if not exists law_enforcement_reports_case_id_idx on public.law_enforcement_reports (case_id);

alter table public.law_enforcement_reports enable row level security;

-- ---------------------------------------------------------------------------
-- 10. industry_alerts
-- ---------------------------------------------------------------------------
create table if not exists public.industry_alerts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid,
  alert_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.industry_alerts
  add column if not exists case_id uuid,
  add column if not exists alert_json jsonb not null default '{}'::jsonb,
  add column if not exists fraud_case_id uuid references public.fraud_cases (id) on delete cascade,
  add column if not exists alert jsonb not null default '{}'::jsonb;

update public.industry_alerts
set case_id = coalesce(case_id, fraud_case_id),
    alert_json = case
      when alert_json = '{}'::jsonb and alert is not null and alert <> '{}'::jsonb then alert
      else alert_json
    end
where case_id is null or alert_json = '{}'::jsonb;

create index if not exists industry_alerts_case_id_idx on public.industry_alerts (case_id);

alter table public.industry_alerts enable row level security;

-- ---------------------------------------------------------------------------
-- 11. support_ratings
-- ---------------------------------------------------------------------------
create table if not exists public.support_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  issue_resolved text not null default 'partial',
  comments text not null default '',
  created_at timestamptz not null default now()
);

alter table public.support_ratings
  add column if not exists followup_id uuid;

alter table public.support_ratings
  alter column issue_resolved set default 'partial';

-- Relax followup_id for Section 8 shape when table pre-existed with NOT NULL FK
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'support_ratings'
      and column_name = 'followup_id'
      and is_nullable = 'NO'
  ) then
    alter table public.support_ratings alter column followup_id drop not null;
  end if;
exception when others then
  null;
end $$;

create index if not exists support_ratings_user_id_idx on public.support_ratings (user_id);
create index if not exists support_ratings_created_at_idx on public.support_ratings (created_at desc);

alter table public.support_ratings enable row level security;

-- ---------------------------------------------------------------------------
-- 12. daily_spotlight
-- ---------------------------------------------------------------------------
create table if not exists public.daily_spotlight (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now()
);

alter table public.daily_spotlight
  add column if not exists date date,
  add column if not exists spotlight_date date;

update public.daily_spotlight
set date = coalesce(date, spotlight_date)
where date is null and spotlight_date is not null;

update public.daily_spotlight
set spotlight_date = coalesce(spotlight_date, date)
where spotlight_date is null and date is not null;

create unique index if not exists daily_spotlight_date_uidx
  on public.daily_spotlight (date)
  where date is not null;

create index if not exists daily_spotlight_store_id_idx on public.daily_spotlight (store_id);

alter table public.daily_spotlight enable row level security;

-- ---------------------------------------------------------------------------
-- 13. Users table fields (public.profiles = marketplace users)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists terms_accepted boolean not null default false,
  add column if not exists monitoring_consent boolean not null default false,
  add column if not exists phone_number text,
  add column if not exists device_fingerprint text,
  add column if not exists banned boolean not null default false,
  add column if not exists frozen boolean not null default false;

update public.profiles
set phone_number = coalesce(nullif(trim(phone_number), ''), nullif(trim(contact_phone), ''))
where phone_number is null and contact_phone is not null;

update public.profiles
set device_fingerprint = coalesce(device_fingerprint, last_device_fingerprint)
where device_fingerprint is null and last_device_fingerprint is not null;

update public.profiles
set banned = (
  platform_banned_at is not null
  or seller_banned_at is not null
)
where banned = false
  and (platform_banned_at is not null or seller_banned_at is not null);

update public.profiles
set frozen = (safety_frozen_at is not null)
where frozen = false and safety_frozen_at is not null;

-- ---------------------------------------------------------------------------
-- 14. Stores table fields (seller store lives on profiles; optional stores view)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists featured_store boolean not null default false,
  add column if not exists plan_expiration timestamptz;

-- Sync plan_expiration from active seller subscription when missing
update public.profiles p
set plan_expiration = s.expires_at
from public.seller_subscriptions s
where s.seller_id = p.id
  and s.status = 'active'
  and s.expires_at is not null
  and p.plan_expiration is null;

create or replace view public.stores as
select
  p.id as id,
  p.id as store_id,
  p.id as user_id,
  p.store_name,
  p.store_slug,
  p.featured_store,
  p.plan_expiration,
  p.active_store,
  p.created_at
from public.profiles p
where p.store_slug is not null
   or p.seller_policies_accepted_at is not null;

comment on view public.stores is
  'Section 8 compatibility view — marketplace stores are profiles with seller onboarding complete.';

-- ---------------------------------------------------------------------------
-- Sync triggers: keep Section 8 alias columns aligned with canonical columns
-- ---------------------------------------------------------------------------
create or replace function public.sync_section8_profile_aliases()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.contact_phone is distinct from old.contact_phone
     or (new.phone_number is null and new.contact_phone is not null) then
    new.phone_number := coalesce(nullif(trim(new.phone_number), ''), nullif(trim(new.contact_phone), ''));
  end if;

  if new.last_device_fingerprint is distinct from old.last_device_fingerprint
     or (new.device_fingerprint is null and new.last_device_fingerprint is not null) then
    new.device_fingerprint := coalesce(new.device_fingerprint, new.last_device_fingerprint);
  end if;

  new.banned := (
    new.platform_banned_at is not null
    or new.seller_banned_at is not null
  );

  new.frozen := (new.safety_frozen_at is not null);

  return new;
end;
$$;

drop trigger if exists profiles_section8_alias_sync on public.profiles;
create trigger profiles_section8_alias_sync
  before insert or update on public.profiles
  for each row execute function public.sync_section8_profile_aliases();

create or replace function public.sync_section8_coa_file_aliases()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := coalesce(new.user_id, new.uploader_id);
  new.uploader_id := coalesce(new.uploader_id, new.user_id);
  new.file_url := coalesce(new.file_url, new.storage_path);
  new.storage_path := coalesce(new.storage_path, new.file_url);
  return new;
end;
$$;

drop trigger if exists coa_files_section8_alias_sync on public.coa_files;
create trigger coa_files_section8_alias_sync
  before insert or update on public.coa_files
  for each row execute function public.sync_section8_coa_file_aliases();

create or replace function public.sync_section8_report_aliases()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'law_enforcement_reports' then
    new.case_id := coalesce(new.case_id, new.fraud_case_id);
    new.fraud_case_id := coalesce(new.fraud_case_id, new.case_id);
    new.report_json := case
      when new.report_json is null or new.report_json = '{}'::jsonb then coalesce(new.report, '{}'::jsonb)
      else new.report_json
    end;
    new.report := case
      when new.report is null or new.report = '{}'::jsonb then coalesce(new.report_json, '{}'::jsonb)
      else new.report
    end;
  elsif tg_table_name = 'industry_alerts' then
    new.case_id := coalesce(new.case_id, new.fraud_case_id);
    new.fraud_case_id := coalesce(new.fraud_case_id, new.case_id);
    new.alert_json := case
      when new.alert_json is null or new.alert_json = '{}'::jsonb then coalesce(new.alert, '{}'::jsonb)
      else new.alert_json
    end;
    new.alert := case
      when new.alert is null or new.alert = '{}'::jsonb then coalesce(new.alert_json, '{}'::jsonb)
      else new.alert
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists law_enforcement_reports_section8_sync on public.law_enforcement_reports;
create trigger law_enforcement_reports_section8_sync
  before insert or update on public.law_enforcement_reports
  for each row execute function public.sync_section8_report_aliases();

drop trigger if exists industry_alerts_section8_sync on public.industry_alerts;
create trigger industry_alerts_section8_sync
  before insert or update on public.industry_alerts
  for each row execute function public.sync_section8_report_aliases();
