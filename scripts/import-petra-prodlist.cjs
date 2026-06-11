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

const BC_AUDIO_ITEMS = [
  {
    id: 'taramps-smart3',
    sku: 'TARAMPS-SMART3',
    name: 'Taramps SMART 3 Bass Monoblock Amplifier - 3000W RMS',
    price: 289.99,
    category: 'Amplifiers',
    brand: 'Taramps',
    description: 'Multi-impedance technology delivering 3000 Watts True RMS power across 1 to 2 Ohms. Premium competition power output.',
    image: '',
    available: 99,
    inStock: true,
  },
  {
    id: 'sundown-sa12',
    sku: 'SUNDOWN-SA12',
    name: 'Sundown Audio SA-12 V.2 1000W RMS Competition Subwoofer',
    price: 349.99,
    category: 'Subwoofers',
    brand: 'Sundown Audio',
    description: 'Legendary competition grade 12-inch subwoofer. Dual 4-Ohm, 1000 Watts RMS with massive excursion clearance.',
    image: '',
    available: 99,
    inStock: true,
  },
  {
    id: 'rockford-p3',
    sku: 'ROCKFORD-P3',
    name: 'Rockford Fosgate Punch P3 Dual 12" Loaded Enclosure',
    price: 499.99,
    category: 'Subwoofers',
    brand: 'Rockford Fosgate',
    description: 'Classic Punch hard-hitting bass. Dual 12-inch loaded vented enclosure wired to a clean 1-Ohm load.',
    image: '',
    available: 99,
    inStock: true,
  },
  {
    id: 'home-soundbar',
    sku: 'BC-HOME-SOUNDBAR',
    name: 'Premium 5.1 Home Theater Wireless Surround Soundbar System',
    price: 399.99,
    category: 'Home Audio',
    brand: 'B&C Performance Audio',
    description: 'High-fidelity home audio wireless soundbar with dedicated 10-inch subwoofer and rear satellite speakers.',
    image: '',
    available: 99,
    inStock: true,
  },
]

function parseArgs () {
  const csvFlag = process.argv.indexOf('--csv')
  const csvPath = csvFlag >= 0 ? process.argv[csvFlag + 1] : DEFAULT_CSV
  return { csvPath: path.resolve(csvPath) }
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

    seen.add(id)
    products.push({
      id,
      sku: petraSku,
      vendorSku: String(cols[headers['VENDOR SKU']] || '').trim(),
      name: shortDesc,
      price,
      category: pickCategory(cols, headers),
      brand: String(cols[headers['BRAND NAME']] || '').trim(),
      description: description.slice(0, 500),
      image,
      available,
      inStock: available > 0,
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
  const products = [...BC_AUDIO_ITEMS, ...petraProducts]

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const payload = {
    generatedAt: new Date().toISOString(),
    source: path.basename(csvPath),
    imageHost: 'https://petraimages.com.s3.amazonaws.com',
    imagePolicy: 'external-only',
    count: products.length,
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
  fs.writeFileSync(
    path.join(ROOT, 'content', 'products.json'),
    `${JSON.stringify(catalogIndex, null, 2)}\n`,
    'utf8',
  )
  fs.writeFileSync(
    path.join(ROOT, 'src', 'content', 'products.json'),
    `${JSON.stringify(catalogIndex, null, 2)}\n`,
    'utf8',
  )

  const inStock = products.filter((p) => p.inStock).length
  console.log(`import-petra-prodlist: wrote ${products.length} products (${inStock} in stock)`)
  console.log(`  catalog file: ${OUT_FILE}`)
  console.log('  images: served from Petra CDN (not stored on site)')
}

main()
