-- ==============================================================================
-- MIGRATION: 036_distributors.sql
-- B&C Performance Audio — non-destructive onboarding fields + RLS for the
-- existing public.distributors table (already has: id, created_at, name, contact_email).
-- Backs pages/admin/vendors.vue. Safe to re-run.
-- ==============================================================================

-- 1. Append onboarding fields
alter table public.distributors
  add column if not exists business_tax_id varchar(50),
  add column if not exists wholesale_catalog_url varchar(255),
  add column if not exists preferred_payout_method varchar(50) default 'Stripe Connect',
  add column if not exists payout_account_id varchar(100),
  add column if not exists is_active boolean default true;

-- 2. Index for checkout/fulfillment lookups
create index if not exists idx_distributors_is_active on public.distributors(is_active);

-- 3. Enforce row level security
alter table public.distributors enable row level security;

-- 4. Public insert (vendor self-registration via the anon key)
drop policy if exists "Allow public vendor registration insert" on public.distributors;
create policy "Allow public vendor registration insert"
  on public.distributors
  for insert
  with check (true);

-- 5. SELECT restricted to authenticated operators.
--    SECURITY: distributors holds EIN (business_tax_id) and payout_account_id.
--    Do NOT expose SELECT to the public anon role, or anyone with the anon key
--    could read every vendor's tax ID and payout account. Keep this `to authenticated`.
drop policy if exists "Allow read visibility for active operators" on public.distributors;
create policy "Allow read visibility for active operators"
  on public.distributors
  for select
  to authenticated
  using (is_active = true);
