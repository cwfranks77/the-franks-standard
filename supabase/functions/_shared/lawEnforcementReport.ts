import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { fetchCoaChainForUser } from './coaChainOfCustody.ts'

/** Gather evidence package for owner review — NOT sent automatically. */
export async function prepareLawEnforcementReport (
  admin: SupabaseClient,
  caseId: string,
): Promise<{ ok: true; draftId: string; payload: Record<string, unknown> } | { ok: false; error: string }> {
  const { data: fraudCase, error: caseErr } = await admin
    .from('fraud_cases')
    .select('*')
    .eq('id', caseId)
    .maybeSingle()

  if (caseErr || !fraudCase) return { ok: false, error: caseErr?.message ?? 'case_not_found' }

  const userId = fraudCase.user_id as string | null

  const [
    profileRes,
    violationsRes,
    activityRes,
    messagesRes,
    listingsRes,
    ordersRes,
    disputesRes,
    regFpRes,
  ] = await Promise.all([
    userId
      ? admin.from('profiles').select('id, public_display_name, seller_banned_at, platform_banned_at, safety_frozen_at, last_known_ip, last_device_fingerprint, created_at').eq('id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
    admin.from('violation_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    admin.from('platform_activity_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(500),
    userId
      ? admin.from('platform_messages').select('*, platform_conversations!inner(buyer_id, seller_id, listing_id)').or(`sender_id.eq.${userId}`).order('created_at', { ascending: false }).limit(200)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('listings').select('id, title, description, price, status, integrity_status, integrity_flags, coa_serial_number, created_at').eq('seller_id', userId).limit(100)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('orders').select('id, listing_id, buyer_id, seller_id, amount, status, paid_at, total_paid').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`).limit(100)
      : Promise.resolve({ data: [] }),
    admin.from('dispute_cases').select('*').or(userId ? `buyer_id.eq.${userId},seller_id.eq.${userId}` : 'id.is.null').limit(50),
    userId
      ? admin.from('user_registration_fingerprints').select('*').eq('user_id', userId)
      : Promise.resolve({ data: [] }),
  ])

  const coaChain = userId ? await fetchCoaChainForUser(admin, userId) : { evidence_logs: [], files: [] }

  const bannedDevices = userId
    ? await admin.from('banned_devices').select('*').eq('user_id', userId)
    : { data: [] }
  const bannedIps = userId
    ? await admin.from('banned_ips').select('*').eq('user_id', userId)
    : { data: [] }

  const payload = {
    report_type: 'law_enforcement',
    prepared_at: new Date().toISOString(),
    requires_owner_approval: true,
    auto_send: false,
    fraud_case: fraudCase,
    subject_profile: profileRes.data,
    violation_events: violationsRes.data ?? [],
    platform_activity: activityRes.data ?? [],
    messages: messagesRes.data ?? [],
    listings: listingsRes.data ?? [],
    orders: ordersRes.data ?? [],
    dispute_cases: disputesRes.data ?? [],
    registration_fingerprints: regFpRes.data ?? [],
    coa_chain_of_custody: coaChain,
    banned_devices: bannedDevices.data ?? [],
    banned_ips: bannedIps.data ?? [],
    audit_note: 'Package prepared for owner review. Do not transmit without explicit approval.',
  }

  const { data: draft, error: draftErr } = await admin.from('safety_report_drafts').insert({
    fraud_case_id: caseId,
    report_type: 'law_enforcement',
    payload,
  }).select('id').single()

  if (draftErr || !draft?.id) return { ok: false, error: draftErr?.message ?? 'draft_failed' }

  await admin.from('fraud_cases').update({
    law_enforcement_prepared: true,
    updated_at: new Date().toISOString(),
  }).eq('id', caseId)

  return { ok: true, draftId: draft.id, payload }
}
