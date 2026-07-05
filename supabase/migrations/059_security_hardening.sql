-- Security hardening: remove overly broad authenticated SELECT policies and lock public RPCs.

-- Any logged-in user could read ALL rows (policies OR together with permissive rules).
drop policy if exists "Dropship orders read authenticated" on public.dropship_orders;
drop policy if exists "Dropship events read authenticated" on public.dropship_events;
drop policy if exists "Allow read visibility for authenticated operators only" on public.distributors;

-- Distributors: registration insert only; reads via service role / edge functions.
drop policy if exists "Allow public vendor registration insert" on public.distributors;
create policy "Distributors insert registration"
  on public.distributors
  for insert
  to anon, authenticated
  with check (
    coalesce(nullif(trim(name), ''), null) is not null
    and coalesce(nullif(trim(contact_email), ''), null) is not null
  );

-- Block anonymous RPC calls to privileged SECURITY DEFINER functions.
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.abl_handle_new_user() from anon;
revoke execute on function public.queue_dropship_order_after_insert() from anon;
revoke execute on function public.profile_account_is_frozen(uuid) from anon;
revoke execute on function public.profile_integrity_hold_active(uuid) from anon;
revoke execute on function public.seller_policies_accepted(uuid) from anon;
revoke execute on function public.record_seller_policy_acceptance(text, text, jsonb) from anon;

-- Service-role-only tables: explicit deny for API roles (RLS on, zero policies = already blocked).
comment on table public.stripe_margin_split_audits is 'Service role only — no client SELECT policies.';
comment on table public.ops_incidents is 'Service role only — no client SELECT policies.';
comment on table public.contact_messages is 'Service role only — no client SELECT policies.';
