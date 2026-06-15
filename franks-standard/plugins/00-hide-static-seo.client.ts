/** Hide crawler-only SEO HTML once the Vue app mounts — real marketplace UI takes over. */
export default defineNuxtPlugin({
  name: 'hide-static-seo',
  setup (nuxtApp) {
    const clear = () => {
      if (!import.meta.client) return
      document.documentElement.classList.add('nuxt-ready')
      document.getElementById('franks-static-seo')?.remove()
      document.getElementById('franks-static-seo-style')?.remove()
      document.getElementById('franks-app-loading')?.remove()
    }
    nuxtApp.hook('app:mounted', clear)
    if (import.meta.client) {
      requestAnimationFrame(clear)
    }
  },
})
