/**
 * Wire the B&C Performance Audio dedicated line (NOT the Franks 877 hub).
 * Franks toll-free restore: npm run ops:deploy-franks-voice
 *
 *   npm run ops:deploy-bc-voice
 */
const {
  FRANKS_TOLL_FREE,
  requireCredentials,
  requireOwnerPhone,
  twimletEcho,
  buildMenuUrl,
  updateVoiceWebhook,
  findNumber,
  normalizeE164,
} = require('./twilio-voice-lib.cjs')

const dryRun = process.argv.includes('--dry-run')
const PREFERRED = () => normalizeE164(process.env.TWILIO_BC_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER || '')

function buildBcVoiceUrls (ownerE164) {
  const message = [
    'Thank you for calling B and C Performance Audio,',
    'competition car audio and subwoofers.',
    'Press 1 for orders or shipping.',
    'Press 2 for product help.',
    'Press 0 to reach the owner.',
  ].join(' ')

  const voiceUrl = buildMenuUrl({
    message,
    ownerE164,
    options: {
      1: 'For order help, visit b c power audio dot com. Goodbye.',
      2: 'Browse our catalog at b c power audio dot com. Goodbye.',
    },
  })

  const fallbackUrl = twimletEcho(
    'Thank you for calling B and C Performance Audio. Please visit b c power audio dot com. Goodbye.',
  )

  return { voiceUrl, fallbackUrl }
}

async function pickBcLine () {
  const preferred = PREFERRED()
  const rows = await require('./twilio-voice-lib.cjs').listIncomingNumbers()
  const bcRows = rows.filter((r) => r.phone_number !== FRANKS_TOLL_FREE)
  if (!bcRows.length) {
    throw new Error('No B&C line found. Buy one: npm run ops:setup-bc-phone -- --buy')
  }
  if (preferred) {
    const hit = bcRows.find((r) => r.phone_number === preferred)
    if (hit) return hit
  }
  const toll833 = bcRows.find((r) => String(r.phone_number).includes('8333228439'))
  return toll833 || bcRows[0]
}

async function main () {
  console.log('=== B&C PERFORMANCE AUDIO — DEDICATED LINE ===')
  requireCredentials()
  const ownerE164 = requireOwnerPhone()
  const { voiceUrl, fallbackUrl } = buildBcVoiceUrls(ownerE164)
  const line = await pickBcLine()

  console.log(`Target: ${line.phone_number} (B&C — not the Franks 877 hub)`)
  console.log(`Owner patch (press 0): ${ownerE164}`)

  if (dryRun) {
    console.log('\n[DRY RUN] Voice URL:', voiceUrl)
    return
  }

  const updated = await updateVoiceWebhook({
    phoneRow: line,
    voiceUrl,
    fallbackUrl,
    friendlyName: 'B&C Performance Audio LLC Support',
  })

  console.log(`[OK] B&C voice menu updated on ${updated.phone_number}`)
}

main().catch((err) => {
  console.error('[!]', err.message || err)
  process.exit(1)
})
