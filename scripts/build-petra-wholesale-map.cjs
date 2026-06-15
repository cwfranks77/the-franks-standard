/**
 * Strip wholesale fields from public catalog; write server-only SKU → wholesale map.
 * Run after import-petra-prodlist.cjs or anytime petra-products.json has wholesalePrice.
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const CATALOG = path.join(ROOT, 'public', 'catalog', 'petra-products.json')
const DATA_OUT = path.join(ROOT, 'data', 'petra-wholesale-by-sku.json')
const EDGE_OUT = path.join(ROOT, 'supabase', 'functions', '_shared', 'petraWholesaleBySku.json')

function main () {
  if (!fs.existsSync(CATALOG)) {
    console.error('build-petra-wholesale-map: missing', CATALOG)
    process.exit(1)
  }

  const payload = JSON.parse(fs.readFileSync(CATALOG, 'utf8'))
  const products = Array.isArray(payload.products) ? payload.products : []
  const map = {}

  const publicProducts = products.map((p) => {
    const wholesale = Number(p.wholesalePrice ?? p.wholesaleCost ?? p.baseCost)
    const sku = String(p.sku || '').trim()
    const id = String(p.id || '').trim()
    if (Number.isFinite(wholesale) && wholesale > 0) {
      if (sku) {
        map[sku.toUpperCase()] = wholesale
        map[sku] = wholesale
      }
      if (id) {
        map[id.toLowerCase()] = wholesale
        map[id] = wholesale
      }
    }
    const {
      wholesalePrice,
      wholesaleCost,
      baseCost,
      cost,
      ...publicRow
    } = p
    return publicRow
  })

  fs.mkdirSync(path.dirname(DATA_OUT), { recursive: true })
  const mapJson = JSON.stringify(map)
  fs.writeFileSync(DATA_OUT, mapJson, 'utf8')
  fs.writeFileSync(EDGE_OUT, mapJson, 'utf8')
  fs.writeFileSync(
    CATALOG,
    JSON.stringify({ ...payload, products: publicProducts, wholesalePolicy: 'server-only' }),
    'utf8',
  )

  console.log(`build-petra-wholesale-map: ${Object.keys(map).length} lookup keys`)
  console.log(`  public catalog: ${CATALOG} (retail only)`)
  console.log(`  server map: ${DATA_OUT}`)
  console.log(`  edge map: ${EDGE_OUT}`)
}

main()
