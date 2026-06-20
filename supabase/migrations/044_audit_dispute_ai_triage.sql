-- Audit trail + dispute AI triage fields (Supabase stack — not Mongo/Express).

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null default 'system'
    check (actor_type in ('system', 'ai', 'admin', 'seller', 'buyer', 'ops')),
  actor_id text,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_target_idx on public.audit_logs (target_type, target_id);

alter table public.audit_logs enable row level security;

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade not null,
  filed_by uuid references public.profiles (id) on delete set null,
  reason text not null,
  description text not null default '',
  evidence_urls text[] not null default '{}',
  status text not null default 'open'
    check (status in ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed')),
  resolution text,
  seller_responded boolean not null default false,
  ai_decision text check (ai_decision in ('auto_refund', 'hold_for_review', 'deny')),
  ai_confidence numeric(4, 3),
  ai_reasons jsonb not null default '[]'::jsonb,
  ai_triaged_at timestamptz,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists disputes_status_idx on public.disputes (status, created_at desc);
create index if not exists disputes_order_id_idx on public.disputes (order_id);

alter table public.disputes enable row level security;

alter table public.disputes
  add column if not exists seller_responded boolean not null default false,
  add column if not exists ai_decision text,
  add column if not exists ai_confidence numeric(4, 3),
  add column if not exists ai_reasons jsonb not null default '[]'::jsonb,
  add column if not exists ai_triaged_at timestamptz;

alter table public.platform_activity_events
  drop constraint if exists platform_activity_events_action_category_check;

alter table public.platform_activity_events
  add constraint platform_activity_events_action_category_check
  check (action_category in (
    'auth', 'browse', 'listing', 'transaction', 'message', 'owner', 'sell', 'general', 'infraction'
  ));
