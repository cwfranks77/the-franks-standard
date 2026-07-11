/**
 * Build public/catalog/petra-products.json from Petra prodlist.csv.
 * Product photos stay on Petra's CDN — nothing is copied into public/images.
 *
 * Usage:
 *   node scripts/import-petra-prodlist.cjs
 *   node scripts/import-petra-prodlist.cjs --csv C:\Users\ninja\Downloads\prodlist.csv
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const DEFAULT_CSV = path.join(process.env.USERPROFILE || '', 'Downloads', 'prodlist.csv')
const OUT_DIR = path.join(ROOT, 'public', 'catalog')
const OUT_FILE = path.join(OUT_DIR, 'petra-products.json')

/** Category markup — must stay aligned with pages/index.vue retail engine. */
function resolveCategoryMarkup (category, name) {
  const cat = String(category || '').toLowerCase()
  const label = String(name || '').toLowerCase()
  if (cat.includes('marine') || label.includes('marine')) return 2.10
  if (cat.includes('car') || label.includes('car audio') || label.includes('subwoofer') || label.includes('amplifier')) return 1.55
  if (cat.includes('home') || label.includes('receiver') || label.includes('soundbar') || label.includes('theater')) return 1.70
  if (cat.includes('accessory') || label.includes('cable') || label.includes('mount') || label.includes('adapter')) return 2.50
  if (cat.includes('electronics') || cat.includes('computer') || cat.includes('workstation')) return 1.35
  return 1.55
}

function buildBcCatalogItem (item) {
  const wholesale = Number(item.wholesalePrice)
  const markup = resolveCategoryMarkup(item.category, item.name)
  const retailPrice = Number((wholesale * markup).toFixed(2))
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    retailPrice,
    price: retailPrice,
    category: item.category,
    brand: item.brand,
    description: item.description,
    image: item.image,
    available: item.available ?? 99,
    inStock: item.inStock ?? true,
    _wholesale: wholesale,
  }
}

const BC_AUDIO_ITEMS = [
  buildBcCatalogItem({
    id: 'taramps-smart3',
    sku: 'TARAMPS-SMART3',
    name: 'Taramps SMART 3 Bass Monoblock Amplifier - 3000W RMS',
    wholesalePrice: 289.99,
    category: 'Amplifiers',
    brand: 'Taramps',
    description: 'Multi-impedance technology delivering 3000 Watts True RMS power across 1 to 2 Ohms. Premium competition power output.',
    image: '/img/bc-catalog/amplifier.svg',
  }),
  buildBcCatalogItem({
    id: 'sundown-sa12',
    sku: 'SUNDOWN-SA12',
    name: 'Sundown Audio SA-12 V.2 1000W RMS Competition Subwoofer',
    wholesalePrice: 349.99,
    category: 'Subwoofers',
    brand: 'Sundown Audio',
    description: 'Legendary competition grade 12-inch subwoofer. Dual 4-Ohm, 1000 Watts RMS with massive excursion clearance.',
    image: '/img/bc-catalog/subwoofer.svg',
  }),
  buildBcCatalogItem({
    id: 'rockford-p3',
    sku: 'ROCKFORD-P3',
    name: 'Rockford Fosgate Punch P3 Dual 12" Loaded Enclosure',
    wholesalePrice: 499.99,
    category: 'Subwoofers',
    brand: 'Rockford Fosgate',
    description: 'Classic Punch hard-hitting bass. Dual 12-inch loaded vented enclosure wired to a clean 1-Ohm load.',
    image: '/img/bc-catalog/enclosure.svg',
  }),
  buildBcCatalogItem({
    id: 'home-soundbar',
    sku: 'BC-HOME-SOUNDBAR',
    name: 'Premium 5.1 Home Theater Wireless Surround Soundbar System',
    wholesalePrice: 399.99,
    category: 'Home Audio',
    brand: 'B&C Performance Audio',
    description: 'High-fidelity home audio wireless soundbar with dedicated 10-inch subwoofer and rear satellite speakers.',
    image: '/img/bc-catalog/soundbar.svg',
  }),
]

function parseArgs () {
  const csvFlag = process.argv.indexOf('--csv')
  const csvPath = csvFlag >= 0 ? process.argv[csvFlag + 1] : DEFAULT_CSV
  const repoCsv = path.join(ROOT, 'prodlist.csv')
  const resolved = path.resolve(csvPath)
  const usePath = fs.existsSync(resolved) ? resolved : (fs.existsSync(repoCsv) ? repoCsv : resolved)
  return { csvPath: usePath }
}

/** Parse one CSV line respecting double-quoted fields. */
function parseCsvLine (line) {
  const fields = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      fields.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  fields.push(cur)
  return fields
}

