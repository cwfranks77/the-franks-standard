import { diagnoseEbaySavedHtml } from '~/utils/ebayHtmlDiagnostics.js'
import { parseEbayProspectsFromHtml } from '~/utils/ebayProspectParse.js'
import { buildEbaySearchUrl } from '~/utils/ebaySearchUrls.js'

export function useEbayProspectSkim () {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const error = ref('')
  const blocked = ref(false)
  const prospects = ref([])
  const sourceUrl = ref('')
  const method = ref('')
  const apiConfigured = ref(false)
  const itemsScanned = ref(0)
  const lastUpload = ref(null)

  function applyProspects (data, fallbackUrl) {
    prospects.value = data?.prospects || []
    blocked.value = !!data?.blocked
    sourceUrl.value = data?.source_url || fallbackUrl || ''
    method.value = data?.method || ''
    apiConfigured.value = !!data?.api_configured
    itemsScanned.value = Number(data?.items_scanned) || 0
    if (data?.diagnostics) {
      lastUpload.value = data.diagnostics
    }
    error.value =
      prospects.value.length === 0
        ? data?.hint ||
          (data?.api_configured
            ? 'No sellers found — try different keywords.'
            : data?.uploadHint ||
              'No sellers found in that file. Re-save eBay after listings load (see tips above).')
        : ''
  }

  function skimFromHtml (html, limit = 120, meta = {}) {
    loading.value = true
    error.value = ''
    try {
      const raw = String(html || '')
      const diag = diagnoseEbaySavedHtml(raw)
      const items = parseEbayProspectsFromHtml(raw, limit)
      applyProspects(
        {
          prospects: items,
          method: 'browser_html',
          api_configured: apiConfigured.value,
          blocked: false,
          hint: items.length ? '' : diag.hint || meta.uploadHint,
          uploadHint: diag.hint,
          diagnostics: { ...diag, fileName: meta.fileName || '' },
        },
        sourceUrl.value,
      )
      return { items, diag }
    } finally {
      loading.value = false
    }
  }

  async function skimFromServer ({ keywords, categoryId, limit = 80 } = {}) {
    loading.value = true
    error.value = ''
    prospects.value = []
    const url = buildEbaySearchUrl({ keywords, categoryId, itemsPerPage: 60 })
    sourceUrl.value = url
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('ebay-prospect-skim', {
        body: { keywords, category_id: categoryId || null, limit },
      })
      if (fnErr) throw new Error(fnErr.message || 'Skim failed')
      if (data?.error) throw new Error(data.hint || data.detail || data.error)
      applyProspects(data, url)
      return data
    } catch (e) {
      error.value = e.message || 'Could not skim eBay'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    blocked,
    prospects,
    sourceUrl,
    method,
    apiConfigured,
    itemsScanned,
    lastUpload,
    skimFromHtml,
    skimFromServer,
  }
}
