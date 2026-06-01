/**
 * Owner actions on ops incidents + test notifications.
 * POST /functions/v1/ops-incident-action  (--no-verify-jwt, ops_key in body)
 */
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import { adminClient, recordIncidentEvent, updateIncidentStatus } from '../_shared/opsIncidents.ts'
import { notifyOpsAlert } from '../_shared/opsNotify.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const opsKey = String(body.ops_key ?? '')
  if (!(await verifyOpsKey(opsKey))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const action = String(body.action ?? '')
  const admin = adminClient()

  if (action === 'list') {
    const limit = Math.min(Number(body.limit ?? 50) || 50, 200)
    const { data, error } = await admin
      .from('ops_incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true, incidents: data ?? [] })
  }

  if (action === 'events') {
    const incidentId = String(body.incident_id ?? '')
    if (!incidentId) return json({ error: 'missing_incident_id' }, 400)
    const { data, error } = await admin
      .from('ops_incident_events')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true })
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true, events: data ?? [] })
  }

  if (action === 'update_status') {
    const incidentId = String(body.incident_id ?? '')
    const status = String(body.status ?? '')
    if (!incidentId || !status) return json({ error: 'missing_fields' }, 400)
    try {
      const result = await updateIncidentStatus({
        incidentId,
        status,
        root_cause: body.root_cause != null ? String(body.root_cause) : undefined,
        fix_summary: body.fix_summary != null ? String(body.fix_summary) : undefined,
        github_commit_sha: body.github_commit_sha != null ? String(body.github_commit_sha) : undefined,
        auto_fix_attempted: body.auto_fix_attempted === true,
      })
      return json({ ok: true, incident: result.incident, notify: result.notify })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return json({ error: msg }, 400)
    }
  }

  if (action === 'test_notify') {
    const kind = String(body.kind ?? 'new') === 'resolved' ? 'resolved' : 'new'
    const notify = await notifyOpsAlert({
      kind,
      severity: String(body.severity ?? 'critical'),
      source: 'test',
      message: String(body.message ?? 'Test alert from ops-incident-action'),
      incidentId: String(body.incident_id ?? '00000000-0000-0000-0000-000000000099'),
      fixSummary: String(body.fix_summary ?? 'Test fix applied'),
      resolvedAt: new Date().toISOString(),
    })
    const incidentId = String(body.incident_id ?? '').trim()
    if (incidentId) {
      await recordIncidentEvent(admin, incidentId, 'test_notify', notify)
    }
    return json({ ok: true, notify })
  }

  return json({ error: 'unknown_action' }, 400)
})
