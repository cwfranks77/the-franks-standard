/**
 * GitHub Pages SPA fix for Nuxt client routes (e.g. /store/brandysportingoods).
 * - 404.html must match index.html so missing paths boot the app.
 * - Remove intermediate dirs with no index.html (they block 404.html fallback).
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', '.output', 'public')
const INDEX = path.join(ROOT, 'index.html')
const SPA_REDIRECT = `<script id="gh-pages-spa-redirect">(function(){var p=location.pathname+location.search+location.hash;if(p!=='/'&&p!=='/index.html'){sessionStorage.setItem('ghSpaRedirect',p)}})();</script>`

/** Dirs that must not exist without index.html — GH Pages stops at the folder and never serves 404.html. */
const SPA_BLOCKING_DIRS = ['store', 'ops/print']

function injectRedirect (html) {
  if (html.includes('gh-pages-spa-redirect')) return html
  const idx = html.indexOf('<div id="__nuxt">')
  if (idx === -1) return html.replace(/<\/head>/i, `${SPA_REDIRECT}\n</head>`)
  return html.slice(0, idx) + SPA_REDIRECT + html.slice(idx)
}

function fixSpaBlockingDir (relativeDir) {
  const dir = path.join(ROOT, relativeDir)
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir)
  const hasIndex = entries.some((n) => n === 'index.html')
  if (hasIndex) return
  console.log(`patch-gh-pages-spa: removing ${relativeDir}/ (no index.html — blocks SPA fallback)`)
  fs.rmSync(dir, { recursive: true, force: true })
}

if (!fs.existsSync(INDEX)) {
  console.error('patch-gh-pages-spa: run nuxt generate first (.output/public missing)')
  process.exit(1)
}

let indexHtml = fs.readFileSync(INDEX, 'utf8')
indexHtml = injectRedirect(indexHtml)
fs.writeFileSync(INDEX, indexHtml, 'utf8')

const html404 = path.join(ROOT, '404.html')
fs.writeFileSync(html404, indexHtml, 'utf8')
console.log('patch-gh-pages-spa: wrote 404.html from index.html')

for (const relativeDir of SPA_BLOCKING_DIRS) {
  fixSpaBlockingDir(relativeDir)
}
console.log('patch-gh-pages-spa: done')
