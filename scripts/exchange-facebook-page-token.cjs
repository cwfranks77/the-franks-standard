/**
 * Exchange short-lived user token -> long-lived user -> non-expiring Page token.
 *   set FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_USER_ACCESS_TOKEN
 *   node scripts/exchange-facebook-page-token.cjs
 *   node scripts/exchange-facebook-page-token.cjs --push-github
 */
const axios = require('axios')
const { spawnSync } = require('child_process')

const GRAPH = 'https://graph.facebook.com/v22.0'
const appId = process.env.FACEBOOK_APP_ID
const appSecret = process.env.FACEBOOK_APP_SECRET
const userToken = process.env.FACEBOOK_USER_ACCESS_TOKEN
const pageId = process.env.FACEBOOK_PAGE_ID || '1018067851385482'
const pushGithub = process.argv.includes('--push-github')
const repo = process.env.GITHUB_REPO || 'cwfranks77/the-franks-standard'

async function debugToken (token) {
  const { data } = await axios.get(`${GRAPH}/debug_token`, {
    params: { input_token: token, access_token: token }
  })
  return data.data
}

async function main () {
  if (!appId || !appSecret || !userToken) {
    console.error('Need FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_USER_ACCESS_TOKEN')
    process.exit(1)
  }

  const { data: long } = await axios.get(`${GRAPH}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: userToken
    }
  })
  const longUser = long.access_token
  if (!longUser) {
    console.error('Long-lived exchange failed:', long)
    process.exit(1)
  }
  const longDays = Math.round((long.expires_in || 0) / 86400)
  console.log(`OK: long-lived user token (~${longDays} days)`)

  const { data: accounts } = await axios.get(`${GRAPH}/me/accounts`, {
    params: { access_token: longUser, fields: 'id,name,access_token' }
  })
  const page = (accounts.data || []).find((p) => String(p.id) === String(pageId))
  if (!page?.access_token) {
    console.error(`Page ${pageId} not in me/accounts. Regenerate user token with pages_show_list.`)
    process.exit(1)
  }

  const pageToken = page.access_token
  const info = await debugToken(pageToken)
  console.log(`OK: Page token for ${page.name || pageId}`)
  console.log(`    type=${info.type} expires_at=${info.expires_at} (0 = does not expire)`)
  console.log(`    scopes=${(info.scopes || []).join(', ')}`)

  if (info.expires_at && info.expires_at !== 0) {
    console.warn('WARN: Page token still has expiry. Long-lived user exchange may have failed partially.')
    console.warn('      Token expires:', new Date(info.expires_at * 1000).toISOString())
  } else {
    console.log('OK: Page token is long-lived (no expiry)')
  }

  if (!pushGithub) {
    console.log('')
    console.log(`"${pageToken}" | gh secret set FACEBOOK_PAGE_ACCESS_TOKEN --repo ${repo}`)
    return
  }

  const r = spawnSync('gh', ['secret', 'set', 'FACEBOOK_PAGE_ACCESS_TOKEN', '--repo', repo], {
    input: pageToken,
    encoding: 'utf8'
  })
  if (r.status !== 0) {
    console.error(r.stderr || r.error || 'gh secret set failed')
    process.exit(1)
  }
  spawnSync('gh', ['secret', 'set', 'FACEBOOK_APP_ID', '--repo', repo, '--body', appId], { encoding: 'utf8' })
  console.log('OK: GitHub secrets updated (FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_APP_ID)')
}

main().catch((e) => {
  console.error(e.response?.data?.error?.message || e.message)
  process.exit(1)
})
