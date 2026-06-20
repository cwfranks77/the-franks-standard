-- SECTION 3: Safety systems (violation scanner, freeze/ban, fraud, disputes, COA chain-of-custody).

-- ----- Profile safety columns -----
alter table public.profiles
  add column if not exists safety_frozen_at timestamptz,
  add column if not exists safety_freeze_reason text,
  add column if not exists messaging_frozen_until timestamptz,
  add column if not exists platform_banned_at timestamptz,
  add column if not exists platform_ban_reason text,
  add column if not exists requires_phone_verification boolean not null default false,
  add column if not exists phone_verified_at timestamptz,
  add column if not exists last_known_ip text,
  add column if not exists last_device_fingerprint text,
  add column if not exists last_browser_fingerprint text;

comment on column public.profiles.safety_frozen_at is
  'Full marketplace freeze (buy, sell, message, list) from violation scanner or ops.';
comment on column public.profiles.messaging_frozen_until is
  'Minor violation: block messaging until this timestamp (typically 72 hours).';

-- ----- Violation events -----
create table if not exists public.violation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  source_type text not null
    check (source_type in ('message', 'listing', 'review', 'dispute', 'upload', 'contact', 'registration', 'other')),
  source_id text,
  violation_type text not null,
  severity text not null check (severity in ('minor', 'major', 'severe')),
  action_taken text not null default 'logged'
    check (action_taken in ('logged', 'messaging_frozen', 'account_frozen', 'fraud_case_opened', 'banned')),
  content_excerpt text,
  matches jsonb not null default '[]'::jsonb,
  ip_address text,
  device_fingerprint text,
  browser_fingerprint text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists violation_events_user_idx on public.violation_events (user_id, created_at desc);
create index if not exists violation_events_severity_idx on public.violation_events (severity, created_at desc);

alter table public.violation_events enable row level security;

-- ----- Permanent ban lists -----
create table if not exists public.banned_devices (
  device_fingerprint text primary key,
  user_id uuid references public.profiles (id) on delete set null,
  reason text not null default '',
  banned_at timestamptz not null default now(),
  banned_by text not null default 'system'
);

create table if not exists public.banned_ips (
  ip_address text primary key,
  user_id uuid references public.profiles (id) on delete set null,
  reason text not null default '',
  fraud_flag boolean not null default false,
  banned_at timestamptz not null default now(),
  banned_by text not null default 'system'
);

create table if not exists public.banned_browser_fingerprints (
  browser_fingerprint text primary key,
  user_id uuid references public.profiles (id) on delete set null,
  reason text not null default '',
  banned_at timestamptz not null default now()
);

-- Anti-rejoin: fingerprints observed at registration
create table if not exists public.user_registration_fingerprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  device_fingerprint text,
  browser_fingerprint text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists user_reg_fp_device_idx on public.user_registration_fingerprints (device_fingerprint);
create index if not exists user_reg_fp_ip_idx on public.user_registration_fingerprints (ip_address);
create index if not exists user_reg_fp_browser_idx on public.user_registration_fingerprints (browser_fingerprint);

alter table public.banned_devices enable row level security;
alter table public.banned_ips enable row level security;
alter table public.banned_browser_fingerprints enable row level security;
alter table public.user_registration_fingerprints enable row level security;

-- ----- Fraud cases -----
create table if not exists public.fraud_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  severity text not null default 'high' check (severity in ('low', 'medium', 'high', 'critical')),
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open'
    check (status in ('open', 'under_review', 'closed')),
  law_enforcement_prepared boolean not null default false,
  industry_alert_prepared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fraud_cases_user_idx on public.fraud_cases (user_id, created_at desc);
create index if not exists fraud_cases_status_idx on public.fraud_cases (status, created_at desc);

alter table public.fraud_cases enable row level security;

-- ----- Formal dispute resolution -----
create table if not exists public.dispute_cases (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  description text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open'
    check (status in ('open', 'awaiting_response', 'tfs_review', 'resolved')),
  ruling text,
  ruling_metadata jsonb not null default '{}'::jsonb,
  legacy_dispute_id uuid references public.disputes (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dispute_cases_order_idx on public.dispute_cases (order_id);
create index if not exists dispute_cases_status_idx on public.dispute_cases (status, created_at desc);

alter table public.dispute_cases enable row level security;

drop policy if exists "Parties read own dispute cases" on public.dispute_cases;
create policy "Parties read own dispute cases"
  on public.dispute_cases for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "Buyer opens dispute case" on public.dispute_cases;
create policy "Buyer opens dispute case"
  on public.dispute_cases for insert
  with check (auth.uid() = buyer_id);

-- ----- COA chain-of-custody -----
create table if not exists public.coa_files (
  id uuid primary key default gen_random_uuid(),
  coa_serial text,
  storage_path text not null,
  mime_type text,
  file_size_bytes bigint,
  uploader_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.coa_hashes (
  id uuid primary key default gen_random_uuid(),
  coa_file_id uuid not null references public.coa_files (id) on delete cascade,
  hash_sha256 text not null,
  algorithm text not null default 'sha256',
  created_at timestamptz not null default now()
);

create unique index if not exists coa_hashes_file_hash_idx on public.coa_hashes (coa_file_id, hash_sha256);

create table if not exists public.coa_listing_links (
  id uuid primary key default gen_random_uuid(),
  coa_file_id uuid not null references public.coa_files (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  certificate_id uuid references public.coa_certificates (id) on delete set null,
  linked_at timestamptz not null default now()
);

create table if not exists public.coa_evidence_logs (
  id uuid primary key default gen_random_uuid(),
  coa_file_id uuid references public.coa_files (id) on delete set null,
  coa_serial text,
  event_type text not null,
  user_id uuid references public.profiles (id) on delete set null,
  listing_id uuid references public.listings (id) on delete set null,
  hash_sha256 text,
  device_fingerprint text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists coa_evidence_logs_serial_idx on public.coa_evidence_logs (coa_serial, created_at desc);

alter table public.coa_files enable row level security;
alter table public.coa_hashes enable row level security;
alter table public.coa_listing_links enable row level security;
alter table public.coa_evidence_logs enable row level security;

-- ----- Activity event types (expand categories) -----
alter table public.platform_activity_events
  drop constraint if exists platform_activity_events_action_category_check;

alter table public.platform_activity_events
  add constraint platform_activity_events_action_category_check
  check (action_category in (
    'auth', 'browse', 'listing', 'transaction', 'message', 'owner', 'sell', 'general', 'infraction', 'safety'
  ));

-- ----- Messaging freeze enforcement -----
create or replace function public.enforce_messaging_not_frozen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.profiles p
    where p.id = NEW.sender_id
      and (
        p.platform_banned_at is not null
        or p.seller_banned_at is not null
        or p.safety_frozen_at is not null
        or (p.messaging_frozen_until is not null and p.messaging_frozen_until > now())
      )
  ) then
    raise exception 'messaging_frozen' using errcode = 'P0001';
  end if;
  return NEW;
end;
$$;

drop trigger if exists platform_messages_freeze_guard on public.platform_messages;
create trigger platform_messages_freeze_guard
  before insert on public.platform_messages
  for each row execute function public.enforce_messaging_not_frozen();

-- ----- Prepared report drafts (owner approval required before send) -----
create table if not exists public.safety_report_drafts (
  id uuid primary key default gen_random_uuid(),
  fraud_case_id uuid references public.fraud_cases (id) on delete cascade,
  report_type text not null check (report_type in ('law_enforcement', 'industry_alert')),
  payload jsonb not null default '{}'::jsonb,
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz not null default now()
);

alter table public.safety_report_drafts enable row level security;
