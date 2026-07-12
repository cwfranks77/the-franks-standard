/**
 * Poll Petra catalog index while the B&C storefront is open.
 * Detects adds/removals and refreshes the live product list (no paid APIs).
 */
import { filterBcAudioProducts } from '~/utils/bcAudioOnlyCatalog.js'

const INDEX_URL = '/catalog/catalog-index.json'
const STORAGE_IDS = 'bc-catalog-audio-ids-v1'
const STORAGE_SIG = 'bc-catalog-signature-v1'
const POLL_MS = 15 * 60 * 1000

export function useBcCatalogAutoRefresh () {
  const { products, refresh } = useBcProductCatalog()

  const lastCheckedAt = useState('bc-catalog-last-checked', () => null)
  const checking = useState('bc-catalog-checking', () => false)
  const updateNotice = useState('bc-catalog-update-notice', () => null)
  let pollTimer = null
  let visibilityHandler = null

  function stopCatalogAutoRefresh () {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    if (import.meta.client && visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
      visibilityHandler = null
    }
  }

  function startCatalogAutoRefresh () {
    if (!import.meta.client || pollTimer) return

    const run = () => { checkForCatalogUpdates({ silent: false }).catch(() => {}) }

    setTimeout(() => {
      checkForCatalogUpdates({ silent: true }).finally(run)
    }, 4000)

    pollTimer = setInterval(run, POLL_MS)

    visibilityHandler = () => {
      if (document.visibilityState === 'visible') run()
    }
    document.addEventListener('visibilitychange', visibilityHandler)
  }

  function loadStoredIds () {
    if (!import.meta.client) return []
    try {
      const raw = sessionStorage.getItem(STORAGE_IDS)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }

  function saveStoredIds (ids) {
    if (!import.meta.client) return
    sessionStorage.setItem(STORAGE_IDS, JSON.stringify(ids))
  }

  function saveStoredSignature (sig) {
    if (!import.meta.client || !sig) return
    sessionStorage.setItem(STORAGE_SIG, String(sig))
  }

  function loadStoredSignature () {
    if (!import.meta.client) return ''
    return String(sessionStorage.getItem(STORAGE_SIG) || '')
  }

  function diffCatalog (oldIds, newProducts) {
    const newIds = newProducts.map((p) => String(p.id))
    const oldSet = new Set(oldIds)
    const newSet = new Set(newIds)
    const added = newIds.filter((id) => !oldSet.has(id))
    const removed = oldIds.filter((id) => !newSet.has(id))
    return { added, removed, total: newIds.length }
  }

  async function fetchCatalogIndex () {
    return await $fetch(INDEX_URL, {
      cache: 'no-cache',
      query: { t: Date.now() },
      retry: 1,
    })
  }

  async function checkForCatalogUpdates ({ silent = false } = {}) {
    if (!import.meta.client || checking.value) return null
    checking.value = true
    lastCheckedAt.value = new Date().toISOString()

    try {
      const index = await fetchCatalogIndex()
      const signature = String(index?.catalogSignature || index?.updatedAt || '')
      const previousSig = loadStoredSignature()
      const previousIds = loadStoredIds()

      const signatureChanged = Boolean(signature) && signature !== previousSig
      const firstVisit = !previousSig && previousIds.length === 0

      if (!signatureChanged && previousIds.length) {
        return null
      }

      await refresh()

      const audioRows = filterBcAudioProducts(products.value || [])
      const { added, removed, total } = diffCatalog(previousIds, audioRows)

      saveStoredIds(audioRows.map((p) => String(p.id)))
      if (signature) saveStoredSignature(signature)

      if (firstVisit || silent) return null

      if (!added.length && !removed.length && signatureChanged) {
        updateNotice.value = {
          type: 'refresh',
          message: 'Catalog prices or stock were updated from Petra.',
          added: 0,
          removed: 0,
          total,
          at: lastCheckedAt.value,
        }
        return updateNotice.value
      }

      if (added.length || removed.length) {
        updateNotice.value = {
          type: 'inventory',
          message: `Inventory update: ${added.length} added, ${removed.length} removed.`,
          added: added.length,
          removed: removed.length,
          total,
          at: lastCheckedAt.value,
        }
        return updateNotice.value
      }

      return null
    } catch {
      return null
    } finally {
      checking.value = false
    }
  }

  function dismissNotice () {
    updateNotice.value = null
  }

  return {
    lastCheckedAt,
    checking,
    updateNotice,
    checkForCatalogUpdates,
    dismissNotice,
    startCatalogAutoRefresh,
    stopCatalogAutoRefresh,
  }
}
