/**
 * SMS sending — Twilio when configured; always logs intent.
 */

const TWILIO_SID = () => process.env.TWILIO_ACCOUNT_SID || process.env.NUXT_TWILIO_ACCOUNT_SID || ''
const TWILIO_TOKEN = () => process.env.TWILIO_AUTH_TOKEN || process.env.NUXT_TWILIO_AUTH_TOKEN || ''
const TWILIO_FROM = () => process.env.TWILIO_PHONE_NUMBER || process.env.NUXT_TWILIO_PHONE_NUMBER || ''

async function sendSms (admin, { toPhone, body, userId = null, metadata = {} }) {
  const phone = String(toPhone || '').trim()
  if (!phone) return { ok: false, error: 'phone_required' }

  const sid = TWILIO_SID()
  const token = TWILIO_TOKEN()
  const from = TWILIO_FROM()

  if (!sid || !token || !from) {
    if (admin) {
      await admin.from('security_events').insert({
        user_id: userId,
        event_type: 'sms_skipped_not_configured',
        severity: 'info',
        details: { to: phone.slice(-4), metadata },
      })
    }
    return { ok: true, skipped: true, reason: 'twilio_not_configured' }
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
  const params = new URLSearchParams({ To: phone, From: from, Body: body })
  const auth = Buffer.from(`${sid}:${token}`).toString('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    return { ok: false, error: `twilio_${res.status}:${txt.slice(0, 300)}` }
  }

  return { ok: true, sent: true }
}

module.exports = { sendSms }
