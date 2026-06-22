import fs from 'node:fs'
import path from 'node:path'
import { writeDocumentIndex } from '../utils/indexer.js'
import { markdownToPdf, bundleToZip } from '../utils/packet-export.js'

const REPO = process.cwd()
const PACKET_DIR = path.join(REPO, 'tfs/system/dealer-packet')
const CACHE_DIR = path.join(REPO, 'tfs/system/document-cache')
const CONTENT = path.join(REPO, 'content')

function ensureDir (p) {
  fs.mkdirSync(p, { recursive: true })
}

function logPacket (action, detail) {
  const logFile = path.join(REPO, 'tfs/logs/dealer-packet.log')
  const line = `[${new Date().toISOString()}] [builder] PACKET: ${action} DETAIL: ${detail}\n`
  ensureDir(path.dirname(logFile))
  fs.appendFileSync(logFile, line, 'utf8')
}

function copyIfExists (src, destDir, destName) {
  if (!fs.existsSync(src)) return false
  ensureDir(destDir)
  const dest = path.join(destDir, destName || path.basename(src))
  fs.copyFileSync(src, dest)
  return true
}

function copyDirMd (srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return
  ensureDir(destDir)
  for (const name of fs.readdirSync(srcDir)) {
    const full = path.join(srcDir, name)
    if (fs.statSync(full).isFile() && name.endsWith('.md')) {
      fs.copyFileSync(full, path.join(destDir, name))
    }
  }
}

function loadSupport () {
  const p = path.join(REPO, 'src/content/support-contacts.json')
  if (!fs.existsSync(p)) {
    return {
      parentCompany: { name: 'The Franks Standard LLC', phone: '(877) 837-0527', email: 'info@thefranksstandard.com', hours: 'Mon–Fri 9am–5pm CT' },
      audioDivision: { name: 'B&C Performance Audio LLC', phone: '(877) 837-0527', email: 'bc-audio@thefranksstandard.com', hours: 'Mon–Fri 9am–5pm CT' },
    }
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function buildSummaryMarkdown (support, lastUpdated) {
  return `# Dealer Business Packet — The Franks Standard

**Last Updated:** ${lastUpdated}

## Business identity
- **Marketplace:** ${support.parentCompany.name}
- **Phone:** ${support.parentCompany.phone}
- **Email:** ${support.parentCompany.email}
- **Website:** https://thefranksstandard.com

## Compliance policies
- Louisiana Marketplace Facilitator — sales tax from **shipping destination ZIP**
- Anti-counterfeit enforcement, COA requirements, prohibited items policy
- Seller and buyer onboarding guides included in packet sources

## Marketplace protections
- Escrow-style checkout, dispute resolution, authenticity monitoring
- 25% owner business income tax reserve on platform checkouts (internal accounting)
- Wholesale distributor fulfillment node transfers per order

## Contact information
- **General:** ${support.parentCompany.email} · ${support.parentCompany.phone}
- **B&C Audio division:** ${support.audioDivision.email}

---
See \`index.json\` for cached document inventory and folder contents for full policy markdown.
`
}

/**
 * Build dealer packet markdown, index, PDF, and ZIP.
 * @param {{ owner?: string }} [opts]
 */
export async function buildDealerPacket (opts = {}) {
  const owner = opts.owner || 'system'
  const lastUpdated = new Date().toISOString()
  ensureDir(PACKET_DIR)
  ensureDir(CACHE_DIR)

  logPacket('build-start', `owner=${owner}`)

  const policiesDir = path.join(CACHE_DIR, 'policies')
  const onboardingDir = path.join(CACHE_DIR, 'onboarding')
  ensureDir(policiesDir)
  ensureDir(onboardingDir)

  const policyFiles = [
    'no_counterfeits.md', 'authenticity_mission.md', 'safety_overview.md',
    'why_sell_on_tfs.md', 'why_buy_on_tfs.md', 'founder_story.md',
  ]
  for (const f of policyFiles) {
    copyIfExists(path.join(CONTENT, f), policiesDir, f)
  }
  copyDirMd(path.join(CONTENT, 'seller_onboarding'), path.join(onboardingDir, 'seller'))
  copyDirMd(path.join(CONTENT, 'buyer_onboarding'), path.join(onboardingDir, 'buyer'))
  copyIfExists(path.join(REPO, 'owner/reporting_guide.md'), policiesDir)

  const support = loadSupport()
  const summary = buildSummaryMarkdown(support, lastUpdated)
  const mdPath = path.join(PACKET_DIR, 'Dealer_Packet.md')
  fs.writeFileSync(mdPath, summary, 'utf8')

  const index = writeDocumentIndex(CACHE_DIR, path.join(PACKET_DIR, 'index.json'))
  fs.copyFileSync(path.join(PACKET_DIR, 'index.json'), path.join(CACHE_DIR, 'index.json'))

  const pdfPath = path.join(PACKET_DIR, 'Dealer_Packet.pdf')
  const zipPath = path.join(PACKET_DIR, 'Dealer_Packet.zip')
  markdownToPdf(summary, pdfPath)

  const zipSources = [mdPath, pdfPath, path.join(PACKET_DIR, 'index.json')]
  bundleToZip(zipSources, zipPath)

  logPacket('build-complete', `files=${zipSources.length}`)

  return {
    ok: true,
    lastUpdated,
    packetDir: PACKET_DIR,
    files: {
      markdown: mdPath,
      pdf: pdfPath,
      zip: zipPath,
      index: path.join(PACKET_DIR, 'index.json'),
    },
    documentCount: index.documentCount,
  }
}

export default { buildDealerPacket }
