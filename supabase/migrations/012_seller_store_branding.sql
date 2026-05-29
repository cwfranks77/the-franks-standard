-- Store brand + customer-facing email for dropship sellers (e.g. Brandy's Sporting Goods).

alter table public.seller_dropship_settings
  add column if not exists store_name text,
  add column if not exists store_contact_email text;

comment on column public.seller_dropship_settings.store_name is 'Public shop name shown on listings';
comment on column public.seller_dropship_settings.store_contact_email is 'Buyer-facing support email (mailto on listings)';
