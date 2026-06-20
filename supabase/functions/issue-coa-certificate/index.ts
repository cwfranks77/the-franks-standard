import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertAccountNotFrozen } from '../_shared/sellerAccountFreeze.ts'
import { assertSellerPoliciesAccepted } from '../_shared/sellerPolicyAcceptance.ts'
import { recordCoaIssued } from '../_shared/coaChainOfCustody.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'
import { corsHeaders, json, siteUrl } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

function formatSerial (year: number, n: number) {
  return `FS-${year}-${String(n).padStart(6, '0')}`
}

/** Fingerprint of photos + title + description at issue time. */
function listingItemFingerprint (listing: {
  image_paths?: string[] | null
  title?: string
  description?: string
}) {
  const paths = [...(listing.image_paths || [])].sort()
  const title = String(listing.title || '').trim()
  const description = String(listing.description || '').trim()
  return `${paths.join('|')}::${title}::${description}`
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

  let body: { listing_id?: string; device_fingerprint?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const listingId = String(body.listing_id ?? '').trim()
  if (!listingId) return json({ error: 'missing_listing_id' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const freeze = await assertAccountNotFrozen(admin, user.id)
  if (!freeze.ok) return json({ error: freeze.error, message: freeze.message }, 403)

  const policies = await assertSellerPoliciesAccepted(admin, user.id)
  if (!policies.ok) return json({ error: policies.error, message: policies.message }, 403)

  const { data: listing, error: listErr } = await admin
    .from('listings')
    .select('id, seller_id, title, description, category, condition, price, image_paths, coa_certificate_id, coa_serial_number, floor_slot_code')
    .eq('id', listingId)
    .maybeSingle()

  if (listErr) return json({ error: listErr.message }, 500)
  if (!listing || listing.seller_id !== user.id) return json({ error: 'forbidden' }, 403)

  const images = (listing.image_paths as string[] | null) || []
  const description = String(listing.description || '').trim()
  if (!images.length) {
    return json({ error: 'photos_required', message: 'Upload item photos before issuing a Franks COA.' }, 400)
  }
  if (description.length < 20) {
    return json({ error: 'description_required', message: 'Add a full item description before COA issue — it is frozen on the certificate.' }, 400)
  }

  if (listing.coa_certificate_id && listing.coa_serial_number) {
    return json({
      ok: true,
      serial_number: listing.coa_serial_number,
      verify_url: `${siteUrl()}/verify/coa/${listing.coa_serial_number}`,
      already_issued: true,
    })
  }

  const year = new Date().getFullYear()

  const { data: seqRow } = await admin
    .from('coa_serial_sequences')
    .select('last_number')
    .eq('year', year)
    .maybeSingle()

  const nextNum = (seqRow?.last_number ?? 0) + 1
  const serial = formatSerial(year, nextNum)

  await admin.from('coa_serial_sequences').upsert({ year, last_number: nextNum }, { onConflict: 'year' })

  const fingerprint = listingItemFingerprint(listing)
  const coaDisclosure =
    'The Franks Standard COA is a platform-issued document template only. It is not a guarantee or warranty by The Franks Standard LLC. The seller backs authenticity of this item.'

  const snapshot = {
    title: listing.title,
    description_excerpt: description.slice(0, 500),
    category: listing.category,
    condition: listing.condition,
    price: listing.price,
    issued_year: year,
    image_paths: images,
    listing_id: listingId,
    floor_slot_code: serial,
    coa_disclosure_fine_print: coaDisclosure,
  }

  const { data: cert, error: certErr } = await admin
    .from('coa_certificates')
    .insert({
      serial_number: serial,
      listing_id: listingId,
      seller_id: user.id,
      status: 'active',
      item_snapshot: snapshot,
      primary_image_path: images[0],
      image_fingerprint: fingerprint,
      description_excerpt: description.slice(0, 500),
    })
    .select('id, serial_number')
    .single()

  if (certErr) return json({ error: certErr.message }, 500)

  const { error: updErr } = await admin
    .from('listings')
    .update({
      coa_type: 'franks_issued',
      coa_certificate_id: cert.id,
      coa_serial_number: serial,
      floor_slot_code: serial,
    })
    .eq('id', listingId)

  if (updErr) return json({ error: updErr.message }, 500)

  await recordCoaIssued(admin, {
    coaSerial: serial,
    listingId,
    certificateId: cert.id,
    sellerId: user.id,
    itemFingerprint: fingerprint,
    ipAddress: clientIpFromRequest(req),
    deviceFingerprint: String((body as { device_fingerprint?: string }).device_fingerprint ?? '').trim() || null,
  })

  return json({
    ok: true,
    certificate_id: cert.id,
    serial_number: cert.serial_number,
    floor_slot_code: serial,
    listing_id: listingId,
    verify_url: `${siteUrl()}/verify/coa/${cert.serial_number}`,
    listing_url: `${siteUrl()}/listing/${listingId}`,
  })
})
