/** Log retention cleanup — 180 days. */

const RETENTION_DAYS = 180

module.exports = async function cleanupLogsJob (admin) {
  if (!admin) throw new Error('supabase_required')

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const tables = [
    'platform_activity_events',
    'violation_events',
    'security_events',
    'audit_logs',
  ]

  const deleted = {}

  for (const table of tables) {
    const { error, count } = await admin
      .from(table)
      .delete({ count: 'exact' })
      .lt('created_at', cutoff)

    if (error) throw new Error(`${table}:${error.message}`)
    deleted[table] = count ?? 0
  }

  await admin.from('system_health_meta').upsert({
    key: 'last_cleanup_run',
    value: { ran_at: new Date().toISOString(), deleted, retention_days: RETENTION_DAYS },
    updated_at: new Date().toISOString(),
  })

  return { ok: true, deleted, cutoff }
}
