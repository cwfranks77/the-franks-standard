-- Site marketing content + customer profile policies (run after 001 and 002)

create table if not exists site_marketing_content (
  content_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table bc_customer_profiles enable row level security;

drop policy if exists bc_customer_read_own on bc_customer_profiles;
create policy bc_customer_read_own on bc_customer_profiles
  for select using (auth.uid() = user_id);

drop policy if exists bc_customer_insert_own on bc_customer_profiles;
create policy bc_customer_insert_own on bc_customer_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists bc_customer_update_own on bc_customer_profiles;
create policy bc_customer_update_own on bc_customer_profiles
  for update using (auth.uid() = user_id);

-- Public read for published marketing keys (anon can read storefront copy)
alter table site_marketing_content enable row level security;

drop policy if exists site_marketing_public_read on site_marketing_content;
create policy site_marketing_public_read on site_marketing_content
  for select using (true);
