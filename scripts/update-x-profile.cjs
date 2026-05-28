/**
 * Rebrand X (Twitter) profile from ZFuel → The Franks Standard (name, bio, URL, profile photo).
 *
 *   node scripts/update-x-profile.cjs
 *   node scripts/update-x-profile.cjs --dry-run
 *   node scripts/update-x-profile.cjs --image path/to/logo.png
 *
 * Requires in .env: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 * (same app that currently posts — must be the @zfuel account tokens until you rename).
 */
const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const rootEnv = path.join(__dirname, '..', '.env')
const tokenEnv = 'C:\\Users\\ninja\\OneDrive\\Documents\\ZentraMeshNative\\token\\.env'
require('dotenv').config({ path: rootEnv })
if (!process.env.X_API_KEY && fs.existsSync(tokenEnv)) {
  require('dotenv').config({ path: tokenEnv })
}

const { X_PROFILE } = require('../utils/socialBrandCopy.cjs')

const dryRun = process.argv.includes('--dry-run')
const imageArg = process.argv.find((a, i) => process.argv[i - 1] === '--image')

function encodeRFC3986 (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

function oauthSign (method, url, params, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${encodeRFC3986(k)}=${encodeRFC3986(params[k])}`)
    .join('&')
  const baseString = `${method}&${encodeRFC3986(url)}&${encodeRFC3986(sortedParams)}`
  const signingKey = `${encodeRFC3986(consumerSecret)}&${encodeRFC3986(tokenSecret)}`
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')
}

function buildOAuthHeader (method, url, extraParams, apiKey, apiSecret, accessToken, accessSecret) {
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    ...extraParams,
  }
  const signature = oauthSign(method, url, oauthParams, apiSecret, accessSecret)
  oauthParams.oauth_signature = signature
  return (
    'OAuth ' +
    Object.keys(oauthParams)
      .sort()
      .map((k) => `${encodeRFC3986(k)}="${encodeRFC3986(oauthParams[k])}"`)
      .join(', ')
  )
}

function resolveImagePath () {
  if (imageArg && fs.existsSync(imageArg)) return imageArg
  const candidates = [
    path.join(__dirname, '..', 'public', 'franks-pavilion.png'),
    path.join(__dirname, '..', 'public', 'logo.png'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}

async function updateProfileText (creds) {
  const url = 'https://api.twitter.com/1.1/account/update_profile.json'
  const body = new URLSearchParams({
    name: X_PROFILE.name.slice(0, 50),
    description: X_PROFILE.description.slice(0, 160),
    url: X_PROFILE.url.slice(0, 100),
    location: X_PROFILE.location.slice(0, 30),
  }).toString()
  const auth = buildOAuthHeader('POST', url, {}, creds.key, creds.secret, creds.token, creds.tokenSecret)
  const res = await axios.post(url, body, {
    headers: {
      Authorization: auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return res.data
}

async function updateProfileImage (creds, imagePath) {
  const url = 'https://upload.twitter.com/1.1/account/update_profile_image.json'
  const form = new FormData()
  form.append('image', fs.createReadStream(imagePath))
  const auth = buildOAuthHeader('POST', url, {}, creds.key, creds.secret, creds.token, creds.tokenSecret)
  const res = await axios.post(url, form, {
    headers: { ...form.getHeaders(), Authorization: auth },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })
  return res.data
}

async function main () {
  const creds = {
    key: process.env.X_API_KEY,
    secret: process.env.X_API_SECRET,
    token: process.env.X_ACCESS_TOKEN,
    tokenSecret: process.env.X_ACCESS_SECRET,
  }
  if (!Object.values(creds).every(Boolean)) {
    console.error('Missing X API env vars in .env')
    process.exit(1)
  }

  const imagePath = resolveImagePath()
  console.log('Target profile:', X_PROFILE)
  console.log('Image:', imagePath || '(none — text only)')

  if (dryRun) {
    console.log('Dry run — no API calls.')
    return
  }

  const textResult = await updateProfileText(creds)
  console.log('OK: profile text', textResult?.screen_name || textResult?.name)

  if (imagePath) {
    const stat = fs.statSync(imagePath)
    if (stat.size > 2 * 1024 * 1024) {
      console.warn('Image > 2MB — X may reject. Resize franks-pavilion.png if upload fails.')
    }
    const imgResult = await updateProfileImage(creds, imagePath)
    console.log('OK: profile image', imgResult?.profile_image_url_https || 'updated')
  }

  console.log('\nManual check: open https://x.com/settings/profile')
  console.log('Optional: change @handle to @thefranksstandard in X Settings → Username (if available).')
}

main().catch((e) => {
  console.error(e.response?.data || e.message)
  process.exit(1)
})
