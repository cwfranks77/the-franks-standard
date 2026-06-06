/**
 * GitHub Pages SPA fix for Nuxt client routes (e.g. /store/brandysportingoods).
 * - 404.html must match index.html so missing paths boot the app.
 * - Remove intermediate dirs with no index.html (they block 404.html fallback).
 */
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', '.output', 'public')
const INDEX = path.join(ROOT, 'index.html')
const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || '').trim().toLowerCase()
const bcPrimarySite = /(^https?:\/\/)?(www\.)?bcpoweraudio\.com\/?$/i.test(siteUrl)
  || siteUrl.includes('bcpoweraudio.com')
// Do not force http→https until GitHub Pages TLS is live (upgrade breaks owner unlock on http).
const BC_HTTPS_UPGRADE = ''
const BC_HOME_REDIRECT = bcPrimarySite
  ? `<script id="bc-storefront-home">(function(){var h=location.hostname.toLowerCase(),p=location.pathname+location.search+location.hash;if(h==='bcpoweraudio.com'){location.replace(location.protocol+'//www.bcpoweraudio.com'+p);return}if(p==='/'||p==='/index.html'||p==='')location.replace('/bc-audio'+location.search+location.hash)})();</script>`
  : ''
const SPA_REDIRECT = `<script id="gh-pages-spa-redirect">(function(){var p=location.pathname+location.search+location.hash;if(p!=='/'&&p!=='/index.html'){sessionStorage.setItem('ghSpaRedirect',p)}})();</script>`
const CHUNK_RECOVERY_INLINE = `<script id="fss-chunk-recovery-inline">(function(){var k='fss-chunk-reload-v1';function go(){if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');var u=new URL(location.href);u.searchParams.set('_cb',String(Date.now()));location.replace(u.toString())}var s=document.querySelector('script[type=module][src*="/_nuxt/"]');if(s){s.addEventListener('error',go,{once:true})}})();</script>`
const NUXT_STORAGE_FIX = `<script id="fss-nuxt-storage-fix">(function(){try{var c=window.__NUXT__&&window.__NUXT__.config;if(c&&c.public&&c.public.supabase){var a=c.public.supabase.clientOptions&&c.public.supabase.clientOptions.auth;if(a&&a.storage&&typeof a.storage.getItem!=='function')delete a.storage}if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})})}if(window.caches&&caches.keys){caches.keys().then(function(ks){ks.forEach(function(k){if(/workbox|fss-/i.test(k))caches.delete(k)})})}}catch(e){}})();</script>`

/** Dirs that must not exist without index.html — GH Pages stops at the folder and never serves 404.html. */
const SPA_BLOCKING_DIRS = ['store', 'ops/print']

function injectRedirect (html) {
  let out = html
  if (BC_HTTPS_UPGRADE && !out.includes('upgrade-insecure-requests')) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n${BC_HTTPS_UPGRADE}`)
  }
  if (BC_HOME_REDIRECT && !out.includes('bc-storefront-home')) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n${BC_HOME_REDIRECT}`)
  }
  if (!out.includes('gh-pages-spa-redirect')) {
    const idx = out.indexOf('<div id="__nuxt">')
    if (idx === -1) out = out.replace(/<\/head>/i, `${SPA_REDIRECT}\n</head>`)
    else out = out.slice(0, idx) + SPA_REDIRECT + out.slice(idx)
  }
  if (!out.includes('fss-chunk-recovery-inline')) {
    out = out.replace(/<\/head>/i, `${CHUNK_RECOVERY_INLINE}\n</head>`)
  }
  if (!out.includes('fss-nuxt-storage-fix') && out.includes('window.__NUXT__')) {
    out = out.replace(/(<script>window\.__NUXT__=[\s\S]*?<\/script>)/i, `$1\n${NUXT_STORAGE_FIX}`)
  }
  return out
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
