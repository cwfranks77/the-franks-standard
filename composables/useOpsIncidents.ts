/**
 * Owner ops incidents dashboard — list, triage, resolve, test alerts.
 */

export function useOpsIncidents () {
  const config = useRuntimeConfig()
  const busy = ref(false)
  const lastError = ref('')
  const incidents = ref<any[]>([])

  function functionsBase () {
    const url = String(config.public?.supabaseUrl || '').replace(/\/+$/, '')
    return `${url}/functions/v1`
  }

  async function callOps (action: string, payload: Record<string, unknown> = {}) {
    busy.value = true
    lastError.value = ''
    const opsKey = typeof window !== 'undefined'
      ? window.prompt('Ops access key (same as toolkit unlock):')
      : ''
    if (!opsKey) {
      busy.value = false
      return null
    }
    try {
      const res = await fetch(`${functionsBase()}/ops-incident-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ops_key: opsKey, ...payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        lastError.value = data.error || res.statusText
        return null
      }
      return data
    } catch (e) {
      lastError.value = e instanceof Error ? e.message : String(e)
      return null
    } finally {
      busy.value = false
    }
  }

  async function loadIncidents () {
    const data = await callOps('list', { limit: 100 })
    if (data?.incidents) incidents.value = data.incidents
    return data
  }

  async function updateStatus (
    incidentId: string,
    status: string,
    extras: Record<string, unknown> = {},
  ) {
    return callOps('update_status', { incident_id: incidentId, status, ...extras })
  }

  async function testNotify (kind: 'new' | 'resolved' = 'new') {
    return callOps('test_notify', { kind })
  }

  return {
    busy,
    lastError,
    incidents,
    loadIncidents,
    updateStatus,
    testNotify,
  }
}
