import { parseEbayProspectsFromHtml } from '~/utils/ebayProspectParse.js'
import { buildEbaySearchUrl } from '~/utils/ebaySearchUrls.js'

export function useEbayProspectSkim () {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const error = ref('')
  const blocked = ref(false)
  const prospects = ref([])
  const sourceUrl = ref('')

  function applyProspects (items, hint, url, wasBlocked) {
    prospects.value = items || []
    blocked.value = !!wasBlocked
    sourceUrl.value = url || ''
    error.value =
      prospects.value.length === 0
        ? hint ||
          'No sellers parsed. Open the eBay search in Chrome, save the page as HTML, and upload it here.'
        : ''
  }

  function skimFromHtml (html, limit = 120) {
    loading.value = true
    error.value = ''
    try {
      const items = parseEbayProspectsFromHtml(String(html || ''), limit)
      applyProspects(items, null, sourceUrl.value, false)
      return items
    } finally {
      loading.value = false
    }
  }

  async function skimFromServer ({ keywords, categoryId, limit = 60 } = {}) {
    loading.value = true
    error.value = ''
    prospects.value = []
    const url = buildEbaySearchUrl({ keywords, categoryId, itemsPerPage: limit })
    sourceUrl.value = url
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('ebay-prospect-skim', {
        body: { keywords, category_id: categoryId || null, limit },
      })
      if (fnErr) throw new Error(fnErr.message || 'Skim failed')
      if (data?.error) throw new Error(data.hint || data.error)
      applyProspects(data.prospects, data.hint, data.source_url || url, data.blocked)
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
    skimFromHtml,
    skimFromServer,
  }
}
