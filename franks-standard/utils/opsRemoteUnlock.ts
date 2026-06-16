import { normalizeOpsPhrase } from '~/utils/opsPhrase'
import { verifyOpsPhraseBrowser } from '~/utils/opsClientAuth'

/** Verify operator phrase — hash check on static GitHub Pages, Supabase Edge as backup. */
export async function verifyOpsPhraseRemote (phrase: string): Promise<boolean> {
  const normalized = normalizeOpsPhrase(phrase)
  if (!normalized) return false

  const config = useRuntimeConfig()
  const expectedHash = String(config.public.opsAccessKeyHash || '').trim().toLowerCase()

  if (expectedHash && import.meta.client) {
    const localOk = await verifyOpsPhraseBrowser(phrase, expectedHash)
    if (localOk) return true
  }

  const base = String(config.public.supabaseUrl || '').replace(/\/$/, '')
  if (!base) return false

  try {
    const res = await fetch(`${base}/functions/v1/ops-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase: normalized }),
    })
    if (!res.ok) return false
    const data = await res.json()
    return Boolean((data as { ok?: boolean })?.ok)
  } catch {
    return false
  }
}
