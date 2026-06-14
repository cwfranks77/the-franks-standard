/** Google Ads / Analytics tag — set NUXT_PUBLIC_GADS_ID in .env and rebuild. */
export default defineNuxtPlugin(() => {
  const id = String(useRuntimeConfig().public.gadsId || '').trim()
  if (!id || !import.meta.client) return

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)

  const w = window
  w.dataLayer = w.dataLayer || []
  function gtag () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments)
  }
  w.gtag = gtag
  gtag('js', new Date())
  gtag('config', id)
})
