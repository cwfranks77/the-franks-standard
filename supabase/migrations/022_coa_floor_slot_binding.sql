-- Floor slot binding: listing "office" ↔ COA serial ↔ item photos/description at issue time.

alter table public.listings
  add column if not exists floor_slot_code text;

comment on column public.listings.floor_slot_code is 'Human office number on floor — matches coa_serial_number when Franks COA issued (FS-YYYY-NNNNNN)';

alter table public.coa_certificates
  add column if not exists image_fingerprint text,
  add column if not exists description_excerpt text;

comment on column public.coa_certificates.image_fingerprint is 'Hash of sorted image_paths + title + description at issue — detects swap to lookalike after COA';
comment on column public.coa_certificates.description_excerpt is 'First 500 chars of description frozen at COA issue';

create unique index if not exists listings_floor_slot_unique
  on public.listings (floor_slot_code)
  where floor_slot_code is not null;
