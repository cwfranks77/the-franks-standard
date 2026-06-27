import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertAccountNotFrozen } from '../_shared/sellerAccountFreeze.ts'
import { recordCoaUpload } from '../_shared/coaChainOfCustody.ts'
import { recordCoaPrintCopy } from '../_shared/recordCoaPrintCopy.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'
import {
  COA_NON_TRANSFERABLE_NOTICE,
  formatDocumentSerial,
  listingHasBriefDescription,
  listingHasThumbnailImages,
  listingItemFingerprint,
  MIN_UPLOAD_BYTES,
  sellerMayPrintOrIssue,
} from '../_shared/coaDocumentPolicy.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

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
    listing_id?: string
    storage_path?: string
    mime_type?: string
    file_size_bytes?: number
    file_hash_sha256?: string
    third_party_serial?: string
    device_fingerprint?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const listingId = String(body.listing_id ?? '').trim()
  const storagePath = String(body.storage_path ?? '').trim()
  const thirdPartySerial = String(body.third_party_serial ?? '').trim().toUpperCase()
  const fileSize = Number(body.file_size_bytes ?? 0)
  const fileHash = String(body.file_hash_sha256 ?? '').trim().toLowerCase()

  if (!listingId || !storagePath) return json({ error: 'missing_fields' }, 400)
  if (!thirdPartySerial || thirdPartySerial.length < 3) {
    return json({ error: 'third_party_serial_required', message: 'Enter the serial number printed on your COA document.' }, 400)
  }
  if (fileSize > 0 && fileSize < MIN_UPLOAD_BYTES) {
    return json({ error: 'file_too_small', message: 'Uploaded COA file is too small — upload a readable scan or photo.' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const freeze = await assertAccountNotFrozen(admin, user.id)
  if (!freeze.ok) return json({ error: freeze.error, message: freeze.message }, 403)

  const { data: listing, error: listErr } = await admin
    .from('listings')
    .select('id, seller_id, title, description, image_paths, coa_certificate_id, coa_document_serial, coa_serial_number')
    .eq('id', listingId)
    .maybeSingle()

  if (listErr) return json({ error: listErr.message }, 500)
  if (!listing || listing.seller_id !== user.id) return json({ error: 'forbidden' }, 403)

  const gate = sellerMayPrintOrIssue(listing)
  if (!gate.ok) return json({ error: 'listing_incomplete', message: gate.reason }, 400)

  if (!listingHasThumbnailImages(listing) || !listingHasBriefDescription(listing)) {
    return json({ error: 'listing_incomplete', message: 'Item photos and description required before COA registration.' }, 400)
  }

  if (fileHash) {
    const { data: dupe } = await admin
      .from('coa_hashes')
      .select('id, coa_file_id')
      .eq('hash_sha256', fileHash)
      .limit(1)
      .maybeSingle()
    if (dupe?.id) {
      return json({
        error: 'duplicate_document',
        message: 'This exact COA file was already uploaded to the platform — each document must be unique.',
      }, 409)
    }
  }

  const { data: serialReuse } = await admin
    .from('coa_certificates')
    .select('id, listing_id')
    .eq('third_party_serial', thirdPartySerial)
    .neq('listing_id', listingId)
    .limit(1)
    .maybeSingle()

  if (serialReuse?.id) {
    return json({
      error: 'serial_already_bound',
      message: 'That third-party COA serial is already registered to another listing and cannot be transferred.',
    }, 409)
  }

  const year = new Date().getFullYear()
  const { data: seqRow } = await admin.from('coa_serial_sequences').select('last_number').eq('year', year).maybeSingle()
  const nextNum = (seqRow?.last_number ?? 0) + 1
  const documentSerial = formatDocumentSerial(year, nextNum)
  await admin.from('coa_serial_sequences').upsert({ year, last_number: nextNum }, { onConflict: 'year' })

  const fingerprint = listingItemFingerprint(listing)
  const description = String(listing.description || '').trim()

  const { data: cert, error: certErr } = await admin
    .from('coa_certificates')
    .insert({
      serial_number: documentSerial,
      listing_id: listingId,
      seller_id: user.id,
      status: 'active',
      document_source: 'third_party_upload',
      third_party_serial: thirdPartySerial,
      auth_status: 'verified',
      auth_notes: 'Auto-verified: mime scan + unique hash + listing snapshot bound.',
      item_snapshot: {
        title: listing.title,
        description_excerpt: description.slice(0, 500),
        image_paths: listing.image_paths,
        third_party_serial: thirdPartySerial,
        non_transferable_notice: COA_NON_TRANSFERABLE_NOTICE,
      },
      primary_image_path: (listing.image_paths as string[])[0],
      image_fingerprint: fingerprint,
      description_excerpt: description.slice(0, 500),
      non_transferable: true,
      buyer_access_enabled: false,
    })
    .select('id, serial_number')
    .single()

  if (certErr) return json({ error: certErr.message }, 500)

  const uploadResult = await recordCoaUpload(admin, {
    coaSerial: documentSerial,
    storagePath,
    mimeType: String(body.mime_type ?? ''),
    fileSizeBytes: fileSize || null,
    fileContentForHash: fileHash || `${storagePath}::${documentSerial}`,
    uploaderId: user.id,
    listingId,
    certificateId: cert.id,
    deviceFingerprint: String(body.device_fingerprint ?? '').trim() || null,
    ipAddress: clientIpFromRequest(req),
    metadata: {
      third_party_serial: thirdPartySerial,
      non_transferable: true,
      auth_status: 'verified',
    },
  })

  if (!uploadResult.ok) return json({ error: uploadResult.error }, 500)

  await recordCoaPrintCopy(admin, {
    certificateId: cert.id,
    serialNumber: documentSerial,
    issuedToUserId: user.id,
    listingId,
    copyType: 'original_issue',
    ipAddress: clientIpFromRequest(req),
    deviceFingerprint: String(body.device_fingerprint ?? '').trim() || null,
    metadata: { source: 'register-coa-upload', third_party_serial: thirdPartySerial },
  }).catch((e) => console.error('original upload COA copy log', e))

  await admin.from('coa_files').update({
    seller_id: user.id,
    listing_id: listingId,
    certificate_id: cert.id,
    auth_status: 'verified',
    document_source: 'third_party_upload',
    third_party_serial: thirdPartySerial,
    description_excerpt: description.slice(0, 500),
    item_image_fingerprint: fingerprint,
    non_transferable: true,
    buyer_access_enabled: false,
  }).eq('id', uploadResult.coaFileId)

  await admin.from('listings').update({
    coa_type: 'upload',
    coa_storage_path: storagePath,
    coa_certificate_id: cert.id,
    coa_document_serial: documentSerial,
    coa_serial_number: documentSerial,
    third_party_coa_serial: thirdPartySerial,
    coa_auth_status: 'verified',
    coa_buyer_access_enabled: false,
  }).eq('id', listingId)

  return json({
    ok: true,
    document_serial: documentSerial,
    third_party_serial: thirdPartySerial,
    certificate_id: cert.id,
    coa_file_id: uploadResult.coaFileId,
    hash_sha256: uploadResult.hashSha256,
    non_transferable_notice: COA_NON_TRANSFERABLE_NOTICE,
    buyer_access: 'locked_until_purchase',
  })
})
