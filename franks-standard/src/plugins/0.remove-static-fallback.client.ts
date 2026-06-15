/** Remove pre-rendered SEO fallback only after Nuxt mounts — avoids white screen while JS loads. */
export default defineNuxtPlugin({
  name: 'remove-static-fallback',
  setup (nuxtApp) {
    const clear = () => {
      document.documentElement.classList.add('nuxt-ready')
      document.getElementById('fss-static-boot')?.remove()
      document.getElementById('fss-static-boot-style')?.remove()
      document.getElementById('fss-static-boot-hide')?.remove()
    }
    if (import.meta.client) {
      nuxtApp.hook('app:created', clear)
      nuxtApp.hook('app:mounted', clear)
    }
  },
})
