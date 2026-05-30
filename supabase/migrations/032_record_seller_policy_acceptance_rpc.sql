-- Reliable seller policy signing from the client (no Edge service-role dependency).
-- Version must stay in sync with utils/sellerPolicyBundle.js SELLER_POLICY_VERSION.

create or replace function public.record_seller_policy_acceptance (
  p_legal_name text,
  p_policy_version text,
  p_documents jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  now_ts timestamptz := now();
  required_docs text[] := array['terms', 'marketplace_policy', 'seller_agreement', 'prohibited_items', 'privacy'];
  doc text;
  clean_name text := trim(coalesce(p_legal_name, ''));
begin
  if uid is null then
    return jsonb_build_object('error', 'unauthorized', 'message', 'Sign in to accept seller policies.');
  end if;

  if length(clean_name) < 2 then
    return jsonb_build_object('error', 'legal_name_required', 'message', 'Enter your full legal name to sign.');
  end if;

  if p_policy_version is distinct from '2026-05-29' then
    return jsonb_build_object(
      'error', 'policy_version_mismatch',
      'message', 'Policies were updated. Refresh the page and sign the current version.',
      'current_version', '2026-05-29'
    );
  end if;

  foreach doc in array required_docs loop
    if not (p_documents ? doc) then
      return jsonb_build_object('error', 'documents_incomplete', 'message', 'You must agree to all listed policies.');
    end if;
  end loop;

  insert into public.profiles (id, full_name, account_type)
  values (uid, clean_name, 'seller')
  on conflict (id) do update set
    full_name = coalesce(nullif(trim(public.profiles.full_name), ''), excluded.full_name);

  update public.profiles
  set
    seller_policies_accepted_at = now_ts,
    seller_policies_version = p_policy_version,
    seller_policies_signer_name = clean_name
  where id = uid;

  begin
    insert into public.seller_policy_acceptances (
      seller_id,
      policy_version,
      signer_legal_name,
      documents_accepted
    )
    values (uid, p_policy_version, clean_name, coalesce(p_documents, '[]'::jsonb));
  exception
    when others then
      raise warning 'seller_policy_acceptances insert skipped: %', sqlerrm;
  end;

  return jsonb_build_object(
    'ok', true,
    'accepted_at', now_ts,
    'policy_version', p_policy_version,
    'signer_name', clean_name
  );
end;
$$;

revoke all on function public.record_seller_policy_acceptance (text, text, jsonb) from public;
grant execute on function public.record_seller_policy_acceptance (text, text, jsonb) to authenticated;
