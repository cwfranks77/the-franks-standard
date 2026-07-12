/**
 * Partner storefronts shown in B&C Audio navigation (Shop Stores menu).
 * Kept in the BC namespace — not shared with The Franks Standard marketplace.
 */
import { BC_BRAND } from '~/utils/bcBrand.js'

export const BC_PARTNER_STORES = [
  {
    id: 'bc-performance-audio',
    name: BC_BRAND.full,
    slug: 'bc-performance-audio',
    path: '/bc-audio',
    tagline: 'Competition-grade subwoofers, amps & staging — dropship fulfillment',
    accent: '#d32f2f',
    status: 'live',
    dropship: true,
  },
  {
    id: 'brandy-sporting',
    name: "Brandy's Sporting Goods",
    slug: 'brandysportinggoods',
    path: '/store/brandysportinggoods',
    tagline: 'Outdoor, fitness & sporting gear — coming soon',
    accent: '#146eb4',
    status: 'coming-soon',
    comingSoon: true,
    dropship: true,
  },
]

export function isBcPartnerStoreComingSoon (store) {
  if (!store) return false
  return Boolean(store.comingSoon || store.status === 'coming-soon')
}
