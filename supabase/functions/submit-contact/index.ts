import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const NOTIFY_EMAIL = Deno.env.get('CONTACT_NOTIFY_EMAIL') ?? 'cwfranks77@gmail.com'
const SENDGRID_KEY = Deno.env.get('SENDGRID_API_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (body.website) {
    return json({ ok: true })
  }

  const name = String(body.name ?? '').trim().slice(0, 120)
  const email = String(body.email ?? '').trim().slice(0, 200)
  const subject = String(body.subject ?? 'Contact form').trim().slice(0, 200)
  const message = String(body.message ?? '').trim().slice(0, 5000)

  if (!email || !message) {
    return json({ error: 'missing_fields' }, 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'invalid_email' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const { error: insErr } = await admin.from('contact_messages').insert({
    name: name || null,
    email,
    subject,
    message,
  })
  if (insErr) {
    return json({ error: insErr.message }, 500)
  }

  if (SENDGRID_KEY && NOTIFY_EMAIL) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SENDGRID_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: NOTIFY_EMAIL }] }],
          from: {
            email: Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'info@thefranksstandard.com',
            name: Deno.env.get('SENDGRID_FROM_NAME') ?? 'The Franks Standard',
          },
          reply_to: { email, name: name || undefined },
          subject: `[Contact] ${subject}`,
          content: [{
            type: 'text/plain',
            value: `From: ${name || '(no name)'} <${email}>\nSubject: ${subject}\n\n${message}`,
          }],
        }),
      })
    } catch {
      // Row saved; notification is best-effort
    }
  }

  return json({ ok: true })
})
