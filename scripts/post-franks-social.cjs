/**
 * Post The Franks Standard to Telegram, Facebook, X.
 * Uses standard TELEGRAM_*, FACEBOOK_*, and X_* environment variables.
 *
 *   cd the-franks-standard
 *   npm run post:social
 *   # or: node scripts/post-franks-social.cjs [--telegram|--facebook|--x]
 *   # founding seller promo: node scripts/post-franks-social.cjs --founders [--telegram|--facebook|--x]
 *   # honors program: node scripts/post-franks-social.cjs --honor [--telegram|--facebook|--x]
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
const LINK_REGISTER = `${SITE}/auth/register`
const LINK_SELL = `${SITE}/sell`
const LINK_BROWSE = `${SITE}/browse`
const LINK_SELLERS = `${SITE}/sellers`
const LINK_PRICING = `${SITE}/pricing`
const LINK_VIDEO = `${SITE}/video`
const LINK_SUPPORT = `${SITE}/support`
const LINK_DOWNLOAD = `${SITE}/download`
const LINK_FOUNDERS = `${SITE}/join/founders10`
const LINK_HONOR = `${SITE}/honor`

const HONOR_TELEGRAM = `The Franks Standard honors those who serve.

Veterans, law enforcement, firefighters, EMS, 911 dispatchers, and corrections officers: sell on our authenticity-first marketplace with 6 months of Pro Seller free.

- Unlimited listings and featured placement
- AI Store Builder included
- COA-backed authenticity on every listing
- One honor redemption per person

Learn more and claim benefits: ${LINK_HONOR}
Promo code: HONOR26

Start selling: ${LINK_SELL}
${SITE}`

const HONOR_FACEBOOK = `We built The Franks Standard on trust — and we want to give back to the people who keep our communities safe.

If you are a veteran, police officer, firefighter, EMS professional, dispatcher, or corrections officer, you can sell on our marketplace with 6 months of Pro free.

Visit ${LINK_HONOR} and use promo code HONOR26 when you register.

Thank you for your service.
${SITE}`

const HONOR_X = `Honoring veterans, police, fire, EMS & first responders: 6 months Pro free on The Franks Standard. ${LINK_HONOR} Code HONOR26 #ThankYouForYourService #TheFranksStandard`

const FOUNDERS_TELEGRAM = `Founding seller offer on The Franks Standard — only 10 spots.

The first 10 people who sign up to SELL get 3 months of Pro free (unlimited listings, featured placement, AI Store Builder). One redemption per person — when the 10 spots are gone, the link stops working.

Claim your spot: ${LINK_FOUNDERS}
Promo code at signup: FOUNDERS10

Join to sell: ${LINK_SELL}
Main site: ${SITE}`

const FOUNDERS_FACEBOOK = `We're opening 10 founding seller spots on The Franks Standard.

Sign up to sell and get 3 months of Pro free — no monthly Pro fee during that period. Limited to the first 10 sellers; one offer per person.

Claim your spot: ${LINK_FOUNDERS}
Use promo code FOUNDERS10 when you register or at checkout.

Start selling: ${LINK_SELL}
${SITE}`

const FOUNDERS_X = `First 10 sellers on The Franks Standard get 3 months Pro free. Limited spots — claim yours: ${LINK_FOUNDERS} Code: FOUNDERS10 #TheFranksStandard`

const TELEGRAM_TEXT = `The Franks Standard is live - the authenticity-first marketplace for collectibles, gear, and high-trust inventory.

What the platform offers:
- COA or signed in-platform authenticity guarantee on every listing
- Escrow flow: buyer confirms before final release
- Seller onboarding with store-focused tools
- AI Store Builder for faster listing setup
- Integrated video rooms for live buyer/seller meetings
- Buyer/seller support paths (chat, phone, email)
- Pricing and launch offer pages for transparent seller costs
- Installable app/PWA experience for mobile-first access

Direct links:
Join free: ${LINK_REGISTER}
Start selling: ${LINK_SELL}
Browse now: ${LINK_BROWSE}
For stores: ${LINK_SELLERS}
Pricing: ${LINK_PRICING}
Video rooms: ${LINK_VIDEO}
Support: ${LINK_SUPPORT}
Download app: ${LINK_DOWNLOAD}

Main site: ${SITE}`

const FACEBOOK_TEXT = `The Franks Standard is live: a proof-first marketplace built for serious buyers and sellers.

Every listing requires a COA or signed in-platform authenticity guarantee, and the checkout flow is designed around buyer confidence with escrow-style confirmation.

Platform highlights:
- Collectibles and high-trust inventory marketplace
- Seller onboarding and store-first tools
- AI Store Builder to accelerate setup
- Built-in video rooms for real-time buyer/seller sessions
- Dedicated pricing, support, and install flows
- Zero-tolerance stance on fakes

Direct links:
Join: ${LINK_REGISTER}
Sell: ${LINK_SELL}
Browse: ${LINK_BROWSE}
For stores: ${LINK_SELLERS}
Support: ${LINK_SUPPORT}
Download app: ${LINK_DOWNLOAD}

Main site: ${SITE}`

const X_TWEET = `The Franks Standard is live: COA/signed guarantee listings, escrow-style buyer confirmation, AI Store Builder, video rooms, seller onboarding, and installable app. Join now: ${LINK_REGISTER}
#TheFranksStandard #collectibles`

function assertFranksBrandCopy () {
  const combined = `${TELEGRAM_TEXT}\n${FACEBOOK_TEXT}\n${X_TWEET}`.toLowerCase()
  const blocked = ['zentrafuel', 'zfuel', 'zentramesh']
  const hit = blocked.find((w) => combined.includes(w))
  if (hit) {
    throw new Error(`Brand guard blocked post copy containing "${hit}".`)
  }
}

function safeErrorMessage (error, platform) {
  const msg = error?.response?.data?.error?.message
    || error?.response?.data?.description
    || error?.response?.statusText
    || error?.message
    || 'Unknown error'
  return `${platform} post failed: ${msg}`
}

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

async function postTelegram (text = TELEGRAM_TEXT) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = process.env.TELEGRAM_CHANNEL_ID
  if (!botToken || !channelId) { console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID'); return false }
  const base = `https://api.telegram.org/bot${botToken}`
  const rasterLogo = resolveRasterLogoPath()
  if (rasterLogo) {
    const form = new FormData()
    form.append('chat_id', channelId)
    form.append('photo', fs.createReadStream(rasterLogo))
    form.append('caption', text.substring(0, 1024))
    await axios.post(`${base}/sendPhoto`, form, { headers: form.getHeaders(), maxContentLength: Infinity })
    if (text.length > 1024) {
      await axios.post(`${base}/sendMessage`, { chat_id: channelId, text })
    }
  } else {
    console.warn('No franks-pavilion.png or logo.png/jpg in public/; posting text only. Add a PNG for Telegram sendPhoto.')
    await axios.post(`${base}/sendMessage`, { chat_id: channelId, text })
  }
  console.log('OK: Telegram')
  return true
}

const GRAPH = 'https://graph.facebook.com/v22.0'

async function fetchPageTokenFromUser (userTok, pageId) {
  const { data } = await axios.get(`${GRAPH}/me/accounts`, {
    params: { access_token: userTok, fields: 'id,name,access_token,tasks' }
  })
  const page = (data.data || []).find((p) => String(p.id) === String(pageId))
  return page?.access_token || null
}

async function resolveFacebookPageToken () {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const direct = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  const user = process.env.FACEBOOK_USER_ACCESS_TOKEN
  if (!pageId) { return null }

  for (const label of ['FACEBOOK_USER_ACCESS_TOKEN', 'FACEBOOK_PAGE_ACCESS_TOKEN']) {
    const candidate = label === 'FACEBOOK_USER_ACCESS_TOKEN' ? user : direct
    if (!candidate) { continue }
    try {
      const pageToken = await fetchPageTokenFromUser(candidate, pageId)
      if (pageToken) {
        console.log(`Resolved Page token for ${pageId} (from ${label} via me/accounts)`)
        return pageToken
      }
      console.warn(`${label}: Page not in me/accounts`)
    } catch (e) {
      console.warn(`${label} me/accounts:`, e.response?.data?.error?.message || e.message)
    }
  }
  return direct || null
}

async function postFacebook (text = FACEBOOK_TEXT) {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const pageToken = await resolveFacebookPageToken()
  if (!pageToken || !pageId) {
    console.error('Missing Facebook Page env (FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_USER_ACCESS_TOKEN + FACEBOOK_PAGE_ID)')
    return false
  }
  // Message-only post (URLs in text). Omit `link` — it often requires pages_read_engagement.
  const res = await axios.post(`${GRAPH}/${pageId}/feed`, {
    message: text,
    access_token: pageToken
  })
  console.log('OK: Facebook', res.data?.id || res.data)
  return true
}

async function postX (tweet = X_TWEET) {
  const apiKey = process.env.X_API_KEY
  const apiSecret = process.env.X_API_SECRET
  const accessToken = process.env.X_ACCESS_TOKEN
  const accessSecret = process.env.X_ACCESS_SECRET
  if (![apiKey, apiSecret, accessToken, accessSecret].every(Boolean)) { console.error('Missing X API env'); return false }
  const tweetUrl = 'https://api.twitter.com/2/tweets'
  const text = tweet.length > 280 ? tweet.slice(0, 276) + '...' : tweet
  const body = { text }
  const auth = buildOAuthHeader('POST', tweetUrl, body, apiKey, apiSecret, accessToken, accessSecret)
  const res = await axios.post(tweetUrl, body, { headers: { Authorization: auth, 'Content-Type': 'application/json' } })
  console.log('OK: X', res.data?.data?.id)
  return true
}

const argv = process.argv.slice(2)
const CAMPAIGN_FLAGS = new Set(['--founders', '--honor'])
const founders = argv.includes('--founders')
const honor = argv.includes('--honor')
const channels = argv.filter((a) => a.startsWith('--') && !CAMPAIGN_FLAGS.has(a))
const all = channels.length === 0

function assertCampaignBrandCopy (text) {
  const combined = String(text || '').toLowerCase()
  const blocked = ['zentrafuel', 'zfuel', 'zentramesh']
  const hit = blocked.find((w) => combined.includes(w))
  if (hit) throw new Error(`Brand guard blocked post copy containing "${hit}".`)
}

;(async () => {
  if (founders) {
    assertCampaignBrandCopy(`${FOUNDERS_TELEGRAM}\n${FOUNDERS_FACEBOOK}\n${FOUNDERS_X}`)
    if (all || argv.includes('--telegram')) await postTelegram(FOUNDERS_TELEGRAM).catch(e => { console.error(safeErrorMessage(e, 'Telegram')); process.exitCode = 1 })
    if (all || argv.includes('--facebook')) await postFacebook(FOUNDERS_FACEBOOK).catch(e => { console.error(safeErrorMessage(e, 'Facebook')); process.exitCode = 1 })
    if (all || argv.includes('--x')) await postX(FOUNDERS_X).catch(e => { console.error(safeErrorMessage(e, 'X')); process.exitCode = 1 })
    return
  }
  if (honor) {
    assertCampaignBrandCopy(`${HONOR_TELEGRAM}\n${HONOR_FACEBOOK}\n${HONOR_X}`)
    if (all || argv.includes('--telegram')) await postTelegram(HONOR_TELEGRAM).catch(e => { console.error(safeErrorMessage(e, 'Telegram')); process.exitCode = 1 })
    if (all || argv.includes('--facebook')) await postFacebook(HONOR_FACEBOOK).catch(e => { console.error(safeErrorMessage(e, 'Facebook')); process.exitCode = 1 })
    if (all || argv.includes('--x')) await postX(HONOR_X).catch(e => { console.error(safeErrorMessage(e, 'X')); process.exitCode = 1 })
    return
  }
  assertFranksBrandCopy()
  if (all || argv.includes('--telegram')) await postTelegram().catch(e => { console.error(safeErrorMessage(e, 'Telegram')); process.exitCode = 1 })
  if (all || argv.includes('--facebook')) await postFacebook().catch(e => { console.error(safeErrorMessage(e, 'Facebook')); process.exitCode = 1 })
  if (all || argv.includes('--x')) await postX().catch(e => { console.error(safeErrorMessage(e, 'X')); process.exitCode = 1 })
})()
