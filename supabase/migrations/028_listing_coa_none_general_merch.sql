-- Allow general-merchandise listings without COA (coa_type = 'none').

alter table public.listings drop constraint if exists listings_coa_type_check;
alter table public.listings add constraint listings_coa_type_check
  check (coa_type in ('upload', 'guarantee', 'franks_issued', 'none'));

comment on column public.listings.coa_type is
  'upload | guarantee | franks_issued for collectibles; none for general merchandise categories';
