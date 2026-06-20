/** Restore deep-linked URL after GitHub Pages 404 → home redirect. */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const key = 'ghSpaRedirect'
  const saved = sessionStorage.getItem(key)
  if (!saved || saved === '/' || saved === '/index.html') return

  sessionStorage.removeItem(key)
  const router = useRouter()
  router.replace(saved).catch(() => {
    window.location.replace(saved)
  })
})
