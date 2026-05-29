/**
 * Auth emails: Namecheap Private Email SMTP (primary), SendGrid API (fallback).
 */
import { sendViaSendgrid } from './sendgridMail.ts'

const SMTP_HOST = Deno.env.get('SMTP_HOST') ?? 'mail.privateemail.com'
const SMTP_PORT = Number(Deno.env.get('SMTP_PORT') ?? '587')
const SMTP_USER = Deno.env.get('SMTP_USER') ?? Deno.env.get('EMAIL_USER') ?? 'info@thefranksstandard.com'
const SMTP_PASS = Deno.env.get('SMTP_PASS') ?? Deno.env.get('EMAIL_PASS') ?? ''
const SMTP_FROM = Deno.env.get('SMTP_FROM') ?? SMTP_USER
const SMTP_FROM_NAME = Deno.env.get('SMTP_FROM_NAME') ?? 'The Franks Standard'

export async function sendAuthMail (
  params: { to: string; subject: string; text: string; html?: string },
): Promise<{ ok: true; via: 'smtp' | 'sendgrid' } | { ok: false; error: string }> {
  if (SMTP_PASS) {
    const smtp = await sendViaMailboxSmtp(params)
    if (smtp.ok) return { ok: true, via: 'smtp' }
    console.error('SMTP send failed, trying SendGrid:', smtp.error)
  }

  const sg = await sendViaSendgrid(params)
  if (sg.ok) return { ok: true, via: 'sendgrid' }
  return {
    ok: false,
    error: SMTP_PASS ? `smtp_failed_and_${sg.error}` : `no_smtp_pass_configured;_${sg.error}`,
  }
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
        tls: true,
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
