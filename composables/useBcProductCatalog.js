import { filterBcAudioProducts } from '~/utils/bcAudioOnlyCatalog.js'
import { bcPlaceholderImageForProduct, resolveBcProductImage } from '~/utils/bcProductImage.js'
import { bcProductShelfCategory } from '~/utils/bcProductShelfCategory.js'

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

  const products = computed(() => filterBcAudioProducts(data.value?.products || []))

  const megastoreItems = computed(() =>
    products.value.map((item) => ({
      id: item.id,
      name: item.name,
      category: bcProductShelfCategory(item),
      brand: item.brand || item.category,
      image: resolveBcProductImage(item),
      fallbackImage: bcPlaceholderImageForProduct(item),
      tagline: item.description,
      retailPrice: item.price,
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
      retailPrice: hit.price,
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
