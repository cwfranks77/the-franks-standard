/**
 * Group Petra catalog rows by category for nav menus and filters.
 */
const PINNED_CATEGORIES = [
  'Amplifiers',
  'Subwoofers',
  'Speakers',
  'Home Audio',
  'Car Audio',
  'Marine Audio',
]

export function useBcCatalogGroups () {
  const { megastoreItems, pending, error } = useBcProductCatalog()

  const items = computed(() => {
    const rows = megastoreItems.value
    return Array.isArray(rows) ? rows : []
  })

  const categories = computed(() => {
    const counts = new Map()
    for (const item of items.value) {
      const cat = String(item.category || 'General').trim() || 'General'
      counts.set(cat, (counts.get(cat) || 0) + 1)
    }
    const pinned = PINNED_CATEGORIES.filter((c) => counts.has(c))
    const rest = [...counts.keys()]
      .filter((c) => !PINNED_CATEGORIES.includes(c))
      .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
    return [...pinned, ...rest].map((name) => ({
      name,
      count: counts.get(name) || 0,
    }))
  })

  function itemsForCategory (category, limit = 8) {
    const cat = String(category || '')
    return items.value.filter((i) => i.category === cat).slice(0, limit)
  }

  return {
    items,
    categories,
    itemsForCategory,
    pending,
    error,
  }
}
