const { statusEnvelope } = require('./_shared.js')
const { loadPlatformConfig } = require('./load_config.js')

async function getStoreStatus (admin) {
  const errors = []
  const warnings = []
  const alerts = []
  const config = loadPlatformConfig()

  const [
    { count: totalStores },
    { count: publishedListings },
    { count: integrityHold },
    { count: searchIndexed },
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }).not('store_slug', 'is', null),
    admin.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    admin.from('listings').select('id', { count: 'exact', head: true }).eq('integrity_status', 'hold'),
    admin.from('search_index_listings').select('listing_id', { count: 'exact', head: true }),
  ])

  const indexGap = (publishedListings ?? 0) - (searchIndexed ?? 0)
  if (indexGap > 50) warnings.push(`search_index_gap:${indexGap}`)

  const { data: topStores } = await admin
    .from('profiles')
    .select('id, store_name, store_slug, seller_tier')
    .not('store_slug', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  return statusEnvelope({
    counts: {
      stores: totalStores ?? 0,
      published_listings: publishedListings ?? 0,
      integrity_hold_listings: integrityHold ?? 0,
      search_indexed: searchIndexed ?? 0,
    },
    summaries: {
      spotlight_enabled: config.spotlight_enabled,
      featured_store_id: config.featured_store_id,
      recent_stores: topStores ?? [],
      search_index_gap: indexGap,
    },
    alerts,
    warnings,
    errors,
  })
}

module.exports = { getStoreStatus }
