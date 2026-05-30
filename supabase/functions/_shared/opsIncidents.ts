import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { notifyOpsAlert, shouldNotifyNewIncident } from './opsNotify.ts'

export type IncidentInput = {
  severity?: string
  source: string
  message: string
  stack?: string | null
  url?: string | null
  user_agent?: string | null
  metadata?: Record<string, unknown>
  status?: string
  root_cause?: string | null
  fix_summary?: string | null
  fingerprint?: string | null
}

const VALID_SEVERITIES = new Set(['critical', 'high', 'medium', 'low', 'info'])
const VALID_STATUSES = new Set(['open', 'triaging', 'fixing', 'resolved', 'wontfix', 'failed'])

export function adminClient (): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function sha256Hex (input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function buildFingerprint (input: IncidentInput): Promise<string> {
  if (input.fingerprint) return input.fingerprint
  const raw = [
    input.source,
    input.message.slice(0, 500),
    input.url ?? '',
    input.stack?.slice(0, 300) ?? '',
  ].join('|')
  return sha256Hex(raw)
}

export async function recordIncidentEvent (
  admin: SupabaseClient,
  incidentId: string,
  eventType: string,
  detail: Record<string, unknown> = {},
) {
  await admin.from('ops_incident_events').insert({
    incident_id: incidentId,
    event_type: eventType,
    detail,
  })
}

export async function ingestIncident (input: IncidentInput) {
  const admin = adminClient()
  const severity = VALID_SEVERITIES.has(String(input.severity ?? '').toLowerCase())
    ? String(input.severity).toLowerCase()
    : 'medium'
  const status = VALID_STATUSES.has(String(input.status ?? '').toLowerCase())
    ? String(input.status).toLowerCase()
    : 'open'
  const fingerprint = await buildFingerprint(input)

  const { data: existing } = await admin
    .from('ops_incidents')
    .select('id, status, created_at')
    .eq('fingerprint', fingerprint)
    .in('status', ['open', 'triaging', 'fixing', 'failed'])
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    await recordIncidentEvent(admin, existing.id, 'duplicate', { fingerprint })
    return { incident: existing, created: false, notify: null as Awaited<ReturnType<typeof notifyOpsAlert>> | null }
  }

  const now = new Date().toISOString()
  const { data: incident, error } = await admin
    .from('ops_incidents')
    .insert({
      severity,
      source: input.source.slice(0, 120),
      message: input.message.slice(0, 4000),
      stack: input.stack?.slice(0, 8000) ?? null,
      url: input.url?.slice(0, 2000) ?? null,
      user_agent: input.user_agent?.slice(0, 500) ?? null,
      metadata: input.metadata ?? {},
      status,
      root_cause: input.root_cause ?? null,
      fix_summary: input.fix_summary ?? null,
      fingerprint,
      updated_at: now,
    })
    .select('*')
    .single()

  if (error || !incident) {
    throw new Error(error?.message ?? 'insert_failed')
  }

  await recordIncidentEvent(admin, incident.id, 'created', { severity, source: input.source })

  let notify: Awaited<ReturnType<typeof notifyOpsAlert>> | null = null
  if (shouldNotifyNewIncident(severity)) {
    notify = await notifyOpsAlert({
      kind: 'new',
      severity,
      source: input.source,
      message: input.message,
      incidentId: incident.id,
    })
    await recordIncidentEvent(admin, incident.id, 'notify', notify)
    await admin.from('ops_incidents').update({ last_notified_at: now }).eq('id', incident.id)
  }

  return { incident, created: true, notify }
}

export async function updateIncidentStatus (params: {
  incidentId: string
  status: string
  root_cause?: string | null
  fix_summary?: string | null
  github_commit_sha?: string | null
  auto_fix_attempted?: boolean
}) {
  const admin = adminClient()
  const status = String(params.status).toLowerCase()
  if (!VALID_STATUSES.has(status)) {
    throw new Error('invalid_status')
  }

  const { data: before, error: fetchErr } = await admin
    .from('ops_incidents')
    .select('*')
    .eq('id', params.incidentId)
    .maybeSingle()

  if (fetchErr || !before) throw new Error(fetchErr?.message ?? 'not_found')

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {
    status,
    updated_at: now,
  }
  if (params.root_cause !== undefined) patch.root_cause = params.root_cause
  if (params.fix_summary !== undefined) patch.fix_summary = params.fix_summary
  if (params.github_commit_sha !== undefined) patch.github_commit_sha = params.github_commit_sha
  if (params.auto_fix_attempted !== undefined) patch.auto_fix_attempted = params.auto_fix_attempted
  if (status === 'resolved') patch.resolved_at = now

  const { data: incident, error } = await admin
    .from('ops_incidents')
    .update(patch)
    .eq('id', params.incidentId)
    .select('*')
    .single()

  if (error || !incident) throw new Error(error?.message ?? 'update_failed')

  await recordIncidentEvent(admin, incident.id, 'status_change', {
    from: before.status,
    to: status,
  })

  let notify: Awaited<ReturnType<typeof notifyOpsAlert>> | null = null
  if (status === 'resolved' && before.status !== 'resolved') {
    notify = await notifyOpsAlert({
      kind: 'resolved',
      incidentId: incident.id,
      fixSummary: incident.fix_summary ?? incident.root_cause ?? 'Issue resolved',
      resolvedAt: incident.resolved_at,
    })
    await recordIncidentEvent(admin, incident.id, 'notify', notify)
    await admin.from('ops_incidents').update({ last_notified_at: now }).eq('id', incident.id)
  }

  return { incident, notify }
}
