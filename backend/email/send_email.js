/**
 * Email sending engine — logs to email_logs, dispatches via SendGrid when configured.
 */

const { renderTemplate } = require('./templates.js')

const SENDGRID_KEY = () => process.env.SENDGRID_API_KEY || process.env.NUXT_SENDGRID_API_KEY || ''
const FROM_EMAIL = () => process.env.SENDGRID_FROM_EMAIL || process.env.NUXT_SENDGRID_FROM_EMAIL || 'info@thefranksstandard.com'
const FROM_NAME = () => process.env.SENDGRID_FROM_NAME || 'The Franks Standard'

async function logEmail (admin, row) {
  const { data, error } = await admin.from('email_logs').insert({
    user_id: row.userId ?? null,
    to_email: row.toEmail,
    template_key: row.templateKey ?? null,
    subject: row.subject,
    category: row.category || 'transactional',
    status: row.status || 'queued',
    payload: row.payload || {},
    error_message: row.errorMessage ?? null,
    job_id: row.jobId ?? null,
    sent_at: row.sentAt ?? null,
  }).select('id').single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, log_id: data.id }
}

async function dispatchSendGrid ({ toEmail, subject, html }) {
  const key = SENDGRID_KEY()
  if (!key) return { ok: false, skipped: true, reason: 'sendgrid_not_configured' }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: FROM_EMAIL(), name: FROM_NAME() },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    return { ok: false, error: `sendgrid_${res.status}:${txt.slice(0, 500)}` }
  }

  return { ok: true, sent: true }
}

/**
 * Send email immediately (transactional) or queue-only when skipDispatch=true (marketing manual).
 */
async function sendEmail (admin, {
  toEmail,
  userId = null,
  templateKey,
  templateData = {},
  subject = null,
  html = null,
  category = 'transactional',
  jobId = null,
  manualMarketing = false,
  ownerTriggered = false,
}) {
  if (!toEmail) return { ok: false, error: 'to_email_required' }

  let finalSubject = subject
  let finalHtml = html
  let finalCategory = category

  if (templateKey) {
    const rendered = renderTemplate(templateKey, templateData)
    if (!rendered) return { ok: false, error: 'unknown_template' }
    finalSubject = finalSubject || rendered.subject
    finalHtml = finalHtml || rendered.html
    finalCategory = rendered.category
  }

  if (!finalSubject || !finalHtml) {
    return { ok: false, error: 'subject_and_body_required' }
  }

  if (manualMarketing && finalCategory === 'marketing' && !ownerTriggered) {
    const log = await logEmail(admin, {
      userId,
      toEmail,
      templateKey,
      subject: finalSubject,
      category: 'marketing',
      status: 'queued',
      payload: { templateData, manual: true },
      jobId,
    })
    return { ok: true, queued: true, log_id: log.log_id, note: 'Marketing email queued for manual owner trigger.' }
  }

  const log = await logEmail(admin, {
    userId,
    toEmail,
    templateKey,
    subject: finalSubject,
    category: finalCategory,
    status: 'queued',
    payload: { templateData },
    jobId,
  })

  const sent = await dispatchSendGrid({ toEmail, subject: finalSubject, html: finalHtml })

  if (admin && log.log_id) {
    await admin.from('email_logs').update({
      status: sent.ok ? 'sent' : (sent.skipped ? 'skipped' : 'failed'),
      sent_at: sent.ok ? new Date().toISOString() : null,
      error_message: sent.error || (sent.skipped ? sent.reason : null),
    }).eq('id', log.log_id)
  }

  if (!sent.ok && !sent.skipped) return { ok: false, error: sent.error, log_id: log.log_id }
  return { ok: true, log_id: log.log_id, sent: !!sent.ok, skipped: !!sent.skipped }
}

module.exports = { sendEmail, logEmail, dispatchSendGrid, SENDGRID_KEY }
