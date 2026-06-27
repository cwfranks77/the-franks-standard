import { getFranksSupport } from '~/utils/supportContacts.js'

export type FranksPublicProfile = {
  siteName: string
  businessType: string
  locationTarget: string
  stateSalesTaxRate: string
  collectionModules: string[]
  seo: { title: string; description: string }
}

const FALLBACK_SEO = {
  title: 'The Franks Standard LLC | Premium Antiques & Gold Buyers Louisiana',
  description:
    'We purchase used antiques, fine estate jewelry, and scrap gold weights at top market values. Secure local evaluations and professional liquidations.',
}

export function useFranksSiteProfile () {
  const config = useRuntimeConfig()
  const support = computed(() => getFranksSupport(config))
  const profile = useState<FranksPublicProfile | null>('franks-wp-profile', () => null)
  const loaded = useState('franks-wp-profile-loaded', () => false)

  async function load () {
    if (loaded.value && profile.value) return profile.value
    try {
      const data = await $fetch<{
        ok: boolean
        profile: FranksPublicProfile | null
        support?: { phoneDisplay: string; phoneTel: string }
      }>('/api/franks-site-profile')
      if (data?.profile) {
        profile.value = data.profile
      } else {
        profile.value = {
          siteName: 'The Franks Standard LLC',
          businessType: 'Used Antiques, Estate Jewelry, and Fine Gold Acquisitions',
          locationTarget: 'Louisiana, USA Local SEO Grid',
          stateSalesTaxRate: '0.0445',
          collectionModules: [
            'Vintage Estate Furniture',
            'Scrap Gold & Precious Bullion Weight Classes',
            'Loose Natural Rubies & Cultured Pearls',
          ],
          seo: { ...FALLBACK_SEO },
        }
      }
    } catch {
      profile.value = {
        siteName: 'The Franks Standard LLC',
        businessType: 'Collectibles & antiques marketplace',
        locationTarget: 'Louisiana, USA',
        stateSalesTaxRate: '0.0445',
        collectionModules: [],
        seo: { ...FALLBACK_SEO },
      }
    }
    loaded.value = true
    return profile.value
  }

  const seoTitle = computed(
    () => profile.value?.seo?.title || FALLBACK_SEO.title,
  )
  const seoDescription = computed(
    () => profile.value?.seo?.description || FALLBACK_SEO.description,
  )

  return {
    profile,
    support,
    loaded,
    load,
    seoTitle,
    seoDescription,
  }
}
