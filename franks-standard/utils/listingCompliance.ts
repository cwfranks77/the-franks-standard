import { scanOffPlatformContent } from '~/utils/offPlatformGuard'
import { scanStripeListingCompliance } from '~/utils/stripeCompliance'
import { listingRequiresCoa, textSuggestsCollectible } from '~/utils/marketplaceCategories'
import { scanListingIntegrity } from '~/utils/authenticityScan'

export type ComplianceFlag = {
  id: string
  label: string
  severity: 'block' | 'review'
  source: string
}

const RESTRICTED_ITEM_RE =
  /\b(firearm|handgun|pistol|rifle|shotgun|ammunition|ammo\b|explosive|detonator|controlled substance|marijuana|cbd oil|stolen property|human remains|counterfeit|fake rolex|super clone|unauthorized authentic|child porn|illegal drug)\b/i

const RESTRICTED_IMAGE_RE =
  /\b(gun|rifle|pistol|ammo|weapon|nude|explicit|drug|marijuana|counterfeit)\b/i

export function scanListingCompliance (row: {
  category?: string
  title?: string
  description?: string
  coa_type?: string
  coa_storage_path?: string
  coa_serial_number?: string
  seller_signature?: string
  price?: number | null
}) {
  const flags: ComplianceFlag[] = []

  const offPlatform = scanOffPlatformContent(`${row.title || ''}\n${row.description || ''}`)
  if (!offPlatform.ok) {
    for (const v of offPlatform.violations) {
      flags.push({ id: v.id, label: v.label, severity: 'block', source: 'contact-info' })
    }
  }

  const stripe = scanStripeListingCompliance(row)
  for (const f of stripe.flags) {
    flags.push({ id: f.id, label: f.label, severity: 'block', source: 'restricted-items' })
  }

  const text = `${row.title || ''} ${row.description || ''}`
  if (RESTRICTED_ITEM_RE.test(text)) {
    flags.push({
      id: 'restricted_item_keyword',
      label: 'Listing text matches prohibited or restricted item keywords.',
      severity: 'block',
      source: 'restricted-items',
    })
  }

  const integrity = scanListingIntegrity(row)
  for (const f of integrity.flags) {
    flags.push({
      id: f.id,
      label: f.label,
      severity: f.severity === 'block' ? 'block' : 'review',
      source: 'authenticity',
    })
  }

  const needsCoa = listingRequiresCoa(row.category, row.title, row.description)
  if (needsCoa) {
    const serial = String(row.coa_serial_number || '').trim()
    const sig = String(row.seller_signature || '').trim()
    if (!serial || sig.length < 3) {
      flags.push({
        id: 'coa_gate_incomplete',
        label: 'Collectible or antique listings require a Franks COA serial and seller e-signature before publish.',
        severity: 'block',
        source: 'coa',
      })
    }
  }

  if (textSuggestsCollectible(row.title, row.description) && !needsCoa) {
    const serial = String(row.coa_serial_number || '').trim()
    if (!serial) {
      flags.push({
        id: 'collectible_intent_no_coa',
        label: 'Title or description suggests a collectible — COA serial and e-signature required.',
        severity: 'block',
        source: 'coa',
      })
    }
  }

  const hasBlock = flags.some((f) => f.severity === 'block')
  return {
    ok: !hasBlock,
    flags,
    needsCoa,
    integrityScore: integrity.score,
  }
}

export function scanListingImageNames (names: string[]) {
  const flags: ComplianceFlag[] = []
  for (const name of names) {
    const base = String(name || '').toLowerCase()
    if (RESTRICTED_IMAGE_RE.test(base)) {
      flags.push({
        id: 'image_filename_flag',
        label: `Image file name flagged for review: ${name}`,
        severity: 'review',
        source: 'image-scan',
      })
    }
  }
  return { ok: flags.length === 0, flags }
}

export function formatComplianceBlockMessage (flags: ComplianceFlag[]) {
  const blocks = flags.filter((f) => f.severity === 'block')
  if (!blocks.length) return ''
  return [
    'This listing cannot be published:',
    ...blocks.map((f) => `• ${f.label}`),
    '',
    'Counterfeit collectibles or antiques trigger automatic account freeze pending review.',
  ].join('\n')
}
