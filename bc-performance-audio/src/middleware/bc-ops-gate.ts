/**
 * No public owner login page — unlock is logo ×5 on the storefront only.
 * Direct visits to /bc-audio/ops/* bounce home unless already authed (→ panel).
 * Restore from stored phrase before bouncing (same race as bc-ops-auth).
 */
import { getStoredOpsPhrase } from '~/utils/opsClientAuth.js'
import { getBcOpsPanelPath, getBcStorefrontPath } from '~/utils/bcSupport.js'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server || import.meta.prerender) return

  const session = useOpsSession()
  session.restoreSessionIfPossible?.()
  let authed = session.isAuthed.value

  if (!authed && import.meta.client && getStoredOpsPhrase()) {
    session.grant()
    authed = await session.syncAuthed()
  }

  if (authed && to.path === '/bc-audio/ops') {
    return navigateTo(getBcOpsPanelPath(), { replace: true })
  }
  if (!authed) {
    return navigateTo(getBcStorefrontPath(), { replace: true })
  }
})
