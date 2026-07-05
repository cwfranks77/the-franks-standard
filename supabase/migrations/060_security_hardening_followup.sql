-- Further hardening: license rows, trigger-only RPCs, anti-probe profile helpers.

-- Unassigned license inventory must not be readable by signed-in users (activation uses service role).
drop policy if exists "abl_licenses_select_own" on public.abl_licenses;
create policy "abl_licenses_select_own"
  on public.abl_licenses
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Trigger functions must not be callable from the API (only fire on INSERT triggers).
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.abl_handle_new_user() from authenticated;
revoke execute on function public.queue_dropship_order_after_insert() from authenticated;

-- Prevent probing other accounts' freeze / policy status via RPC.
create or replace function public.profile_account_is_frozen(uid uuid)
returns boolean
language sql
stable
security definer
set search_path to public
as $$
  select case
    when auth.uid() is null then false
    when auth.uid() is distinct from uid then false
    else exists (
      select 1
      from public.profiles p
      where p.id = uid
        and (
          (
            p.account_frozen_at is not null
            and p.seller_debt_status = 'pending'
            and p.seller_debt_paid_at is null
          )
          or (
            p.integrity_hold_at is not null
            and (p.integrity_hold_expires_at is null or p.integrity_hold_expires_at > now())
          )
        )
    )
  end;
$$;

create or replace function public.profile_integrity_hold_active(uid uuid)
returns boolean
language sql
stable
security definer
set search_path to public
as $$
  select case
    when auth.uid() is null then false
    when auth.uid() is distinct from uid then false
    else exists (
      select 1
      from public.profiles p
      where p.id = uid
        and p.integrity_hold_at is not null
        and (p.integrity_hold_expires_at is null or p.integrity_hold_expires_at > now())
    )
  end;
$$;

create or replace function public.seller_policies_accepted(uid uuid)
returns boolean
language sql
stable
security definer
set search_path to public
as $$
  select case
    when auth.uid() is null then false
    when auth.uid() is distinct from uid then false
    else exists (
      select 1
      from public.profiles p
      where p.id = uid
        and p.seller_policies_accepted_at is not null
        and p.seller_policies_version is not null
        and p.seller_policies_version = '2026-05-29'
    )
  end;
$$;

-- Public bucket: drop broad list-all policy; direct public URLs still work when bucket is public.
drop policy if exists "Listings public read" on storage.objects;