function slugId (petraSku) {
  const base = String(petraSku || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base ? `petra-${base}` : ''
}

function externalImageUrl (raw) {
  const url = String(raw || '').trim()
  if (!url.startsWith('http')) return ''
  return url.replace(/^http:\/\//i, 'https://')
}

function pickCategory (row, headers) {
  const sub = String(row[headers.SUBCATEGORY] || '').trim()
  const cls = String(row[headers['PRODUCT CLASS']] || '').trim()
  return sub || cls || 'General'
}

function stripHtml (text) {
  return String(text || '')
    .replace(/&bull;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function loadPetraRows (csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8')
  const lines = raw.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 4) {
    throw new Error('prodlist.csv looks empty or truncated')
  }

  const headerFields = parseCsvLine(lines[2]).map((h) => h.trim())
  const headers = {}
  headerFields.forEach((name, idx) => {
    headers[name] = idx
  })

  const products = []
  const seen = new Set()

  for (let i = 3; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    const petraSku = String(cols[headers['PETRA SKU']] || '').trim()
    const id = slugId(petraSku)
    if (!id || seen.has(id)) continue

    const price = Number.parseFloat(String(cols[headers.PRICE] || '').replace(/[^0-9.]/g, ''))
    const image = externalImageUrl(cols[headers['IMAGE URL']])
    if (!image || !Number.isFinite(price) || price <= 0) continue

    const available = Number.parseInt(String(cols[headers.AVAILABLE] || '0'), 10) || 0
    const shortDesc = String(cols[headers.DESCRIPTION] || '').trim()
    const longDesc = stripHtml(cols[headers['LONG DESC']])
    const description = longDesc || shortDesc
    if (!description) continue

    const product = {
      PRICE: price,
      NAME: shortDesc,
      CATEGORY: pickCategory(cols, headers),
    }

    const wholesale = Number(product.PRICE) || 0
    const markup = resolveCategoryMarkup(product.CATEGORY, product.NAME)
    product.retailPrice = Number((wholesale * markup).toFixed(2))

    seen.add(id)
    products.push({
      id,
      sku: petraSku,
      vendorSku: String(cols[headers['VENDOR SKU']] || '').trim(),
      name: shortDesc,
      retailPrice: product.retailPrice,
      price: product.retailPrice,
      category: product.CATEGORY,
      brand: String(cols[headers['BRAND NAME']] || '').trim(),
      description: description.slice(0, 500),
      image,
      available,
      inStock: available > 0,
      _wholesale: wholesale,
    })
  }

  return products
}

function main () {
  const { csvPath } = parseArgs()
  if (!fs.existsSync(csvPath)) {
    if (fs.existsSync(OUT_FILE)) {
      console.log(`import-petra-prodlist: CSV not found — keeping existing ${OUT_FILE}`)
      return
    }
    console.error(`import-petra-prodlist: CSV not found at ${csvPath}`)
    process.exit(1)
  }

  const petraProducts = loadPetraRows(csvPath)
  const built = [...BC_AUDIO_ITEMS, ...petraProducts]
  const wholesaleMap = {}
  const products = built.map((row) => {
    const w = Number(row._wholesale)
    const sku = String(row.sku || '').trim()
    const id = String(row.id || '').trim()
    if (Number.isFinite(w) && w > 0) {
      if (sku) {
        wholesaleMap[sku.toUpperCase()] = w
        wholesaleMap[sku] = w
      }
      if (id) {
        wholesaleMap[id.toLowerCase()] = w
        wholesaleMap[id] = w
      }
    }
    const { _wholesale, ...publicRow } = row
    return publicRow
  })

  const mapJson = JSON.stringify(wholesaleMap)
  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true })
  fs.writeFileSync(path.join(ROOT, 'data', 'petra-wholesale-by-sku.json'), mapJson, 'utf8')
  const sharedDir = path.join(ROOT, 'supabase', 'functions', '_shared')
  fs.mkdirSync(sharedDir, { recursive: true })
  fs.writeFileSync(
    path.join(sharedDir, 'petraWholesaleBySku.json'),
    mapJson,
    'utf8',
  )

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const payload = {
    generatedAt: new Date().toISOString(),
    source: path.basename(csvPath),
    imageHost: 'https://petraimages.com.s3.amazonaws.com',
    imagePolicy: 'external-only',
    count: products.length,
    wholesalePolicy: 'server-only',
    products,
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(payload), 'utf8')

  const catalogIndex = {
    catalogUrl: '/catalog/petra-products.json',
    imagePolicy: 'external-only',
    imageHost: payload.imageHost,
    count: products.length,
    inStockCount: products.filter((p) => p.inStock).length,
    updatedAt: payload.generatedAt,
  }
  const contentDir = path.join(ROOT, 'content')
  const srcContentDir = path.join(ROOT, 'src', 'content')
  fs.mkdirSync(contentDir, { recursive: true })
  fs.mkdirSync(srcContentDir, { recursive: true })
  fs.writeFileSync(
    path.join(contentDir, 'products.json'),
    `${JSON.stringify(catalogIndex, null, 2)}\n`,
    'utf8',
  )
  fs.writeFileSync(
    path.join(srcContentDir, 'products.json'),
    `${JSON.stringify(catalogIndex, null, 2)}\n`,
    'utf8',
  )

  const inStock = products.filter((p) => p.inStock).length
  console.log(`import-petra-prodlist: wrote ${products.length} products (${inStock} in stock)`)
  console.log(`  catalog file: ${OUT_FILE}`)
  console.log('  images: served from Petra CDN (not stored on site)')
}

main()
