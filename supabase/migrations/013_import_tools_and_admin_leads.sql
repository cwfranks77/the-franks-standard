-- Import tools and vetted lead logging for platform migration work.
-- Tables are service-role managed through Edge Functions; RLS remains enabled.

create table if not exists public.listing_import_batches (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  source text not null default 'ebay_csv',
  file_name text,
  status text not null default 'completed'
    check (status in ('processing', 'completed', 'completed_with_errors', 'failed')),
  total_rows integer not null default 0,
  inserted_count integer not null default 0,
  skipped_count integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists listing_import_batches_seller_created_idx
  on public.listing_import_batches (seller_id, created_at desc);

alter table public.listing_import_batches enable row level security;

drop policy if exists "Import batches read own" on public.listing_import_batches;
create policy "Import batches read own" on public.listing_import_batches
  for select to authenticated using (auth.uid() = seller_id);

create table if not exists public.admin_leads (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  contact_email text not null,
  category text,
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'converted', 'closed')),
  notes text,
  source text not null default 'manual',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_leads_status_created_idx
  on public.admin_leads (status, created_at desc);

create index if not exists admin_leads_contact_email_idx
  on public.admin_leads (lower(contact_email));

alter table public.admin_leads enable row level security;

create or replace function public.touch_admin_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_leads_updated_at on public.admin_leads;
create trigger admin_leads_updated_at
  before update on public.admin_leads
  for each row execute function public.touch_admin_leads_updated_at();
