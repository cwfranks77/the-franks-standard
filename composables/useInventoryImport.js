import { LISTING_CATEGORIES } from '~/utils/marketplaceCategories'
import { parseEbaySellerHtmlWithDiagnostics } from '~/utils/ebayParse.js'

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
    row['name'] ||
    row['product title'] ||
    ''
  const priceRaw =
    row.price ||
    row['start price'] ||
    row['buy it now price'] ||
    row['current price'] ||
    row['retail price'] ||
    row['msrp'] ||
    row['map'] ||
    row['map price'] ||
    ''
  const price = Number.parseFloat(String(priceRaw).replace(/[^0-9.]/g, ''))
  const image =
    row.picurl ||
    row['pic url'] ||
    row['image url'] ||
    row['gallery url'] ||
    row['item photo url'] ||
    row['main image'] ||
    row['image'] ||
    row['image 1'] ||
    row['image url 1'] ||
    row['image1'] ||
    ''
  const sku =
    row.sku ||
    row['supplier sku'] ||
    row['vendor sku'] ||
    row['source sku'] ||
    row['product sku'] ||
    row['custom label'] ||
    row['item id'] ||
    row['product id'] ||
    ''
  const desc = row.description || row['item description'] || ''
  const supplierSku =
    row['supplier sku'] ||
    row['vendor sku'] ||
    row['source sku'] ||
    row['doba sku'] ||
    row['supplier_sku'] ||
    ''
  const wholesaleRaw =
    row['wholesale cost'] ||
    row['wholesale price'] ||
    row['wholesale'] ||
    row['cost'] ||
    row['your cost'] ||
    row['supplier cost'] ||
    ''
  const wholesale_cost = Number.parseFloat(String(wholesaleRaw).replace(/[^0-9.]/g, ''))
  const external_id = supplierSku || sku || title.slice(0, 80)
  if (!title) return null
  return {
    external_id: String(external_id),
    title,
    price: Number.isFinite(price) && price > 0 ? price : null,
    image_url: image.startsWith('http') ? image : null,
    description: desc,
    item_url: null,
    supplier_sku: String(supplierSku || sku || '').trim() || null,
    wholesale_cost: Number.isFinite(wholesale_cost) && wholesale_cost > 0 ? wholesale_cost : null,
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

  function applyEbayPreviewItems (items, hint) {
    previewItems.value = (items || []).map((it) => ({
      ...it,
      selected: true,
      description: '',
    }))
    if (!previewItems.value.length) {
      previewError.value =
        hint ||
        'No listings found. Save your eBay store page as HTML and upload it here, or use CSV export.'
    } else {
      previewError.value = ''
    }
  }

  /** Parse a saved eBay store/search page in the browser (works when eBay blocks servers). */
  function previewEbayFromHtml (html, limit = 60) {
    previewLoading.value = true
    previewError.value = ''
    try {
      const { items, hint } = parseEbaySellerHtmlWithDiagnostics(String(html || ''), limit)
      applyEbayPreviewItems(items, hint)
      return { count: items.length, items, source: 'html', hint }
    } finally {
      previewLoading.value = false
    }
  }

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
      applyEbayPreviewItems(data.items, data.hint)
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
    listingMode = 'direct',
    dropshipProviderKey = '',
    dropshipProviderName = '',
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

        const isDropship = listingMode === 'dropship'
        if (isDropship) {
          const supplierSku = String(item.supplier_sku || '').trim()
          if (!supplierSku) {
            results.failed++
            results.errors.push(`${item.title}: missing supplier SKU (required for Doba dropship)`)
            continue
          }
        }

        const imagePaths = []
        if (item.image_url && /^https?:\/\//i.test(item.image_url)) {
          imagePaths.push(item.image_url)
        }

        const normalizedProviderKey = String(dropshipProviderKey || '').trim()
        const normalizedProviderName = String(dropshipProviderName || '').trim()
        const title = String(item.title).trim().slice(0, 200)
        const description =
            (item.description || '').trim() ||
            `Imported listing. Review photos and add COA or signed guarantee before publishing.`
        const { scanOffPlatformContent } = await import('~/utils/offPlatformGuard.js')
        const guard = scanOffPlatformContent(`${title}\n${description}`)
        if (!guard.ok) {
          results.failed++
          results.errors.push(`${item.title}: off-platform content blocked — remove emails, phones, or outside payment links`)
          continue
        }

        const payload = {
          seller_id: user.id,
          title,
          description,
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
          listing_mode: isDropship ? 'dropship' : 'direct',
          dropship_provider_key: isDropship ? (normalizedProviderKey || null) : null,
          dropship_provider_name: isDropship ? (normalizedProviderName || null) : null,
          dropship_sales_channel_key: isDropship ? 'the-franks-standard' : null,
          dropship_supplier_sku: isDropship ? (String(item.supplier_sku || '').trim() || null) : null,
          dropship_wholesale_cost: isDropship ? (item.wholesale_cost != null ? Number(item.wholesale_cost) : null) : null,
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
    previewEbayFromHtml,
    setCsvPreview,
    importSelected,
    parseInventoryCsv,
  }
}
