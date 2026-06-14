import { OPS_COOKIE, opsSessionSecret, verifyOpsSessionToken } from '../utils/opsAuth'

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (path.startsWith('/api/ops/session')) return
  if (path.startsWith('/api/public/')) return

  const isProtectedPage = path.startsWith('/ops/') || path.startsWith('/admin/')
  const isProtectedApi = path.startsWith('/api/ops/') && !path.startsWith('/api/ops/session')

  if (!isProtectedPage && !isProtectedApi) return

  if (path === '/ops' || path === '/ops/') return

  const config = useRuntimeConfig()
  const secret = opsSessionSecret(config)
  const cookie = getCookie(event, OPS_COOKIE)

  if (verifyOpsSessionToken(cookie, secret)) return

  if (path.startsWith('/api/')) {
    throw createError({ statusCode: 401, statusMessage: 'Operator authentication required' })
  }

  return sendRedirect(event, '/ops', 302)
})
