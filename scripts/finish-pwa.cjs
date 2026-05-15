/** Post-build: ensure PWA files exist and HTML references the manifest (required for Chrome install). */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', '.output', 'public')
const MANIFEST = path.join(ROOT, 'manifest.webmanifest')
const MANIFEST_JSON = path.join(ROOT, 'manifest.json')

const HEAD_SNIPPET = [
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<link rel="manifest" href="/manifest.json">',
].join('\n')

function walkHtml (dir, fn) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory()) walkHtml(p, fn)
    else if (name.isFile() && name.name.endsWith('.html')) fn(p)
  }
}

if (!fs.existsSync(ROOT)) {
  console.error('finish-pwa: missing .output/public')
  process.exit(1)
}

if (!fs.existsSync(MANIFEST)) {
  console.error('finish-pwa: missing manifest.webmanifest')
  process.exit(1)
}

fs.copyFileSync(MANIFEST, MANIFEST_JSON)
console.log('finish-pwa: copied manifest.webmanifest to manifest.json')

let patched = 0
walkHtml(ROOT, (file) => {
  let html = fs.readFileSync(file, 'utf8')
  if (html.includes('rel="manifest"')) return
  const idx = html.indexOf('</head>')
  if (idx === -1) return
  html = html.slice(0, idx) + HEAD_SNIPPET + '\n' + html.slice(idx)
  fs.writeFileSync(file, html, 'utf8')
  patched++
})

console.log('finish-pwa: injected manifest link into ' + patched + ' HTML file(s)')