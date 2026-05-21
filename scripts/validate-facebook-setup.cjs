/**
 * Validate Facebook env before posting. Safe to run in CI (no secrets printed).
 *   node scripts/validate-facebook-setup.cjs
 */
const axios = require('axios')

const GRAPH = 'https://graph.facebook.com/v22.0'
const PAGE_ID = process.env.FACEBOOK_PAGE_ID
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
const USER_TOKEN = process.env.FACEBOOK_USER_ACCESS_TOKEN

const REQUIRED_SCOPES = ['pages_manage_posts']
const RECOMMENDED_SCOPES = ['pages_read_engagement']

function fail (msg) {
  console.error(msg)
  process.exitCode = 1
}

async function debugToken (token) {
  const { data } = await axios.get(`${GRAPH}/debug_token`, {
    params: { input_token: token, access_token: token }
  })
  return data.data
}

async function fetchPageTokenFromUser (userTok) {
  const { data } = await axios.get(`${GRAPH}/me/accounts`, {
    params: { access_token: userTok, fields: 'id,name,access_token,tasks' }
  })
  const page = (data.data || []).find((p) => String(p.id) === String(PAGE_ID))
  return page?.access_token || null
}

async function resolvePageToken () {
  if (!PAGE_ID) {
    fail('Missing FACEBOOK_PAGE_ID (expected 1018067851385482 for ZentraFuel Page).')
    return null
  }

  // Permanent Page token (from push-facebook-long-lived.ps1) — use directly, do not require user token.
  if (PAGE_TOKEN && PAGE_TOKEN.length > 50) {
    try {
      const info = await debugToken(PAGE_TOKEN)
      if (info?.type === 'PAGE') {
        console.log('OK: using FACEBOOK_PAGE_ACCESS_TOKEN (permanent Page token)')
        if (info.expires_at === 0) {
          console.log('OK: token does not expire (expires_at=0)')
        } else if (info.expires_at) {
          console.warn('WARN: Page token has expiry:', new Date(info.expires_at * 1000).toISOString())
          console.warn('      Re-run scripts/push-facebook-long-lived.ps1 for a non-expiring token.')
        }
        return PAGE_TOKEN
      }
      console.warn('FACEBOOK_PAGE_ACCESS_TOKEN is not type PAGE; trying me/accounts fallback.')
    } catch (e) {
      console.warn('FACEBOOK_PAGE_ACCESS_TOKEN debug failed:', e.response?.data?.error?.message || e.message)
    }
  }

  if (USER_TOKEN) {
    try {
      const pageToken = await fetchPageTokenFromUser(USER_TOKEN)
      if (pageToken) {
        console.log('OK: resolved Page token from FACEBOOK_USER_ACCESS_TOKEN via me/accounts')
        return pageToken
      }
      console.warn('FACEBOOK_USER_ACCESS_TOKEN: Page not in me/accounts (token may be expired — use long-lived Page token instead).')
    } catch (e) {
      console.warn('FACEBOOK_USER_ACCESS_TOKEN me/accounts:', e.response?.data?.error?.message || e.message)
    }
  }

  fail('Missing or invalid FACEBOOK_PAGE_ACCESS_TOKEN. Run scripts/push-facebook-long-lived.ps1 once. See docs/META-FACEBOOK-SETUP.md')
  return null
}

async function main () {
  const token = await resolvePageToken()
  if (!token) { return }

  let info
  try {
    info = await debugToken(token)
  } catch (e) {
    fail(`Token debug failed: ${e.response?.data?.error?.message || e.message}`)
    return
  }

  if (!info) {
    fail('Token debug returned no data.')
    return
  }

  console.log(`Token type: ${info.type || 'unknown'}`)
  const scopes = info.scopes || []
  if (scopes.length) { console.log(`Scopes: ${scopes.join(', ')}`) }

  const missing = REQUIRED_SCOPES.filter((s) => !scopes.includes(s))
  const missingRecommended = RECOMMENDED_SCOPES.filter((s) => !scopes.includes(s))
  if (missingRecommended.length) {
    console.warn(`Optional scopes missing: ${missingRecommended.join(', ')} (link previews only)`)
  }
  if (info.type !== 'PAGE') {
    console.warn('Expected type PAGE. Use the access_token inside me/accounts for your Page, not the Explorer user token.')
  }
  if (missing.length) {
    fail(
      `Missing scopes: ${missing.join(', ')}. In Meta App Dashboard, Use cases, Manage everything on your Page, Customize, add pages_manage_posts, then regenerate token. See docs/META-FACEBOOK-SETUP.md`
    )
    return
  }

  try {
    await axios.get(`${GRAPH}/${PAGE_ID}`, {
      params: { fields: 'id,name', access_token: token }
    })
    console.log(`OK: can read Page ${PAGE_ID}`)
  } catch (e) {
    fail(`Cannot read Page: ${e.response?.data?.error?.message || e.message}`)
    return
  }

  console.log('OK: Facebook token ready for posting')
}

main().catch((e) => {
  fail(e.message || String(e))
})
