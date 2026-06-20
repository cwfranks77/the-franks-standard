/**
 * Create marketplace listing — backend handler (Express + Nitro).
 */

async function createListing (admin, {
  sellerId,
  listing = {},
  flags = [],
  publish = false,
}) {
  if (!admin) return { ok: false, error: 'supabase_unavailable' }
  if (!sellerId) return { ok: false, error: 'unauthorized', status: 401 }

  const title = String(listing.title ?? '').trim()
  const description = String(listing.description ?? '').trim()
  const category = String(listing.category ?? 'general').trim() || 'general'
  const price = Number(listing.price)
  const condition = String(listing.condition ?? 'good').trim() || 'good'
  const coaType = String(listing.coa_type ?? 'none').trim() || 'none'

  if (!title) return { ok: false, error: 'title_required', status: 400 }
  if (!Number.isFinite(price) || price <= 0) return { ok: false, error: 'invalid_price', status: 400 }

  const { data: profile } = await admin
    .from('profiles')
    .select('id, seller_banned_at, seller_policies_accepted_at, account_frozen_at')
    .eq('id', sellerId)
    .maybeSingle()

  if (!profile) return { ok: false, error: 'seller_not_found', status: 404 }
  if (profile.seller_banned_at) return { ok: false, error: 'seller_banned', status: 403 }
  if (profile.account_frozen_at) return { ok: false, error: 'account_frozen', status: 403 }
  if (!profile.seller_policies_accepted_at) return { ok: false, error: 'seller_not_verified', status: 403 }

  const payload = {
    seller_id: sellerId,
    title: title.slice(0, 200),
    description: description.slice(0, 8000),
    category,
    price,
    condition,
    coa_type: coaType,
    status: publish ? 'published' : 'draft',
    sale_type: String(listing.sale_type ?? 'fixed').trim() || 'fixed',
    listing_mode: String(listing.listing_mode ?? 'direct').trim() || 'direct',
    integrity_status: flags.length ? 'review' : 'clear',
  }

  const { data, error } = await admin.from('listings').insert(payload).select('id, status, integrity_status').single()
  if (error) return { ok: false, error: error.message, status: 400 }

  if (flags.length) {
    const { persistListingViolationFlags } = require('./marketplace_enforcement.js')
    await persistListingViolationFlags(admin, {
      userId: sellerId,
      listing: payload,
      flags,
    }).catch(() => {})
  }

  const { logListingCreated } = require('../activity/activity_recorder.js')
  await logListingCreated(sellerId, data.id, admin).catch(() => {})

  return {
    ok: true,
    listing_id: data.id,
    status: data.status,
    integrity_status: data.integrity_status,
    flags,
  }
}

module.exports = { createListing }
