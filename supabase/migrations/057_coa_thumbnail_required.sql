-- Lock COAs issued without a frozen item thumbnail until re-synced.

update public.coa_certificates
set
  auth_status = 'pending',
  auth_notes = coalesce(auth_notes, '') || ' Pending: item thumbnail required before print.'
where primary_image_path is null or btrim(primary_image_path) = '';

update public.listings l
set coa_auth_status = 'pending'
from public.coa_certificates c
where l.coa_certificate_id = c.id
  and (c.primary_image_path is null or btrim(c.primary_image_path) = '');
