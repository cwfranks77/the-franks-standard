const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const source = path.join(rootDir, 'public', 'catalog', 'petra-products.json')
const targetDir = path.join(rootDir, 'bc-performance-audio', 'src', 'catalog')
const target = path.join(targetDir, 'petra-products.json')

if (!fs.existsSync(source)) {
  console.log('[move-petra-catalog-to-bc] already moved or missing')
  process.exit(0)
}

fs.mkdirSync(targetDir, { recursive: true })
fs.renameSync(source, target)
console.log('[move-petra-catalog-to-bc] public/catalog/petra-products.json -> bc-performance-audio/src/catalog/')
