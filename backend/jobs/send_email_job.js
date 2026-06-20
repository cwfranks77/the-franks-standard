/** Send transactional email job (queued — does not send without owner mailer config). */

module.exports = async function sendEmailJob (admin, payload) {
  const { to, subject, body, template } = payload || {}
  if (!to || !subject) throw new Error('send_email_missing_fields')

  if (admin) {
    await admin.from('reliability_events').insert({
      event_type: 'job_send_email',
      operation: 'send_email',
      succeeded: true,
      metadata: { to, subject, template: template || null, queued_only: true },
    })
  }

  return { ok: true, queued: true, note: 'Email job recorded. Wire SMTP/SendGrid to dispatch.' }
}
