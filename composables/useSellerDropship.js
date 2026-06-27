/** Seller-owned dropship setup — any provider, guided wizard state. */
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
]

export function providerByKey (key) {
  return DROPSHIP_PROVIDER_CATALOG.find((p) => p.key === key) || null
}

export function useSellerDropship () {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  const settings = ref(null)
  const secrets = ref(null)

  const setupComplete = computed(() => !!settings.value?.setup_complete)
  const preferredProvider = computed(() => providerByKey(settings.value?.preferred_provider_key || ''))

  async function load () {
    if (!user.value?.id) return
    loading.value = true
    error.value = ''
    try {
      const [sRes, secRes] = await Promise.all([
        supabase.from('seller_dropship_settings').select('*').eq('seller_id', user.value.id).maybeSingle(),
        supabase.from('seller_dropship_secrets').select('seller_id, doba_supplier_id, doba_warehouse_id, updated_at').eq('seller_id', user.value.id).maybeSingle(),
      ])
      if (sRes.error) throw sRes.error
      settings.value = sRes.data
      secrets.value = secRes.data || null
    } catch (e) {
      error.value = e?.message || 'Could not load dropship settings'
    } finally {
      loading.value = false
    }
  }

  async function saveSetup (payload) {
    if (!user.value?.id) return { ok: false, error: 'Sign in first' }
    saving.value = true
    error.value = ''
    const sellerId = user.value.id
    try {
      const settingsRow = {
        seller_id: sellerId,
        setup_complete: !!payload.setupComplete,
        setup_step: Number(payload.setupStep) || 0,
        preferred_provider_key: payload.preferredProviderKey || null,
        preferred_provider_name: payload.preferredProviderName || null,
        fulfillment_mode: payload.fulfillmentMode === 'integrated' ? 'integrated' : 'manual',
        provider_account_email: payload.providerAccountEmail?.trim() || null,
        provider_account_ref: payload.providerAccountRef?.trim() || null,
        supplier_portal_url: payload.supplierPortalUrl?.trim() || null,
        notes: payload.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { error: sErr } = await supabase
        .from('seller_dropship_settings')
        .upsert(settingsRow, { onConflict: 'seller_id' })
      if (sErr) throw sErr

      const hasSecrets = payload.flxpointApiKey || payload.inventorySourceApiKey
        || payload.dobaSupplierId || payload.dobaWarehouseId
      if (hasSecrets || secrets.value) {
        const secretRow = {
          seller_id: sellerId,
          updated_at: new Date().toISOString(),
        }
        if (payload.flxpointApiKey?.trim()) secretRow.flxpoint_api_key = payload.flxpointApiKey.trim()
        if (payload.inventorySourceApiKey?.trim()) secretRow.inventory_source_api_key = payload.inventorySourceApiKey.trim()
        if (payload.dobaSupplierId?.trim()) secretRow.doba_supplier_id = payload.dobaSupplierId.trim()
        if (payload.dobaWarehouseId?.trim()) secretRow.doba_warehouse_id = payload.dobaWarehouseId.trim()

        const { error: secErr } = await supabase
          .from('seller_dropship_secrets')
          .upsert(secretRow, { onConflict: 'seller_id' })
        if (secErr) throw secErr
      }

      await load()
      return { ok: true }
    } catch (e) {
      error.value = e?.message || 'Save failed'
      return { ok: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  return {
    loading,
    saving,
    error,
    settings,
    secrets,
    setupComplete,
    preferredProvider,
    providers: DROPSHIP_PROVIDER_CATALOG,
    load,
    saveSetup,
  }
}