/** Hide the pre-JS splash once Vue mounts (pairs with inject-spa-fallback.cjs). */
export default defineNuxtPlugin({
  name: 'remove-static-fallback',
  setup () {
    if (!import.meta.client) return
    const markReady = () => {
      document.documentElement.classList.add('nuxt-ready')
    }
    // One paint with the full-screen logo, then hand off to the app.
    requestAnimationFrame(() => {
      requestAnimationFrame(markReady)
    })
  },
})
