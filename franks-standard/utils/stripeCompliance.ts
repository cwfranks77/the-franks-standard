/**
 * Stripe / PSP compliance — keep marketplace out of weapons, hunting, and tactical gear.
 * Used at listing publish and in integrity scans. Align Stripe Dashboard business
 * description with this positioning (authenticated collectibles & general merchandise).
 */

export const STRIPE_SAFE_POSITIONING =
  'Authenticated collectibles marketplace: trading cards, coins, comics, memorabilia, vintage goods, and general merchandise with proof-first listings and escrow checkout.'

/** Categories removed from the catalog — too high risk for Stripe marketplace accounts. */
export const STRIPE_REMOVED_CATEGORIES = [
  'Firearms Accessories',
] as const

/** Listing text that triggers block at publish (weapons, ammo, tactical, hunting weapons). */
export const STRIPE_PROHIBITED_LISTING_RE =
  /\b(firearm|firearms|handgun|pistol|rifle|shotgun|revolver|ar-15|ar15|ak-47|gun\b|guns\b|ammunition|ammo\b|bullet\b|bullets|cartridge|magazine\b|mags\b|silencer|suppressor|nfa\b|sbr\b|sbs\b|ffl\b|4473|lower receiver|upper receiver|barrel assembly|bolt carrier|tactical gear|plate carrier|body armor|ballistic|night vision|thermal scope|hunting knife|combat knife|switchblade|brass knuckles|stun gun|taser|pepper ball|airsoft gun|bb gun|pellet gun|crossbow|bow hunting|hunting rifle|military weapon|ordnance|explosive|detonator)\b/i

export type StripeComplianceHit = {
  id: string
  label: string
  severity: 'block'
}

export function categoryBlockedForStripe (category: string | null | undefined): StripeComplianceHit | null {
  const c = String(category || '').trim()
  if ((STRIPE_REMOVED_CATEGORIES as readonly string[]).includes(c)) {
    return {
      id: 'stripe_category_removed',
      label: `"${c}" is not accepted — we focus on authenticated collectibles and general merchandise (no weapons or tactical gear).`,
      severity: 'block',
    }
  }
  return null
}

export function scanStripeListingCompliance (row: {
  category?: string | null
  title?: string | null
  description?: string | null
}): { ok: boolean; flags: StripeComplianceHit[] } {
  const flags: StripeComplianceHit[] = []
  const catHit = categoryBlockedForStripe(row.category)
  if (catHit) flags.push(catHit)

  const text = `${row.title || ''} ${row.description || ''}`.trim()
  if (text.length >= 3 && STRIPE_PROHIBITED_LISTING_RE.test(text)) {
    flags.push({
      id: 'stripe_prohibited_keywords',
      label:
        'Listing mentions weapons, ammunition, tactical gear, or regulated hunting weapons — not permitted on this marketplace.',
      severity: 'block',
    })
  }

  return { ok: flags.length === 0, flags }
}
