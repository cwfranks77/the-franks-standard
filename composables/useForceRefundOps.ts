/**
 * Ops-initiated forced buyer refunds — calls ops-force-refund edge function.
 */

export function useForceRefundOps () {
  const config = useRuntimeConfig()
  const busy = ref(false)
  const lastError = ref('')

  function functionsBase () {
    const url = String(config.public?.supabaseUrl || '').replace(/\/+$/, '')
    return `${url}/functions/v1`
  }

  async function callRefundOps (action: string, payload: Record<string, unknown> = {}) {
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
      const res = await fetch(`${functionsBase()}/ops-force-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ops_key: opsKey, ...payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        lastError.value = data.error || data.detail || res.statusText
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

  return { busy, lastError, callRefundOps }
}
