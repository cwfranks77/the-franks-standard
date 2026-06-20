/**
 * Homepage floor hub — compact differentiators, built-on pills, feature links.
 */
import { SECURITY_DIFFERENTIATORS } from '~/utils/securityDifferentiators.js'
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'
import { LIVE_NOW_TABS, LIVE_NOW_BY_TAB } from '~/utils/platformLiveFeatures.js'
import { HOME_DEPARTMENTS, departmentBrowseTo } from '~/utils/homeQuickLinks.js'

/** Short “stack” chips — what the platform is built on */
export const HOME_BUILT_ON = [
  { label: 'COA registry', to: '/verify/coa/FS-2026-000001' },
  { label: 'Proof before publish', to: '/how-it-works' },
  { label: 'Stripe escrow', to: '/protection' },
  { label: 'Authenticity scan', to: '/learn/tools/authenticity-checklist' },
  { label: 'Coin study guide', to: '/learn/tools/coin-study-guide' },
  { label: 'Policy signature', to: '/seller-agreement' },
  { label: `${PRICING_PUBLIC.txRangeLabel} fees`, to: '/pricing' },
  { label: 'Video inspect', to: '/video' },
]

/** Top differentiators — link rows, not cards */
export const HOME_APART_LINKS = SECURITY_DIFFERENTIATORS.filter((d) =>
  ['coa-office', 'proof-gate', 'escrow', 'forced-refund', 'policy-signature', 'fees', 'video-inspect'].includes(d.id),
).map((d) => ({
  id: d.id,
  icon: d.icon,
  title: d.title,
  short: d.short,
  to: d.link,
}))

export { LIVE_NOW_TABS, LIVE_NOW_BY_TAB }

export const HOME_OFFER_ADS = [
  {
    id: 'founders10',
    code: 'FOUNDERS10',
    line: 'First 10 sellers · 3 months Pro free',
    to: '/join/founders10',
    tone: 'gold',
  },
  {
    id: 'honor26',
    code: 'HONOR26',
    line: 'Military & first responders · 6 months Pro',
    to: '/honor',
    tone: 'navy',
  },
  {
    id: 'excellence',
    code: 'Seller Excellence',
    line: '#1 each cycle · 0% platform fees 30 days',
    to: '/top-sellers',
    tone: 'green',
  },
]

/** Flat category text links for the nav cloud */
export function homeCategoryLinks () {
  return HOME_DEPARTMENTS.map((d) => ({
    label: d.shortLabel,
    to: departmentBrowseTo(d),
  }))
}
