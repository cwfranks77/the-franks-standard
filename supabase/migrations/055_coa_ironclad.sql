-- Iron-clad COA: serial binding, seller vault, backend auth status, buyer access gates.

create table if not exists public.coa_serial_sequences (
  year int primary key,
  last_number int not null default 0
);

create table if not exists public.coa_certificates (
  id uuid primary key default gen_random_uuid(),
  serial_number text not null unique,
  listing_id uuid references public.listings (id) on delete restrict,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked', 'counterfeit')),
  item_snapshot jsonb not null default '{}'::jsonb,
  primary_image_path text,
  image_fingerprint text not null default '',
  description_excerpt text,
  seller_signature_name text,
  seller_signed_at timestamptz,
  third_party_serial text,
  document_source text not null default 'franks_issued'
    check (document_source in ('franks_issued', 'third_party_upload')),
  auth_status text not null default 'pending'
    check (auth_status in ('pending', 'verified', 'rejected')),
  auth_notes text,
  non_transferable boolean not null default true,
  buyer_access_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coa_certificates_listing_idx on public.coa_certificates (listing_id);
create index if not exists coa_certificates_seller_idx on public.coa_certificates (seller_id);
create index if not exists coa_certificates_third_party_serial_idx on public.coa_certificates (third_party_serial);

alter table public.coa_files
  add column if not exists seller_id uuid references public.profiles (id) on delete set null,
  add column if not exists listing_id uuid references public.listings (id) on delete set null,
  add column if not exists certificate_id uuid references public.coa_certificates (id) on delete set null,
  add column if not exists auth_status text default 'pending',
  add column if not exists auth_notes text,
  add column if not exists document_source text default 'third_party_upload',
  add column if not exists third_party_serial text,
  add column if not exists description_excerpt text,
  add column if not exists item_image_fingerprint text,
  add column if not exists non_transferable boolean not null default true,
  add column if not exists buyer_access_enabled boolean not null default false;

alter table public.listings
  add column if not exists coa_auth_status text default 'none',
  add column if not exists coa_buyer_access_enabled boolean not null default false,
  add column if not exists third_party_coa_serial text,
  add column if not exists coa_document_serial text;

create unique index if not exists coa_files_platform_serial_idx
  on public.coa_files (coa_serial)
  where coa_serial is not null;

create index if not exists coa_files_seller_serial_idx
  on public.coa_files (seller_id, coa_serial);

alter table public.coa_certificates enable row level security;
alter table public.coa_serial_sequences enable row level security;

comment on column public.coa_certificates.non_transferable is
  'Certificate may not be moved to another listing or item.';
