/**
 * Archive all published listings for a seller (admin/service role only).
 * Usage: set SUPABASE_SERVICE_ROLE_KEY in env, then:
 *   node scripts/archive-seller-listings.cjs [seller_id]
 */
const sellerId = process.argv[2] || '901ccd01-c7c5-4120-8c20-8a84787befb8'
const url = (process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://rochesyrxiyrxhzmkuwk.supabase.co').replace(/\/$/, '')
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || ''

if (!key) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY (Supabase → Settings → API → service_role).')
  process.exit(1)
}

async function main () {
  const res = await fetch(`${url}/rest/v1/listings?seller_id=eq.${sellerId}&status=eq.published`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status: 'archived' }),
  })
  const text = await res.text()
  if (!res.ok) {
    console.error('Failed:', res.status, text)
    process.exit(1)
  }
  const rows = JSON.parse(text || '[]')
  console.log(`Archived ${rows.length} listing(s) for seller ${sellerId}.`)
  rows.forEach((r) => console.log(`  - ${r.title} (${r.id})`))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
