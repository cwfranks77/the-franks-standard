-- EXPANSION Sections 16–17: AI phone and chat agent logging tables

create table if not exists public.phone_call_logs (
  id uuid primary key default gen_random_uuid(),
  call_sid text,
  caller_number text,
  intent text not null default 'general_support',
  transcript jsonb not null default '[]'::jsonb,
  escalated boolean not null default false,
  escalation_reason text,
  script_used text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists phone_call_logs_intent_idx on public.phone_call_logs (intent, created_at desc);
create index if not exists phone_call_logs_escalated_idx on public.phone_call_logs (escalated, created_at desc);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'escalated', 'closed')),
  escalated boolean not null default false,
  escalation_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_sessions_user_idx on public.chat_sessions (user_id, created_at desc);
create index if not exists chat_sessions_status_idx on public.chat_sessions (status, created_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at asc);

alter table public.phone_call_logs enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

revoke all on table public.phone_call_logs from anon, authenticated, public;
revoke all on table public.chat_sessions from anon, authenticated, public;
revoke all on table public.chat_messages from anon, authenticated, public;

comment on table public.phone_call_logs is 'AI phone agent call transcripts and routing (backend-only, no auto telephony).';
comment on table public.chat_sessions is 'AI chat support sessions.';
comment on table public.chat_messages is 'AI chat support message log.';
