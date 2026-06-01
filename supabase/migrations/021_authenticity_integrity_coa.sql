-- Authenticity integrity monitoring, reports, enforcement, and year-scoped Franks COAs.

-- ----- Seller enforcement -----
alter table public.profiles
  add column if not exists seller_banned_at timestamptz,
  add column if not exists seller_ban_reason text;

-- ----- Listing integrity -----
alter table public.listings
  add column if not exists integrity_status text not null default 'clear',
  add column if not exists integrity_flags jsonb not null default '[]'::jsonb,
  add column if not exists integrity_score int not null default 0,
  add column if not exists integrity_scanned_at timestamptz,
  add column if not exists coa_certificate_id uuid;

alter table public.listings drop constraint if exists listings_integrity_status_check;
alter table public.listings add constraint listings_integrity_status_check
  check (integrity_status in ('clear', 'review', 'suspended', 'counterfeit_confirmed'));

-- Expand COA types (upload, guarantee, franks_issued)
alter table public.listings drop constraint if exists listings_coa_type_check;
alter table public.listings add constraint listings_coa_type_check
  check (coa_type in ('upload', 'guarantee', 'franks_issued'));

alter table public.listings
  add column if not exists coa_serial_number text;

create index if not exists listings_integrity_status_idx
  on public.listings (integrity_status)
  where status = 'published';

create unique index if not exists listings_coa_serial_unique
  on public.listings (coa_serial_number)
  where coa_serial_number is not null;

-- ----- Year-scoped COA serials (FS-YYYY-NNNNNN) -----
create table if not exists public.coa_serial_sequences (
  year int primary key,
  last_number int not null default 0
);

create table if not exists public.coa_certificates (
  id uuid primary key default gen_random_uuid(),
  serial_number text not null unique,
  listing_id uuid not null references public.listings (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'revoked', 'superseded', 'sold')),
  item_snapshot jsonb not null default '{}'::jsonb,
  primary_image_path text,
  pdf_storage_path text,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text,
  superseded_by uuid references public.coa_certificates (id)
);

create index if not exists coa_certificates_listing_idx on public.coa_certificates (listing_id);
create index if not exists coa_certificates_seller_idx on public.coa_certificates (seller_id);

alter table public.coa_certificates enable row level security;

drop policy if exists "COA certs public read active" on public.coa_certificates;
create policy "COA certs public read active" on public.coa_certificates
  for select using (status = 'active');

drop policy if exists "COA certs seller read own" on public.coa_certificates;
create policy "COA certs seller read own" on public.coa_certificates
  for select using (auth.uid() = seller_id);

-- ----- Buyer / public fraud reports -----
create table if not exists public.authenticity_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid references public.profiles (id) on delete set null,
  reporter_email text,
  reason text not null check (reason in (
    'suspected_counterfeit',
    'misrepresented_grade',
    'wrong_item_photos',
    'fake_coa_document',
    'other'
  )),
  details text not null default '',
  status text not null default 'open'
    check (status in ('open', 'under_review', 'confirmed', 'dismissed')),
  resolution_notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists authenticity_reports_listing_idx on public.authenticity_reports (listing_id);
create index if not exists authenticity_reports_status_idx on public.authenticity_reports (status);

alter table public.authenticity_reports enable row level security;

drop policy if exists "Reports insert authenticated" on public.authenticity_reports;
create policy "Reports insert authenticated" on public.authenticity_reports
  for insert to authenticated
  with check (reporter_id is null or reporter_id = auth.uid());

drop policy if exists "Reports read own" on public.authenticity_reports;
create policy "Reports read own" on public.authenticity_reports
  for select using (reporter_id = auth.uid());

comment on column public.listings.integrity_status is 'clear | review | suspended | counterfeit_confirmed';
comment on table public.authenticity_reports is 'Buyer/public counterfeit and misrepresentation reports';
