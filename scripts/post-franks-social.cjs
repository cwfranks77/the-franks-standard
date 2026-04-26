/**
 * Post The Franks Standard to Telegram, Facebook, X.
 * Reuse the same TELEGRAM_*, FACEBOOK_*, TWITTER_* (or X_*) variables as token/scripts/post-social.js for ZFUEL if you want one bot and apps for both brands.
 *
 *   cd the-franks-standard-site
 *   node scripts/post-franks-social.cjs
 *
 * Requires: npm i axios form-data dotenv
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const crypto = require('crypto')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const PUBLIC_DIR = path.join(__dirname, '..', 'public')
/** Telegram sendPhoto expects a raster image; prefer png/jpg if present. */
function resolveRasterLogoPath () {
  for (const name of ['franks-pavilion.png', 'logo.png', 'logo.jpg', 'logo.jpeg']) {
    const p = path.join(PUBLIC_DIR, name)
    if (fs.existsSync(p)) { return p }
  }
  return null
}
const SITE = 'https://thefranksstandard.com'

const TELEGRAM_TEXT = `The Franks Standard is open — the authenticity-first marketplace for collectibles, gear, and high-trust inventory.

COA or signed in-platform guarantee on every listing. Zero tolerance for fakes. Built for what bazaar marketplaces are not: proof, not just volume.

${SITE}

Sellers: join free. Buyers: know what you are getting.

— Charles Franks / The Franks Standard`

const FACEBOOK_TEXT = `The Franks Standard is live. A new marketplace where every public listing is backed by a Certificate of Authenticity or a signed in-platform guarantee — not optional paperwork buried in a listing.

If you sell high-trust items, this is a floor for reputation, not a flood of fakes.

Join: ${SITE}`

const X_TWEET = `The Franks Standard is live — every listing: COA or signed guarantee. Collectibles & gear, proof-first. ${SITE}

#collectibles #TheFranksStandard`

function encodeRFC3986 (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

function oauthSign (method, url, params, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params).sort().map(k => `${encodeRFC3986(k)}=${encodeRFC3986(params[k])}`).join('&')
  const baseString = `${method}&${encodeRFC3986(url)}&${encodeRFC3986(sortedParams)}`
  const signingKey = `${encodeRFC3986(consumerSecret)}&${encodeRFC3986(tokenSecret)}`
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')
}

function buildOAuthHeader (method, url, _body, apiKey, apiSecret, accessToken, accessSecret) {
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  }
  const signature = oauthSign(method, url, { ...oauthParams }, apiSecret, accessSecret)
  oauthParams.oauth_signature = signature
  return 'OAuth ' + Object.keys(oauthParams).sort().map(k => `${encodeRFC3986(k)}="${encodeRFC3986(oauthParams[k])}"`).join(', ')
}

async function postTelegram () {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = process.env.TELEGRAM_CHANNEL_ID
  if (!botToken || !channelId) { console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID'); return false }
  const base = `https://api.telegram.org/bot${botToken}`
  const rasterLogo = resolveRasterLogoPath()
  if (rasterLogo) {
    const form = new FormData()
    form.append('chat_id', channelId)
    form.append('photo', fs.createReadStream(rasterLogo))
    form.append('caption', TELEGRAM_TEXT.substring(0, 1024))
    await axios.post(`${base}/sendPhoto`, form, { headers: form.getHeaders(), maxContentLength: Infinity })
    if (TELEGRAM_TEXT.length > 1024) {
      await axios.post(`${base}/sendMessage`, { chat_id: channelId, text: TELEGRAM_TEXT })
    }
  } else {
    console.warn('No franks-pavilion.png or logo.png/jpg in public/; posting text only. Add a PNG for Telegram sendPhoto.')
    await axios.post(`${base}/sendMessage`, { chat_id: channelId, text: TELEGRAM_TEXT })
  }
  console.log('OK: Telegram')
  return true
}

async function postFacebook () {
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  const pageId = process.env.FACEBOOK_PAGE_ID
  if (!pageToken || !pageId) { console.error('Missing Facebook Page env'); return false }
  const res = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
    message: FACEBOOK_TEXT,
    link: SITE,
    access_token: pageToken
  })
  console.log('OK: Facebook', res.data?.id || res.data)
  return true
}

async function postX () {
  const apiKey = process.env.X_API_KEY
  const apiSecret = process.env.X_API_SECRET
  const accessToken = process.env.X_ACCESS_TOKEN
  const accessSecret = process.env.X_ACCESS_SECRET
  if (![apiKey, apiSecret, accessToken, accessSecret].every(Boolean)) { console.error('Missing X API env'); return false }
  const tweetUrl = 'https://api.twitter.com/2/tweets'
  const text = X_TWEET.length > 280 ? X_TWEET.slice(0, 276) + '...' : X_TWEET
  const body = { text }
  const auth = buildOAuthHeader('POST', tweetUrl, body, apiKey, apiSecret, accessToken, accessSecret)
  const res = await axios.post(tweetUrl, body, { headers: { Authorization: auth, 'Content-Type': 'application/json' } })
  console.log('OK: X', res.data?.data?.id)
  return true
}

const argv = process.argv.slice(2)
const all = argv.length === 0
;(async () => {
  if (all || argv.includes('--telegram')) await postTelegram().catch(e => { console.error(e); process.exitCode = 1 })
  if (all || argv.includes('--facebook')) await postFacebook().catch(e => { console.error(e); process.exitCode = 1 })
  if (all || argv.includes('--x')) await postX().catch(e => { console.error(e); process.exitCode = 1 })
})()
