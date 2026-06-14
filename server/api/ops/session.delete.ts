import { OPS_COOKIE } from '../../utils/opsAuth'

export default defineEventHandler((event) => {
  deleteCookie(event, OPS_COOKIE, { path: '/' })
  return { ok: true }
})
