import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { fetchCoaChainForUser } from './coaChainOfCustody.ts'

function buildTimeline (items: { at: string }[]) {
  return items
    .filter((row) => row?.at)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

/** Gather evidence package for owner review — NOT sent automatically. */
export async function prepareLawEnforcementReport (
  admin: SupabaseClient,
  caseId: string,
): Promise<{ ok: true; reportId: string; payload: Record<string, unknown> } | { ok: false; error: string }> {
  const { data: fraudCase, error: caseErr } = await admin
    .from('fraud_cases')
    .select('*')
    .eq('id', caseId)
    .maybeSingle()

  if (caseErr || !fraudCase) return { ok: false, error: caseErr?.message ?? 'case_not_found' }

  const userId = fraudCase.user_id as string | null

  let authEmail: string | null = null
  if (userId) {
    const { data: authUser } = await admin.auth.admin.getUserById(userId)
    authEmail = authUser?.user?.email ?? null
  }

  const [
    profileRes,
    violationsRes,
    activityRes,
    messagesRes,
    listingsRes,
    ordersRes,
    disputesRes,
    regFpRes,
    bannedDevicesRes,
    bannedIpsRes,
  ] = await Promise.all([
    userId
      ? admin.from('profiles').select('id, public_display_name, contact_phone, contact_email, seller_banned_at, platform_banned_at, safety_frozen_at, last_known_ip, last_device_fingerprint, created_at').eq('id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
    userId
      ? admin.from('violation_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('platform_activity_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(500)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('platform_messages').select('*, platform_conversations!inner(buyer_id, seller_id, listing_id)').eq('sender_id', userId).order('created_at', { ascending: false }).limit(200)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('listings').select('id, title, description, price, status, integrity_status, integrity_flags, coa_serial_number, created_at').eq('seller_id', userId).limit(100)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('orders').select('id, listing_id, buyer_id, seller_id, amount, status, paid_at, total_paid, created_at').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`).limit(100)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('dispute_cases').select('*').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`).limit(50)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('user_registration_fingerprints').select('*').eq('user_id', userId)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('banned_devices').select('*').eq('user_id', userId)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('banned_ips').select('*').eq('user_id', userId)
      : Promise.resolve({ data: [] }),
  ])

  const coaChain = userId ? await fetchCoaChainForUser(admin, userId) : { evidence_logs: [], files: [] }
  const violations = violationsRes.data ?? []
  const activityLogs = activityRes.data ?? []
  const disputes = disputesRes.data ?? []

  const timelineRows: { at: string; type: string; [k: string]: unknown }[] = []
  if (fraudCase.created_at) {
    timelineRows.push({ at: fraudCase.created_at as string, type: 'fraud_case_opened', severity: fraudCase.severity })
  }
  for (const v of violations) {
    timelineRows.push({ at: v.created_at as string, type: 'violation', violation_type: v.violation_type, severity: v.severity })
  }
  for (const a of activityLogs) {
    timelineRows.push({ at: a.created_at as string, type: 'activity', event_type: a.event_type, action: a.action })
  }
  for (const d of disputes) {
    timelineRows.push({ at: d.created_at as string, type: 'dispute', dispute_id: d.id, status: d.status })
  }

  const report = {
    case_id: caseId,
    user_id: userId,
    severity: fraudCase.severity,
    evidence: {
      fraud_case: fraudCase.evidence,
      violation_events: violations,
      orders: ordersRes.data ?? [],
      user_contact: {
        user_id: userId,
        public_display_name: profileRes.data?.public_display_name ?? null,
        contact_phone: profileRes.data?.contact_phone ?? null,
        contact_email: profileRes.data?.contact_email ?? authEmail,
        auth_email: authEmail,
      },
    },
    timeline: buildTimeline(timelineRows),
    device_data: {
      registration_fingerprints: regFpRes.data ?? [],
      banned_devices: bannedDevicesRes.data ?? [],
      profile_last_device_fingerprint: profileRes.data?.last_device_fingerprint ?? null,
    },
    ip_data: {
      profile_last_known_ip: profileRes.data?.last_known_ip ?? null,
      banned_ips: bannedIpsRes.data ?? [],
    },
    coa_chain: coaChain,
    messages: messagesRes.data ?? [],
    listings: listingsRes.data ?? [],
    disputes,
    activity_logs: activityLogs,
    meta: {
      prepared_at: new Date().toISOString(),
      requires_owner_approval: true,
      auto_send: false,
    },
  }

  const { data: saved, error: saveErr } = await admin
    .from('law_enforcement_reports')
    .upsert({
      fraud_case_id: caseId,
      user_id: userId,
      severity: fraudCase.severity as string,
      report,
      prepared_at: new Date().toISOString(),
    }, { onConflict: 'fraud_case_id' })
    .select('id')
    .single()

  if (saveErr || !saved?.id) return { ok: false, error: saveErr?.message ?? 'save_failed' }

  await admin.from('fraud_cases').update({
    law_enforcement_prepared: true,
    updated_at: new Date().toISOString(),
  }).eq('id', caseId)

  await admin.from('safety_report_drafts').insert({
    fraud_case_id: caseId,
    report_type: 'law_enforcement',
    payload: report,
  })

  return { ok: true, reportId: saved.id, payload: report }
}
