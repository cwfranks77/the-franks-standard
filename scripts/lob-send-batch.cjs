/**
 * Send US postcards from a CSV (mail-ready rows only).
 *
 * CSV columns (header required):
 *   business_name OR username, address_line1, address_city, address_state, address_zip
 *   Optional: mail_ready (yes/y/1 to send), username
 *
 *   npm run mail:lob-batch -- --csv ./mail-ready.csv --dry-run
 *   npm run mail:lob-batch -- --csv ./mail-ready.csv --limit 10
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const POSTCARD_COPY_PATH = path.join(__dirname, '..', 'assets', 'email-campaign', 'postcard-copy.txt')

function parseArgs () {
  const args = process.argv.slice(2)
  const out = { csv: '', dryRun: false, limit: 0 }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--csv' && args[i + 1]) { out.csv = args[++i]; continue }
    if (args[i] === '--dry-run') { out.dryRun = true }
    if (args[i] === '--limit' && args[i + 1]) { out.limit = Number.parseInt(args[++i], 10) || 0 }
  }
  return out
}

function parseCsvLine (line) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; continue }
      inQ = !inQ
      continue
    }
    if (c === ',' && !inQ) { out.push(cur); cur = ''; continue }
    cur += c
  }
  out.push(cur)
  return out
}

function parseCsv (text) {
  const lines = String(text || '').trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return []
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i])
    const row = {}
    headers.forEach((h, j) => { row[h] = (cells[j] || '').trim() })
    rows.push(row)
  }
  return rows
}

function backMessage () {
  if (fs.existsSync(POSTCARD_COPY_PATH)) {
    return fs.readFileSync(POSTCARD_COPY_PATH, 'utf8').trim()
  }
  return 'The Franks Standard — thefranksstandard.com/sell — (877) 837-0527'
}

function isMailReady (row) {
  const v = String(row.mail_ready || '').toLowerCase()
  if (v && !['yes', 'y', '1', 'true'].includes(v)) return false
  return Boolean(
    row.address_line1 && row.address_city && row.address_state && row.address_zip,
  )
}

async function sendOne (apiKey, frontUrl, row) {
  const name = row.business_name || row.username || 'Shop'
  const payload = {
    description: 'Franks Standard seller postcard batch',
    to: {
      name,
      address_line1: row.address_line1,
      address_line2: row.address_line2 || undefined,
      address_city: row.address_city,
      address_state: row.address_state,
      address_zip: row.address_zip,
      address_country: 'US',
    },
    front: frontUrl,
    back: backMessage(),
    size: '4x6',
  }
  const res = await fetch('https://api.lob.com/v1/postcards', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  return { ok: res.ok, data, name }
}

async function main () {
  const opts = parseArgs()
  if (!opts.csv) {
    console.error('Usage: npm run mail:lob-batch -- --csv ./mail-ready.csv [--dry-run] [--limit N]')
    process.exit(1)
  }
  const csvPath = path.resolve(opts.csv)
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath)
    process.exit(1)
  }

  const apiKey = process.env.LOB_API_KEY
  const frontUrl = process.env.LOB_POSTCARD_FRONT_URL
  let rows = parseCsv(fs.readFileSync(csvPath, 'utf8')).filter(isMailReady)
  if (opts.limit > 0) rows = rows.slice(0, opts.limit)

  console.log(`Rows to send: ${rows.length} (mail_ready + full address)`)
  if (!rows.length) {
    console.error('No sendable rows. Set mail_ready=yes and fill address columns.')
    process.exit(1)
  }

  if (opts.dryRun) {
    for (const r of rows) {
      console.log('[dry-run]', r.business_name || r.username, r.address_line1, r.address_city, r.address_state, r.address_zip)
    }
    return
  }

  if (!apiKey) {
    console.error('Set LOB_API_KEY in .env')
    process.exit(1)
  }
  if (!frontUrl) {
    console.error('Set LOB_POSTCARD_FRONT_URL (upload front from public/mail/postcard-design.html)')
    process.exit(1)
  }

  let ok = 0
  let fail = 0
  for (const row of rows) {
    const result = await sendOne(apiKey, frontUrl, row)
    if (result.ok) {
      ok++
      console.log('OK', result.name, result.data.id)
    } else {
      fail++
      console.error('FAIL', result.name, result.data)
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  console.log(`Done. ${ok} sent, ${fail} failed.`)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
