/**
 * Group Petra catalog rows by shelf category for nav menus and filters.
 */
import { BC_SHELF_CATEGORIES } from '~/utils/bcProductShelfCategory.js'

const PINNED_CATEGORIES = BC_SHELF_CATEGORIES

const MAX_MENU_CATEGORIES = 12

export function useBcCatalogGroups () {
  const { megastoreItems, pending, error, refresh } = useBcProductCatalog()

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
    const ordered = [...pinned, ...rest]
      .map((name) => ({ name, count: counts.get(name) || 0 }))
    return ordered.slice(0, MAX_MENU_CATEGORIES)
  })

  const totalCategoryCount = computed(() => {
    const set = new Set(items.value.map((i) => i.category).filter(Boolean))
    return set.size
  })

  function itemsForCategory (category, limit = 8) {
    const cat = String(category || '')
    return items.value.filter((i) => i.category === cat).slice(0, limit)
  }

  return {
    items,
    categories,
    totalCategoryCount,
    itemsForCategory,
    pending,
    error,
    refresh,
  }
}
