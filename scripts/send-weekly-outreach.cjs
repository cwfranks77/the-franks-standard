#!/usr/bin/env node
/**
 * Weekly outreach — B&C dealer pitch + Franks Standard seller pitch via SendGrid.
 *
 * Safety:
 *   - Only sends to prospects with approved:true in data/outreach-prospects.json
 *   - Skips if already emailed in last 30 days (data/outreach-sent-log.json)
 *   - Max OUTREACH_MAX_PER_BRAND per run (default 3)
 *   - Set OUTREACH_LIVE=true to actually send (otherwise dry-run)
 *
 * Usage:
 *   node scripts/send-weekly-outreach.cjs
 *   OUTREACH_LIVE=true node scripts/send-weekly-outreach.cjs
 */
require('dotenv').config()

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const PROSPECTS_FILE = path.join(ROOT, 'data', 'outreach-prospects.json')
const SENT_LOG_FILE = path.join(ROOT, 'data', 'outreach-sent-log.json')

const BC_SITE = 'https://www.bcpoweraudio.com'
const TFS_SITE = (process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com').replace(/\/$/, '')
const MAX_PER_BRAND = Number(process.env.OUTREACH_MAX_PER_BRAND || 3)
const LIVE = String(process.env.OUTREACH_LIVE || '').toLowerCase() === 'true'
const COOLDOWN_DAYS = Number(process.env.OUTREACH_COOLDOWN_DAYS || 30)

const BC_DEALER_BODY = `Hi {{name}},

I'm with B&C Performance Audio LLC — authorized wholesale distribution for competition-grade subwoofers, amplifiers, and staging gear.

• Live catalog with MSRP and dropship checkout
• Home, car, marine, and Bluetooth departments
• Open-door owner support: (833) 722-4147

Browse: ${BC_SITE}/bc-audio/catalog

We are expanding dealer partnerships in Louisiana and nationwide. If you run an install shop or retail counter, reply with your business name and we will send wholesale terms.

— B&C Performance Audio LLC
${BC_SITE}

Reply STOP to opt out.`

const TFS_SELLER_BODY = `Hi {{name}},

I built The Franks Standard — an authenticated collectibles and gear marketplace where proof comes before publish.

• Seller COA or signed guarantee on collectible listings
• Sale fees 4–5% by plan (3% launch promo for new sellers)
• Escrow checkout and structured disputes

List free: ${TFS_SITE}/sell
Questions: (877) 837-0527

We also feature partner dropship stores (B&C Performance Audio, Brandy's Sporting Goods). If you carry inventory, open a shop this week.

— Charles Franks
The Franks Standard LLC
${TFS_SITE}

Reply STOP to opt out.`

function loadJson (file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function saveSentLog (log) {
  fs.writeFileSync(SENT_LOG_FILE, `${JSON.stringify(log, null, 2)}\n`, 'utf8')
}

function daysSince (iso) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
}

function wasRecentlySent (log, email, brand) {
  return log.sent.some((row) =>
    row.email === email
    && row.brand === brand
    && daysSince(row.sentAt) < COOLDOWN_DAYS,
  )
}

function renderBody (template, name) {
  return template.replace(/\{\{name\}\}/g, name || 'there')
}

async function sendViaSendGrid ({ to, subject, text }) {
  const apiKey = String(process.env.SENDGRID_API_KEY || '').trim()
  if (!apiKey) return { ok: false, error: 'SENDGRID_API_KEY not set' }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.NOTIFICATION_EMAIL_FROM || 'info@thefranksstandard.com'
  const fromName = process.env.SENDGRID_FROM_NAME || 'The Franks Standard'

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [{ type: 'text/plain', value: text }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return { ok: false, error: `SendGrid ${res.status}: ${errText.slice(0, 300)}` }
  }
  return { ok: true }
}

async function main () {
  const data = loadJson(PROSPECTS_FILE, { prospects: [] })
  const log = loadJson(SENT_LOG_FILE, { sent: [] })
  const prospects = (data.prospects || []).filter((p) => p.approved && p.email)

  const counts = { bc: 0, tfs: 0 }
  const results = []

  for (const p of prospects) {
    const brand = p.brand === 'bc' ? 'bc' : 'tfs'
    if (counts[brand] >= MAX_PER_BRAND) continue
    if (wasRecentlySent(log, p.email, brand)) {
      results.push({ email: p.email, brand, status: 'skipped_cooldown' })
      continue
    }

    const subject = brand === 'bc'
      ? 'B&C Performance Audio — wholesale dealer partnership'
      : 'Sell on The Franks Standard — proof-first marketplace'
    const text = renderBody(brand === 'bc' ? BC_DEALER_BODY : TFS_SELLER_BODY, p.name)

    if (!LIVE) {
      results.push({ email: p.email, brand, status: 'dry_run', subject })
      counts[brand]++
      continue
    }

    const sent = await sendViaSendGrid({ to: p.email, subject, text })
    if (sent.ok) {
      log.sent.push({
        email: p.email,
        brand,
        prospectId: p.id,
        sentAt: new Date().toISOString(),
      })
      counts[brand]++
      results.push({ email: p.email, brand, status: 'sent' })
    } else {
      results.push({ email: p.email, brand, status: 'failed', error: sent.error })
    }
  }

  if (LIVE) saveSentLog(log)

  console.log(JSON.stringify({
    mode: LIVE ? 'live' : 'dry_run',
    maxPerBrand: MAX_PER_BRAND,
    results,
    wholesalerLeads: (data.wholesalerLeads || []).length,
  }, null, 2))

  if (!LIVE) {
    console.log('\nDry run only. Set OUTREACH_LIVE=true to send.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
