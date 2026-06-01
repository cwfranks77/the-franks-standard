/**
 * Verify internal NuxtLink/href paths resolve to prerendered routes or dynamic patterns.
 * Run: node scripts/check-site-routes.cjs
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const pagesDir = path.join(root, 'pages')

function walk (dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, acc)
    else if (/\.vue$/i.test(name)) acc.push(p)
  }
  return acc
}

function routeFromPage (rel) {
  let r = rel.replace(/\\/g, '/').replace(/^pages\//, '').replace(/\.vue$/, '')
  if (r === 'index' || r.endsWith('/index')) r = r.replace(/\/?index$/, '')
  if (!r) return '/'
  r = r.replace(/\[([^\]]+)\]/g, ':$1')
  return '/' + r
}

const staticRoutes = new Set()
for (const file of walk(pagesDir)) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  const route = routeFromPage(rel)
  if (!route.includes(':')) staticRoutes.add(route.replace(/\/$/, '') || '/')
}

const vueFiles = []
function walkAll (dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (name === 'node_modules' || name === '.nuxt' || name === '.output') continue
    if (fs.statSync(p).isDirectory()) walkAll(p)
    else if (/\.vue$/i.test(name)) vueFiles.push(p)
  }
}
walkAll(root)

const pathRe = /(?:to|:href)=["'`]([^"'`]+)["'`]|(?:to|:href)=["'{]\s*(?:path:\s*)?['"]([^'"]+)['"]|(?:to|href):\s*['"]([^'"]+)['"]/g
const found = new Map()

for (const file of vueFiles) {
  const text = fs.readFileSync(file, 'utf8')
  let m
  while ((m = pathRe.exec(text)) !== null) {
    const raw = (m[1] || m[2] || m[3] || '').trim()
    if (!raw || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw === '#') continue
    const base = raw.split('?')[0].split('#')[0]
    if (base.includes('${') || base.includes('{{') || base.includes('||')) continue
    if (!base.startsWith('/')) continue
    if (!found.has(base)) found.set(base, [])
    found.get(base).push(path.relative(root, file))
  }
}

const dynamicPatterns = [
  /^\/listing\/[^/]+$/,
  /^\/listing\/[^/]+\/edit$/,
  /^\/order\/[^/]+$/,
  /^\/order\/success$/,
  /^\/video\/r\/[^/]+$/,
  /^\/verify\/coa\/[^/]+$/,
  /^\/store\/[^/]+$/,
  /^\/r\/[^/]+$/,
  /^\/go\/[^/]+$/,
  /^\/learn\/[^/]+$/,
  /^\/collections\/[^/]+$/,
  /^\/dashboard$/,
  /\.html$/,
]

function ok (p) {
  const norm = p.replace(/\/$/, '') || '/'
  if (staticRoutes.has(norm)) return true
  return dynamicPatterns.some((re) => re.test(p))
}

const htmlNuxtLinks = []
for (const [p, files] of found) {
  if (/\.html$/i.test(p)) htmlNuxtLinks.push({ p, files })
}

const bad = []
for (const [p] of found) {
  if (p.startsWith('/ops') && !staticRoutes.has(p.replace(/\/$/, ''))) {
    // ops may need auth — still a valid page
  }
  if (!ok(p)) bad.push(p)
}

console.log('Static routes:', staticRoutes.size)
console.log('Internal paths found:', found.size)
if (htmlNuxtLinks.length) {
  console.error('NuxtLink/href to .html (use a Vue route or <a href> for static files):')
  for (const { p, files } of htmlNuxtLinks) {
    console.error(' ', p, '←', files.slice(0, 2).join(', '))
  }
  process.exit(1)
}
if (bad.length) {
  console.error('Possibly missing routes:')
  for (const p of bad.sort()) {
    console.error(' ', p, '←', found.get(p).slice(0, 2).join(', '))
  }
  process.exit(1)
}
console.log('All checked internal paths match a page route.')
