/**
 * Orchestrator: organic social posts + optional Meta paid (paused/dry-run safe).
 *
 *   npm run ads:run                              # organic all channels, security campaign
 *   npm run ads:run -- --campaign security       # security organic copy
 *   npm run ads:run -- --meta-paid               # + Meta paid (needs META_ADS_LIVE=1)
 *   npm run ads:run -- --dry-run                 # no API writes for paid
 *   npm run ads:run -- --export-reddit-google    # write copy files for manual Reddit/Google UI
 */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { getCampaign } = require('../utils/adCampaignCopy.cjs')

const root = path.join(__dirname, '..')
const argv = process.argv.slice(2)
function parseCampaign () {
  const eq = argv.find((a) => a.startsWith('--campaign='))
  if (eq) return eq.split('=')[1]
  const i = argv.indexOf('--campaign')
  if (i >= 0 && argv[i + 1]) return argv[i + 1]
  return process.env.ADS_CAMPAIGN || 'security'
}
const campaign = parseCampaign()
const metaPaid = argv.includes('--meta-paid') || process.env.ADS_META_PAID === '1'
const dryRun = argv.includes('--dry-run')
const organicOnly = argv.includes('--organic-only')
const skipOrganic = argv.includes('--skip-organic')
const exportRg = argv.includes('--export-reddit-google')

function run (cmd, args, extraEnv = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...extraEnv },
  })
  return r.status === 0
}

function exportRedditGoogle () {
  const camp = getCampaign(campaign)
  const outDir = path.join(root, 'assets', 'paid-ads-export')
  fs.mkdirSync(outDir, { recursive: true })
  if (camp.redditExport) {
    fs.writeFileSync(
      path.join(outDir, `reddit-${campaign}.txt`),
      `TITLE:\n${camp.redditExport.title}\n\nBODY:\n${camp.redditExport.body}\n\nURL:\n${camp.redditExport.url}\n`,
    )
  }
  if (camp.googleExport) {
    fs.writeFileSync(
      path.join(outDir, `google-${campaign}.json`),
      JSON.stringify(camp.googleExport, null, 2),
    )
  }
  console.log(`Exported → ${outDir}`)
}

;(async () => {
  console.log(`\n=== Paid ads orchestrator (campaign: ${campaign}) ===\n`)

  if (exportRg) exportRedditGoogle()

  if (!skipOrganic) {
    const flag = campaign === 'founders' ? '--founders'
      : campaign === 'honor' ? '--honor'
        : campaign === 'security' ? '--security'
          : ''
    console.log('→ Organic posts (Telegram, Facebook, Instagram, X)')
    if (!run('node', [`scripts/post-franks-social.cjs`, flag].filter(Boolean))) {
      process.exitCode = 1
    }
  }

  if (metaPaid && !organicOnly) {
    console.log('\n→ Meta paid ads')
    const env = {
      META_ADS_CAMPAIGN: campaign,
      ...(dryRun ? { META_ADS_DRY_RUN: '1', META_ADS_LIVE: '0' } : {}),
    }
    if (!run('node', ['scripts/run-meta-paid-ads.cjs', `--campaign=${campaign}`, ...(dryRun ? ['--dry-run'] : [])], env)) {
      process.exitCode = 1
    }
  }

  if (!metaPaid) {
    console.log('\nPaid Meta skipped (pass --meta-paid when META_AD_ACCOUNT_ID + tokens are set).')
  }

  console.log('\nReddit/Google: paste from assets/paid-ads-export/ or ads.reddit.com / ads.google.com')
  console.log('Docs: docs/ADS-AUTOMATION-SETUP.md\n')
})()
