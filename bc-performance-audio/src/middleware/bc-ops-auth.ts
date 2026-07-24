/**
 * Gate /bc-audio/ops/* (except the /bc-audio/ops gate landing) behind owner session.
 * If a phrase is already stored, restore auth instead of bouncing to the storefront
 * (plain isAuthed starts false while async hash verify is still in flight).
 */
import { getStoredOpsPhrase } from '~/utils/opsClientAuth.js'
import { getBcStorefrontPath } from '~/utils/bcSupport.js'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server || import.meta.prerender) return

  const session = useOpsSession()
  session.restoreSessionIfPossible?.()
  if (session.isAuthed.value) return

  if (import.meta.client && getStoredOpsPhrase()) {
    session.grant()
    const ok = await session.syncAuthed()
    if (ok) return
  }

  return navigateTo(getBcStorefrontPath(), { replace: true })
})
