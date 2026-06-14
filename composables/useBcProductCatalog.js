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

  const products = computed(() => data.value?.products || [])

  const megastoreItems = computed(() =>
    products.value.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      brand: item.brand || item.category,
      image: item.image || '',
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
      category: hit.category,
      brand: hit.brand || hit.category,
      image: hit.image || '',
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
