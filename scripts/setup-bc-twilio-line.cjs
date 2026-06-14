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

function printSecrets (phoneNumber) {
  const display = formatDisplay(phoneNumber)
  const tel = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber.replace(/\D/g, '')}`
  console.log('\n--- Add to GitHub (Settings → Secrets → Actions) ---')
  console.log(`NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE=${display}`)
  console.log(`NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL=${tel}`)
  console.log('\nThen re-run workflow "Deploy B&C to bcpoweraudio.com" in GitHub Actions.')
  console.log('Studio flow: docs/BC-PHONE-SETUP.md section 3 (connect number to B&C flow).')
  return { display, tel }
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
  const secrets = printSecrets(bought.phone_number)
  pushGhSecrets(secrets)
  console.log('\nNext: Twilio Console → Studio → create "B&C Performance Audio Customer Service" flow')
  console.log('      → assign that flow to this number (see docs/BC-PHONE-SETUP.md).')
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
  if (args.has('--search')) {
    await searchTollFree()
    return
  }

  console.log(`
Commands:
  node scripts/setup-bc-twilio-line.cjs --search      See toll-free numbers you can buy
  node scripts/setup-bc-twilio-line.cjs --buy         Buy one (uses your Twilio balance)
  node scripts/setup-bc-twilio-line.cjs --buy --gh-secrets   Buy + save to GitHub Actions
`)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
