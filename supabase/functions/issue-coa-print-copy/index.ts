import { createClient } from 'npm:@supabase/supabase-js@2'

import { assertAccountNotFrozen } from '../_shared/sellerAccountFreeze.ts'

import {
  buyerCoaReadyForPrint,
  coaReadyForPrint,
} from '../_shared/coaDocumentPolicy.ts'

import { recordCoaPrintCopy, verifyCoaCopyToken } from '../_shared/recordCoaPrintCopy.ts'

import { clientIpFromRequest } from '../_shared/requestContext.ts'

import { corsHeaders, json, siteUrl } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

function documentPayload (
  cert: Record<string, unknown>,
  listing: Record<string, unknown>,
  snapshot: Record<string, unknown>,
  base: string,
  copyToken: string,
) {
  const primaryPath = String(cert.primary_image_path || '').trim()
  if (!primaryPath) return null

  return {
    serial: cert.serial_number,
    floor_slot: listing.coa_serial_number || cert.serial_number,
    title: listing.title || snapshot.title,
    description_excerpt: cert.description_excerpt || String(listing.description || '').slice(0, 500),
    seller_name: cert.seller_signature_name || listing.seller_legal_name || '',
    seller_signed_at: cert.seller_signed_at,
    issued_at: cert.created_at,
    third_party_serial: cert.third_party_serial,
    document_source: cert.document_source,
    non_transferable: cert.non_transferable,
    primary_image_path: primaryPath,
    verify_url: `${base}/verify/coa/${cert.serial_number}`,
    copy_verify_url: `${base}/verify/coa/${cert.serial_number}?copy=${encodeURIComponent(copyToken)}`,
    document_url: `${base}/coa/document/${cert.serial_number}?copy=${encodeURIComponent(copyToken)}`,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) return json({ error: 'unauthorized' }, 401)

  let body: {
    serial?: string
    listing_id?: string
    copy_type?: 'view' | 'print' | 'download'
    copy_token?: string
    device_fingerprint?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const serial = String(body.serial ?? '').trim().toUpperCase()
  const listingId = String(body.listing_id ?? '').trim()
  const copyType = (body.copy_type === 'print' || body.copy_type === 'download') ? body.copy_type : 'view'
  const existingCopyToken = String(body.copy_token ?? '').trim().toUpperCase()
  if (!serial) return json({ error: 'serial_required' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const freeze = await assertAccountNotFrozen(admin, user.id)
  if (!freeze.ok) return json({ error: freeze.error, message: freeze.message }, 403)

  const { data: cert } = await admin
    .from('coa_certificates')
    .select('id, serial_number, listing_id, seller_id, status, auth_status, document_source, third_party_serial, description_excerpt, item_snapshot, seller_signature_name, seller_signed_at, primary_image_path, image_fingerprint, created_at, non_transferable')
    .eq('serial_number', serial)
    .maybeSingle()

  if (!cert || cert.status !== 'active') {
    return json({ error: 'certificate_not_found', message: 'Certificate not found or not active.' }, 404)
  }

  const { data: listing } = await admin
    .from('listings')
    .select('id, seller_id, title, description, image_paths, coa_serial_number, coa_document_serial, coa_auth_status, coa_buyer_access_enabled, coa_type, seller_legal_name')
    .eq('id', cert.listing_id)
    .maybeSingle()

  if (!listing) return json({ error: 'listing_not_found' }, 404)
  if (listingId && listing.id !== listingId) {
    return json({ error: 'listing_mismatch', message: 'Serial does not match this listing.' }, 409)
  }

  const isSeller = listing.seller_id === user.id
  let gate = isSeller
    ? coaReadyForPrint(listing, cert)
    : { ok: false as boolean, reason: '', code: '' }

  if (!isSeller) {
    const { data: paidOrder } = await admin
      .from('orders')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('buyer_id', user.id)
      .eq('status', 'paid')
      .limit(1)
      .maybeSingle()
    if (!paidOrder?.id) {
      return json({
        error: 'access_denied',
        code: 'not_buyer',
        message: 'COA copies are only issued to the seller or the buyer who completed purchase.',
      }, 403)
    }
    gate = buyerCoaReadyForPrint(listing, cert)
  }

  if (!gate.ok) {
    return json({
      error: 'coa_locked',
      code: gate.code || 'gate_failed',
      message: gate.reason || 'COA print is locked until item photos, description, serial, and verification are complete.',
    }, 403)
  }

  const snapshot = (cert.item_snapshot as Record<string, unknown>) || {}
  const base = siteUrl()

  if (existingCopyToken && copyType === 'view') {
    const existing = await verifyCoaCopyToken(admin, existingCopyToken)
    if (!existing || existing.serial_number !== serial) {
      return json({
        error: 'invalid_copy',
        message: 'Copy ID not found or does not match this serial.',
      }, 404)
    }
    if (existing.issued_to_user_id !== user.id) {
      return json({
        error: 'access_denied',
        message: 'This copy ID was issued to another account.',
      }, 403)
    }
    const doc = documentPayload(cert, listing, snapshot, base, existing.copy_token)
    if (!doc) {
      return json({
        error: 'coa_locked',
        code: 'cert_thumbnail_missing',
        message: 'Item thumbnail must be frozen on the certificate before print.',
      }, 403)
    }
    return json({
      ok: true,
      copy_number: existing.copy_number,
      copy_token: existing.copy_token,
      copy_id: existing.id,
      reopened: true,
      document: doc,
    })
  }

  const copyResult = await recordCoaPrintCopy(admin, {
    certificateId: cert.id,
    serialNumber: cert.serial_number,
    issuedToUserId: user.id,
    listingId: listing.id,
    copyType,
    deviceFingerprint: String(body.device_fingerprint ?? '').trim() || null,
    ipAddress: clientIpFromRequest(req),
    metadata: { requested_via: 'issue-coa-print-copy' },
  })

  if (!copyResult.ok) return json({ error: copyResult.error }, 500)

  const doc = documentPayload(cert, listing, snapshot, base, copyResult.copyToken)
  if (!doc) {
    return json({
      error: 'coa_locked',
      code: 'cert_thumbnail_missing',
      message: 'Item thumbnail must be frozen on the certificate before print.',
    }, 403)
  }

  return json({
    ok: true,
    copy_number: copyResult.copyNumber,
    copy_token: copyResult.copyToken,
    copy_id: copyResult.copyId,
    document: doc,
  })
})
