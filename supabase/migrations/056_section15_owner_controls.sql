-- SECTION 15: Owner control systems — alerts and API keys

create table if not exists public.owner_alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create index if not exists owner_alerts_created_idx on public.owner_alerts (created_at desc);
create index if not exists owner_alerts_unread_idx on public.owner_alerts (read, created_at desc) where read = false;
create index if not exists owner_alerts_type_idx on public.owner_alerts (type, created_at desc);

create table if not exists public.owner_api_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  key_prefix text not null default '',
  permissions jsonb not null default '[]'::jsonb,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists owner_api_keys_prefix_idx on public.owner_api_keys (key_prefix);
create index if not exists owner_api_keys_revoked_idx on public.owner_api_keys (revoked) where revoked = false;

alter table public.owner_alerts enable row level security;
alter table public.owner_api_keys enable row level security;

revoke all on table public.owner_alerts from anon, authenticated, public;
revoke all on table public.owner_api_keys from anon, authenticated, public;

comment on table public.owner_alerts is 'Owner-only system alerts (fraud spikes, failures, threats).';
comment on table public.owner_api_keys is 'Hashed owner API keys with JSON permissions.';
