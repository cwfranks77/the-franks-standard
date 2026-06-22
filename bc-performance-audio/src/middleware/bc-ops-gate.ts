/**
 * No public owner login page — unlock is logo ×5 on the storefront only.
 * Direct visits to /bc-audio/ops/* bounce home unless already authed (→ panel).
 */
import { getBcOpsPanelPath, getBcStorefrontPath } from '~/utils/bcSupport.js'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || import.meta.prerender) return

  const { isAuthed } = useOpsSession()
  if (isAuthed.value && to.path === '/bc-audio/ops') {
    return navigateTo(getBcOpsPanelPath(), { replace: true })
  }
  if (!isAuthed.value) {
    return navigateTo(getBcStorefrontPath(), { replace: true })
  }
})
