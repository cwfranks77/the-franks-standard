/**
 * Email sender for BC owner workflows.
 * Uses SendGrid when SENDGRID_API_KEY is set; otherwise logs only.
 */
export async function sendBcOwnerEmail (to: string, subject: string, body: string) {
  const from = process.env.NOTIFICATION_EMAIL_FROM || 'no-reply@bcpoweraudio.com'
  const apiKey = String(process.env.SENDGRID_API_KEY || '').trim()

  if (!apiKey) {
    console.log('[bc-email]', { to, subject, preview: body.slice(0, 120) })
    return { sent: false, reason: 'SENDGRID_API_KEY not set' }
  }

  try {
    const sg = await import('@sendgrid/mail')
    sg.default.setApiKey(apiKey)
    await sg.default.send({
      to,
      from,
      subject,
      text: body,
    })
    return { sent: true }
  } catch (err) {
    console.error('BC email send failed', err)
    return { sent: false, reason: 'send_failed' }
  }
}
