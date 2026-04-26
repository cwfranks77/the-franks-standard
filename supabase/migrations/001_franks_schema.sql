-- The Franks Standard: profiles, listings, storage.
-- Run once in: Supabase Dashboard -> SQL -> New query -> Run (entire file).

-- ----- Profiles (one row per auth user) -----
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  account_type text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable" on public.profiles
  for select using (true);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, account_type)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'account_type'), ''),
      'buyer'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----- Listings -----
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  price numeric(12,2) not null check (price > 0),
  condition text not null,
  coa_type text not null check (coa_type in ('upload', 'guarantee')),
  guarantee_signed boolean not null default false,
  seller_legal_name text,
  coa_storage_path text,
  image_paths text[] not null default '{}',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists listings_seller_id_idx on public.listings (seller_id);
create index if not exists listings_status_created_at_idx on public.listings (status, created_at desc);

alter table public.listings enable row level security;

drop policy if exists "Listings read" on public.listings;
create policy "Listings read" on public.listings
  for select using (
    status = 'published' or auth.uid() = seller_id
  );

drop policy if exists "Sellers insert own listing" on public.listings;
create policy "Sellers insert own listing" on public.listings
  for insert with check (auth.uid() = seller_id);

drop policy if exists "Sellers update own listing" on public.listings;
create policy "Sellers update own listing" on public.listings
  for update using (auth.uid() = seller_id);

drop policy if exists "Sellers delete own listing" on public.listings;
create policy "Sellers delete own listing" on public.listings
  for delete using (auth.uid() = seller_id);

-- ----- Storage (public read for listing images) -----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listings',
  'listings',
  true,
  52428800, -- 50MB
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Listings public read" on storage.objects;
create policy "Listings public read" on storage.objects
  for select using (bucket_id = 'listings');

drop policy if exists "Listings user insert own prefix" on storage.objects;
create policy "Listings user insert own prefix" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listings'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Listings user update own prefix" on storage.objects;
create policy "Listings user update own prefix" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'listings'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'listings'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Listings user delete own prefix" on storage.objects;
create policy "Listings user delete own prefix" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listings'
    and split_part(name, '/', 1) = auth.uid()::text
  );
