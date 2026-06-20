-- SECTION 11: Communication systems (email, SMS, notifications, support, messaging)

-- ---------------------------------------------------------------------------
-- 1. Email logs
-- ---------------------------------------------------------------------------
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  to_email text not null,
  template_key text,
  subject text not null,
  category text not null default 'transactional'
    check (category in ('transactional', 'marketing', 'broadcast')),
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'skipped')),
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  job_id uuid references public.background_jobs (id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_logs_user_idx on public.email_logs (user_id, created_at desc);
create index if not exists email_logs_status_idx on public.email_logs (status, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. SMS verification
-- ---------------------------------------------------------------------------
create table if not exists public.sms_verification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  phone_number text not null,
  code_hash text not null,
  reason text not null default 'verification',
  ip_address text,
  device_fingerprint text,
  expires_at timestamptz not null,
  verified_at timestamptz,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sms_verification_user_idx on public.sms_verification (user_id, created_at desc);
create index if not exists sms_verification_phone_idx on public.sms_verification (phone_number, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. In-platform notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id, read) where read = false;

-- ---------------------------------------------------------------------------
-- 4. Hardened message delivery log
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid,
  content text not null default '',
  sanitized_content text not null default '',
  ip_address text,
  device_fingerprint text,
  platform_message_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists messages_sender_idx on public.messages (sender_id, created_at desc);
create index if not exists messages_receiver_idx on public.messages (receiver_id, created_at desc);

alter table public.platform_messages
  add column if not exists raw_content text,
  add column if not exists sanitized_content text,
  add column if not exists receiver_id uuid references public.profiles (id) on delete set null,
  add column if not exists ip_address text,
  add column if not exists device_fingerprint text;

-- ---------------------------------------------------------------------------
-- 5. Support tickets
-- ---------------------------------------------------------------------------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  description text not null default '',
  status text not null default 'open'
    check (status in ('open', 'awaiting_user', 'awaiting_staff', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_user_idx on public.support_tickets (user_id, created_at desc);
create index if not exists support_tickets_status_idx on public.support_tickets (status);
create index if not exists support_messages_ticket_idx on public.support_messages (ticket_id, created_at);

-- ---------------------------------------------------------------------------
-- 6. Owner broadcasts
-- ---------------------------------------------------------------------------
create table if not exists public.broadcast_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id text,
  channel text not null check (channel in ('notification', 'email', 'both')),
  subject text,
  message text not null,
  audience text not null default 'all_users',
  recipient_count int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.email_logs enable row level security;
alter table public.sms_verification enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.broadcast_logs enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users read own support tickets" on public.support_tickets;
create policy "Users read own support tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

drop policy if exists "Users read own ticket messages" on public.support_messages;
create policy "Users read own ticket messages"
  on public.support_messages for select
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
    or sender_id = auth.uid()
  );
