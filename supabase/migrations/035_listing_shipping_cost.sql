-- Canonical shipping_cost on listings (direct + dropship). Used at Stripe Checkout.
-- Safe to re-run.

alter table public.listings
  add column if not exists shipping_cost numeric(12,2) not null default 0;

update public.listings
set shipping_cost = case
  when listing_mode = 'dropship' then coalesce(dropship_shipping_cost, 0)
  else coalesce(seller_shipping_cost, 0)
end
where shipping_cost = 0
  and (coalesce(dropship_shipping_cost, 0) > 0 or coalesce(seller_shipping_cost, 0) > 0);

comment on column public.listings.shipping_cost is
  'Buyer shipping charge (USD). Checkout total = price + shipping_cost. Escrow includes shipping for Connect transfers.';
