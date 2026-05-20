/** Remove pre-rendered SEO fallback so it does not block hero buttons and links. */
export default defineNuxtPlugin(() => {
  const clear = () => {
    document.documentElement.classList.add('nuxt-ready')
    document.getElementById('fss-static-boot')?.remove()
    document.getElementById('fss-static-boot-style')?.remove()
  }
  clear()
  requestAnimationFrame(clear)
})
