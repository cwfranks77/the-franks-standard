-- Seller liability releases (Forms A/B) + buyer agreement (Form C) + checkout ack (Form D)
-- Version must match utils/liabilityPolicyVersion.js LIABILITY_POLICY_VERSION

alter table public.profiles
  add column if not exists buyer_policies_accepted_at timestamptz,
  add column if not exists buyer_policies_version text,
  add column if not exists buyer_policies_signer_name text;

create table if not exists public.seller_liability_releases (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  release_type text not null check (release_type in ('collectible_antique_coa', 'general_merchandise')),
  policy_version text not null,
  signer_legal_name text not null,
  serialized_coa_used boolean not null default false,
  release_text_sha256 text,
  signature_sha256 text,
  signed_at timestamptz not null default now()
);

create index if not exists seller_liability_releases_seller_idx
  on public.seller_liability_releases (seller_id, signed_at desc);
create index if not exists seller_liability_releases_listing_idx
  on public.seller_liability_releases (listing_id);

alter table public.seller_liability_releases enable row level security;

drop policy if exists "Sellers read own liability releases" on public.seller_liability_releases;
create policy "Sellers read own liability releases" on public.seller_liability_releases
  for select using (auth.uid() = seller_id);

create table if not exists public.buyer_policy_acceptances (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  policy_version text not null,
  signer_legal_name text not null,
  documents_accepted jsonb not null default '[]'::jsonb,
  accepted_at timestamptz not null default now()
);

create index if not exists buyer_policy_acceptances_buyer_idx
  on public.buyer_policy_acceptances (buyer_id, accepted_at desc);

alter table public.buyer_policy_acceptances enable row level security;

drop policy if exists "Buyers read own policy acceptances" on public.buyer_policy_acceptances;
create policy "Buyers read own policy acceptances" on public.buyer_policy_acceptances
  for select using (auth.uid() = buyer_id);

create table if not exists public.buyer_order_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  ack_version text not null,
  serialized_coa_serial text,
  ack_text_sha256 text,
  signed_at timestamptz not null default now()
);

create index if not exists buyer_order_ack_buyer_idx
  on public.buyer_order_acknowledgments (buyer_id, signed_at desc);
create index if not exists buyer_order_ack_order_idx
  on public.buyer_order_acknowledgments (order_id);

alter table public.buyer_order_acknowledgments enable row level security;

drop policy if exists "Buyers read own order acknowledgments" on public.buyer_order_acknowledgments;
create policy "Buyers read own order acknowledgments" on public.buyer_order_acknowledgments
  for select using (auth.uid() = buyer_id);

