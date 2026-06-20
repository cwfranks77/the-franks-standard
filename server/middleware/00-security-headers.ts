import { backendRequire as require } from '#cjs-require'
const { SECURITY_HEADERS } = require('#backend/security/security_hardening.js')

/** Apply Helmet-equivalent security headers on every response. */
export default defineEventHandler((event) => {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    setResponseHeader(event, key, value)
  }
})
