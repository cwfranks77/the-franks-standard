/**
 * Supabase Auth "Send Email" hook — sends signup / recovery / magic-link mail via SendGrid.
 * Enable: Dashboard → Authentication → Auth Hooks → Send email → this function URL.
 * Secrets (Supabase Edge): SENDGRID_API_KEY, SEND_EMAIL_HOOK_SECRET (auto when hook enabled).
 */
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { sendAuthMail } from '../_shared/sendAuthMail.ts'

/** Dashboard value is `v1,whsec_<base64>` — standardwebhooks expects the base64 part only. */
function hookSecretRaw (): string {
  const raw = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? ''
  return raw.replace(/^v1,whsec_/i, '').trim()
}
const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/+$/, '')
const SITE_URL = (Deno.env.get('SITE_URL') ?? Deno.env.get('NUXT_PUBLIC_SITE_URL') ?? 'https://thefranksstandard.com').replace(/\/+$/, '')

type EmailActionType = 'signup' | 'recovery' | 'magiclink' | 'email_change' | 'invite'

type HookPayload = {
  user: { email?: string }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: EmailActionType
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

function buildConfirmUrl (emailData: HookPayload['email_data']): string {
  const redirectTo = emailData.redirect_to || `${SITE_URL}/auth/verify`
  const url = new URL(`${SUPABASE_URL}/auth/v1/verify`)
  url.searchParams.set('token', emailData.token_hash)
  url.searchParams.set('type', emailData.email_action_type)
  url.searchParams.set('redirect_to', redirectTo)
  return url.toString()
}

function emailCopy (action: EmailActionType, confirmUrl: string): { subject: string; text: string; html: string } {
  const brand = 'The Franks Standard'
  const footer = `\n\n— ${brand}\nAuthenticity-first collectibles & gear.\n${SITE_URL}`

  if (action === 'recovery') {
    return {
      subject: `Reset your ${brand} password`,
      text: `Reset your password using this link (expires soon):\n\n${confirmUrl}${footer}`,
      html: `<p>Reset your password for <strong>${brand}</strong>.</p><p><a href="${confirmUrl}">Reset password</a></p><p style="color:#64748b;font-size:13px;">Link expires soon. If you did not request this, ignore this email.</p>`,
    }
  }
  if (action === 'magiclink') {
    return {
      subject: `Sign in to ${brand}`,
      text: `Sign in using this link (expires soon):\n\n${confirmUrl}${footer}`,
      html: `<p>Your sign-in link for <strong>${brand}</strong>:</p><p><a href="${confirmUrl}">Sign in</a></p>`,
    }
  }
  if (action === 'email_change') {
    return {
      subject: `Confirm your new email — ${brand}`,
      text: `Confirm your new email address:\n\n${confirmUrl}${footer}`,
      html: `<p>Confirm your new email for <strong>${brand}</strong>:</p><p><a href="${confirmUrl}">Confirm email</a></p>`,
    }
  }
  if (action === 'invite') {
    return {
      subject: `You're invited to ${brand}`,
      text: `Accept your invitation:\n\n${confirmUrl}${footer}`,
      html: `<p>You have been invited to <strong>${brand}</strong>.</p><p><a href="${confirmUrl}">Accept invitation</a></p>`,
    }
  }
  return {
    subject: `Confirm your ${brand} account`,
    text: `Welcome to ${brand}. Confirm your email to buy and sell with proof (COA or signed guarantee on every listing):\n\n${confirmUrl}${footer}`,
    html: `<p>Welcome to <strong>${brand}</strong> — the marketplace where authenticity is not optional.</p><p><a href="${confirmUrl}" style="font-weight:bold;">Confirm your email</a></p><p style="color:#64748b;font-size:13px;">Every listing needs a COA or in-platform guarantee. Questions? Reply or email info@thefranksstandard.com.</p>`,
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405 })
  }
  const hookSecret = hookSecretRaw()
  if (!hookSecret) {
    return new Response(JSON.stringify({ error: 'missing_send_email_hook_secret' }), { status: 500 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  let data: HookPayload
  try {
    const wh = new Webhook(hookSecret)
    data = wh.verify(payload, headers) as HookPayload
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'hook_verify_failed'
    return new Response(JSON.stringify({ error: msg }), { status: 401 })
  }

  const to = data.user?.email?.trim()
  if (!to) {
    return new Response(JSON.stringify({ error: 'missing_user_email' }), { status: 400 })
  }

  const action = data.email_data?.email_action_type ?? 'signup'
  const confirmUrl = buildConfirmUrl(data.email_data)
  const copy = emailCopy(action, confirmUrl)

  const sent = await sendAuthMail({
    to,
    subject: copy.subject,
    text: copy.text,
    html: copy.html,
  })

  if (!sent.ok) {
    console.error('auth-send-email error', sent.error)
    return new Response(JSON.stringify({ error: sent.error }), { status: 500 })
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
