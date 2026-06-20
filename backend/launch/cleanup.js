/**
 * Pre-launch test data cleanup — table-specific test patterns.
 */

const TEST_EMAIL_PATTERN = /^(test|demo|qa|sandbox)@/i
const TEST_TITLE_PATTERN = /^\[test\]|^test listing|^demo /i

async function cleanupTestData (admin, { dryRun = true, ownerConfirmed = false } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }
  if (!dryRun && !ownerConfirmed) {
    return { ok: false, error: 'owner_confirmation_required', message: 'Set ownerConfirmed:true to execute destructive cleanup.' }
  }

  const report = { dry_run: dryRun, removed: {}, errors: [] }

  const run = async (label, fn) => {
    try {
      report.removed[label] = await fn()
    } catch (e) {
      report.errors.push(`${label}:${e.message}`)
    }
  }

  await run('test_listings', () => cleanupListings(admin, dryRun))
  await run('test_users', () => cleanupTestUsers(admin, { dryRun }).then((r) => r.count ?? 0))
  await run('test_orders', () => cleanupOrders(admin, dryRun))
  await run('test_payouts', () => cleanupPayouts(admin, dryRun))
  await run('test_disputes', () => cleanupDisputes(admin, dryRun))
  await run('test_fraud_cases', () => cleanupFraudCases(admin, dryRun))
  await run('test_coa_files', () => cleanupCoaFiles(admin, dryRun))
  await run('test_messages', () => cleanupMessages(admin, dryRun))
  await run('test_notifications', () => cleanupNotifications(admin, dryRun))

  if (!dryRun) {
    await admin.from('audit_logs').insert({
      actor_type: 'ops',
      actor_id: 'launch_cleanup',
      action: 'pre_launch_cleanup',
      target_type: 'platform',
      details: report,
    })
  }

  return { ok: report.errors.length === 0, ...report }
}

async function cleanupListings (admin, dryRun) {
  const { data: rows } = await admin
    .from('listings')
    .select('id, title')
    .or('title.ilike.[test]%,title.ilike.test listing%,title.ilike.demo %')
  const ids = (rows ?? []).filter((r) => TEST_TITLE_PATTERN.test(r.title || '')).map((r) => r.id)
  if (!ids.length) return 0
  if (dryRun) return ids.length
  await admin.from('listings').delete().in('id', ids)
  return ids.length
}

async function cleanupOrders (admin, dryRun) {
  const { data: rows } = await admin.from('orders').select('id, buyer_email').ilike('buyer_email', 'test%@%').limit(200)
  const ids = (rows ?? []).filter((o) => TEST_EMAIL_PATTERN.test(o.buyer_email || '')).map((o) => o.id)
  if (!ids.length) return 0
  if (dryRun) return ids.length
  await admin.from('orders').delete().in('id', ids)
  return ids.length
}

async function cleanupPayouts (admin, dryRun) {
  const { data: rows } = await admin.from('payouts').select('id, reference').ilike('reference', 'test%').limit(200)
  const ids = (rows ?? []).map((r) => r.id)
  if (!ids.length) return 0
  if (dryRun) return ids.length
  await admin.from('payouts').delete().in('id', ids)
  return ids.length
}

async function cleanupDisputes (admin, dryRun) {
  const { data: rows } = await admin.from('dispute_cases').select('id, description').ilike('description', '[test]%').limit(200)
  const ids = (rows ?? []).map((r) => r.id)
  if (!ids.length) return 0
  if (dryRun) return ids.length
  await admin.from('dispute_cases').delete().in('id', ids)
  return ids.length
}

async function cleanupFraudCases (admin, dryRun) {
  const { data: rows } = await admin.from('fraud_cases').select('id, evidence').limit(500)
  const ids = (rows ?? []).filter((r) => r.evidence?.is_test === true).map((r) => r.id)
  if (!ids.length) return 0
  if (dryRun) return ids.length
  await admin.from('fraud_cases').delete().in('id', ids)
  return ids.length
}

async function cleanupCoaFiles (admin, dryRun) {
  const { data: rows } = await admin
    .from('coa_files')
    .select('id, coa_serial, hash')
    .or('coa_serial.ilike.TEST%,hash.ilike.test%')
    .limit(200)
  const ids = (rows ?? []).map((r) => r.id)
  if (!ids.length) return 0
  if (dryRun) return ids.length
  await admin.from('coa_files').delete().in('id', ids)
  return ids.length
}

async function cleanupMessages (admin, dryRun) {
  const { data: rows } = await admin.from('messages').select('id, content').ilike('content', '[test]%').limit(200)
  const ids = (rows ?? []).map((r) => r.id)
  if (!ids.length) return 0
  if (dryRun) return ids.length
  await admin.from('messages').delete().in('id', ids)
  return ids.length
}

async function cleanupNotifications (admin, dryRun) {
  const { data: rows } = await admin.from('notifications').select('id, title').ilike('title', '[test]%').limit(200)
  const ids = (rows ?? []).map((r) => r.id)
  if (!ids.length) return 0
  if (dryRun) return ids.length
  await admin.from('notifications').delete().in('id', ids)
  return ids.length
}

async function cleanupTestUsers (admin, { dryRun = true } = {}) {
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, contact_email, store_name')
    .or('contact_email.ilike.test%@%,store_name.ilike.[test]%')
    .limit(100)

  const ids = (profiles ?? [])
    .filter((p) => TEST_EMAIL_PATTERN.test(p.contact_email || '') || /^\[test\]/i.test(p.store_name || ''))
    .map((p) => p.id)

  if (!ids.length) return { ok: true, count: 0 }
  if (dryRun) return { ok: true, dry_run: true, count: ids.length, user_ids: ids }

  for (const id of ids) {
    await admin.auth.admin.deleteUser(id).catch(() => {})
  }
  return { ok: true, count: ids.length }
}

module.exports = { cleanupTestData, cleanupTestUsers, TEST_EMAIL_PATTERN, TEST_TITLE_PATTERN }
