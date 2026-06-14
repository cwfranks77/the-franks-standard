/** Restore deep link when GitHub Pages served 404.html for a client route. */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  const saved = sessionStorage.getItem('ghSpaRedirect')
  if (!saved) return
  sessionStorage.removeItem('ghSpaRedirect')
  const target = saved.startsWith('/') ? saved : `/${saved}`
  if (window.location.pathname + window.location.search + window.location.hash === target) return
  navigateTo(target, { replace: true })
})
