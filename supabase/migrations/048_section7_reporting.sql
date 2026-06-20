-- Section 7: Law enforcement reports and industry fraud alerts (owner-prepared, never auto-sent)

create table if not exists public.law_enforcement_reports (
  id uuid primary key default gen_random_uuid(),
  fraud_case_id uuid not null references public.fraud_cases (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  severity text not null default 'high',
  report jsonb not null default '{}'::jsonb,
  prepared_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists law_enforcement_reports_case_uidx
  on public.law_enforcement_reports (fraud_case_id);

create index if not exists law_enforcement_reports_user_idx
  on public.law_enforcement_reports (user_id, prepared_at desc);

create table if not exists public.industry_alerts (
  id uuid primary key default gen_random_uuid(),
  fraud_case_id uuid not null references public.fraud_cases (id) on delete cascade,
  alert jsonb not null default '{}'::jsonb,
  prepared_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists industry_alerts_case_uidx
  on public.industry_alerts (fraud_case_id);

alter table public.law_enforcement_reports enable row level security;
alter table public.industry_alerts enable row level security;

-- Service role / edge functions only — no client-facing policies
