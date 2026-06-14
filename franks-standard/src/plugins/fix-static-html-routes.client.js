/**
 * NuxtLink cannot open public/*.html — Vue Router has no match and shows 404.
 * Redirect known static HTML paths to real Nuxt routes (preserve query).
 */
const HTML_TO_ROUTE = {
  '/seller-lookup.html': '/ops/seller-lookup',
  '/seller-lookup.htm': '/ops/seller-lookup',
}

export default defineNuxtPlugin(() => {
  const router = useRouter()
  router.beforeEach((to) => {
    const path = to.path.replace(/\/$/, '') || '/'
    const target = HTML_TO_ROUTE[path]
    if (!target) return
    return navigateTo({ path: target, query: to.query, hash: to.hash }, { replace: true })
  })
})
