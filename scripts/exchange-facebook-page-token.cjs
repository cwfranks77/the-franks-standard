/**
 * Exchange a short-lived user token for a long-lived user token, then resolve Page token.
 * Usage (do not commit tokens):
 *   set FACEBOOK_APP_ID=...
 *   set FACEBOOK_APP_SECRET=...
 *   set FACEBOOK_USER_ACCESS_TOKEN=...   (Explorer user token after Generate)
 *   set FACEBOOK_PAGE_ID=1018067851385482
 *   node scripts/exchange-facebook-page-token.cjs
 */
const axios = require('axios')

const GRAPH = 'https://graph.facebook.com/v22.0'
const appId = process.env.FACEBOOK_APP_ID
const appSecret = process.env.FACEBOOK_APP_SECRET
const userToken = process.env.FACEBOOK_USER_ACCESS_TOKEN
const pageId = process.env.FACEBOOK_PAGE_ID || '1018067851385482'

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
  console.log('OK: long-lived user token (expires_in days ~', Math.round((long.expires_in || 0) / 86400), ')')

  const { data: accounts } = await axios.get(`${GRAPH}/me/accounts`, {
    params: { access_token: longUser, fields: 'id,name,access_token' }
  })
  const page = (accounts.data || []).find((p) => String(p.id) === String(pageId))
  if (!page?.access_token) {
    console.error(`Page ${pageId} not in me/accounts. Add pages_show_list and regenerate user token.`)
    process.exit(1)
  }

  console.log(`OK: Page token for ${page.name || pageId}`)
  console.log('')
  console.log('Set GitHub secret (PowerShell):')
  console.log(`  "${page.access_token}" | gh secret set FACEBOOK_PAGE_ACCESS_TOKEN --repo cwfranks77/the-franks-standard --body-file -`)
  console.log('')
  console.log('Or paste into: https://github.com/cwfranks77/the-franks-standard/settings/secrets/actions')
}

main().catch((e) => {
  console.error(e.response?.data?.error?.message || e.message)
  process.exit(1)
})
