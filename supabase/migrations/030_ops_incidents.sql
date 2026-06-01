-- Ops incident tracking: client errors, health checks, edge failures, manual reports.

create table if not exists public.ops_incidents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  severity text not null default 'medium'
    check (severity in ('critical', 'high', 'medium', 'low', 'info')),
  source text not null,
  message text not null,
  stack text,
  url text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'open'
    check (status in ('open', 'triaging', 'fixing', 'resolved', 'wontfix', 'failed')),
  root_cause text,
  fix_summary text,
  auto_fix_attempted boolean not null default false,
  github_commit_sha text,
  fingerprint text,
  last_notified_at timestamptz
);

create index if not exists ops_incidents_status_created_idx
  on public.ops_incidents (status, created_at desc);

create index if not exists ops_incidents_fingerprint_idx
  on public.ops_incidents (fingerprint)
  where fingerprint is not null and status not in ('resolved', 'wontfix');

create table if not exists public.ops_incident_events (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.ops_incidents (id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null,
  detail jsonb not null default '{}'::jsonb
);

create index if not exists ops_incident_events_incident_idx
  on public.ops_incident_events (incident_id, created_at desc);

alter table public.ops_incidents enable row level security;
alter table public.ops_incident_events enable row level security;

-- No direct client access; edge functions use service role.
revoke all on table public.ops_incidents from anon, authenticated, public;
revoke all on table public.ops_incident_events from anon, authenticated, public;

comment on table public.ops_incidents is
  'Production incidents ingested from client errors, health checks, and edge functions.';

comment on table public.ops_incident_events is
  'Timeline entries for ops incidents (status changes, notifications, triage).';
