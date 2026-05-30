-- Sync seller policy gate with utils/sellerPolicyBundle.js SELLER_POLICY_VERSION (2026-05-29).

comment on column public.profiles.seller_policies_version is 'Version string e.g. 2026-05-29 — must match current bundle to sell.';

create or replace function public.seller_policies_accepted (uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.seller_policies_accepted_at is not null
      and p.seller_policies_version is not null
      and p.seller_policies_version = '2026-05-29'
  );
$$;
