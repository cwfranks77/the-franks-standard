import { normalizeOpsPhrase } from '~/utils/opsPhrase'

/** Verify owner phrase via Supabase Edge (static GitHub Pages — no hash in browser). */
export async function verifyOpsPhraseRemote (phrase: string): Promise<boolean> {
  const normalized = normalizeOpsPhrase(phrase)
  if (!normalized) return false

  const config = useRuntimeConfig()
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
