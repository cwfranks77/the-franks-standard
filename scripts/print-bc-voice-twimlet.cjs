/**
 * Print the Twilio-hosted greeting URL (no Supabase). Paste into Twilio → your number → Voice → Webhook.
 *   node scripts/print-bc-voice-twimlet.cjs
 */
const { loadEnvLocal, normalizeE164, twimletSayThenForward } = require('./twilio-voice-lib.cjs')

const GREETING = [
  'Thank you for calling B and C Performance Audio.',
  'Your call is important to us.',
].join(' ')

loadEnvLocal()
const owner = normalizeE164(process.env.BC_OWNER_CELL_PHONE || process.env.PRIVATE_OWNER_CELL_PHONE) || '+13373400449'
const url = twimletSayThenForward(GREETING, owner)

console.log('=== B&C VOICE — paste this URL in Twilio Voice Webhook (HTTP POST) ===')
console.log(url)
console.log('')
console.log('Forward to:', owner)
console.log('Greeting:', GREETING)
