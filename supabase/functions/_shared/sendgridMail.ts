/** Send transactional mail via SendGrid HTTP API (used by auth hook + ops alerts). */

export type SendgridMailParams = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendViaSendgrid (params: SendgridMailParams): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = Deno.env.get('SENDGRID_API_KEY') ?? ''
  if (!key) return { ok: false, error: 'missing_sendgrid_api_key' }

  const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'info@thefranksstandard.com'
  const fromName = Deno.env.get('SENDGRID_FROM_NAME') ?? 'The Franks Standard'

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: fromEmail, name: fromName },
      subject: params.subject,
      content: [
        { type: 'text/plain', value: params.text },
        ...(params.html ? [{ type: 'text/html', value: params.html }] : []),
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { ok: false, error: `sendgrid_${res.status}:${body.slice(0, 200)}` }
  }
  return { ok: true }
}
