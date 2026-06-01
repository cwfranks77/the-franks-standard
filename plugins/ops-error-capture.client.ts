/**
 * Capture Vue + window runtime errors and POST to ops-error-ingest.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const config = useRuntimeConfig()
  const base = String(config.public.supabaseUrl || '').replace(/\/+$/, '')
  if (!base) return

  const ingestUrl = `${base}/functions/v1/ops-error-ingest`
  let lastSentAt = 0

  async function reportError (payload: Record<string, unknown>) {
    const now = Date.now()
    if (now - lastSentAt < 2000) return
    lastSentAt = now

    try {
      await fetch(ingestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'client',
          severity: 'high',
          url: window.location.href,
          user_agent: navigator.userAgent,
          ...payload,
        }),
        keepalive: true,
      })
    } catch {
      // Best-effort only — never throw from error handler
    }
  }

  const prevHandler = nuxtApp.vueApp.config.errorHandler
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    reportError({
      source: 'vue',
      message,
      stack,
      metadata: { info, component: instance?.$options?.name ?? null },
    })
    if (typeof prevHandler === 'function') {
      prevHandler(err, instance, info)
    }
  }

  window.addEventListener('error', (event) => {
    reportError({
      source: 'window.onerror',
      message: event.message || 'Script error',
      stack: event.error instanceof Error ? event.error.stack : undefined,
      metadata: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    reportError({
      source: 'unhandledrejection',
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    })
  })
})
