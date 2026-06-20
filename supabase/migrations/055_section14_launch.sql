-- SECTION 14: Launch prep — lock, backups, post-launch monitoring

-- ---------------------------------------------------------------------------
-- Launch lock (singleton row)
-- ---------------------------------------------------------------------------
create table if not exists public.launch_lock (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid,
  locked boolean not null default false,
  emergency_shutdown boolean not null default false,
  locked_at timestamptz,
  locked_by uuid references public.profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.launch_lock (id, locked)
values ('00000000-0000-0000-0000-000000000001', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Backup metadata
-- ---------------------------------------------------------------------------
create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  label text not null default '',
  status text not null default 'completed'
    check (status in ('pending', 'completed', 'failed', 'restored')),
  includes jsonb not null default '{}'::jsonb,
  storage_path text,
  size_bytes bigint,
  manifest jsonb not null default '{}'::jsonb,
  created_by text not null default 'ops',
  created_at timestamptz not null default now(),
  restored_at timestamptz
);

create index if not exists backups_created_idx on public.backups (created_at desc);

-- ---------------------------------------------------------------------------
-- Post-launch monitoring events
-- ---------------------------------------------------------------------------
create table if not exists public.post_launch_events (
  id uuid primary key default gen_random_uuid(),
  check_type text not null,
  status text not null check (status in ('ok', 'warning', 'critical')),
  message text not null default '',
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists post_launch_events_created_idx on public.post_launch_events (created_at desc);
create index if not exists post_launch_events_type_idx on public.post_launch_events (check_type, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS — service role / owner ops only for lock and backups
-- ---------------------------------------------------------------------------
alter table public.launch_lock enable row level security;
alter table public.backups enable row level security;
alter table public.post_launch_events enable row level security;

revoke all on table public.launch_lock from anon, authenticated, public;
revoke all on table public.backups from anon, authenticated, public;
revoke all on table public.post_launch_events from anon, authenticated, public;

-- Block marketplace writes when launch is locked (authenticated users)
create or replace function public.is_launch_locked ()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select locked from public.launch_lock where id = '00000000-0000-0000-0000-000000000001'::uuid), false);
$$;

drop policy if exists "Block listing publish when launch locked" on public.listings;
create policy "Block listing publish when launch locked"
  on public.listings for insert
  to authenticated
  with check (not public.is_launch_locked());

drop policy if exists "Block listing update publish when launch locked" on public.listings;
create policy "Block listing update publish when launch locked"
  on public.listings for update
  to authenticated
  using (not public.is_launch_locked() or status is distinct from 'published')
  with check (not public.is_launch_locked() or status is distinct from 'published');

comment on table public.launch_lock is 'Singleton launch gate — blocks marketplace activity when locked.';
comment on table public.backups is 'Launch backup manifests and metadata.';
comment on table public.post_launch_events is 'Post-launch health monitor events (10-minute cron).';
