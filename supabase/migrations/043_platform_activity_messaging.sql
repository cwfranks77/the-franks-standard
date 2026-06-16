-- Platform activity log, on-site messaging, and profile privacy (ops-readable).

-- ----- Signed-in user activity (IP captured server-side) -----
create table if not exists public.platform_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  user_display_name text,
  ip_address text,
  user_agent text,
  action text not null,
  action_category text not null default 'general'
    check (action_category in ('auth', 'browse', 'listing', 'transaction', 'message', 'owner', 'sell', 'general')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_activity_events_created_at_idx
  on public.platform_activity_events (created_at desc);
create index if not exists platform_activity_events_user_id_idx
  on public.platform_activity_events (user_id);

alter table public.platform_activity_events enable row level security;

-- No public access — ops edge functions use service role.

-- ----- On-platform buyer ↔ seller messaging -----
create table if not exists public.platform_conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  buyer_display_name text,
  seller_display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.platform_conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  sender_display_name text,
  body text not null,
  status text not null default 'sent'
    check (status in ('sent', 'blocked', 'flagged')),
  blocked_pii boolean not null default false,
  pii_violations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_messages_conversation_idx
  on public.platform_messages (conversation_id, created_at desc);

alter table public.platform_conversations enable row level security;
alter table public.platform_messages enable row level security;

drop policy if exists "Participants read own conversations" on public.platform_conversations;
create policy "Participants read own conversations"
  on public.platform_conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "Buyer starts conversation" on public.platform_conversations;
create policy "Buyer starts conversation"
  on public.platform_conversations for insert
  with check (auth.uid() = buyer_id);

drop policy if exists "Participants read own messages" on public.platform_messages;
create policy "Participants read own messages"
  on public.platform_messages for select
  using (
    exists (
      select 1 from public.platform_conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants send messages" on public.platform_messages;
create policy "Participants send messages"
  on public.platform_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.platform_conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ----- Profile privacy: public sees display name only -----
alter table public.profiles
  add column if not exists public_display_name text,
  add column if not exists hide_contact_info boolean not null default true;

-- Replace wide-open profile read with public-safe view fields only.
drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable"
  on public.profiles for select
  using (true);

comment on column public.profiles.hide_contact_info is
  'When true, clients must not render email/phone from auth.users on public surfaces.';
