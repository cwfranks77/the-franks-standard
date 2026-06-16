import { appendLocalActivity } from '~/utils/platformActivity'

const ERROR_KEY = 'tfs-site-errors-v1'
const MAX_ERRORS = 80

function pushError (message: string) {
  try {
    const list: { message: string; at: string }[] = JSON.parse(localStorage.getItem(ERROR_KEY) || '[]')
    list.unshift({ message: String(message).slice(0, 500), at: new Date().toISOString() })
    localStorage.setItem(ERROR_KEY, JSON.stringify(list.slice(0, MAX_ERRORS)))
  } catch {
    // ignore storage failures
  }
}

/** Site-wide error capture for the operator Site Monitor panel. */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const prev = nuxtApp.vueApp.config.errorHandler
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    const message = err instanceof Error ? err.message : String(err)
    pushError(`Vue: ${message} (${info || 'unknown'})`)
    appendLocalActivity({
      user_id: null,
      user_display_name: null,
      ip_address: 'browser-session',
      user_agent: navigator.userAgent,
      action: `Site error: ${message.slice(0, 120)}`,
      action_category: 'infraction',
      metadata: { source: 'vue', info },
    })
    if (typeof prev === 'function') prev(err, instance, info)
  }

  window.addEventListener('error', (event) => {
    pushError(event.message || 'Script error')
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const message = reason instanceof Error ? reason.message : String(reason)
    pushError(`Unhandled: ${message}`)
  })
})
