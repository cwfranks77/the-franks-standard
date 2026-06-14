/**
 * After deploy, cached index.html can reference removed /_nuxt/*.js chunks (404).
 * Recover once by hard-reloading with a cache-bust query param.
 */
const RELOAD_KEY = 'fss-chunk-reload-v1'

function isChunkLoadFailure (message: string, filename?: string) {
  const m = message || ''
  if (filename && /\/_nuxt\//.test(filename)) return true
  return /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError|dynamically imported module/i.test(m)
}

function reloadWithCacheBust () {
  if (typeof sessionStorage === 'undefined') return
  if (sessionStorage.getItem(RELOAD_KEY)) return
  sessionStorage.setItem(RELOAD_KEY, '1')
  const url = new URL(window.location.href)
  url.searchParams.set('_cb', String(Date.now()))
  window.location.replace(url.toString())
}

export default defineNuxtPlugin({
  name: 'chunk-load-recovery',
  enforce: 'pre',
  setup (nuxtApp) {
    if (!import.meta.client) return

    window.addEventListener(
      'error',
      (event) => {
        const target = event.target
        if (target instanceof HTMLScriptElement) {
          const src = target.src || ''
          if (src.includes('/_nuxt/')) reloadWithCacheBust()
          return
        }
        if (target instanceof HTMLLinkElement && target.rel === 'modulepreload') {
          const href = target.href || ''
          if (href.includes('/_nuxt/')) reloadWithCacheBust()
        }
        if (isChunkLoadFailure(event.message || '', event.filename)) {
          reloadWithCacheBust()
        }
      },
      true,
    )

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason
      const message = reason instanceof Error ? reason.message : String(reason ?? '')
      if (isChunkLoadFailure(message)) reloadWithCacheBust()
    })

    nuxtApp.hook('app:mounted', () => {
      try {
        sessionStorage.removeItem(RELOAD_KEY)
      } catch {
        // ignore
      }
    })
  },
})
