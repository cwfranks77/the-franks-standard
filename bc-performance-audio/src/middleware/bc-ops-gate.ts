/**
 * No public owner login page — unlock is logo ×5 on the storefront only.
 * Direct visits to /bc-audio/ops/* bounce home unless already authed (→ panel).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || import.meta.prerender) return

  const { isAuthed } = useOpsSession()
  if (isAuthed.value && to.path === '/bc-audio/ops') {
    return navigateTo('/bc-audio/ops/panel', { replace: true })
  }
  if (!isAuthed.value) {
    return navigateTo('/bc-audio', { replace: true })
  }
})
