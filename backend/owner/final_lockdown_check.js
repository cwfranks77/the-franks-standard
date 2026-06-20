/**
 * Final system lockdown check — pre-launch security audit.
 */

const { validatePlatform, REQUIRED_TABLES } = require('../launch/validate_platform.js')
const { OWNER_ROUTE_PREFIXES } = require('../security/owner_only.js')
const { TEST_TITLE_PATTERN } = require('../launch/cleanup.js')

const REQUIRED_OWNER_ENDPOINTS = [
  '/api/owner/status/platform',
  '/api/owner/launch/readiness',
  '/api/owner/emergency/shutdown',
  '/api/owner/export/audit',
]

const SECURITY_MODULES = [
  '../security/rate_limit.js',
  '../security/brute_force.js',
  '../security/owner_only.js',
  '../security/device_fingerprint.js',
  '../security/ip_risk.js',
]

async function finalLockdownCheck (admin) {
  const issues = []

  const opsHash = process.env.OPS_ACCESS_KEY_HASH || process.env.NUXT_OPS_ACCESS_KEY_HASH || ''
  if (!opsHash) issues.push('owner_ops_key_hash_not_configured')

  for (const prefix of OWNER_ROUTE_PREFIXES) {
    if (!prefix.startsWith('/api/owner') && prefix !== '/api/reports') continue
  }

  for (const ep of REQUIRED_OWNER_ENDPOINTS) {
    if (!ep.startsWith('/api/owner')) issues.push(`owner_endpoint_unverified:${ep}`)
  }

  const debugPatterns = ['debug', 'test-only', '__nuxt']
  for (const p of debugPatterns) {
    if (process.env[`NUXT_PUBLIC_${p.toUpperCase()}`]) {
      issues.push(`debug_env_exposed:${p}`)
    }
  }

  if (admin) {
    const { data: testListings } = await admin
      .from('listings')
      .select('id, title')
      .or('title.ilike.[test]%,title.ilike.test listing%')
      .limit(5)

    if ((testListings ?? []).some((l) => TEST_TITLE_PATTERN.test(l.title || ''))) {
      issues.push(`test_data_remaining:listings:${testListings.length}`)
    }

    const validation = await validatePlatform(admin)
    issues.push(...validation.errors.map((e) => `validation:${e}`))

    const { count: published } = await admin.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'published')
    const { count: indexed } = await admin.from('search_index_listings').select('listing_id', { count: 'exact', head: true })
    if ((published ?? 0) > 0 && (indexed ?? 0) === 0) {
      issues.push('search_index_empty_with_published_listings')
    }

    for (const table of ['launch_lock', 'owner_alerts', 'owner_api_keys']) {
      const { error } = await admin.from(table).select('id').limit(1)
      if (error && /does not exist/i.test(error.message)) {
        issues.push(`missing_migration_table:${table}`)
      }
    }
  } else {
    issues.push('supabase_admin_unavailable')
  }

  for (const mod of SECURITY_MODULES) {
    try {
      require(mod)
    } catch {
      issues.push(`security_module_missing:${mod}`)
    }
  }

  return {
    secure: issues.length === 0,
    issues,
    checked_at: new Date().toISOString(),
    tables_expected: REQUIRED_TABLES.length,
    owner_route_prefixes: OWNER_ROUTE_PREFIXES,
  }
}

module.exports = { finalLockdownCheck }
