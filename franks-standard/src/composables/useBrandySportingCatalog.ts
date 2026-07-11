import { filterBrandySportingProducts } from '~/utils/brandySportingCatalog.js'

/** Brandy's Sporting Goods — runtime catalog from /catalog/brandy-sporting-products.json */
export function useBrandySportingCatalog () {
  const { data, pending, error, refresh } = useFetch('/catalog/brandy-sporting-products.json', {
    key: 'brandy-sporting-catalog',
    server: false,
    lazy: false,
    retry: 2,
  })

  const products = computed(() => {
    const rows = data.value?.products || []
    if (rows.length) return rows
    const petra = data.value?.source === 'petra-products.json' ? [] : []
    return filterBrandySportingProducts(petra)
  })

  const inStockCount = computed(() => products.value.filter((p) => p.inStock !== false).length)

  return { data, products, inStockCount, pending, error, refresh }
}
