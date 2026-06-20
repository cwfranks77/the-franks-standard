-- Cart persistence + activity event fields (backend only).

alter table public.platform_activity_events
  add column if not exists event_type text,
  add column if not exists device_fingerprint text;

update public.platform_activity_events
set event_type = action
where event_type is null and action is not null;

create table if not exists public.buyer_carts (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  shipping_zip text,
  updated_at timestamptz not null default now()
);

alter table public.buyer_carts enable row level security;

drop policy if exists "Users manage own cart" on public.buyer_carts;
create policy "Users manage own cart"
  on public.buyer_carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.buyer_carts is
  'Server-synced cart for signed-in buyers; tax quotes use shipping_zip.';

alter table public.orders
  add column if not exists merchandise_amount numeric(12,2),
  add column if not exists shipping_cost numeric(12,2) not null default 0;
