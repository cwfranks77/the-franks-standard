/**
 * Delete logs older than 180 days — cron entry point.
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 */
const cleanupLogsJob = require('../jobs/cleanup_logs_job.js')

async function runLogCleanup (admin) {
  return cleanupLogsJob(admin)
}

module.exports = { runLogCleanup, RETENTION_DAYS: 180 }
