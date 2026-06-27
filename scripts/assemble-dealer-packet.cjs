/**
 * Gather TFS + B&C business paperwork into a dealer packet folder.
 * Run: node scripts/assemble-dealer-packet.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')

const REPO = path.join(__dirname, '..')
const DESKTOP = path.join(os.homedir(), 'OneDrive', 'Desktop')
const TEMP = path.join(os.tmpdir(), 'tfs_bc_business_docs')
const FINAL = path.join(os.homedir(), 'Documents', 'Dealer Business License', 'Tax Documents')

function ensureDir (p) {
  fs.mkdirSync(p, { recursive: true })
}

function copyFile (src, destDir, destName) {
  if (!fs.existsSync(src)) {
    console.warn('SKIP (missing):', src)
    return false
  }
  ensureDir(destDir)
  const dest = path.join(destDir, destName || path.basename(src))
  fs.copyFileSync(src, dest)
  console.log('COPY:', dest)
  return true
}

function copyDirFiles (srcDir, destDir, filter) {
  if (!fs.existsSync(srcDir)) return
  ensureDir(destDir)
  for (const name of fs.readdirSync(srcDir)) {
    const full = path.join(srcDir, name)
    if (!fs.statSync(full).isFile()) continue
    if (filter && !filter(name)) continue
    copyFile(full, destDir)
  }
}

function writeText (destDir, name, body) {
  ensureDir(destDir)
  const dest = path.join(destDir, name)
  fs.writeFileSync(dest, body, 'utf8')
  console.log('WRITE:', dest)
}

function rmDir (p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true })
}

// --- clean temp ---
rmDir(TEMP)
ensureDir(TEMP)

const dirs = {
  tax: path.join(TEMP, '01_Business_Registration_and_Tax'),
  tfsProfile: path.join(TEMP, '02_The_Franks_Standard', 'Business_Profile'),
  tfsPolicies: path.join(TEMP, '02_The_Franks_Standard', 'Policies_and_Rules'),
  tfsSeller: path.join(TEMP, '02_The_Franks_Standard', 'Seller_Onboarding'),
  tfsBuyer: path.join(TEMP, '02_The_Franks_Standard', 'Buyer_Onboarding'),
  tfsBrand: path.join(TEMP, '02_The_Franks_Standard', 'Brand'),
  tfsCoa: path.join(TEMP, '02_The_Franks_Standard', 'COA_and_Authenticity'),
  bcProfile: path.join(TEMP, '03_BC_Performance_Audio', 'Business_Profile'),
  bcPolicies: path.join(TEMP, '03_BC_Performance_Audio', 'Policies'),
  bcMarketing: path.join(TEMP, '03_BC_Performance_Audio', 'Marketing'),
}

// --- PDFs from Desktop (EIN + resale) ---
copyFile(path.join(DESKTOP, 'The Franks Standard CP-575.pdf'), dirs.tax)
copyFile(path.join(DESKTOP, 'Resale Certificate.pdf'), dirs.tax)

// --- TFS content (source only, not public/ duplicates) ---
const contentRoot = path.join(REPO, 'content')
const copyContent = (name, dest) => copyFile(path.join(contentRoot, name), dest)

copyContent('no_counterfeits.md', dirs.tfsPolicies)
copyContent('authenticity_mission.md', dirs.tfsPolicies)
copyContent('safety_overview.md', dirs.tfsPolicies)
copyContent('why_sell_on_tfs.md', dirs.tfsPolicies)
copyContent('why_buy_on_tfs.md', dirs.tfsPolicies)
copyContent('founder_story.md', dirs.tfsProfile)
copyContent('home_authenticity_banner.md', dirs.tfsPolicies)
copyDirFiles(path.join(contentRoot, 'seller_onboarding'), dirs.tfsSeller, (n) => n.endsWith('.md'))
copyDirFiles(path.join(contentRoot, 'buyer_onboarding'), dirs.tfsBuyer, (n) => n.endsWith('.md'))

copyDirFiles(path.join(REPO, 'brand'), dirs.tfsBrand, (n) => n.endsWith('.md'))
copyFile(path.join(REPO, 'backend', 'ai_chat_agent', 'knowledge_base', 'coa.md'), dirs.tfsCoa)
copyFile(path.join(REPO, 'backend', 'ai_chat_agent', 'knowledge_base', 'fraud.md'), dirs.tfsPolicies)
copyFile(path.join(REPO, 'backend', 'ai_chat_agent', 'knowledge_base', 'disputes.md'), dirs.tfsPolicies)
copyFile(path.join(REPO, 'backend', 'ai_chat_agent', 'knowledge_base', 'payments.md'), dirs.tfsPolicies)
copyFile(path.join(REPO, 'backend', 'ai_chat_agent', 'knowledge_base', 'platform_overview.md'), dirs.tfsProfile)

// Policy metadata + bundles (site legal references)
const utils = path.join(REPO, 'franks-standard', 'utils')
for (const f of [
  'marketplacePolicyMeta.js',
  'sellerPolicyBundle.js',
  'buyerPolicyBundle.js',
  'marketplaceFacilitatorCopy.js',
  'authenticitySeal.js',
  'franksCoaModel.js',
  'protectionMessaging.js',
  'ownerDocuments.js',
  'sellerPolicyVersion.js',
  'liabilityPolicyVersion.js',
]) {
  copyFile(path.join(utils, f), dirs.tfsPolicies)
}

copyFile(path.join(REPO, 'src', 'content', 'support-contacts.json'), dirs.tfsProfile)
copyFile(path.join(REPO, 'owner', 'reporting_guide.md'), dirs.tfsPolicies)

// --- B&C Audio ---
copyFile(path.join(REPO, 'bc-performance-audio', 'docs', 'policies', 'shipping_and_returns.md'), dirs.bcPolicies)
copyDirFiles(path.join(REPO, 'bc-performance-audio', 'docs', 'templates'), dirs.bcPolicies, (n) => n.endsWith('.txt'))
copyDirFiles(path.join(REPO, 'marketing', 'bc_audio'), dirs.bcMarketing, (n) => /\.(md|txt)$/i.test(n))

// --- Generated summaries for wholesalers ---
const support = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'content', 'support-contacts.json'), 'utf8'))

writeText(dirs.tfsProfile, 'Business_Profile_Sheet.md', `# The Franks Standard LLC — Business Profile (Dealer Packet)

**Legal entity:** ${support.parentCompany.name}  
**Role:** Louisiana marketplace facilitator (collectibles, gear, multi-vendor)  
**General support phone:** ${support.parentCompany.phone}  
**General support email:** ${support.parentCompany.email}  
**Hours:** ${support.parentCompany.hours}  
**Website:** https://thefranksstandard.com  

## What we do
- Operate a proof-first online marketplace (not the seller of third-party listed items).
- Require seller-backed authenticity proof on collectible categories (COA upload or Franks Standard COA serial).
- Collect sales tax from the customer's **shipping destination ZIP** (Louisiana Marketplace Facilitator compliance).
- Provide escrow checkout, dispute resolution, and enforcement against proven counterfeits.

## Binding policy pages (live on site)
- Terms of Service — /terms
- Privacy Policy — /privacy
- Marketplace Policies & Enforcement — /marketplace-policy
- Seller Agreement — /seller-agreement
- Prohibited Items — /prohibited-items
- Buyer Marketplace Facilitator Agreement — /buyer-agreement
- Protection summary — /protection

## Included in this packet
See \`DEALER_PACKET_INDEX.md\` at the folder root. PDF copies of EIN (CP-575) and Louisiana resale certificate are in \`01_Business_Registration_and_Tax\`.

*Prepared for wholesale / distributor onboarding — ${new Date().toISOString().slice(0, 10)}*
`)

writeText(dirs.bcProfile, 'BC_Business_Profile_Sheet.md', `# B&C Performance Audio LLC — Business Profile (Dealer Packet)

**Legal entity:** ${support.audioDivision.name}  
**Parent marketplace:** ${support.parentCompany.name}  
**Division focus:** Competition car audio — wholesale distribution portal  
**Support phone:** ${support.audioDivision.phone}  
**Support email:** ${support.audioDivision.email}  
**Hours:** ${support.audioDivision.hours}  
**Website:** https://bcpoweraudio.com  
**Marketplace lane:** https://thefranksstandard.com/bc-audio  

## What we do
- Authorized wholesale-style competition audio catalog (subs, amps, install gear).
- Dark-theme dedicated storefront; checkout and tax run on The Franks Standard platform rails.
- Louisiana sales tax calculated from **shipping ZIP** at checkout.
- COA chain-of-custody and platform fraud monitoring for high-trust inventory.

## Related documents in this packet
- \`03_BC_Performance_Audio/Policies/shipping_and_returns.md\`
- \`03_BC_Performance_Audio/Marketing/\` — value proposition and brand story
- The Franks Standard marketplace policies in \`02_The_Franks_Standard/\`

*Prepared for wholesale / distributor onboarding — ${new Date().toISOString().slice(0, 10)}*
`)

// --- Index ---
const indexSections = []
function listDir (rel, title) {
  const full = path.join(TEMP, rel)
  if (!fs.existsSync(full)) return
  const entries = []
  function walk (d, prefix) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p, prefix + e.name + '/')
      else entries.push(prefix + e.name)
    }
  }
  walk(full, '')
  if (entries.length) indexSections.push(`## ${title}\n\n${entries.map((e) => `- ${rel}/${e}`).join('\n')}`)
}

listDir('01_Business_Registration_and_Tax', '01 — Business registration & tax')
listDir('02_The_Franks_Standard', '02 — The Franks Standard LLC')
listDir('03_BC_Performance_Audio', '03 — B&C Performance Audio LLC')

writeText(TEMP, 'DEALER_PACKET_INDEX.md', `# Dealer Business Packet — The Franks Standard & B&C Performance Audio

Assembled: ${new Date().toLocaleString()}

This folder is for **wholesale / distributor onboarding**. It combines:
- Government tax documents (EIN letter, resale certificate) from your Desktop
- Marketplace policies, anti-counterfeit rules, COA requirements, and seller/buyer guides from the TFS codebase
- B&C Performance Audio shipping, returns, and business marketing materials

**Not included (keep private):** owner ops passphrases, API keys, internal license keys.

${indexSections.join('\n\n')}

## Notes for wholesalers
1. **The Franks Standard LLC** is the marketplace facilitator; listed items are sold by independent sellers unless marked as B&C inventory.
2. **B&C Performance Audio LLC** is a separate branded division for competition audio.
3. Full binding legal text for Terms, Privacy, and Marketplace Policy lives on thefranksstandard.com — printed copies should be generated from the site (\`?print=1\` on policy URLs) when counsel provides final stamped versions.
4. Seller policy version reference files are included as \`.js\` exports from the live site configuration.

## Missing items to add manually
If you have these elsewhere, drop them into \`01_Business_Registration_and_Tax\`:
- Louisiana LLC formation / Articles of Organization (The Franks Standard LLC)
- Louisiana LLC formation (B&C Performance Audio LLC)
- Any state dealer or wholesale license not already scanned
- Signed distributor agreements with Petra / other suppliers
`)

// --- Move to Documents ---
rmDir(FINAL)
ensureDir(path.dirname(FINAL))
fs.renameSync(TEMP, FINAL)
console.log('\nDONE — Dealer packet at:', FINAL)
