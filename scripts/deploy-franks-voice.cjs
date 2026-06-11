/**
 * Restore The Franks Standard toll-free (877) 837-0527 voice greeting.
 * This number is the Franks marketplace hub — NOT the B&C dedicated line.
 *
 *   npm run ops:deploy-franks-voice
 */
const {
  FRANKS_TOLL_FREE,
  requireCredentials,
  requireOwnerPhone,
  twimletEcho,
  buildMenuUrl,
  updateVoiceWebhook,
  findNumber,
} = require('./twilio-voice-lib.cjs')

const dryRun = process.argv.includes('--dry-run')

function buildFranksVoiceUrls (ownerE164) {
  const message = [
    'Thank you for calling The Franks Standard,',
    'your authenticity-first collectibles marketplace.',
    'Press 1 for account and billing.',
    'Press 2 for marketplace support.',
    'For B and C Performance Audio car audio, visit b c power audio dot com.',
    'Press 0 to reach an administrator.',
  ].join(' ')

  const voiceUrl = buildMenuUrl({
    message,
    ownerE164,
    options: {
      1: 'For account and billing, email info at the franks standard dot com. We will respond during business hours. Goodbye.',
      2: 'For marketplace help, visit the franks standard dot com or use the Help chat on any page. Goodbye.',
    },
  })

  const fallbackUrl = twimletEcho(
    'Thank you for calling The Franks Standard. We could not complete your call. Please visit the franks standard dot com or email info at the franks standard dot com. Goodbye.',
  )

  return { voiceUrl, fallbackUrl }
}

async function main () {
  console.log('=== THE FRANKS STANDARD — TOLL-FREE VOICE RESTORE ===')
  requireCredentials()
  const ownerE164 = requireOwnerPhone()
  const { voiceUrl, fallbackUrl } = buildFranksVoiceUrls(ownerE164)

  const line = await findNumber(
    (r) => r.phone_number === FRANKS_TOLL_FREE,
    `Could not find ${FRANKS_TOLL_FREE} on your Twilio account.`,
  )

  console.log(`Target: ${line.phone_number} (Franks Standard hub)`)
  console.log(`Owner patch (press 0): ${ownerE164}`)
  console.log(`Voice URL length: ${voiceUrl.length}`)

  if (dryRun) {
    console.log('\n[DRY RUN] Voice URL:', voiceUrl)
    return
  }

  const updated = await updateVoiceWebhook({
    phoneRow: line,
    voiceUrl,
    fallbackUrl,
    friendlyName: 'The Franks Standard LLC — Marketplace Support',
  })

  console.log(`[OK] Franks voice menu restored on ${updated.phone_number}`)
  console.log('-> Call (877) 837-0527 to test.')
}

main().catch((err) => {
  console.error('[!]', err.message || err)
  process.exit(1)
})
