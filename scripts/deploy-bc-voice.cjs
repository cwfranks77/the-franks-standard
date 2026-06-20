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
  'Thank you for calling B and C Performance Audio.',
  'Your call is important to us.',
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
  const fallbackUrl = voiceUrl
  return { voiceUrl, fallbackUrl }
}

async function main () {
  console.log('=== B&C PERFORMANCE AUDIO — VOICE GREETING ===')
  requireCredentials()
  const bcE164 = bcSupportE164()
  const { voiceUrl, fallbackUrl } = buildBcVoiceUrls()

  const line = await findNumber(
    (r) => r.phone_number === bcE164,
    `Could not find ${bcE164} on your Twilio account. Buy or port the B&C line first.`,
  )

  console.log(`Target: ${line.phone_number}`)
  console.log(`Voice URL: ${voiceUrl}`)
  console.log('Flow: AI first on +18337224147 — owner cell only when caller asks or AI escalates')

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
