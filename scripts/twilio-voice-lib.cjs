const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const ENV_LOCAL = path.join(ROOT, '.env.local')
const PLACEHOLDER_RE = /your_actual|XXXXXXXXXX|placeholder/i
const FRANKS_TOLL_FREE = '+18778370527'

function loadEnvLocal () {
  if (!fs.existsSync(ENV_LOCAL)) return
  for (const line of fs.readFileSync(ENV_LOCAL, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!m || process.env[m[1]]) continue
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

function authHeader () {
  const SID = (process.env.TWILIO_ACCOUNT_SID || '').trim()
  const TOKEN = (process.env.TWILIO_AUTH_TOKEN || '').trim()
  return { SID, TOKEN, header: 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64') }
}

function isPlaceholder (value) {
  return !value || PLACEHOLDER_RE.test(value)
}

function normalizeE164 (raw) {
  const value = String(raw || '').trim()
  if (!value || isPlaceholder(value)) return ''
  if (value.startsWith('+')) return value.replace(/\s/g, '')
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

function twimletEcho (sayText) {
  const safe = String(sayText).replace(/&/g, 'and').replace(/</g, '').replace(/>/g, '')
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">${safe}</Say></Response>`
  return `https://twimlets.com/echo?Twiml=${encodeURIComponent(twiml)}`
}

function twimletForward (ownerE164) {
  return `https://twimlets.com/forward?PhoneNumber=${encodeURIComponent(ownerE164)}&Timeout=35`
}

function twimletSayThenForward (sayText, ownerE164) {
  const safe = String(sayText).replace(/&/g, 'and').replace(/</g, '').replace(/>/g, '')
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">${safe}</Say><Dial timeout="35">${ownerE164}</Dial></Response>`
  return `https://twimlets.com/echo?Twiml=${encodeURIComponent(twiml)}`
}

function buildMenuUrl ({ message, options, ownerE164 }) {
  const params = new URLSearchParams({
    Message: message,
    NumDigits: '1',
    Timeout: '12',
  })
  for (const [digit, sayText] of Object.entries(options)) {
    params.set(digit, twimletEcho(sayText))
  }
  if (ownerE164) {
    params.set('0', twimletForward(ownerE164))
  }
  return `https://twimlets.com/menu?${params.toString()}`
}

async function twilioGet (urlPath) {
  const { header } = authHeader()
  const res = await fetch(`https://api.twilio.com/2010-04-01${urlPath}`, {
    headers: { Authorization: header },
  })
  const text = await res.text()
  const data = JSON.parse(text)
  if (!res.ok) throw new Error(`Twilio GET ${urlPath} -> ${res.status}: ${text.slice(0, 240)}`)
  return data
}

async function twilioPost (urlPath, body) {
  const { header } = authHeader()
  const res = await fetch(`https://api.twilio.com/2010-04-01${urlPath}`, {
    method: 'POST',
    headers: {
      Authorization: header,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  })
  const text = await res.text()
  const data = JSON.parse(text)
  if (!res.ok) throw new Error(`Twilio POST ${urlPath} -> ${res.status}: ${text.slice(0, 240)}`)
  return data
}

async function listIncomingNumbers () {
  const { SID } = authHeader()
  const data = await twilioGet(`/Accounts/${SID}/IncomingPhoneNumbers.json?PageSize=50`)
  return data.incoming_phone_numbers || []
}

function requireCredentials () {
  loadEnvLocal()
  const { SID, TOKEN } = authHeader()
  if (isPlaceholder(SID) || isPlaceholder(TOKEN)) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required in .env.local')
  }
  return { SID, TOKEN }
}

function requireOwnerPhone () {
  const ownerE164 = normalizeE164(process.env.PRIVATE_OWNER_CELL_PHONE)
  if (!ownerE164) {
    throw new Error('PRIVATE_OWNER_CELL_PHONE=+1... required in .env.local (real cell, E.164)')
  }
  return ownerE164
}

const BC_VOICE_INBOUND_URL = 'https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/bc-voice-inbound'

function bcVoiceInboundUrl () {
  return process.env.BC_VOICE_INBOUND_URL || BC_VOICE_INBOUND_URL
}

async function updateVoiceWebhook ({ phoneRow, voiceUrl, fallbackUrl, friendlyName, voiceMethod = 'POST', fallbackMethod = 'POST' }) {
  const { SID } = authHeader()
  return twilioPost(`/Accounts/${SID}/IncomingPhoneNumbers/${phoneRow.sid}.json`, {
    FriendlyName: friendlyName,
    VoiceUrl: voiceUrl,
    VoiceMethod: voiceMethod,
    VoiceFallbackUrl: fallbackUrl,
    VoiceFallbackMethod: fallbackMethod,
  })
}

async function findNumber (predicate, notFoundMessage) {
  const rows = await listIncomingNumbers()
  const hit = rows.find(predicate)
  if (!hit) throw new Error(notFoundMessage)
  return hit
}

module.exports = {
  FRANKS_TOLL_FREE,
  BC_VOICE_INBOUND_URL,
  loadEnvLocal,
  requireCredentials,
  requireOwnerPhone,
  normalizeE164,
  twimletEcho,
  twimletForward,
  twimletSayThenForward,
  buildMenuUrl,
  bcVoiceInboundUrl,
  listIncomingNumbers,
  updateVoiceWebhook,
  findNumber,
  isPlaceholder,
}
