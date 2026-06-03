const fs = require('node:fs')
const path = require('node:path')

const file = path.join(__dirname, '..', 'layouts', 'default.vue')
let t = fs.readFileSync(file, 'utf8')

t = t.replace('<div class="site-wrapper">', '<div class="site-wrapper marketplace-dark">')

const start = t.indexOf('<header class="site-header">')
const end = t.indexOf('<div class="site-trust"')

if (start >= 0 && end > start) {
  const repl = '    <EbayMarketHeader :on-home="onHome" :is-owner="isOwner" @brand-click="onBrandOrLogoClick" />\n\n    '
  t = t.slice(0, start) + repl + t.slice(end)
  console.log('Replaced site-header with EbayMarketHeader')
} else if (t.includes('EbayMarketHeader')) {
  console.log('EbayMarketHeader already present')
} else {
  console.log('Could not find site-header block')
  process.exit(1)
}

fs.writeFileSync(file, t)
