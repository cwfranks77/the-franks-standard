/** Dropship supplier catalog — customer-facing wizard (no account required to plan). */

export const DROPSHIP_PROVIDER_CATALOG = [
  { key: 'custom', name: 'My own supplier (any company)', website: '', contactEmail: '', note: 'Use any wholesaler or supplier you already work with.', integrated: false },
  { key: 'doba', name: 'Doba', website: 'https://www.doba.com/', contactEmail: 'support@doba.com', note: 'Optional API auto-dispatch if you connect your Doba account.', integrated: true },
  { key: 'inventory-source', name: 'Inventory Source', website: 'https://www.inventorysource.com/', contactEmail: 'support@inventorysource.com', note: 'Optional API auto-dispatch with your Inventory Source account.', integrated: true },
  { key: 'spocket', name: 'Spocket', website: 'https://www.spocket.co/', contactEmail: 'support@spocket.co', note: 'Manual or portal fulfillment — connect your Spocket account.', integrated: false },
  { key: 'syncee', name: 'Syncee', website: 'https://syncee.com/', contactEmail: 'support@syncee.com', note: 'Manual or portal fulfillment.', integrated: false },
  { key: 'zendrop', name: 'Zendrop', website: 'https://www.zendrop.com/', contactEmail: 'support@zendrop.com', note: 'Manual or portal fulfillment.', integrated: false },
  { key: 'cjdropshipping', name: 'CJdropshipping', website: 'https://cjdropshipping.com/', contactEmail: 'support@cjdropshipping.com', note: 'Manual or portal fulfillment.', integrated: false },
  { key: 'aliexpress', name: 'AliExpress / overseas supplier', website: 'https://www.aliexpress.com/', contactEmail: '', note: 'You place orders manually with your supplier.', integrated: false },
  { key: 'wholesale', name: 'Local wholesale / trade show supplier', website: '', contactEmail: '', note: 'Any private supplier — you fulfill orders yourself.', integrated: false },
] as const

export function providerByKey (key: string) {
  return DROPSHIP_PROVIDER_CATALOG.find((p) => p.key === key) || null
}

const STORAGE_KEY = 'tfs-dropship-setup-v1'

export function loadDropshipSetupLocal () {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveDropshipSetupLocal (payload: Record<string, unknown>) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, savedAt: new Date().toISOString() }))
  } catch { /* ignore quota */ }
}