-- ── Seller liability release at publish ──
create or replace function public.record_seller_liability_release (
  p_release_type text,
  p_legal_name text,
  p_listing_id uuid default null,
  p_serialized_coa_used boolean default false,
  p_release_text_sha256 text default null,
  p_signature_sha256 text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  now_ts timestamptz := now();
  clean_name text := trim(coalesce(p_legal_name, ''));
  v_version text := '2026-06-12';
begin
  if uid is null then
    return jsonb_build_object('error', 'unauthorized', 'message', 'Sign in to sign the liability release.');
  end if;
  if length(clean_name) < 2 then
    return jsonb_build_object('error', 'legal_name_required', 'message', 'Enter your full legal name to sign.');
  end if;
  if p_release_type not in ('collectible_antique_coa', 'general_merchandise') then
    return jsonb_build_object('error', 'invalid_release_type', 'message', 'Invalid liability release type.');
  end if;
  if p_listing_id is not null then
    if not exists (select 1 from public.listings l where l.id = p_listing_id and l.seller_id = uid) then
      return jsonb_build_object('error', 'listing_not_found', 'message', 'Listing not found for this seller.');
    end if;
  end if;

  insert into public.seller_liability_releases (
    seller_id, listing_id, release_type, policy_version, signer_legal_name,
    serialized_coa_used, release_text_sha256, signature_sha256, signed_at
  )
  values (
    uid, p_listing_id, p_release_type, v_version, clean_name,
    coalesce(p_serialized_coa_used, false), p_release_text_sha256, p_signature_sha256, now_ts
  );

  return jsonb_build_object('ok', true, 'signed_at', now_ts, 'policy_version', v_version);
end;
$$;

revoke all on function public.record_seller_liability_release (text, text, uuid, boolean, text, text) from public;
grant execute on function public.record_seller_liability_release (text, text, uuid, boolean, text, text) to authenticated;

-- ── Buyer agreement (once per version) ──
create or replace function public.record_buyer_policy_acceptance (
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
  clean_name text := trim(coalesce(p_legal_name, ''));
  required_docs text[] := array['terms', 'marketplace_policy', 'buyer_agreement', 'privacy'];
  doc text;
begin
  if uid is null then
    return jsonb_build_object('error', 'unauthorized', 'message', 'Sign in to accept buyer policies.');
  end if;
  if length(clean_name) < 2 then
    return jsonb_build_object('error', 'legal_name_required', 'message', 'Enter your full legal name to sign.');
  end if;
  if p_policy_version is distinct from '2026-06-12' then
    return jsonb_build_object(
      'error', 'policy_version_mismatch',
      'message', 'Policies were updated. Refresh and sign the current version.',
      'current_version', '2026-06-12'
    );
  end if;
  foreach doc in array required_docs loop
    if not (p_documents ? doc) then
      return jsonb_build_object('error', 'documents_incomplete', 'message', 'You must agree to all listed policies.');
    end if;
  end loop;

  insert into public.profiles (id, full_name)
  values (uid, clean_name)
  on conflict (id) do update set
    full_name = coalesce(nullif(trim(public.profiles.full_name), ''), excluded.full_name);

  update public.profiles
  set
    buyer_policies_accepted_at = now_ts,
    buyer_policies_version = p_policy_version,
    buyer_policies_signer_name = clean_name
  where id = uid;

  begin
    insert into public.buyer_policy_acceptances (
      buyer_id, policy_version, signer_legal_name, documents_accepted
    )
    values (uid, p_policy_version, clean_name, coalesce(p_documents, '[]'::jsonb));
  exception when others then
    raise warning 'buyer_policy_acceptances insert skipped: %', sqlerrm;
  end;

  return jsonb_build_object(
    'ok', true,
    'accepted_at', now_ts,
    'policy_version', p_policy_version,
    'signer_name', clean_name
  );
end;
$$;

revoke all on function public.record_buyer_policy_acceptance (text, text, jsonb) from public;
grant execute on function public.record_buyer_policy_acceptance (text, text, jsonb) to authenticated;

-- ── Checkout acknowledgment (per purchase) — called from edge after order create ──
create or replace function public.record_buyer_order_acknowledgment (
  p_listing_id uuid,
  p_order_id uuid,
  p_ack_version text,
  p_serialized_coa_serial text default null,
  p_ack_text_sha256 text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  now_ts timestamptz := now();
begin
  if uid is null then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  if p_ack_version is distinct from '2026-06-12' then
    return jsonb_build_object('error', 'ack_version_mismatch');
  end if;
  if not exists (
    select 1 from public.orders o
    where o.id = p_order_id and o.buyer_id = uid and o.listing_id = p_listing_id
  ) then
    return jsonb_build_object('error', 'order_not_found');
  end if;

  insert into public.buyer_order_acknowledgments (
    buyer_id, listing_id, order_id, ack_version, serialized_coa_serial, ack_text_sha256, signed_at
  )
  values (
    uid, p_listing_id, p_order_id, p_ack_version, nullif(trim(p_serialized_coa_serial), ''), p_ack_text_sha256, now_ts
  );

  return jsonb_build_object('ok', true, 'signed_at', now_ts);
end;
$$;

revoke all on function public.record_buyer_order_acknowledgment (uuid, uuid, text, text, text) from public;
grant execute on function public.record_buyer_order_acknowledgment (uuid, uuid, text, text, text) to authenticated;
