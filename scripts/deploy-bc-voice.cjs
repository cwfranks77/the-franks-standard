/**
 * B&C Performance Audio — inbound greeting + forward to owner cell.
 *
 *   npm run ops:deploy-bc-voice
 *   npm run ops:deploy-bc-voice -- --dry-run
 *
 * Requires .env.local:
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, PRIVATE_OWNER_CELL_PHONE
 * Optional:
 *   NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL=+18337224147
 */
const {
  requireCredentials,
  requireOwnerPhone,
  normalizeE164,
  twimletEcho,
  twimletSayThenForward,
  bcVoiceInboundUrl,
  updateVoiceWebhook,
  findNumber,
  loadEnvLocal,
} = require('./twilio-voice-lib.cjs')

const dryRun = process.argv.includes('--dry-run')

/** Spoken on answer — keep B&C as "B and C" for text-to-speech. */
const BC_HOLD_GREETING = [
  'Thank you for calling B and C Performance Audio, a division of The Franks Standard.',
  'Your call is important to us.',
  'Please hold while we connect you to customer support.',
].join(' ')

function bcSupportE164 () {
  loadEnvLocal()
  return normalizeE164(
    process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL
    || process.env.BC_AUDIO_SUPPORT_TEL
    || '+18337224147',
  )
}

function buildBcVoiceUrls () {
  const voiceUrl = process.env.BC_VOICE_WEBHOOK_URL || bcVoiceInboundUrl()
  const fallbackUrl = twimletEcho(
    'We could not complete your call to B and C Performance Audio. Please visit b c power audio dot com or email bc-audio at the franks standard dot com. Goodbye.',
  )
  return { voiceUrl, fallbackUrl }
}

async function main () {
  console.log('=== B&C PERFORMANCE AUDIO — VOICE GREETING ===')
  requireCredentials()
  const ownerE164 = requireOwnerPhone()
  const bcE164 = bcSupportE164()
  const { voiceUrl, fallbackUrl } = buildBcVoiceUrls()

  const line = await findNumber(
    (r) => r.phone_number === bcE164,
    `Could not find ${bcE164} on your Twilio account. Buy or port the B&C line first.`,
  )

  console.log(`Target: ${line.phone_number}`)
  console.log(`Forward to: ${ownerE164}`)
  console.log(`Greeting: ${BC_HOLD_GREETING}`)

  if (dryRun) {
    console.log('\n[DRY RUN] Voice URL:', voiceUrl)
    return
  }

  const updated = await updateVoiceWebhook({
    phoneRow: line,
    voiceUrl,
    fallbackUrl,
    friendlyName: 'B&C Performance Audio LLC — Customer Support',
  })

  console.log(`[OK] B&C greeting restored on ${updated.phone_number}`)
  console.log('-> Call your B&C support number to test.')
}

main().catch((err) => {
  console.error('[!]', err.message || err)
  process.exit(1)
})
