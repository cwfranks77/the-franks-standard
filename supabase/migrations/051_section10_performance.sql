-- SECTION 10: Performance indexes, job queue, reliability tracking

-- ---------------------------------------------------------------------------
-- 2. Database query optimization indexes (idempotent)
-- ---------------------------------------------------------------------------
create index if not exists platform_activity_events_user_id_perf_idx
  on public.platform_activity_events (user_id);

create index if not exists platform_activity_events_event_type_perf_idx
  on public.platform_activity_events (event_type);

create index if not exists platform_activity_events_created_at_perf_idx
  on public.platform_activity_events (created_at desc);

create index if not exists violation_events_user_id_perf_idx
  on public.violation_events (user_id);

create index if not exists violation_events_violation_type_perf_idx
  on public.violation_events (violation_type);

create index if not exists fraud_cases_user_id_perf_idx
  on public.fraud_cases (user_id);

create index if not exists fraud_cases_status_perf_idx
  on public.fraud_cases (status);

create index if not exists dispute_cases_buyer_id_perf_idx
  on public.dispute_cases (buyer_id);

create index if not exists dispute_cases_seller_id_perf_idx
  on public.dispute_cases (seller_id);

create index if not exists dispute_cases_status_perf_idx
  on public.dispute_cases (status);

create index if not exists coa_files_listing_id_perf_idx
  on public.coa_files (listing_id);

create index if not exists coa_files_hash_perf_idx
  on public.coa_files (hash);

create index if not exists coa_files_hash_sha256_perf_idx
  on public.coa_hashes (hash_sha256)
  where hash_sha256 is not null;

-- ---------------------------------------------------------------------------
-- 5. Background job queue
-- ---------------------------------------------------------------------------
create table if not exists public.background_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'dead')),
  attempts int not null default 0,
  max_attempts int not null default 3,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists background_jobs_status_scheduled_idx
  on public.background_jobs (status, scheduled_at);

create table if not exists public.job_failures (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.background_jobs (id) on delete set null,
  job_type text not null,
  error_message text not null,
  payload jsonb not null default '{}'::jsonb,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists job_failures_job_type_idx on public.job_failures (job_type, created_at desc);

-- ---------------------------------------------------------------------------
-- 7. Reliability / failover events
-- ---------------------------------------------------------------------------
create table if not exists public.reliability_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  operation text not null,
  attempts int not null default 1,
  succeeded boolean not null default false,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reliability_events_type_idx on public.reliability_events (event_type, created_at desc);

-- ---------------------------------------------------------------------------
-- 8. System health metadata
-- ---------------------------------------------------------------------------
create table if not exists public.system_health_meta (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.system_health_meta (key, value)
values ('last_cleanup_run', '{"ran_at": null}'::jsonb)
on conflict (key) do nothing;

alter table public.background_jobs enable row level security;
alter table public.job_failures enable row level security;
alter table public.reliability_events enable row level security;
alter table public.system_health_meta enable row level security;

-- Expand rate_limit_events categories for Section 10 API paths
alter table public.rate_limit_events drop constraint if exists rate_limit_events_category_check;
alter table public.rate_limit_events
  add constraint rate_limit_events_category_check
  check (category in (
    'login', 'messaging', 'listing_edit', 'api',
    'messages', 'listings', 'reviews', 'disputes', 'coa'
  ));
