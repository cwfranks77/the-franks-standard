/**
 * Wire Brandy's Sporting Goods storefront in Supabase (store name, slug, contact email).
 * Requires SUPABASE_SERVICE_ROLE_KEY (never commit).
 *
 *   node scripts/setup-brandy-store.cjs
 */
require('dotenv').config()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || ''

const STORE_NAME = "Brandy's Sporting Goods"
const STORE_SLUG = 'brandysportingoods'
const CONTACT =
  process.env.BRANDY_STORE_CONTACT || 'info@brandysportingoods.com'

async function adminFetch (path, options = {}) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${typeof body === 'object' ? JSON.stringify(body) : body}`)
  }
  return body
}

async function resolveSellerId () {
  if (process.env.BRANDY_SELLER_ID) return process.env.BRANDY_SELLER_ID.trim()

  const email = (process.env.BRANDY_SELLER_EMAIL || '').trim().toLowerCase()
  if (email) {
    const users = await adminFetch(
      `/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    )
    const u = users?.users?.[0]
    if (u?.id) return u.id
    throw new Error(`No auth user for BRANDY_SELLER_EMAIL=${email}. Sign up at /auth/login first.`)
  }

  const profiles = await adminFetch(
    '/rest/v1/profiles?select=id,full_name,account_type&account_type=eq.seller&order=created_at.asc&limit=5',
  )
  if (!profiles?.length) {
    throw new Error(
      'No seller profile found. Set BRANDY_SELLER_ID or BRANDY_SELLER_EMAIL, or create a seller account.',
    )
  }
  const pick = profiles[0]
  console.warn(
    `No BRANDY_SELLER_ID set — using first seller profile: ${pick.full_name || pick.id} (${pick.id})`,
  )
  return pick.id
}

async function main () {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  const sellerId = await resolveSellerId()

  await adminFetch(`/rest/v1/profiles?id=eq.${sellerId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      store_name: STORE_NAME,
      store_slug: STORE_SLUG,
      account_type: 'seller',
    }),
  })
  console.log('OK profiles:', STORE_SLUG, sellerId)

  const existing = await adminFetch(
    `/rest/v1/seller_dropship_settings?seller_id=eq.${sellerId}&select=seller_id`,
  )
  const row = {
    seller_id: sellerId,
    store_contact_email: CONTACT,
    updated_at: new Date().toISOString(),
  }
  if (existing?.length) {
    await adminFetch(`/rest/v1/seller_dropship_settings?seller_id=eq.${sellerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ store_contact_email: CONTACT, updated_at: row.updated_at }),
    })
  } else {
    await adminFetch('/rest/v1/seller_dropship_settings', {
      method: 'POST',
      body: JSON.stringify({
        ...row,
        setup_complete: false,
        setup_step: 0,
        fulfillment_mode: 'manual',
      }),
      headers: { Prefer: 'resolution=merge-duplicates' },
    })
  }
  console.log('OK store contact:', CONTACT)
  console.log(`Store URL: https://thefranksstandard.com/store/${STORE_SLUG}`)
  console.log('Seller id (save in brandys-store.env):', sellerId)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})