import { createClient } from 'npm:@supabase/supabase-js@2'
import { scanListingIntegrity } from '../_shared/authenticityScan.ts'
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const opsKey = String(body.ops_key ?? '')
  if (!(await verifyOpsKey(opsKey))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const action = String(body.action ?? '')

  if (action === 'scan_all') {
    const { data: rows, error } = await admin
      .from('listings')
      .select('id, title, description, category, price, coa_type, coa_storage_path, guarantee_signed, status, integrity_status')
      .eq('status', 'published')

    if (error) return json({ error: error.message }, 500)

    const results: unknown[] = []
    for (const row of rows || []) {
      const scan = scanListingIntegrity(row)
      let nextStatus = row.integrity_status
      if (row.integrity_status === 'counterfeit_confirmed' || row.integrity_status === 'suspended') {
        results.push({ id: row.id, title: row.title, skipped: true, integrity_status: row.integrity_status })
        continue
      }
      if (scan.severity === 'block') nextStatus = 'review'
      else if (scan.severity === 'review' || scan.score >= 25) nextStatus = 'review'
      else nextStatus = 'clear'

      await admin.from('listings').update({
        integrity_flags: scan.flags,
        integrity_score: scan.score,
        integrity_status: nextStatus,
        integrity_scanned_at: new Date().toISOString(),
      }).eq('id', row.id)

      results.push({ id: row.id, title: row.title, score: scan.score, severity: scan.severity, integrity_status: nextStatus, flags: scan.flags })
    }

    return json({ ok: true, scanned: results.length, results })
  }

  if (action === 'list_queue') {
    const { data: flagged } = await admin
      .from('listings')
      .select('id, title, category, integrity_status, integrity_score, integrity_flags, integrity_scanned_at, seller_id, coa_type, coa_serial_number, created_at')
      .in('integrity_status', ['review', 'suspended', 'counterfeit_confirmed'])
      .order('integrity_score', { ascending: false })
      .limit(100)

    const { data: reports } = await admin
      .from('authenticity_reports')
      .select('id, listing_id, reason, details, status, created_at, reporter_email')
      .in('status', ['open', 'under_review'])
      .order('created_at', { ascending: false })
      .limit(100)

    return json({ ok: true, flagged: flagged || [], reports: reports || [] })
  }

  const listingId = String(body.listing_id ?? '')
  const sellerId = String(body.seller_id ?? '')

  if (action === 'suspend_listing' && listingId) {
    await admin.from('listings').update({
      status: 'archived',
      integrity_status: 'suspended',
      integrity_scanned_at: new Date().toISOString(),
    }).eq('id', listingId)
    return json({ ok: true })
  }

  if (action === 'confirm_counterfeit' && listingId) {
    const { data: listing } = await admin.from('listings').select('seller_id').eq('id', listingId).maybeSingle()
    await admin.from('listings').update({
      status: 'archived',
      integrity_status: 'counterfeit_confirmed',
      integrity_scanned_at: new Date().toISOString(),
    }).eq('id', listingId)

    if (listing?.seller_id) {
      await admin.from('profiles').update({
        seller_banned_at: new Date().toISOString(),
        seller_ban_reason: String(body.ban_reason ?? 'Proven counterfeit / misrepresentation'),
      }).eq('id', listing.seller_id)
    }

    const reportId = String(body.report_id ?? '')
    if (reportId) {
      await admin.from('authenticity_reports').update({
        status: 'confirmed',
        resolution_notes: String(body.notes ?? 'Counterfeit confirmed — listing removed, seller banned.'),
        resolved_at: new Date().toISOString(),
      }).eq('id', reportId)
    }

    const certId = String(body.coa_certificate_id ?? '')
    if (certId) {
      await admin.from('coa_certificates').update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_reason: 'counterfeit_confirmed',
      }).eq('id', certId)
    }

    return json({ ok: true, seller_banned: !!listing?.seller_id })
  }

  if (action === 'clear_listing' && listingId) {
    await admin.from('listings').update({
      integrity_status: 'clear',
      integrity_flags: [],
      integrity_score: 0,
      integrity_scanned_at: new Date().toISOString(),
    }).eq('id', listingId)
    return json({ ok: true })
  }

  if (action === 'dismiss_report') {
    const reportId = String(body.report_id ?? '')
    if (!reportId) return json({ error: 'missing_report_id' }, 400)
    await admin.from('authenticity_reports').update({
      status: 'dismissed',
      resolution_notes: String(body.notes ?? 'Dismissed after review.'),
      resolved_at: new Date().toISOString(),
    }).eq('id', reportId)
    return json({ ok: true })
  }

  if (action === 'ban_seller' && sellerId) {
    await admin.from('profiles').update({
      seller_banned_at: new Date().toISOString(),
      seller_ban_reason: String(body.ban_reason ?? 'Authenticity policy violation'),
    }).eq('id', sellerId)
    await admin.from('listings').update({ status: 'archived', integrity_status: 'suspended' }).eq('seller_id', sellerId).eq('status', 'published')
    return json({ ok: true })
  }

  return json({ error: 'unknown_action' }, 400)
})
