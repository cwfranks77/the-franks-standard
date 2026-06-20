-- SECTION 9: Security hardening tables and audit extensions

-- ---------------------------------------------------------------------------
-- Session security tracking (app layer alongside Supabase Auth)
-- ---------------------------------------------------------------------------
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_token_hash text not null,
  device_fingerprint text,
  ip_address text,
  ip_subnet text,
  last_active_at timestamptz not null default now(),
  last_rotated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists user_sessions_user_idx on public.user_sessions (user_id, last_active_at desc);
create index if not exists user_sessions_token_hash_idx on public.user_sessions (session_token_hash);
create unique index if not exists user_sessions_active_token_uidx
  on public.user_sessions (session_token_hash)
  where revoked_at is null;

alter table public.user_sessions enable row level security;

-- ---------------------------------------------------------------------------
-- Rate limit violations
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  limit_key text not null,
  category text not null check (category in ('login', 'messaging', 'listing_edit', 'api')),
  ip_address text,
  user_id uuid references public.profiles (id) on delete set null,
  request_count int not null default 1,
  window_seconds int not null,
  blocked boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_key_idx on public.rate_limit_events (limit_key, created_at desc);
create index if not exists rate_limit_events_category_idx on public.rate_limit_events (category, created_at desc);

alter table public.rate_limit_events enable row level security;

-- ---------------------------------------------------------------------------
-- Security events (brute force, IP risk, fingerprint blocks)
-- ---------------------------------------------------------------------------
create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  ip_address text,
  device_fingerprint text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_events_user_idx on public.security_events (user_id, created_at desc);
create index if not exists security_events_type_idx on public.security_events (event_type, created_at desc);
create index if not exists security_events_ip_idx on public.security_events (ip_address, created_at desc);

alter table public.security_events enable row level security;

-- ---------------------------------------------------------------------------
-- Login brute-force state
-- ---------------------------------------------------------------------------
create table if not exists public.login_attempt_state (
  id uuid primary key default gen_random_uuid(),
  identifier text not null unique,
  failed_count int not null default 0,
  login_frozen_until timestamptz,
  captcha_required boolean not null default false,
  account_frozen_until timestamptz,
  last_attempt_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists login_attempt_state_frozen_idx
  on public.login_attempt_state (login_frozen_until)
  where login_frozen_until is not null;

alter table public.login_attempt_state enable row level security;

-- ---------------------------------------------------------------------------
-- Listing file uploads (security audit trail)
-- ---------------------------------------------------------------------------
create table if not exists public.listing_files (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  uploader_id uuid references public.profiles (id) on delete set null,
  storage_path text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  hash_sha256 text not null,
  scan_status text not null default 'pending'
    check (scan_status in ('pending', 'clean', 'rejected', 'skipped')),
  scan_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists listing_files_listing_idx on public.listing_files (listing_id);
create index if not exists listing_files_hash_idx on public.listing_files (hash_sha256);

alter table public.listing_files enable row level security;

-- ---------------------------------------------------------------------------
-- Audit logs — Section 9 compatibility columns
-- ---------------------------------------------------------------------------
alter table public.audit_logs
  add column if not exists user_id uuid references public.profiles (id) on delete set null,
  add column if not exists target text;

update public.audit_logs
set user_id = actor_id::uuid
where user_id is null
  and actor_id is not null
  and actor_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

update public.audit_logs
set target = coalesce(target, nullif(trim(concat_ws(':', target_type, target_id)), ''))
where target is null;

create index if not exists audit_logs_user_id_idx on public.audit_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- IP risk cache
-- ---------------------------------------------------------------------------
create table if not exists public.ip_risk_cache (
  ip_address text primary key,
  risk_score int not null default 0,
  factors jsonb not null default '[]'::jsonb,
  evaluated_at timestamptz not null default now()
);

alter table public.ip_risk_cache enable row level security;
