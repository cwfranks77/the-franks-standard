import { OPS_COOKIE, opsSessionSecret, signOpsSessionToken, verifyOpsPhrase } from '../../utils/opsAuth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const phrase = String(body?.phrase || '')
  const config = useRuntimeConfig()
  const expectedHash = String(config.public.opsAccessKeyHash || '')

  if (!expectedHash) {
    throw createError({ statusCode: 503, statusMessage: 'Operator key not configured on this build.' })
  }
  if (!verifyOpsPhrase(phrase, expectedHash)) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid operator phrase.' })
  }

  const secret = opsSessionSecret(config)
  const token = signOpsSessionToken(secret)
  setCookie(event, OPS_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return { ok: true }
})
