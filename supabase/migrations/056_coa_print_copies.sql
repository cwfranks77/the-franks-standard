-- Documented COA print/download copies — each copy gets a unique token watermarked on the certificate.

create table if not exists public.coa_print_copies (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.coa_certificates (id) on delete cascade,
  serial_number text not null,
  copy_number int not null check (copy_number >= 1),
  copy_token text not null unique,
  issued_to_user_id uuid not null references public.profiles (id) on delete cascade,
  copy_type text not null default 'view'
    check (copy_type in ('original_issue', 'view', 'print', 'download')),
  listing_id uuid references public.listings (id) on delete set null,
  device_fingerprint text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (certificate_id, copy_number)
);

create index if not exists coa_print_copies_serial_idx on public.coa_print_copies (serial_number, created_at desc);
create index if not exists coa_print_copies_user_idx on public.coa_print_copies (issued_to_user_id, created_at desc);
create index if not exists coa_print_copies_token_idx on public.coa_print_copies (copy_token);

alter table public.coa_print_copies enable row level security;

comment on table public.coa_print_copies is
  'Every COA view/print/download from the site is logged with a unique copy token watermarked on the document.';
