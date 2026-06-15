/**
 * GitHub Pages SPA fallback for the standalone Franks Standard app.
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', '.output', 'public')
const INDEX = path.join(ROOT, 'index.html')
const SPA_REDIRECT = `<script id="gh-pages-spa-redirect">(function(){var p=location.pathname+location.search+location.hash;if(p!=='/'&&p!=='/index.html'){sessionStorage.setItem('ghSpaRedirect',p)}})();</script>`

if (!fs.existsSync(INDEX)) {
  console.error('patch-gh-pages-spa: run nuxt generate first (.output/public missing)')
  process.exit(1)
}

let indexHtml = fs.readFileSync(INDEX, 'utf8')
if (!indexHtml.includes('gh-pages-spa-redirect')) {
  const idx = indexHtml.indexOf('<div id="__nuxt">')
  if (idx === -1) indexHtml = indexHtml.replace(/<\/head>/i, `${SPA_REDIRECT}\n</head>`)
  else indexHtml = indexHtml.slice(0, idx) + SPA_REDIRECT + indexHtml.slice(idx)
}
fs.writeFileSync(INDEX, indexHtml, 'utf8')
fs.writeFileSync(path.join(ROOT, '404.html'), indexHtml, 'utf8')
console.log('patch-gh-pages-spa: wrote 404.html from index.html')
