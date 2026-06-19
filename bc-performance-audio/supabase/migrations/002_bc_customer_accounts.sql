-- Customer accounts must be approved before checkout (owner approves in ops panel)

create table if not exists bc_customer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null,
  full_name text,
  phone text,
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists bc_customer_profiles_status_idx on bc_customer_profiles (status);
create index if not exists bc_customer_profiles_email_idx on bc_customer_profiles (email);

-- Owner-editable app download links (optional cloud copy)
-- Also available via site-content key bcAppSettings
