/** Send transactional email job — Section 11 email engine. */

const { processEmailJob } = require('../email/email_queue.js')

module.exports = async function sendEmailJob (admin, payload) {
  const result = await processEmailJob(admin, payload || {})
  if (!result.ok && !result.skipped) {
    throw new Error(result.error || 'send_email_failed')
  }
  return result
}
