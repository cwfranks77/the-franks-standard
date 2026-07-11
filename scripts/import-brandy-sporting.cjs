#!/usr/bin/env node
/**
 * Build public/catalog/brandy-sporting-products.json from Petra catalog rows.
 * Run after import-petra-prodlist.cjs (reads petra-products.json).
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const PETRA_FILE = path.join(ROOT, 'public', 'catalog', 'petra-products.json')
const OUT_FILE = path.join(ROOT, 'public', 'catalog', 'brandy-sporting-products.json')

// CJS bridge — brandySportingCatalog.js is ESM export; inline filter for script stability.
const BRANDY_SPORTING_CATEGORIES = new Set([
  'Outdoor Recreation',
  'Fitness Technology & Equipment',
  'Drinkware',
])
const SPORTING_NAME_RE =
  /\b(cooler|tent|sleeping bag|hiking|camping|fishing|kayak|canoe|paddle|bike|bicycle|athletic|sport|golf|hunting|archery|exercise|fitness|dumbbell|yoga|backpack|hydration|water bottle|tumbler|binocular|scope|horn|air horn|lantern|flashlight|headlamp|grill|tailgate|weights|treadmill|tracker|smartwatch|watch)\b/i
const NON_SPORTING_RE =
  /\b(laptop|printer|router|drill|wrench|refrigerator|microwave|vacuum|lawn mower|car alarm|remote start|hdmi|keyboard|barcode|scanner)\b/i

function normalizeCat (category) {
  return String(category || '').replace(/^"+|"+$/g, '').trim()
}

function isBrandySportingProduct (product) {
  if (!product) return false
  const cat = normalizeCat(product.category)
  const text = `${product?.name || ''} ${product?.description || ''}`.trim()
  if (NON_SPORTING_RE.test(text)) return false
  if (BRANDY_SPORTING_CATEGORIES.has(cat)) {
    if (cat === 'Drinkware') return /\b(bottle|tumbler|cooler|hydration|mug|flask|jug)\b/i.test(text)
    if (cat === 'Fitness Technology & Equipment') {
      return /\b(fitness|tracker|watch|exercise|bike|treadmill|weight|yoga|sport)\b/i.test(text)
    }
    return SPORTING_NAME_RE.test(text) || cat === 'Outdoor Recreation'
  }
  return SPORTING_NAME_RE.test(text)
}

function main () {
  if (!fs.existsSync(PETRA_FILE)) {
    console.error('import-brandy-sporting: run catalog:import-petra first — petra-products.json missing')
    process.exit(1)
  }

  const petra = JSON.parse(fs.readFileSync(PETRA_FILE, 'utf8'))
  const source = Array.isArray(petra.products) ? petra.products : []
  const products = source
    .filter(isBrandySportingProduct)
    .map((row) => ({
      id: `brandy-${row.id || row.sku}`,
      sku: row.sku,
      storeId: 'brandy-sporting',
      name: row.name,
      brand: row.brand || 'Sporting',
      category: normalizeCat(row.category),
      description: row.description,
      retailPrice: row.retailPrice ?? row.price,
      price: row.retailPrice ?? row.price,
      image: row.image,
      inStock: row.inStock !== false,
      badge: row.inStock === false ? 'Out of stock' : '',
    }))

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'petra-products.json',
    storeId: 'brandy-sporting',
    storeName: "Brandy's Sporting Goods",
    count: products.length,
    inStockCount: products.filter((p) => p.inStock).length,
    products,
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload), 'utf8')
  console.log(`import-brandy-sporting: wrote ${products.length} products (${payload.inStockCount} in stock)`)
  console.log(`  catalog file: ${OUT_FILE}`)
}

main()
