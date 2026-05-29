import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json, siteUrl } from '../_shared/stripe.ts'

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

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const serial = String(url.searchParams.get('serial') ?? '').trim().toUpperCase()

  if (!serial || !/^FS-\d{4}-\d{6}$/.test(serial)) {
    return json({ error: 'invalid_serial' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const { data: cert, error } = await admin
    .from('coa_certificates')
    .select('id, serial_number, status, issued_at, item_snapshot, listing_id, seller_id, revoked_at, revoked_reason, image_fingerprint, description_excerpt, primary_image_path')
    .eq('serial_number', serial)
    .maybeSingle()

  if (error) return json({ error: error.message }, 500)
  if (!cert) return json({ ok: false, valid: false, message: 'Serial not found in The Franks Standard registry.' })

  const { data: listing } = await admin
    .from('listings')
    .select('id, title, description, status, integrity_status, image_paths, coa_serial_number, floor_slot_code')
    .eq('id', cert.listing_id)
    .maybeSingle()

  const bucket = 'listings'
  const imagePath = cert.primary_image_path || listing?.image_paths?.[0]
  const imageUrl = imagePath
    ? `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${imagePath}`
    : null

  const currentFp = listing ? listingItemFingerprint(listing) : ''
  const itemUnchanged = !cert.image_fingerprint || currentFp === cert.image_fingerprint
  const slotMatch = listing
    ? (listing.floor_slot_code === cert.serial_number || listing.coa_serial_number === cert.serial_number)
    : false
  const officePaired = listing?.id === cert.listing_id && slotMatch && itemUnchanged

  return json({
    ok: true,
    valid: cert.status === 'active' && listing?.status === 'published' && listing?.integrity_status === 'clear' && officePaired,
    office_paired: officePaired,
    listing_id: cert.listing_id,
    floor_slot_code: cert.serial_number,
    item_unchanged: itemUnchanged,
    photos_or_copy_changed: cert.image_fingerprint ? !itemUnchanged : false,
    serial_number: cert.serial_number,
    certificate_status: cert.status,
    listing_status: listing?.status ?? 'unknown',
    integrity_status: listing?.integrity_status ?? null,
    issued_at: cert.issued_at,
    revoked_at: cert.revoked_at,
    revoked_reason: cert.revoked_reason,
    item: cert.item_snapshot,
    listing_title: listing?.title ?? (cert.item_snapshot as Record<string, string>)?.title,
    listing_url: listing?.id ? `${siteUrl()}/listing/${listing.id}` : null,
    image_url: imageUrl,
    certified_description: cert.description_excerpt || (cert.item_snapshot as Record<string, string>)?.description_excerpt,
    message: cert.status !== 'active'
      ? 'This COA has been revoked or superseded.'
      : listing?.integrity_status === 'counterfeit_confirmed'
        ? 'This item was removed as counterfeit.'
        : listing?.status !== 'published'
          ? 'Listing is no longer active.'
          : !officePaired && !itemUnchanged
            ? 'COA serial is valid but listing photos or description no longer match what was certified — do not treat as the same item.'
            : !slotMatch
              ? 'COA serial does not match this listing floor office number.'
              : 'Active Franks Standard COA — serial locked to this listing office and item photos.',
  })
})
