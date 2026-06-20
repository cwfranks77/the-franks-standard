const { statusEnvelope } = require('./_shared.js')

async function getUserStatus (admin) {
  const errors = []
  const warnings = []
  const alerts = []
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: bannedUsers },
    { count: frozenUsers },
    { count: sellers },
    { count: phoneVerify },
    { count: newUsers7d },
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).not('platform_banned_at', 'is', null),
    admin.from('profiles').select('id', { count: 'exact', head: true }).not('safety_frozen_at', 'is', null),
    admin.from('profiles').select('id', { count: 'exact', head: true }).not('stripe_account_id', 'is', null),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('requires_phone_verification', true),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
  ])

  const { data: testUsers } = await admin
    .from('profiles')
    .select('id, contact_email, store_name')
    .or('contact_email.ilike.test%@%,store_name.ilike.[test]%')
    .limit(20)

  if ((testUsers ?? []).length > 0) warnings.push(`test_users_remaining:${testUsers.length}`)

  return statusEnvelope({
    counts: {
      total_users: totalUsers ?? 0,
      banned_users: bannedUsers ?? 0,
      frozen_users: frozenUsers ?? 0,
      sellers_with_stripe: sellers ?? 0,
      phone_verification_required: phoneVerify ?? 0,
      new_users_7d: newUsers7d ?? 0,
    },
    summaries: {
      test_user_sample: testUsers ?? [],
    },
    alerts,
    warnings,
    errors,
  })
}

module.exports = { getUserStatus }
