/** Mobile + email alerts for ops incidents (Twilio SMS, ntfy.sh, SendGrid). */

import { sendViaSendgrid } from './sendgridMail.ts'

export type NotifyKind = 'new' | 'resolved'

export function opsNotifyEnabled (): boolean {
  return (Deno.env.get('OPS_NOTIFY_ENABLED') ?? '').toLowerCase() === 'true'
}

export function truncateAlert (value: string, max: number): string {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

function formatResolvedTime (iso?: string | null): string {
  if (!iso) return 'now'
  try {
    return new Date(iso).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return 'now'
  }
}

export function buildAlertMessage (params: {
  kind: NotifyKind
  severity?: string
  source?: string
  message?: string
  incidentId?: string
  fixSummary?: string
  resolvedAt?: string | null
}): string {
  if (params.kind === 'new') {
    const sev = params.severity ?? 'unknown'
    const src = params.source ?? 'unknown'
    const msg = truncateAlert(params.message ?? '', 80)
    return `Franks Standard ALERT: ${sev} ${src} — ${msg}`
  }
  const id = (params.incidentId ?? 'incident').slice(0, 8)
  const fix = truncateAlert(params.fixSummary ?? 'resolved', 80)
  const time = formatResolvedTime(params.resolvedAt)
  return `Franks Standard FIXED: ${id} — ${fix} — ${time}`
}

export async function sendNtfyAlert (
  message: string,
  title: string,
  priority: 'min' | 'low' | 'default' | 'high' | 'max' = 'default',
): Promise<{ ok: true } | { ok: false; error: string }> {
  const topic = (Deno.env.get('NTFY_TOPIC') ?? '').trim()
  if (!topic) return { ok: false, error: 'missing_ntfy_topic' }

  const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: 'POST',
    headers: {
      Title: title,
      Priority: priority,
      Tags: priority === 'high' || priority === 'max' ? 'warning,rotating_light' : 'white_check_mark',
    },
    body: message,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { ok: false, error: `ntfy_${res.status}:${body.slice(0, 120)}` }
  }
  return { ok: true }
}

export async function sendTwilioSms (
  message: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sid = (Deno.env.get('TWILIO_ACCOUNT_SID') ?? '').trim()
  const token = (Deno.env.get('TWILIO_AUTH_TOKEN') ?? '').trim()
  const from = (
    Deno.env.get('TWILIO_FROM_NUMBER')
    ?? Deno.env.get('TWILIO_PHONE_NUMBER')
    ?? ''
  ).trim()
  const to = (Deno.env.get('OPS_ALERT_PHONE') ?? '').trim()

  if (!sid || !token) return { ok: false, error: 'missing_twilio_credentials' }
  if (!from) return { ok: false, error: 'missing_twilio_from_number' }
  if (!to) return { ok: false, error: 'missing_ops_alert_phone' }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
  const auth = btoa(`${sid}:${token}`)
  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: message.slice(0, 160),
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { ok: false, error: `twilio_${res.status}:${text.slice(0, 120)}` }
  }
  return { ok: true }
}

export type NotifyResult = {
  enabled: boolean
  message: string
  sent: string[]
  skipped: string[]
  warnings: string[]
}

export async function notifyOpsAlert (params: {
  kind: NotifyKind
  severity?: string
  source?: string
  message?: string
  incidentId?: string
  fixSummary?: string
  resolvedAt?: string | null
}): Promise<NotifyResult> {
  const sent: string[] = []
  const skipped: string[] = []
  const warnings: string[] = []
  const message = buildAlertMessage(params)

  if (!opsNotifyEnabled()) {
    warnings.push('OPS_NOTIFY_ENABLED is not true — notifications skipped')
    console.warn('[ops-notify]', warnings.join('; '))
    return { enabled: false, message, sent, skipped, warnings }
  }

  const ntfyTopic = (Deno.env.get('NTFY_TOPIC') ?? '').trim()
  const alertPhone = (Deno.env.get('OPS_ALERT_PHONE') ?? '').trim()
  const alertEmail = (Deno.env.get('OPS_ALERT_EMAIL') ?? '').trim()

  if (!ntfyTopic && !alertPhone && !alertEmail) {
    warnings.push('No channels configured (set NTFY_TOPIC and/or OPS_ALERT_PHONE and/or OPS_ALERT_EMAIL)')
    console.warn('[ops-notify]', warnings.join('; '))
    return { enabled: true, message, sent, skipped, warnings }
  }

  if (ntfyTopic) {
    const title = params.kind === 'new' ? 'Franks Standard Alert' : 'Franks Standard Fixed'
    const priority = params.kind === 'new' && (params.severity === 'critical' || params.severity === 'high')
      ? 'high'
      : 'default'
    const r = await sendNtfyAlert(message, title, priority)
    if (r.ok) sent.push('ntfy')
    else warnings.push(`ntfy: ${r.error}`)
  } else {
    skipped.push('ntfy (NTFY_TOPIC unset)')
  }

  if (alertPhone) {
    const r = await sendTwilioSms(message)
    if (r.ok) sent.push('sms')
    else warnings.push(`sms: ${r.error}`)
  } else {
    skipped.push('sms (OPS_ALERT_PHONE unset)')
  }

  if (alertEmail) {
    const subject = params.kind === 'new'
      ? `[Franks Ops] ${params.severity ?? 'alert'} — ${params.source ?? 'incident'}`
      : `[Franks Ops] Fixed — ${(params.incidentId ?? '').slice(0, 8)}`
    const site = (Deno.env.get('SITE_URL') ?? 'https://thefranksstandard.com').replace(/\/+$/, '')
    const r = await sendViaSendgrid({
      to: alertEmail,
      subject,
      text: `${message}\n\nDashboard: ${site}/ops/incidents`,
      html: `<p>${message.replace(/</g, '&lt;')}</p><p><a href="${site}/ops/incidents">View incidents</a></p>`,
    })
    if (r.ok) sent.push('email')
    else warnings.push(`email: ${r.error}`)
  } else {
    skipped.push('email (OPS_ALERT_EMAIL unset)')
  }

  if (sent.length === 0) {
    console.warn('[ops-notify] No channels delivered.', { warnings, skipped })
  }

  return { enabled: true, message, sent, skipped, warnings }
}

export function shouldNotifyNewIncident (severity: string): boolean {
  const s = severity.toLowerCase()
  return s === 'critical' || s === 'high'
}
