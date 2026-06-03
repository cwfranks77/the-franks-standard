-- Shipping cost for direct (seller-shipped) listings — buyer pays item price + shipping at checkout.
-- Safe to re-run.

alter table public.listings
  add column if not exists seller_shipping_cost numeric(12,2) not null default 0;

comment on column public.listings.seller_shipping_cost is
  'Shipping charged to buyer on direct listings (USD). Added to list price at Stripe Checkout.';

comment on column public.listings.dropship_shipping_cost is
  'Shipping charged to buyer on dropship listings (USD). Added to list price at Stripe Checkout.';
