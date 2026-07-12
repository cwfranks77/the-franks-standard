#!/usr/bin/env node
/**
 * Send Petra prodlist / approved-brands follow-up from B&C Performance Audio.
 *
 * Usage:
 *   node scripts/send-petra-catalog-request.cjs           # dry-run (prints only)
 *   OUTREACH_LIVE=true node scripts/send-petra-catalog-request.cjs
 *
 * Requires SENDGRID_API_KEY in .env (or environment).
 * Sends FROM bc-audio@thefranksstandard.com when SENDGRID_BC_FROM_EMAIL is set or defaulted below.
 */
try {
  require('dotenv').config()
} catch {
  // GitHub Actions injects env vars directly; dotenv is optional locally.
}

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const ROOT = path.join(__dirname, '..')
const DRAFT_FILE = path.join(ROOT, 'data', 'outreach-drafts', 'petra-prodlist-request.txt')
const SENT_LOG_FILE = path.join(ROOT, 'data', 'outreach-sent-log.json')

const LIVE = process.argv.includes('--send') || String(process.env.OUTREACH_LIVE || '').toLowerCase() === 'true'
const TO_EMAIL = String(process.env.PETRA_TO_EMAIL || 'customerservice@petra.com').trim()
const CC_EMAIL = String(process.env.PETRA_REP_EMAIL || '').trim()
const FROM_EMAIL = String(process.env.SENDGRID_BC_FROM_EMAIL || process.env.BC_AUDIO_FROM_EMAIL || 'bc-audio@thefranksstandard.com').trim()
const FROM_NAME = String(process.env.SENDGRID_BC_FROM_NAME || 'B&C Performance Audio LLC').trim()
const REPLY_TO = String(process.env.SENDGRID_BC_REPLY_TO || FROM_EMAIL).trim()

const SUBJECT = 'B&C Performance Audio LLC — updated prodlist.csv and approved brand lines'

const BODY = `Hello Petra Dealer Support,

My name is Charles W. Franks, owner of B&C Performance Audio LLC (Louisiana LLC, EIN and resale certificate on file with Petra).

I am following up on my sales representative’s message that additional brand lines were approved for my dealer account. I have not yet seen those items in my product export.

Could you please:

1. Confirm which brand lines are active on my dealer account today.
2. Send or point me to a fresh prodlist.csv (full product and price file) that includes every SKU I am authorized to sell.
3. Confirm my FTP/EDI download path if automated catalog refresh is available on my account.

My storefront pulls inventory from prodlist.csv for bcpoweraudio.com. My current export shows about 2,391 total SKUs with a limited audio selection, so I want to make sure I am receiving the complete authorized feed.

Business contact:
Charles W. Franks
B&C Performance Audio LLC (division of The Franks Standard LLC)
Phone: (833) 722-4147
Email: bc-audio@thefranksstandard.com
Website: https://www.bcpoweraudio.com

Thank you for your help. A written reply with next steps or a timeline would be appreciated.

Respectfully,
Charles W. Franks
B&C Performance Audio LLC`

function loadSentLog () {
  try {
    return JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8'))
  } catch {
    return { sent: [] }
  }
}

function saveSentLog (log) {
  fs.writeFileSync(SENT_LOG_FILE, `${JSON.stringify(log, null, 2)}\n`, 'utf8')
}

function saveDraft () {
  fs.mkdirSync(path.dirname(DRAFT_FILE), { recursive: true })
  const draft = `To: ${TO_EMAIL}${CC_EMAIL ? `\nCc: ${CC_EMAIL}` : ''}\nFrom: ${FROM_NAME} <${FROM_EMAIL}>\nReply-To: ${REPLY_TO}\nSubject: ${SUBJECT}\n\n${BODY}\n`
  fs.writeFileSync(DRAFT_FILE, draft, 'utf8')
  return DRAFT_FILE
}

function wasRecentlySent (log) {
  const force = String(process.env.PETRA_EMAIL_FORCE || '').toLowerCase() === 'true'
  if (force) return false
  const cooldownDays = Number(process.env.PETRA_EMAIL_COOLDOWN_DAYS || 7)
  const cutoff = Date.now() - cooldownDays * 24 * 60 * 60 * 1000
  return (log.sent || []).some((row) =>
    row.prospectId === 'petra-prodlist-request'
    && new Date(row.sentAt).getTime() > cutoff,
  )
}

async function sendViaSendGrid () {
  const apiKey = String(process.env.SENDGRID_API_KEY || process.env.NUXT_SENDGRID_API_KEY || '').trim()
  if (!apiKey) return { ok: false, error: 'SENDGRID_API_KEY not set in .env' }

  const verifiedFrom = String(process.env.SENDGRID_FROM_EMAIL || '').trim()
  const fromEmail = verifiedFrom || FROM_EMAIL

  const personalizations = [{
    to: [{ email: TO_EMAIL }],
    ...(CC_EMAIL ? { cc: [{ email: CC_EMAIL }] } : {}),
  }]

  const payload = {
    personalizations,
    from: { email: fromEmail, name: FROM_NAME },
    reply_to: { email: REPLY_TO, name: FROM_NAME },
    subject: SUBJECT,
    content: [{ type: 'text/plain', value: BODY }],
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return { ok: false, error: `SendGrid ${res.status}: ${errText.slice(0, 400)}` }
  }
  return { ok: true, fromEmail }
}

function openMailtoDraft () {
  const params = new URLSearchParams()
  params.set('subject', SUBJECT)
  params.set('body', BODY)
  if (CC_EMAIL) params.set('cc', CC_EMAIL)
  const mailto = `mailto:${encodeURIComponent(TO_EMAIL)}?${params.toString()}`
  if (process.platform === 'win32') {
    execFileSync('cmd', ['/c', 'start', '', mailto], { stdio: 'ignore' })
    return mailto
  }
  return mailto
}

async function main () {
  const draftPath = saveDraft()

  console.log('--- Petra catalog request email ---')
  console.log(`To:      ${TO_EMAIL}`)
  if (CC_EMAIL) console.log(`Cc:      ${CC_EMAIL}`)
  console.log(`From:    ${FROM_NAME} <${FROM_EMAIL}>`)
  console.log(`Reply:   ${REPLY_TO}`)
  console.log(`Subject: ${SUBJECT}`)
  console.log(`Draft:   ${draftPath}`)
  console.log('')

  if (!LIVE) {
    console.log('Dry run only. To send via SendGrid:')
    console.log('  OUTREACH_LIVE=true node scripts/send-petra-catalog-request.cjs')
    console.log('  npm run catalog:email-petra:send')
    return
  }

  const log = loadSentLog()
  if (wasRecentlySent(log)) {
    console.log('Skipped: Petra catalog request already sent within cooldown window.')
    console.log('Set PETRA_EMAIL_FORCE=true to send again.')
    return
  }

  const sent = await sendViaSendGrid()
  if (!sent.ok) {
    console.error(`Send failed: ${sent.error}`)
    console.log('Opening your email app as a backup…')
    try { openMailtoDraft() } catch { /* ignore */ }
    process.exit(1)
  }

  log.sent.push({
    email: TO_EMAIL,
    brand: 'bc',
    prospectId: 'petra-prodlist-request',
    subject: SUBJECT,
    fromEmail: sent.fromEmail,
    replyTo: REPLY_TO,
    sentAt: new Date().toISOString(),
  })
  saveSentLog(log)

  console.log(`Sent successfully via SendGrid (from ${sent.fromEmail}, reply-to ${REPLY_TO}).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
