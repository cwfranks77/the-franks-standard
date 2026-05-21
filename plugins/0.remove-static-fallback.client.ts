/** Remove pre-rendered SEO fallback so it never blocks header pills or hero buttons. */
export default defineNuxtPlugin({
  name: 'remove-static-fallback',
  enforce: 'pre',
  setup () {
    const clear = () => {
      document.documentElement.classList.add('nuxt-ready')
      document.getElementById('fss-static-boot')?.remove()
      document.getElementById('fss-static-boot-style')?.remove()
      document.getElementById('fss-static-boot-hide')?.remove()
    }
    clear()
    if (import.meta.client) {
      requestAnimationFrame(clear)
      document.addEventListener('DOMContentLoaded', clear, { once: true })
    }
  },
})