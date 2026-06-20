/**
 * Law enforcement report packager — gathers evidence, saves to law_enforcement_reports.
 * NEVER sends automatically. Owner must review and submit externally.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} fraudCaseId
 */
const { fetchCoaChainForUser } = require('../_shared/fetchCoaChain')
const { timelineFromSources } = require('../_shared/buildTimeline')

async function prepareLawEnforcementReport (admin, fraudCaseId) {
  const { data: fraudCase, error: caseErr } = await admin
    .from('fraud_cases')
    .select('*')
    .eq('id', fraudCaseId)
    .maybeSingle()

  if (caseErr || !fraudCase) {
    return { ok: false, error: caseErr?.message ?? 'case_not_found' }
  }

  const userId = fraudCase.user_id

  let authEmail = null
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
      ? admin.from('profiles').select(
        'id, public_display_name, contact_phone, contact_email, seller_banned_at, platform_banned_at, safety_frozen_at, last_known_ip, last_device_fingerprint, created_at, terms_accepted, monitoring_consent',
      ).eq('id', userId).maybeSingle()
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
      ? admin.from('listings').select('id, title, description, price, status, integrity_status, integrity_flags, coa_serial_number, created_at, updated_at').eq('seller_id', userId).limit(100)
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

  const deviceData = {
    registration_fingerprints: regFpRes.data ?? [],
    banned_devices: bannedDevicesRes.data ?? [],
    profile_last_device_fingerprint: profileRes.data?.last_device_fingerprint ?? null,
  }

  const ipData = {
    profile_last_known_ip: profileRes.data?.last_known_ip ?? null,
    banned_ips: bannedIpsRes.data ?? [],
    coa_log_ips: (coaChain.evidence_logs ?? [])
      .map((l) => ({ at: l.created_at, ip_address: l.ip_address, event_type: l.event_type }))
      .filter((r) => r.ip_address),
  }

  const userContact = {
    user_id: userId,
    public_display_name: profileRes.data?.public_display_name ?? null,
    contact_phone: profileRes.data?.contact_phone ?? null,
    contact_email: profileRes.data?.contact_email ?? authEmail,
    auth_email: authEmail,
    note: 'Included for lawful law-enforcement disclosure. Do not distribute outside official channels.',
  }

  const report = {
    case_id: fraudCaseId,
    user_id: userId,
    severity: fraudCase.severity,
    evidence: {
      fraud_case: fraudCase.evidence,
      violation_events: violations,
      orders: ordersRes.data ?? [],
      user_contact: userContact,
    },
    timeline: timelineFromSources({
      violations,
      activityLogs,
      disputes,
      fraudCase,
    }),
    device_data: deviceData,
    ip_data: ipData,
    coa_chain: coaChain,
    messages: messagesRes.data ?? [],
    listings: listingsRes.data ?? [],
    disputes,
    activity_logs: activityLogs,
    meta: {
      prepared_at: new Date().toISOString(),
      requires_owner_approval: true,
      auto_send: false,
      audit_note: 'Package prepared for owner review. Do not transmit without explicit approval.',
    },
  }

  const { data: saved, error: saveErr } = await admin
    .from('law_enforcement_reports')
    .upsert({
      fraud_case_id: fraudCaseId,
      case_id: fraudCaseId,
      user_id: userId,
      severity: fraudCase.severity,
      report,
      report_json: report,
      prepared_at: new Date().toISOString(),
    }, { onConflict: 'fraud_case_id' })
    .select('id')
    .single()

  if (saveErr || !saved?.id) {
    return { ok: false, error: saveErr?.message ?? 'save_failed' }
  }

  await admin.from('fraud_cases').update({
    law_enforcement_prepared: true,
    updated_at: new Date().toISOString(),
  }).eq('id', fraudCaseId)

  return { ok: true, reportId: saved.id, report }
}

module.exports = { prepareLawEnforcementReport }
