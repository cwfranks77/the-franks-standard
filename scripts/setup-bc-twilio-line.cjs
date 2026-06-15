/**
 * Connect your paid Twilio account to B&C Performance Audio support line.
 *
 * One-time: add to .env.local (never commit):
 *   TWILIO_ACCOUNT_SID=AC...
 *   TWILIO_AUTH_TOKEN=...
 *
 * Commands:
 *   node scripts/setup-bc-twilio-line.cjs              List numbers on your account
 *   node scripts/setup-bc-twilio-line.cjs --search     Show available US toll-free numbers
 *   node scripts/setup-bc-twilio-line.cjs --buy        Buy one toll-free (~$2/mo from your balance)
 *   node scripts/setup-bc-twilio-line.cjs --gh-secrets After --buy, save phone to GitHub Actions
 */
const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const ROOT = path.join(__dirname, '..')
const ENV_LOCAL = path.join(ROOT, '.env.local')

function loadEnvLocal () {
  if (!fs.existsSync(ENV_LOCAL)) return
  for (const line of fs.readFileSync(ENV_LOCAL, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!m || process.env[m[1]]) continue
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

loadEnvLocal()

const SID = (process.env.TWILIO_ACCOUNT_SID || '').trim()
const TOKEN = (process.env.TWILIO_AUTH_TOKEN || '').trim()
const args = new Set(process.argv.slice(2))

function authHeader () {
  return 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64')
}

async function twilioGet (urlPath) {
  const res = await fetch(`https://api.twilio.com/2010-04-01${urlPath}`, {
    headers: { Authorization: authHeader() },
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  if (!res.ok) throw new Error(`Twilio GET ${urlPath} → ${res.status}: ${text.slice(0, 200)}`)
  return data
}

async function twilioPost (urlPath, body) {
  const res = await fetch(`https://api.twilio.com/2010-04-01${urlPath}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  if (!res.ok) throw new Error(`Twilio POST ${urlPath} → ${res.status}: ${text.slice(0, 300)}`)
  return data
}

function formatDisplay (e164) {
  const digits = String(e164).replace(/\D/g, '')
  const n = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (n.length !== 10) return e164
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`
}

function toE164 (phoneNumber) {
  const raw = String(phoneNumber || '').trim()
  if (raw.startsWith('+')) return raw.replace(/\s/g, '')
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

function patchLine (filePath, pattern, replacement) {
  const abs = path.join(ROOT, filePath)
  const text = fs.readFileSync(abs, 'utf8')
  if (!pattern.test(text)) {
    throw new Error(`Could not patch ${filePath}`)
  }
  fs.writeFileSync(abs, text.replace(pattern, replacement))
}

function applyBcPhoneToProject ({ display, tel, e164 }) {
  const ledgerPath = path.join(ROOT, 'src/content/support-contacts.json')
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'))
  ledger.audioDivision.phone = display
  fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`)

  patchLine('utils/bcSupport.js', /phoneDisplay: '[^']*'/, `phoneDisplay: '${display}'`)
  patchLine('utils/bcSupport.js', /phoneTel: '[^']*'/, `phoneTel: '${tel}'`)
  patchLine(
    'nuxt.config.ts',
    /bcAudioSupportPhone: process\.env\.NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE \|\| '[^']*'/,
    `bcAudioSupportPhone: process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE || '${display}'`,
  )
  patchLine(
    'nuxt.config.ts',
    /bcAudioSupportTel: process\.env\.NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL \|\| '[^']*'/,
    `bcAudioSupportTel: process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL || '${tel}'`,
  )
  patchLine(
    'scripts/inject-spa-fallback.cjs',
    /NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE \|\| '[^']*'/,
    `NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE || '${display}'`,
  )
  patchLine(
    'scripts/inject-spa-fallback.cjs',
    /NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL \|\| '[^']*'/,
    `NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL || '${tel}'`,
  )

  process.env.TWILIO_BC_PHONE_NUMBER = e164
  console.log(`\n[OK] Project files updated for B&C line ${display}`)
}

function printSecrets (phoneNumber) {
  const display = formatDisplay(phoneNumber)
  const tel = toE164(phoneNumber)
  console.log('\n--- GitHub Actions secrets ---')
  console.log(`NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE=${display}`)
  console.log(`NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL=${tel}`)
  return { display, tel, e164: tel }
}

function pushGhSecrets ({ display, tel }) {
  if (!args.has('--gh-secrets')) return
  try {
    execSync(`gh secret set NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE --body "${display}"`, {
      cwd: ROOT, stdio: 'inherit',
    })
    execSync(`gh secret set NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL --body "${tel}"`, {
      cwd: ROOT, stdio: 'inherit',
    })
    console.log('\nGitHub secrets saved. Trigger deploy: gh workflow run "Deploy B&C to bcpoweraudio.com"')
  } catch (e) {
    console.error('\nCould not set GitHub secrets (is `gh` logged in?). Set them manually in GitHub Settings.')
  }
}

async function listOwned () {
  const data = await twilioGet(`/Accounts/${SID}/IncomingPhoneNumbers.json?PageSize=50`)
  const rows = data.incoming_phone_numbers || []
  console.log(`\nYour Twilio numbers (${rows.length}):`)
  if (!rows.length) {
    console.log('  (none yet — run with --search then --buy)')
    return null
  }
  for (const row of rows) {
    const label = row.friendly_name || ''
    const voice = row.voice_url ? 'voice configured' : 'no voice URL'
    console.log(`  ${formatDisplay(row.phone_number)}  ${row.phone_number}  [${voice}] ${label}`)
  }
  const franksHint = rows.find((r) => String(r.phone_number).includes('8778370527'))
  if (franksHint) {
    console.log('\n  → (877) 837-0527 is your Franks Standard line — pick a different number for B&C.')
  }
  return rows
}

async function searchTollFree () {
  const data = await twilioGet('/Accounts/' + SID + '/AvailablePhoneNumbers/US/TollFree.json?SmsEnabled=true&VoiceEnabled=true&PageSize=5')
  const available = data.available_phone_numbers || []
  console.log(`\nAvailable US toll-free (showing ${available.length}):`)
  for (const n of available) {
    console.log(`  ${formatDisplay(n.phone_number)}  ${n.phone_number}`)
  }
  if (!available.length) console.log('  (none found — try Louisiana local in Twilio console)')
  return available
}

function pickBcLineRow (rows) {
  const bcRows = rows.filter((r) => !String(r.phone_number).includes('8778370527'))
  if (!bcRows.length) return null
  const bcNamed = bcRows.find((r) => /b&c|bc performance/i.test(String(r.friendly_name || '')))
  return bcNamed || bcRows[0]
}

async function wireBcVoice (e164) {
  process.env.TWILIO_BC_PHONE_NUMBER = e164
  console.log('\nWiring B&C voice menu on the new line...')
  execSync('node scripts/deploy-ai-voice-agent.cjs', { cwd: ROOT, stdio: 'inherit' })
}

async function finalizeBcLine (phoneNumber) {
  const secrets = printSecrets(phoneNumber)
  applyBcPhoneToProject(secrets)
  pushGhSecrets(secrets)
  if (args.has('--deploy-voice')) {
    await wireBcVoice(secrets.e164)
  }
  console.log('\nNext: commit + push, then B&C deploy workflow updates www.bcpoweraudio.com.')
  return secrets
}

async function buyTollFree () {
  const available = await searchTollFree()
  if (!available.length) {
    console.error('\nNo toll-free numbers available to buy via API. Buy manually in Twilio console.')
    process.exit(1)
  }
  const pick = available[0].phone_number
  console.log(`\nBuying ${pick} (charged to your Twilio balance)...`)
  const bought = await twilioPost(`/Accounts/${SID}/IncomingPhoneNumbers.json`, {
    PhoneNumber: pick,
    FriendlyName: 'B&C Performance Audio LLC Support',
  })
  console.log(`\nPurchased: ${formatDisplay(bought.phone_number)}`)
  await finalizeBcLine(bought.phone_number)
}

async function useExistingBcLine () {
  const rows = await listOwned()
  const line = pickBcLineRow(rows || [])
  if (!line) {
    console.error('\nNo B&C line on your Twilio account (only Franks 877?). Run with --buy.')
    process.exit(1)
  }
  console.log(`\nUsing existing line: ${formatDisplay(line.phone_number)}`)
  await finalizeBcLine(line.phone_number)
}

async function main () {
  if (!SID || !TOKEN) {
    console.error(`
Twilio credentials not found.

1. Open https://console.twilio.com
2. Copy Account SID and Auth Token
3. Create .env.local in the project folder with:

   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=your_token

4. Run again: node scripts/setup-bc-twilio-line.cjs
`)
    process.exit(1)
  }

  const account = await twilioGet(`/Accounts/${SID}.json`)
  console.log(`Twilio account: ${account.friendly_name || SID}`)
  console.log(`Status: ${account.status}  |  Balance: $${account.balance || '?'}`)

  await listOwned()

  if (args.has('--buy')) {
    await buyTollFree()
    return
  }
  if (args.has('--use-existing')) {
    await useExistingBcLine()
    return
  }
  if (args.has('--search')) {
    await searchTollFree()
    return
  }

  console.log(`
Commands:
  node scripts/setup-bc-twilio-line.cjs --search
  node scripts/setup-bc-twilio-line.cjs --buy --gh-secrets --deploy-voice
  node scripts/setup-bc-twilio-line.cjs --use-existing --gh-secrets --deploy-voice
`)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
