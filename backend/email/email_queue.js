/**
 * Email queue — uses Section 10 background job queue.
 */

const { enqueue } = require('../jobs/queue.js')
const { sendEmail } = require('./send_email.js')

const TEMPLATE_JOB_MAP = {
  order_confirmation: 'send_email',
  dispute_update: 'send_email',
  fraud_case_update: 'send_email',
  support_followup: 'send_email',
  verification: 'send_email',
  plan_expiration_warning: 'send_email',
  marketing_manual: 'send_email',
}

async function queueEmail (admin, payload) {
  const jobType = TEMPLATE_JOB_MAP[payload.templateKey] || 'send_email'
  return enqueue(admin, {
    jobType,
    payload: {
      ...payload,
      queued_at: new Date().toISOString(),
    },
  })
}

/** Job handler — registered with queue manager. */
async function processEmailJob (admin, payload) {
  return sendEmail(admin, {
    toEmail: payload.toEmail,
    userId: payload.userId ?? null,
    templateKey: payload.templateKey,
    templateData: payload.templateData || {},
    subject: payload.subject,
    html: payload.html,
    category: payload.category,
    jobId: payload.job_id,
    manualMarketing: payload.manualMarketing === true,
    ownerTriggered: payload.ownerTriggered === true,
  })
}

module.exports = { queueEmail, processEmailJob, TEMPLATE_JOB_MAP }
