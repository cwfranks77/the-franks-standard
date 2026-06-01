#!/usr/bin/env node
/**
 * Fix the toll-free IVR loop where pressing any key replays the greeting.
 *
 * Twilio <Gather> without an action posts collected digits back to the same
 * VoiceUrl. The current number uses a static Twimlets URL, so every keypress
 * restarts the initial message. This script updates the number to a two-step
 * Twimlets setup: greeting -> keypress handler -> owner dial.
 */
const https = require('https')

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || ''
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || ''
const CUSTOMER_NUMBER = process.env.TWILIO_CUSTOMER_SERVICE_NUMBER || '+18778370527'
const OWNER_FORWARD_NUMBER = process.env.TWILIO_OWNER_FORWARD_NUMBER || ''
const DRY_RUN = process.argv.includes('--dry-run')

function fail (message) {
  console.error(message)
  process.exit(1)
}

function twilioRequest (method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? new URLSearchParams(body).toString() : ''
    const req = https.request({
      hostname: 'api.twilio.com',
      path,
      method,
      auth: `${ACCOUNT_SID}:${AUTH_TOKEN}`,
      headers: payload
        ? {
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': Buffer.byteLength(payload),
          }
        : undefined,
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode, data })
        }
      })
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

function escapeXml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function twimletUrl (twiml) {
  return `https://twimlets.com/echo?Twiml=${encodeURIComponent(twiml)}`
}

function ownerDialTwiml (ownerNumber) {
  const owner = escapeXml(ownerNumber)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response>',
    '<Say voice="Polly.Matthew" language="en-US">I received your selection. I am connecting you to the owner now. Please hold.</Say>',
    '<Dial record="record-from-ringing-dual" timeout="30">',
    `<Number>${owner}</Number>`,
    '</Dial>',
    '<Say voice="Polly.Matthew" language="en-US">We were unable to connect you. Please try again later or email info at the franks standard dot com. Thank you for calling.</Say>',
    '</Response>',
  ].join('')
}

function greetingTwiml (handlerUrl, ownerNumber) {
  const owner = escapeXml(ownerNumber)
  const action = escapeXml(handlerUrl)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response>',
    '<Say voice="Polly.Matthew" language="en-US">Thank you for calling The Franks Standard, the authenticity first collectibles and gear marketplace. Every listing on our platform requires proof for collectible items. I am your customer service assistant.</Say>',
    '<Pause length="1"/>',
    `<Gather input="dtmf" timeout="6" numDigits="1" action="${action}" method="POST">`,
    '<Say voice="Polly.Matthew" language="en-US">Press 1 for orders and shipping. Press 2 for selling fees and store setup. Press 3 for authenticity and C O A questions. Press 4 for technical support. Press 0 to speak directly with the owner Charles Franks.</Say>',
    '</Gather>',
    '<Say voice="Polly.Matthew" language="en-US">I did not receive a selection. Connecting you to the owner now. Please hold.</Say>',
    '<Dial record="record-from-ringing-dual" timeout="30">',
    `<Number>${owner}</Number>`,
    '</Dial>',
    '<Say voice="Polly.Matthew" language="en-US">We were unable to connect you. Please try again later or email info at the franks standard dot com. Thank you for calling.</Say>',
    '</Response>',
  ].join('')
}

function extractForwardNumber (voiceUrl) {
  try {
    const parsed = new URL(voiceUrl)
    const twiml = parsed.searchParams.get('Twiml') || ''
    const match = twiml.match(/<Number>(\+\d+)<\/Number>/)
    return match ? match[1] : ''
  } catch {
    return ''
  }
}

function maskNumber (value) {
  const s = String(value || '')
  return s ? `${s.slice(0, 3)}***${s.slice(-4)}` : '(missing)'
}

;(async () => {
  if (!ACCOUNT_SID || !AUTH_TOKEN) fail('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN.')

  const listPath = `/2010-04-01/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(CUSTOMER_NUMBER)}`
  const found = await twilioRequest('GET', listPath)
  if (found.status !== 200) fail(`Could not fetch phone number: HTTP ${found.status}`)
  const number = found.data?.incoming_phone_numbers?.[0]
  if (!number) fail(`Twilio number not found: ${CUSTOMER_NUMBER}`)

  const ownerNumber = OWNER_FORWARD_NUMBER || extractForwardNumber(number.voice_url)
  if (!/^\+\d{10,15}$/.test(ownerNumber)) {
    fail('Missing TWILIO_OWNER_FORWARD_NUMBER=+1... and no existing <Number> could be read from VoiceUrl.')
  }

  const handlerUrl = twimletUrl(ownerDialTwiml(ownerNumber))
  const voiceUrl = twimletUrl(greetingTwiml(handlerUrl, ownerNumber))

  console.log('Customer number:', maskNumber(number.phone_number))
  console.log('Forward number:', maskNumber(ownerNumber))
  console.log('Fix:', 'Gather action will route keypresses to a handler instead of replaying the greeting.')
  if (DRY_RUN) {
    console.log('Dry run only. New VoiceUrl length:', voiceUrl.length)
    process.exit(0)
  }

  const updatePath = `/2010-04-01/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers/${number.sid}.json`
  const updated = await twilioRequest('POST', updatePath, {
    VoiceUrl: voiceUrl,
    VoiceMethod: 'POST',
  })
  if (updated.status < 200 || updated.status >= 300) {
    console.error(updated.data)
    fail(`Failed to update Twilio number: HTTP ${updated.status}`)
  }

  console.log('Updated Twilio VoiceUrl. Pressing any menu key now routes to the handler instead of repeating the greeting.')
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
