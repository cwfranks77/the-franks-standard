import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const SENDGRID_KEY = () => Deno.env.get('SENDGRID_API_KEY') ?? ''
const FROM_EMAIL = () => Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'info@thefranksstandard.com'
const FROM_NAME = () => Deno.env.get('SENDGRID_FROM_NAME') ?? 'The Franks Standard'
const SITE = () => (Deno.env.get('SITE_URL') ?? 'https://thefranksstandard.com').replace(/\/+$/, '')

const TEMPLATES: Record<string, { category: string; subject: (d: Record<string, unknown>) => string; html: (d: Record<string, unknown>) => string }> = {
  order_confirmation: {
    category: 'transactional',
    subject: (d) => `Order confirmed — ${d.order_id || 'The Franks Standard'}`,
    html: (d) => `<p>Your order <strong>${d.order_id || ''}</strong> is confirmed.</p><p>Total: <strong>${d.total || ''}</strong></p><p><a href="${SITE()}/orders">View orders</a></p>`,
  },
  dispute_update: {
    category: 'transactional',
    subject: (d) => `Dispute update — ${d.status || 'updated'}`,
    html: (d) => `<p>Status: <strong>${d.status || ''}</strong></p>${d.ruling ? `<p>Ruling: ${d.ruling}</p>` : ''}<p><a href="${SITE()}/disputes">View dispute</a></p>`,
  },
  fraud_case_update: {
    category: 'transactional',
    subject: () => 'Important account security notice',
    html: (d) => `<p>Fraud review case ${d.case_id || ''} updated.</p><p>Status: <strong>${d.status || 'under review'}</strong></p>`,
  },
  support_followup: {
    category: 'transactional',
    subject: () => 'How did we do? — Support follow-up',
    html: (d) => `<p><a href="${d.survey_url || SITE()}">Rate your experience</a></p>`,
  },
  verification: {
    category: 'transactional',
    subject: () => 'Verify your email — The Franks Standard',
    html: (d) => `<p><a href="${d.verify_url || SITE()}">Verify now</a></p>${d.code ? `<p>Code: <strong>${d.code}</strong></p>` : ''}`,
  },
  marketing_manual: {
    category: 'marketing',
    subject: (d) => String(d.subject || 'News from The Franks Standard'),
    html: (d) => `<div>${d.body || d.message || ''}</div>`,
  },
  plan_expiration_warning: {
    category: 'transactional',
    subject: () => 'Your seller plan is expiring soon',
    html: (d) => `<p>Plan <strong>${d.plan_name || ''}</strong> expires ${d.expires_at || 'soon'}.</p><p><a href="${SITE()}/sell/pricing">Renew</a></p>`,
  },
}

function renderTemplate (key: string, data: Record<string, unknown> = {}) {
  const tpl = TEMPLATES[key]
  if (!tpl) return null
  return { subject: tpl.subject(data), html: tpl.html(data), category: tpl.category }
}

export async function queueTransactionalEmail (
  admin: SupabaseClient,
  params: {
    userId?: string | null
    toEmail: string
    templateKey: string
    templateData?: Record<string, unknown>
    ownerTriggered?: boolean
  },
) {
  const rendered = renderTemplate(params.templateKey, params.templateData ?? {})
  if (!rendered) return { ok: false, error: 'unknown_template' }

  const { data: log } = await admin.from('email_logs').insert({
    user_id: params.userId ?? null,
    to_email: params.toEmail,
    template_key: params.templateKey,
    subject: rendered.subject,
    category: rendered.category,
    status: 'queued',
    payload: { templateData: params.templateData ?? {} },
  }).select('id').single()

  if (params.templateKey === 'marketing_manual' && !params.ownerTriggered) {
    return { ok: true, queued: true, log_id: log?.id }
  }

  const key = SENDGRID_KEY()
  if (!key) {
    if (log?.id) {
      await admin.from('email_logs').update({ status: 'skipped', error_message: 'sendgrid_not_configured' }).eq('id', log.id)
    }
    return { ok: true, skipped: true, log_id: log?.id }
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.toEmail }] }],
      from: { email: FROM_EMAIL(), name: FROM_NAME() },
      subject: rendered.subject,
      content: [{ type: 'text/html', value: rendered.html }],
    }),
  })

  if (log?.id) {
    await admin.from('email_logs').update({
      status: res.ok ? 'sent' : 'failed',
      sent_at: res.ok ? new Date().toISOString() : null,
      error_message: res.ok ? null : `sendgrid_${res.status}`,
    }).eq('id', log.id)
  }

  return { ok: res.ok, log_id: log?.id }
}

export async function processEmailJobPayload (
  admin: SupabaseClient,
  payload: Record<string, unknown>,
) {
  return queueTransactionalEmail(admin, {
    userId: payload.userId as string | undefined,
    toEmail: String(payload.toEmail ?? ''),
    templateKey: String(payload.templateKey ?? ''),
    templateData: (payload.templateData as Record<string, unknown>) ?? {},
    ownerTriggered: payload.ownerTriggered === true,
  })
}
