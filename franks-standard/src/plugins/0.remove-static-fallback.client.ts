/** Hide the pre-JS SEO splash once Vue mounts (pairs with inject-spa-fallback.cjs). */
export default defineNuxtPlugin({
  name: 'remove-static-fallback',
  setup () {
    if (!import.meta.client) return
    document.documentElement.classList.add('nuxt-ready')
  },
})
