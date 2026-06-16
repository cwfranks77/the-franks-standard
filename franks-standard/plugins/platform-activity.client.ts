import { appendLocalActivity } from '~/utils/platformActivity'

const SESSION_KEY = 'tfs-user-session-v1'

function readSession () {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const router = useRouter()
  router.afterEach((to) => {
    const session = readSession()
    if (!session?.userId) return
    appendLocalActivity({
      user_id: session.userId,
      user_display_name: session.displayName || 'Account holder',
      ip_address: 'browser-session',
      user_agent: navigator.userAgent,
      action: `Viewed ${to.path}`,
      action_category: 'browse',
      metadata: { path: to.fullPath },
    })
  })
})
