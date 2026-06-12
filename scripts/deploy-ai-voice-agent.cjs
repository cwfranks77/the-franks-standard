/**
 * Wire the B&C Performance Audio dedicated line (NOT the Franks 877 hub).
 * Franks toll-free restore: npm run ops:deploy-franks-voice
 *
 *   npm run ops:deploy-bc-voice
 */
const { execSync } = require('node:child_process')
const {
  FRANKS_TOLL_FREE,
  requireCredentials,
  requireOwnerPhone,
  twimletEcho,
  bcVoiceInboundUrl,
  updateVoiceWebhook,
  normalizeE164,
} = require('./twilio-voice-lib.cjs')

const dryRun = process.argv.includes('--dry-run')
const PREFERRED = () => normalizeE164(process.env.TWILIO_BC_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER || '')

function buildBcVoiceUrls () {
  const voiceUrl = bcVoiceInboundUrl()
  const fallbackUrl = twimletEcho(
    'Thank you for calling B and C Performance Audio. Please visit b c power audio dot com. Goodbye.',
  )
  return { voiceUrl, fallbackUrl }
}

function syncBcVoiceSecrets (ownerE164, bcLineE164) {
  const token = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()
  if (!token) {
    console.log('Skip Supabase voice secrets — add SUPABASE_ACCESS_TOKEN to .env.local to sync owner cell.')
    return
  }
  try {
    execSync(
      `npx supabase@latest secrets set BC_VOICE_OWNER_PHONE=${ownerE164} TWILIO_BC_CALLER_ID=${bcLineE164} --project-ref rochesyrxiyrxhzmkuwk`,
      { stdio: 'inherit', env: { ...process.env, SUPABASE_ACCESS_TOKEN: token } },
    )
    console.log('[OK] Supabase voice secrets synced (owner cell + B&C caller ID).')
  } catch {
    console.log('Could not sync Supabase voice secrets — deploy bc-voice-inbound workflow will retry.')
  }
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
  const bcNamed = bcRows.find((r) => /b&c|bc performance/i.test(String(r.friendly_name || '')))
  return bcNamed || bcRows[0]
}

async function main () {
  console.log('=== B&C PERFORMANCE AUDIO — DEDICATED LINE ===')
  requireCredentials()
  const ownerE164 = requireOwnerPhone()
  const { voiceUrl, fallbackUrl } = buildBcVoiceUrls()
  const line = await pickBcLine()

  console.log(`Target: ${line.phone_number} (B&C — not the Franks 877 hub)`)
  console.log(`Voice webhook: ${voiceUrl}`)
  console.log(`Owner patch (press 0): ${ownerE164}`)

  if (dryRun) {
    return
  }

  syncBcVoiceSecrets(ownerE164, line.phone_number)

  const updated = await updateVoiceWebhook({
    phoneRow: line,
    voiceUrl,
    fallbackUrl,
    friendlyName: 'B&C Performance Audio LLC Support',
    voiceMethod: 'POST',
    fallbackMethod: 'GET',
  })

  console.log(`[OK] B&C voice menu updated on ${updated.phone_number}`)
}

main().catch((err) => {
  console.error('[!]', err.message || err)
  process.exit(1)
})
