import { BC_META_DEFAULTS } from '~/utils/bcMetaDefaults.js'
import { fetchBcPublicSiteContent } from '~/composables/useBcPublicSiteContent'

export type BcSiteMeta = typeof BC_META_DEFAULTS

export function useBcSiteMeta () {
  const meta = ref<BcSiteMeta>({ ...BC_META_DEFAULTS })
  const metaLoaded = ref(false)

  async function refreshBcSiteMeta () {
    try {
      const data = await fetchBcPublicSiteContent(['bcMeta'])
      const published = data?.bcMeta as Partial<BcSiteMeta> | undefined
      if (published && typeof published === 'object') {
        meta.value = { ...BC_META_DEFAULTS, ...published }
      }
    } catch { /* keep defaults */ }
    finally {
      metaLoaded.value = true
    }
  }

  useHead(() => ({
    title: meta.value.title,
    titleTemplate: () => meta.value.title,
    link: [
      { key: 'bc-canonical', rel: 'canonical', href: meta.value.url },
    ],
    meta: [
      { key: 'description', name: 'description', content: meta.value.description },
      { key: 'og:type', property: 'og:type', content: 'website' },
      { key: 'og:site_name', property: 'og:site_name', content: meta.value.parentCompany },
      { key: 'og:title', property: 'og:title', content: meta.value.title },
      { key: 'og:description', property: 'og:description', content: meta.value.description },
      { key: 'og:url', property: 'og:url', content: meta.value.url },
      { key: 'og:image', property: 'og:image', content: meta.value.image },
      { key: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { key: 'twitter:title', name: 'twitter:title', content: meta.value.title },
      { key: 'twitter:description', name: 'twitter:description', content: meta.value.description },
      { key: 'twitter:image', name: 'twitter:image', content: meta.value.image },
    ],
  }))

  onMounted(() => {
    refreshBcSiteMeta()
  })

  return { meta, metaLoaded, refreshBcSiteMeta }
}
