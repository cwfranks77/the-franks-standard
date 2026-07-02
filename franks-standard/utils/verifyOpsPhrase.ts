import { verifyOpsPhraseBrowser } from '~/utils/opsClientAuth'
import { verifyOpsPhraseRemote } from '~/utils/opsRemoteUnlock'

/** Check owner phrase against build hash first, then Supabase edge function. */
export async function verifyOpsPhrase (phrase: string): Promise<boolean> {
  const config = useRuntimeConfig()
  const hash = String(config.public.opsAccessKeyHash || '').trim().toLowerCase()
  if (hash && await verifyOpsPhraseBrowser(phrase, hash)) return true
  return verifyOpsPhraseRemote(phrase)
}
