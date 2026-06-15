import { filterBcAudioProducts } from '~/utils/bcAudioOnlyCatalog.js'
import { bcPlaceholderImageForProduct, resolveBcProductImage } from '~/utils/bcProductImage.js'
import { bcProductShelfCategory } from '~/utils/bcProductShelfCategory.js'
import { fetchBcPublicSiteContent } from '~/composables/useBcPublicSiteContent'
import { withCustomerRetailOnly } from '~/utils/bcRetailPricing.js'

/**
 * Load B&C product rows at runtime from /catalog/petra-products.json.
 * Keeps large catalogs and remote image URLs out of the JS bundle.
 */
export function useBcProductCatalog () {
  const { data, pending, error, refresh } = useFetch('/catalog/petra-products.json', {
    key: 'bc-petra-catalog',
    server: false,
    lazy: false,
    retry: 2,
  })

  const hiddenProductIds = ref([])
  const priceOverrides = ref({})

  async function loadOwnerCatalogRules () {
    try {
      const content = await fetchBcPublicSiteContent(['bcHiddenCatalog', 'bcPriceOverrides'])
      const ids = content?.bcHiddenCatalog?.productIds
      hiddenProductIds.value = Array.isArray(ids) ? ids.map(String) : []
      priceOverrides.value = (content?.bcPriceOverrides && typeof content.bcPriceOverrides === 'object')
        ? content.bcPriceOverrides
        : {}
    } catch {
      hiddenProductIds.value = []
      priceOverrides.value = {}
    }
  }

  onMounted(loadOwnerCatalogRules)

  const products = computed(() => {
    const hidden = new Set(hiddenProductIds.value)
    return filterBcAudioProducts(data.value?.products || [])
      .filter((p) => !hidden.has(String(p.id)))
      .map((p) => withCustomerRetailOnly(p, priceOverrides.value))
  })

  const megastoreItems = computed(() =>
    products.value.map((item) => ({
      id: item.id,
      name: item.name,
      category: bcProductShelfCategory(item),
      brand: item.brand || item.category,
      image: resolveBcProductImage(item),
      fallbackImage: bcPlaceholderImageForProduct(item),
      tagline: item.description,
      retailPrice: item.retailPrice ?? item.price,
      badge: item.inStock === false ? 'Out of stock' : '',
      inStock: item.inStock !== false,
      specs: [],
    })),
  )

  function findProduct (id) {
    const hit = products.value.find((p) => String(p.id) === String(id))
    if (!hit) return null
    return {
      id: hit.id,
      name: hit.name,
      category: bcProductShelfCategory(hit),
      brand: hit.brand || hit.category,
      image: resolveBcProductImage(hit),
      fallbackImage: bcPlaceholderImageForProduct(hit),
      tagline: hit.description,
      description: hit.description,
      retailPrice: hit.retailPrice ?? hit.price,
      inStock: hit.inStock !== false,
    }
  }

  return {
    data,
    products,
    megastoreItems,
    findProduct,
    pending,
    error,
    refresh,
  }
}
