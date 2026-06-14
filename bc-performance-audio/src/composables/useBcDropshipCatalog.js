import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const EMPTY_CATALOG = Object.freeze({
  items: [],
  store: { is_live: true },
  offline: false,
})

/**
 * Supabase dropship API is unavailable on static GitHub Pages (bcpoweraudio.com).
 * Petra JSON catalog is the source of truth there.
 */
export function useBcDropshipCatalog () {
  const config = useRuntimeConfig()
  const staticStorefront = isBcPowerAudioPrimarySite(config.public.siteUrl)

  if (staticStorefront) {
    return {
      data: ref(EMPTY_CATALOG),
      pending: ref(false),
      error: ref(null),
    }
  }

  return useFetch('/api/public/dropship-catalog', {
    query: { storeId: 'bc-performance-audio' },
    default: () => ({ ...EMPTY_CATALOG, items: [] }),
    retry: 0,
  })
}
