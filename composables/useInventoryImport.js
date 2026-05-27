import { LISTING_CATEGORIES } from '~/utils/marketplaceCategories'

const DEFAULT_CATEGORY = 'Sports Cards & Memorabilia'

function normalizeHeader (h) {
  return String(h || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function parseCsvLine (line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (c === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}

function mapCsvRow (headers, cells) {
  const row = {}
  headers.forEach((h, i) => {
    row[h] = (cells[i] || '').trim()
  })
  const title =
    row.title ||
    row['item title'] ||
    row['* title'] ||
    row['product name'] ||
    ''
  const priceRaw =
    row.price ||
    row['start price'] ||
    row['buy it now price'] ||
    row['current price'] ||
    ''
  const price = Number.parseFloat(String(priceRaw).replace(/[^0-9.]/g, ''))
  const image =
    row.picurl ||
    row['pic url'] ||
    row['image url'] ||
    row['gallery url'] ||
    row['item photo url'] ||
    ''
  const sku = row.sku || row['custom label'] || row['item id'] || ''
  const desc = row.description || row['item description'] || ''
  const external_id = sku || title.slice(0, 80)
  if (!title) return null
  return {
    external_id: String(external_id),
    title,
    price: Number.isFinite(price) && price > 0 ? price : null,
    image_url: image.startsWith('http') ? image : null,
    description: desc,
    item_url: null,
  }
}

export function parseInventoryCsv (text) {
  const lines = String(text || '').split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return []
  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  const items = []
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i])
    const mapped = mapCsvRow(headers, cells)
    if (mapped) items.push(mapped)
  }
  return items
}

export function useInventoryImport () {
  const supabase = useSupabaseClient()
  const previewLoading = ref(false)
  const importLoading = ref(false)
  const previewError = ref('')
  const previewItems = ref([])

  async function previewEbaySeller (sellerUsername, limit = 24) {
    previewLoading.value = true
    previewError.value = ''
    previewItems.value = []
    try {
      const { data, error } = await supabase.functions.invoke('ebay-seller-preview', {
        body: { seller_username: sellerUsername, limit },
      })
      if (error) throw new Error(error.message || 'Preview failed')
      if (data?.error) throw new Error(data.hint || data.error)
      previewItems.value = (data.items || []).map((it) => ({
        ...it,
        selected: true,
        description: '',
      }))
      if (!previewItems.value.length && data?.hint) {
        previewError.value = data.hint
      }
      return data
    } catch (e) {
      previewError.value = e.message || 'Could not load eBay listings'
      throw e
    } finally {
      previewLoading.value = false
    }
  }

  function setCsvPreview (items) {
    previewError.value = ''
    previewItems.value = items.map((it) => ({
      ...it,
      selected: true,
      description: it.description || '',
    }))
  }

  async function importSelected ({
    publish = false,
    coaType = 'guarantee',
    guaranteeSigned = true,
    sellerLegalName = '',
    defaultCategory = DEFAULT_CATEGORY,
    importSource = 'manual',
  }) {
    importLoading.value = true
    const results = { created: 0, skipped: 0, failed: 0, errors: [] }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sign in required')

      const selected = previewItems.value.filter((i) => i.selected)
      if (!selected.length) throw new Error('Select at least one item')

      for (const item of selected) {
        const price = item.price != null ? Number(item.price) : null
        if (!price || price <= 0) {
          results.failed++
          results.errors.push(`${item.title}: missing price`)
          continue
        }

        const imagePaths = []
        if (item.image_url && /^https?:\/\//i.test(item.image_url)) {
          imagePaths.push(item.image_url)
        }

        const payload = {
          seller_id: user.id,
          title: String(item.title).trim().slice(0, 200),
          description:
            (item.description || '').trim() ||
            `Imported listing. Review photos and add COA or signed guarantee before publishing.`,
          category: LISTING_CATEGORIES.includes(defaultCategory)
            ? defaultCategory
            : DEFAULT_CATEGORY,
          price,
          condition: 'good',
          coa_type: coaType,
          guarantee_signed: coaType === 'guarantee' ? !!guaranteeSigned : false,
          seller_legal_name: coaType === 'guarantee' ? (sellerLegalName || null) : null,
          coa_storage_path: null,
          image_paths: imagePaths,
          status: publish ? 'published' : 'draft',
          sale_type: 'fixed',
          import_source: importSource,
          external_listing_id: item.external_id ? String(item.external_id) : null,
        }

        let { error: insErr } = await supabase.from('listings').insert(payload)
        if (insErr && /import_source|external_listing_id/i.test(insErr.message || '')) {
          const fallback = { ...payload }
          delete fallback.import_source
          delete fallback.external_listing_id
          ;({ error: insErr } = await supabase.from('listings').insert(fallback))
        }
        if (insErr) {
          if (insErr.code === '23505') {
            results.skipped++
          } else {
            results.failed++
            results.errors.push(`${item.title}: ${insErr.message}`)
          }
        } else {
          results.created++
        }
      }
      return results
    } finally {
      importLoading.value = false
    }
  }

  return {
    previewLoading,
    importLoading,
    previewError,
    previewItems,
    previewEbaySeller,
    setCsvPreview,
    importSelected,
    parseInventoryCsv,
  }
}
