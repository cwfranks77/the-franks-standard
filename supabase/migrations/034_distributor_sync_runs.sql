-- Track automated distributor catalog and inventory sync attempts.

create table if not exists public.distributor_sync_runs (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid references public.distributors (id) on delete set null,
  distributor_name varchar(100) not null,
  status varchar(40) not null default 'success'
    check (status in ('success', 'partial', 'failed')),
  connection_type varchar(40) not null default 'REST_API_FEED',
  products_parsed integer not null default 0,
  inventory_updates integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_distributor_sync_runs_created
  on public.distributor_sync_runs (created_at desc);

create index if not exists idx_distributor_sync_runs_distributor
  on public.distributor_sync_runs (distributor_id, created_at desc);

alter table public.distributor_sync_runs enable row level security;
