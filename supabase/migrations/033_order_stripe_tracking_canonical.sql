-- Canonical order + Stripe + tracking columns (stable names for controllers).
-- Keeps legacy columns (status, stripe_supplier_transfer_id) in sync during migration.
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1) order_status (canonical) <-> status (legacy)
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists order_status text;

update public.orders
set order_status = status
where order_status is null
  and status is not null;

alter table public.orders
  alter column order_status set default 'pending';

update public.orders
set order_status = 'pending'
where order_status is null;

alter table public.orders
  alter column order_status set not null;

-- Mirror allowed values from orders_status_check (003_stripe_payments.sql)
alter table public.orders drop constraint if exists orders_order_status_check;
alter table public.orders add constraint orders_order_status_check
  check (order_status in (
    'pending',
    'paid',
    'shipped',
    'delivered',
    'confirmed',
    'cancelled',
    'refunded',
    'submitted_to_supplier',
    'disputed'
  ));

create index if not exists orders_order_status_idx
  on public.orders (order_status);

comment on column public.orders.order_status is
  'Canonical marketplace order lifecycle. Synced with legacy column status until apps migrate.';

-- ---------------------------------------------------------------------------
-- 2) stripe_transfer_id (canonical) <-> stripe_supplier_transfer_id (legacy)
--    Primary Connect transfer for vendor escrow / supplier portion.
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists stripe_supplier_transfer_id text;

alter table public.orders
  add column if not exists stripe_transfer_id text;

update public.orders
set stripe_transfer_id = stripe_supplier_transfer_id
where stripe_transfer_id is null
  and stripe_supplier_transfer_id is not null;

create index if not exists orders_stripe_transfer_id_idx
  on public.orders (stripe_transfer_id)
  where stripe_transfer_id is not null;

comment on column public.orders.stripe_transfer_id is
  'Canonical Stripe transfer id (tr_*) for escrow/vendor portion. Synced with stripe_supplier_transfer_id.';

-- ---------------------------------------------------------------------------
-- 3) tracking_status (canonical on orders — ensure present + index)
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists tracking_status text;

create index if not exists orders_tracking_status_idx
  on public.orders (tracking_status)
  where tracking_status is not null and length(trim(tracking_status)) > 0;

comment on column public.orders.tracking_status is
  'Latest carrier tracking status from Shippo/EasyPost or supplier (e.g. in_transit, delivered). Free text — not enum-constrained.';

-- ---------------------------------------------------------------------------
-- 4) order_tracking_events.tracking_status (audit table alignment)
-- ---------------------------------------------------------------------------
create table if not exists public.order_tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null,
  event_type text not null,
  status text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_tracking_events_order_id_idx
  on public.order_tracking_events (order_id, created_at desc);

alter table public.order_tracking_events
  add column if not exists tracking_status text;

update public.order_tracking_events
set tracking_status = status
where tracking_status is null
  and status is not null;

comment on column public.order_tracking_events.tracking_status is
  'Carrier status on this webhook event. Legacy column status kept in sync.';

-- ---------------------------------------------------------------------------
-- 5) Bidirectional sync triggers (legacy <-> canonical)
-- ---------------------------------------------------------------------------
create or replace function public.sync_orders_canonical_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- order_status <-> status
  if tg_op = 'INSERT' then
    if new.order_status is null and new.status is not null then
      new.order_status := new.status;
    elsif new.status is null and new.order_status is not null then
      new.status := new.order_status;
    end if;
  else
    if new.order_status is distinct from old.order_status
      and new.order_status is not null
      and (new.status is null or new.status is not distinct from old.status) then
      new.status := new.order_status;
    elsif new.status is distinct from old.status
      and new.status is not null
      and (new.order_status is null or new.order_status is not distinct from old.order_status) then
      new.order_status := new.status;
    end if;
  end if;

  -- stripe_transfer_id <-> stripe_supplier_transfer_id
  if tg_op = 'INSERT' then
    if new.stripe_transfer_id is null and new.stripe_supplier_transfer_id is not null then
      new.stripe_transfer_id := new.stripe_supplier_transfer_id;
    elsif new.stripe_supplier_transfer_id is null and new.stripe_transfer_id is not null then
      new.stripe_supplier_transfer_id := new.stripe_transfer_id;
    end if;
  else
    if new.stripe_transfer_id is distinct from old.stripe_transfer_id
      and new.stripe_transfer_id is not null
      and (new.stripe_supplier_transfer_id is null
        or new.stripe_supplier_transfer_id is not distinct from old.stripe_supplier_transfer_id) then
      new.stripe_supplier_transfer_id := new.stripe_transfer_id;
    elsif new.stripe_supplier_transfer_id is distinct from old.stripe_supplier_transfer_id
      and new.stripe_supplier_transfer_id is not null
      and (new.stripe_transfer_id is null
        or new.stripe_transfer_id is not distinct from old.stripe_transfer_id) then
      new.stripe_transfer_id := new.stripe_supplier_transfer_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_sync_canonical_columns on public.orders;
create trigger orders_sync_canonical_columns
  before insert or update on public.orders
  for each row
  execute function public.sync_orders_canonical_columns();

create or replace function public.sync_order_tracking_events_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.tracking_status is null and new.status is not null then
      new.tracking_status := new.status;
    elsif new.status is null and new.tracking_status is not null then
      new.status := new.tracking_status;
    end if;
  else
    if new.tracking_status is distinct from old.tracking_status
      and new.tracking_status is not null
      and (new.status is null or new.status is not distinct from old.status) then
      new.status := new.tracking_status;
    elsif new.status is distinct from old.status
      and new.status is not null
      and (new.tracking_status is null or new.tracking_status is not distinct from old.tracking_status) then
      new.tracking_status := new.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists order_tracking_events_sync_tracking_status on public.order_tracking_events;
create trigger order_tracking_events_sync_tracking_status
  before insert or update on public.order_tracking_events
  for each row
  execute function public.sync_order_tracking_events_status();

-- ---------------------------------------------------------------------------
-- 6) One-time parity fix after backfill
-- ---------------------------------------------------------------------------
update public.orders
set
  order_status = status,
  stripe_transfer_id = coalesce(stripe_transfer_id, stripe_supplier_transfer_id)
where order_status is distinct from status
   or (stripe_transfer_id is null and stripe_supplier_transfer_id is not null);

update public.order_tracking_events
set tracking_status = status
where tracking_status is distinct from status
   or (tracking_status is null and status is not null);
