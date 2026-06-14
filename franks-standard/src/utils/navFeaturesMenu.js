/**
 * Header Features dropdown — live marketplace tools by category.
 */
import { LIVE_NOW_BY_TAB } from '~/utils/platformLiveFeatures.js'

function mapItems (rows) {
  return (rows || []).map((f) => ({
    label: f.title,
    to: f.to,
    desc: f.desc,
  }))
}

export const NAV_FEATURES_SECTIONS = [
  {
    id: 'buyers',
    label: 'Buyers',
    accent: 'cyan',
    items: mapItems(LIVE_NOW_BY_TAB.buyers),
  },
  {
    id: 'sellers',
    label: 'Sellers',
    accent: 'gold',
    items: mapItems(LIVE_NOW_BY_TAB.sellers),
  },
  {
    id: 'security',
    label: 'Security & trust',
    accent: 'green',
    items: mapItems(LIVE_NOW_BY_TAB.security),
  },
  {
    id: 'perks',
    label: 'Perks & programs',
    accent: 'violet',
    items: mapItems(LIVE_NOW_BY_TAB.perks),
  },
]
