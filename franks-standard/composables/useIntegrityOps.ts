import { getStoredOpsPhrase } from '~/utils/opsClientAuth'
import { getSupabaseFunctionsBase } from '~/utils/publicSupabase'

/** Operator listing moderation — ops-integrity-action edge function. */
export function useIntegrityOps () {
  const config = useRuntimeConfig()
  const busy = ref(false)
  const lastError = ref('')

  async function callOps (action: string, payload: Record<string, unknown> = {}) {
    busy.value = true
    lastError.value = ''

    const base = getSupabaseFunctionsBase(config)
    if (!base) {
      lastError.value = 'Supabase is not configured on this build.'
      busy.value = false
      return null
    }

    const opsKey = getStoredOpsPhrase()
    if (!opsKey) {
      lastError.value = 'Operator phrase missing — lock and unlock the console again.'
      busy.value = false
      return null
    }

    try {
      const res = await fetch(`${base}/ops-integrity-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ops_key: opsKey, ...payload }),
      })
      const data = await res.json().catch(() => ({})) as Record<string, unknown>
      if (!res.ok) {
        lastError.value = String(data.error || data.detail || res.statusText)
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

  return { busy, lastError, callOps }
}
