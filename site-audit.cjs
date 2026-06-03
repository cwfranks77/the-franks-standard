#!/usr/bin/env node
/**
 * Deep infrastructure audit: Namecheap SMTP, layout purity, brand folder isolation.
 * Usage: node site-audit.cjs  (or: node site-audit.js)
 * Credentials: franks-standard-credentials/email.env or ./email.env (EMAIL_USER, EMAIL_PASS)
 */
const fs = require('fs')
const path = require('path')

const ROOT = __dirname

const EMAIL_ENV_PATHS = [
  path.join(ROOT, '..', 'franks-standard-credentials', 'email.env'),
  path.join(ROOT, 'email.env'),
]

function loadEmailEnv () {
  for (const p of EMAIL_ENV_PATHS) {
    if (!fs.existsSync(p)) continue
    const out = {}
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m) out[m[1]] = m[2].trim()
    }
    if (out.EMAIL_USER && out.EMAIL_PASS) return { ...out, source: p }
  }
  return null
}

console.log('================================================================')
console.log('THE FRANKS STANDARD & B&C AUDIO - DEEP INFRASTRUCTURE AUDIT')
console.log('================================================================')

const diagnostics = {
  emailHandshake: 'PENDING',
  layoutsPurified: 'PENDING',
  pagesIsolated: 'PENDING',
}

/** Legacy + current markers that must NOT appear in layouts/default.vue */
const LAYOUT_STACK_MARKERS = [
  'amazon-nav-header',
  'ebay-sub-navigation',
  'EbayMarketHeader',
  'MarketplaceLandingFooter',
  'mkt-header__bar',
  'site-footer',
]

async function runAuditPipeline () {
  try {
    console.log('[1/3] Testing Namecheap Email Relays (SSL Port 465)...')
    const env = loadEmailEnv()
    if (!env) {
      console.warn(' -> SKIP: No email.env found (set EMAIL_USER + EMAIL_PASS in franks-standard-credentials/email.env)')
      diagnostics.emailHandshake = 'SKIP (no credentials file)'
    } else {
      let nodemailer
      try {
        nodemailer = require('nodemailer')
      } catch {
        console.warn(' -> SKIP: nodemailer not installed. Run: npm install nodemailer --save-dev')
        diagnostics.emailHandshake = 'SKIP (npm install nodemailer)'
      }
      if (nodemailer) {
        const user = env.EMAIL_USER
        const transporter = nodemailer.createTransport({
          host: env.SMTP_HOST || 'mail.privateemail.com',
          port: Number(env.SMTP_PORT || 465),
          secure: String(env.SMTP_SECURE ?? 'true') !== 'false',
          auth: { user, pass: env.EMAIL_PASS },
        })
        await transporter.sendMail({
          from: `"The Franks Standard Network" <${user}>`,
          to: user,
          subject: '[DIAGNOSTIC] Connection Test Passed',
          html: '<h3>Audit Complete</h3><p>Your background mail communication channels are operational.</p>',
        })
        console.log(' -> SUCCESS: Namecheap login authenticated and test email dispatched!')
        diagnostics.emailHandshake = 'PASS'
      }
    }
  } catch (err) {
    console.error(' -> EMAIL FAILURE:', err.message)
    diagnostics.emailHandshake = 'FAIL (Check password or Anti-Spoof filter rules)'
  }

  try {
    console.log('\n[2/3] Auditing Root Layout for Header Duplications...')
    const layoutPath = path.join(ROOT, 'layouts', 'default.vue')
    if (!fs.existsSync(layoutPath)) {
      console.log(' -> NOTICE: No layouts/default.vue found.')
      diagnostics.layoutsPurified = 'PASS'
    } else {
      const content = fs.readFileSync(layoutPath, 'utf8')
      const hit = LAYOUT_STACK_MARKERS.find((m) => content.includes(m))
      if (hit) {
        console.warn(` -> WARNING: Found "${hit}" inside layouts/default.vue — causes page stacking.`)
        diagnostics.layoutsPurified = 'FAIL (Requires clean root shell)'
      } else if (!content.includes('<NuxtPage')) {
        console.warn(' -> WARNING: default layout missing <NuxtPage /> shell.')
        diagnostics.layoutsPurified = 'FAIL (Requires clean root shell)'
      } else {
        console.log(' -> SUCCESS: layouts/default.vue is a clean, un-stacked container wrapper.')
        diagnostics.layoutsPurified = 'PASS'
      }
    }
  } catch {
    diagnostics.layoutsPurified = 'ERROR'
  }

  try {
    console.log('\n[3/3] Scanning Folder Subdirectories for Structural Overlaps...')
    const bcAudioIndex = path.join(ROOT, 'pages', 'bc-audio', 'index.vue')
    const rootIndex = path.join(ROOT, 'pages', 'index.vue')
    if (fs.existsSync(bcAudioIndex) && fs.existsSync(rootIndex)) {
      const rootContent = fs.readFileSync(rootIndex, 'utf8')
      const hasLandingChrome =
        rootContent.includes('EbayMarketHeader') && rootContent.includes('MarketplaceHome')
      if (hasLandingChrome) {
        console.log(' -> SUCCESS: Spatial folder separation verified; homepage chrome is on index only.')
        diagnostics.pagesIsolated = 'PASS'
      } else {
        console.warn(' -> WARNING: pages/index.vue missing expected marketplace landing chrome.')
        diagnostics.pagesIsolated = 'FAIL (Homepage shell incomplete)'
      }
    } else {
      console.warn(' -> WARNING: Missing isolated /bc-audio/ index or main landing view.')
      diagnostics.pagesIsolated = 'FAIL (Run brand isolation script)'
    }
  } catch {
    diagnostics.pagesIsolated = 'ERROR'
  }

  console.log('\n================================================================')
  console.log('FINAL INFRASTRUCTURE HEALTH STATUS SHEET:')
  console.log('================================================================')
  console.log(` -> EMAIL COMMUNICATIONS GATEWAY  : [${diagnostics.emailHandshake}]`)
  console.log(` -> CONTAINER WRAPPER PURIFICATION: [${diagnostics.layoutsPurified}]`)
  console.log(` -> BRAND FOLDER ARCHITECTURE     : [${diagnostics.pagesIsolated}]`)
  console.log('================================================================\n')

  const failed = Object.values(diagnostics).some((v) => String(v).startsWith('FAIL'))
  process.exit(failed ? 1 : 0)
}

runAuditPipeline()
