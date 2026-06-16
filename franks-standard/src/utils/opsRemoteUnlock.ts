import { normalizeOpsPhrase } from '~/utils/opsPhrase'

/** Check operator phrase on the server (Nitro API or Supabase Edge). Never compares hash in the browser. */
export async function verifyOpsPhraseRemote (phrase: string): Promise<boolean> {
  const normalized = normalizeOpsPhrase(phrase)
  if (!normalized) return false

  try {
    await $fetch('/api/ops/session', {
      method: 'POST',
      body: { phrase: normalized },
    })
    return true
  } catch {
    /* static GitHub Pages — use Supabase Edge */
  }

  if (!import.meta.client) return false

  try {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase.functions.invoke('ops-session', {
      body: { phrase: normalized },
    })
    if (error) return false
    return Boolean((data as { ok?: boolean })?.ok)
  } catch {
    return false
  }
}
