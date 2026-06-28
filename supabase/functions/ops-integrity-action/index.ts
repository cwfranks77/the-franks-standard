import { createClient } from 'npm:@supabase/supabase-js@2'
import { scanListingIntegrity } from '../_shared/authenticityScan.ts'
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import {
  banSellerAfterIntegrityHold,
  DEFAULT_HOLD_DAYS,
  liftIntegrityHold,
  placeIntegrityHold,
} from '../_shared/sellerIntegrityHold.ts'
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

  if (action === 'list_listings') {
    const statusFilter = String(body.status ?? 'all')
    const search = String(body.search ?? '').trim()
    const limit = Math.min(Number(body.limit ?? 100) || 100, 200)

    let query = admin
      .from('listings')
      .select('id,title,description,category,status,integrity_status,price,created_at,seller_id,coa_serial_number,image_paths')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true, listings: data || [] })
  }

  const listingId = String(body.listing_id ?? '')
  const sellerId = String(body.seller_id ?? '')

  if (action === 'update_listing' && listingId) {
    const patch: Record<string, unknown> = {}
    const allowed = [
      'title',
      'description',
      'category',
      'price',
      'status',
      'condition',
      'integrity_status',
    ] as const

    for (const key of allowed) {
      if (body[key] !== undefined && body[key] !== null) {
        patch[key] = body[key]
      }
    }

    if (!Object.keys(patch).length) {
      return json({ error: 'no_fields_to_update' }, 400)
    }

    if (patch.status === 'published') {
      patch.integrity_scanned_at = new Date().toISOString()
    }

    const { data, error } = await admin
      .from('listings')
      .update(patch)
      .eq('id', listingId)
      .select('id,title,status,price,category,seller_id')
      .maybeSingle()

    if (error) return json({ error: error.message }, 500)
    if (!data) return json({ error: 'listing_not_found' }, 404)
    return json({ ok: true, listing: data })
  }

  if (action === 'suspend_listing' && listingId) {
    await admin.from('listings').update({
      status: 'archived',
      integrity_status: 'suspended',
      integrity_scanned_at: new Date().toISOString(),
    }).eq('id', listingId)
    return json({ ok: true })
  }

  if (action === 'delete_listing' && listingId) {
    const { error } = await admin.from('listings').delete().eq('id', listingId)
    if (error) {
      const fkBlocked = String(error.message || '').includes('foreign key') || error.code === '23503'
      if (!fkBlocked) return json({ error: error.message }, 500)

      await admin.from('listings').update({
        status: 'archived',
        integrity_status: 'suspended',
        integrity_scanned_at: new Date().toISOString(),
      }).eq('id', listingId)

      return json({
        ok: true,
        archived: true,
        deleted: listingId,
        note: 'Listing has order history — removed from marketplace (archived) instead of hard delete.',
      })
    }
    return json({ ok: true, deleted: listingId })
  }

  if (action === 'hold_seller_for_review') {
    const targetSeller = sellerId || ''
    if (!targetSeller && listingId) {
      const { data: listing } = await admin.from('listings').select('seller_id').eq('id', listingId).maybeSingle()
      if (listing?.seller_id) {
        const hold = await placeIntegrityHold(admin, {
          sellerId: listing.seller_id,
          listingId,
          reason: String(body.hold_reason ?? 'Authenticity review — wrong item, COA mismatch, or misrepresentation reported.'),
          holdDays: Number(body.hold_days ?? DEFAULT_HOLD_DAYS) || DEFAULT_HOLD_DAYS,
          opsNote: String(body.notes ?? '') || null,
        })
        if (!hold.ok) return json({ error: hold.error }, 500)

        const reportId = String(body.report_id ?? '')
        if (reportId) {
          await admin.from('authenticity_reports').update({
            status: 'under_review',
            resolution_notes: String(body.notes ?? 'Seller on integrity hold — evidence requested.'),
          }).eq('id', reportId)
        }

        return json({ ok: true, integrity_hold: true, expires_at: hold.expiresAt })
      }
      return json({ error: 'missing_seller' }, 400)
    }
    if (!targetSeller) return json({ error: 'missing_seller_id' }, 400)

    const hold = await placeIntegrityHold(admin, {
      sellerId: targetSeller,
      listingId: listingId || null,
      reason: String(body.hold_reason ?? 'Authenticity review — submit evidence to info@thefranksstandard.com.'),
      holdDays: Number(body.hold_days ?? DEFAULT_HOLD_DAYS) || DEFAULT_HOLD_DAYS,
      opsNote: String(body.notes ?? '') || null,
    })
    if (!hold.ok) return json({ error: hold.error }, 500)
    return json({ ok: true, integrity_hold: true, expires_at: hold.expiresAt })
  }

  if (action === 'lift_integrity_hold' && sellerId) {
    const lifted = await liftIntegrityHold(admin, {
      sellerId,
      opsNote: String(body.notes ?? '') || null,
    })
    if (!lifted.ok) return json({ error: lifted.error }, 500)
    return json({ ok: true, integrity_hold_lifted: true })
  }

  if (action === 'ban_seller_after_hold' && sellerId) {
    await banSellerAfterIntegrityHold(admin, {
      sellerId,
      banReason: String(body.ban_reason ?? 'Authenticity policy violation after review'),
      opsNote: String(body.notes ?? '') || null,
    })
    return json({ ok: true, seller_banned: true })
  }

  if (action === 'confirm_counterfeit' && listingId) {
    const banImmediately = body.ban_immediately === true || body.ban_immediately === 'true'
    const { data: listing } = await admin.from('listings').select('seller_id').eq('id', listingId).maybeSingle()
    await admin.from('listings').update({
      status: 'archived',
      integrity_status: 'counterfeit_confirmed',
      integrity_scanned_at: new Date().toISOString(),
    }).eq('id', listingId)

    let sellerBanned = false
    let integrityHold = false
    let holdExpiresAt: string | null = null

    if (listing?.seller_id) {
      if (banImmediately) {
        await admin.from('profiles').update({
          seller_banned_at: new Date().toISOString(),
          seller_ban_reason: String(body.ban_reason ?? 'Proven counterfeit / misrepresentation'),
          integrity_hold_at: null,
          integrity_hold_reason: null,
          integrity_hold_expires_at: null,
        }).eq('id', listing.seller_id)
        sellerBanned = true
      } else {
        const hold = await placeIntegrityHold(admin, {
          sellerId: listing.seller_id,
          listingId,
          reason: String(body.hold_reason ?? 'Counterfeit or misrepresentation confirmed on listing — account paused pending final review.'),
          holdDays: Number(body.hold_days ?? DEFAULT_HOLD_DAYS) || DEFAULT_HOLD_DAYS,
          opsNote: String(body.notes ?? '') || null,
          archivePublishedListings: true,
        })
        if (hold.ok) {
          integrityHold = true
          holdExpiresAt = hold.expiresAt
        }
      }
    }

    const reportId = String(body.report_id ?? '')
    if (reportId) {
      await admin.from('authenticity_reports').update({
        status: banImmediately ? 'confirmed' : 'under_review',
        resolution_notes: String(
          body.notes ??
            (banImmediately
              ? 'Counterfeit confirmed — listing removed, seller banned.'
              : 'Counterfeit confirmed on listing — seller on integrity hold for evidence window.'),
        ),
        resolved_at: banImmediately ? new Date().toISOString() : null,
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

    return json({
      ok: true,
      seller_banned: sellerBanned,
      integrity_hold: integrityHold,
      hold_expires_at: holdExpiresAt,
    })
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
