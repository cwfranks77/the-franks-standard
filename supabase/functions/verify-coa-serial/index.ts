import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'
import {
  buyerMayAccessCoa,
  coaReadyForPrint,
  listingItemFingerprint,
} from '../_shared/coaDocumentPolicy.ts'
import { verifyCoaCopyToken } from '../_shared/recordCoaPrintCopy.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const serial = String(url.searchParams.get('serial') ?? '').trim().toUpperCase()
  const copyToken = String(url.searchParams.get('copy') ?? '').trim().toUpperCase()
  if (!serial) return json({ error: 'serial_required' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  let copyRecord = null
  if (copyToken) {
    copyRecord = await verifyCoaCopyToken(admin, copyToken)
    if (!copyRecord || copyRecord.serial_number !== serial) {
      return json({
        valid: false,
        copy_valid: false,
        message: 'Copy ID not found or does not match this serial — may be an unauthorized photocopy.',
      })
    }
  }

  const { data: cert } = await admin
    .from('coa_certificates')
    .select('id, serial_number, listing_id, seller_id, status, auth_status, non_transferable, image_fingerprint, description_excerpt, item_snapshot, created_at, third_party_serial, document_source, seller_signature_name, seller_signed_at, primary_image_path')
    .eq('serial_number', serial)
    .maybeSingle()

  if (!cert) {
    return json({ valid: false, message: 'Serial not found in The Franks Standard registry.' })
  }

  const { data: listing } = await admin
    .from('listings')
    .select('id, title, description, image_paths, floor_slot_code, coa_serial_number, coa_auth_status, coa_buyer_access_enabled, status, seller_legal_name')
    .eq('id', cert.listing_id)
    .maybeSingle()

  if (!listing) {
    return json({ valid: false, message: 'Certificate exists but listing record is missing.' })
  }

  const currentFingerprint = listingItemFingerprint(listing)
  const itemUnchanged = currentFingerprint === cert.image_fingerprint
  const officePaired = listing.coa_serial_number === cert.serial_number
    || listing.floor_slot_code === cert.serial_number

  const printGate = coaReadyForPrint(
    { ...listing, coa_auth_status: listing.coa_auth_status || cert.auth_status },
    cert,
  )

  const base = 'https://thefranksstandard.com'

  return json({
    valid: cert.status === 'active' && cert.auth_status === 'verified' && officePaired,
    print_ready: printGate.ok,
    print_lock_reason: printGate.ok ? null : printGate.reason,
    print_lock_code: printGate.ok ? null : printGate.code,
    copy_valid: copyRecord ? true : undefined,
    copy_number: copyRecord?.copy_number,
    copy_token: copyRecord?.copy_token,
    copy_issued_at: copyRecord?.created_at,
    message: copyRecord
      ? `Registered copy #${copyRecord.copy_number} (${copyRecord.copy_token}) is on file for this certificate.`
      : cert.status !== 'active'
      ? 'Certificate suspended or revoked.'
      : !officePaired
        ? 'COA serial does not match this listing — non-transferable binding failed.'
        : !itemUnchanged
          ? 'Listing photos or description changed since certificate issue.'
          : 'Certificate matches listing snapshot.',
    serial: cert.serial_number,
    third_party_serial: cert.third_party_serial,
    floor_slot_code: listing.floor_slot_code || cert.serial_number,
    office_paired: officePaired,
    item_unchanged: itemUnchanged,
    certificate_status: cert.status,
    listing_title: listing.title,
    certified_description: cert.description_excerpt,
    issued_at: cert.created_at,
    non_transferable: cert.non_transferable,
    listing_url: `${base}/listing/${listing.id}`,
    buyer_may_download: buyerMayAccessCoa(listing, cert).ok,
  })
})
