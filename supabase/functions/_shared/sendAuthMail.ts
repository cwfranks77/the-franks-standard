/**
 * Auth emails: SendGrid API (primary), Namecheap mailbox SMTP (fallback).
 */
import { sendViaSendgrid } from './sendgridMail.ts'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') ?? ''
const SMTP_HOST = Deno.env.get('SMTP_HOST') ?? 'mail.privateemail.com'
const SMTP_PORT = Number(Deno.env.get('SMTP_PORT') ?? '587')
const SMTP_USER = Deno.env.get('SMTP_USER') ?? Deno.env.get('EMAIL_USER') ?? 'info@thefranksstandard.com'
const SMTP_PASS = Deno.env.get('SMTP_PASS') ?? Deno.env.get('EMAIL_PASS') ?? ''
const SMTP_FROM = Deno.env.get('SMTP_FROM') ?? SMTP_USER
const SMTP_FROM_NAME = Deno.env.get('SMTP_FROM_NAME') ?? 'The Franks Standard'

export async function sendAuthMail (
  params: { to: string; subject: string; text: string; html?: string },
): Promise<{ ok: true; via: 'smtp' | 'sendgrid' } | { ok: false; error: string }> {
  if (SENDGRID_API_KEY) {
    const sg = await sendViaSendgrid(params)
    if (sg.ok) return { ok: true, via: 'sendgrid' }
    console.error('SendGrid send failed, trying mailbox SMTP:', sg.error)
  }

  if (SMTP_PASS) {
    const smtp = await sendViaMailboxSmtp(params)
    if (smtp.ok) return { ok: true, via: 'smtp' }
    return {
      ok: false,
      error: SENDGRID_API_KEY ? `sendgrid_failed_and_${smtp.error}` : `smtp_failed;_${smtp.error}`,
    }
  }

  return { ok: false, error: 'missing_sendgrid_api_key_and_smtp_pass' }
}

async function sendViaMailboxSmtp (
  params: { to: string; subject: string; text: string; html?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        // PrivateEmail/Namecheap uses STARTTLS on 587 and implicit TLS on 465.
        // Denomailer expects tls=false for STARTTLS.
        tls: SMTP_PORT === 465,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASS,
        },
      },
    })

    await client.send({
      from: `${SMTP_FROM_NAME} <${SMTP_FROM}>`,
      to: params.to,
      subject: params.subject,
      content: params.text,
      html: params.html ?? undefined,
    })
    await client.close()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
