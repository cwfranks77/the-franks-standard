const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const sources = [
  path.join(rootDir, 'bc-performance-audio', 'src', 'catalog', 'petra-products.json'),
  path.join(rootDir, 'public', 'catalog', 'petra-products.json'),
]
const targetDir = path.join(rootDir, 'public', 'catalog')
const target = path.join(targetDir, 'petra-products.json')

const source = sources.find((p) => fs.existsSync(p))
if (!source) {
  console.log('[restore-nuxt-bc-catalog] no B&C catalog source yet')
  process.exit(0)
}

fs.mkdirSync(targetDir, { recursive: true })
fs.copyFileSync(source, target)
console.log('[restore-nuxt-bc-catalog] synced petra-products.json to public/catalog/')
