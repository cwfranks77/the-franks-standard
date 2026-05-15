// Post-build: patch every static HTML file so crawlers, link previews, and no-JS
// clients see real content (the SPA-only build otherwise ships an empty #__nuxt).
//
// What this script injects per page:
//   1. A page-specific visible fallback (the Nuxt app replaces it once JS loads).
//   2. A per-page <link rel="canonical"> pointing to the public URL of THIS file.
//   3. Contact info (phone + email) on every page so search snippets and link
//      previews always show how to reach you.
//   4. <meta name="robots" content="noindex,nofollow"> ONLY when this build is
//      destined for GitHub Pages — so only the Vercel canonical
//      (thefranksstandard.com) gets indexed, not the github.io mirror.
const fs = require('node:fs')
const path = require('node:path')

const SITE_URL = (process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com').replace(/\/$/, '')
const PHONE_DISPLAY = process.env.NUXT_PUBLIC_CUSTOMER_SERVICE_PHONE || '(877) 837-0527'
const PHONE_TEL = '+1' + PHONE_DISPLAY.replace(/\D+/g, '').replace(/^1/, '')
const SUPPORT_EMAIL = 'info@thefranksstandard.com'

// Auto-noindex: set noindex when this build is NOT serving the canonical
// host. Vercel always sets VERCEL_URL to the actual deploy host (like
// thefranksstandard-site-abc.vercel.app). If that doesn't match our
// SITE_URL host, this build is a duplicate mirror — tell crawlers to ignore.
// GitHub Pages builds (the real canonical) do not set VERCEL_URL, so they
// stay indexable. NUXT_NOINDEX=1 is an explicit manual override.
const IS_NOINDEX_BUILD = String(process.env.VERCEL || '').trim() === '1' ||
  String(process.env.NUXT_NOINDEX || '').trim() === '1'

const ROOT = path.join(__dirname, '..', '.output', 'public')
const NUXT_EMPTY = '<div id="__nuxt"></div>'

// Marker so we never inject twice on the same file.
const START = '<!--fss:spa-fallback-start-->'
const END = '<!--fss:spa-fallback-end-->'

const SHARED_FOOTER = `
<footer class="fss-static-footer">
  <p class="fss-static-contact">
    <strong>Contact:</strong>
    <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a> &middot;
    <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
  </p>
  <p class="fss-static-tag">The Franks Standard &mdash; Authenticity-Guaranteed Marketplace &middot; ${SITE_URL.replace(/^https?:\/\//, '')}</p>
</footer>`

const SHARED_STYLE = `<style id="fss-static-boot-style">
#fss-static-boot,.fss-static-aur,.fss-static-footer{box-sizing:border-box}
#fss-static-boot{min-height:60vh;position:relative;overflow:hidden;padding:clamp(1rem,4vw,2.5rem);color:#e8e4f0;font-family:Inter,system-ui,sans-serif}
.fss-static-aur{position:absolute;inset:0;pointer-events:none;opacity:.7;background:radial-gradient(ellipse 80% 50% at 0% 0%,rgba(255,45,122,.28) 0%,transparent 50%),radial-gradient(ellipse 60% 40% at 100% 10%,rgba(0,224,255,.14) 0%,transparent 45%),linear-gradient(180deg,#0a0518 0%,#120a22 100%)}
.fss-static-inner{max-width:1200px;margin:0 auto;position:relative;z-index:1;display:grid;gap:1.5rem;align-items:center;padding-top:1rem;grid-template-columns:1fr}
@media(min-width:900px){.fss-static-inner{grid-template-columns:1.1fr 0.9fr;padding-top:2rem}.fss-static-h1{font-size:clamp(1.5rem,3vw,2.6rem)}}
.fss-static-ribbon{text-transform:uppercase;letter-spacing:.12em;font-size:.7rem;color:#00f5a0;font-weight:700;margin:0}
.fss-static-h1{font-family:Cinzel,Georgia,serif;font-size:clamp(1.4rem,4vw,2.1rem);line-height:1.2;margin:.75rem 0 .5rem}
.fss-s2{background:linear-gradient(90deg,#ffd84d 0%,#fff3a6 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.fss-static-sub{color:#a39ab8;font-size:.95rem;max-width:32rem;margin:0 0 1rem}
.fss-static-media{text-align:center}
.fss-static-media img{max-width:min(200px,42vw);height:auto;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.fss-static-contact-block{margin:1rem 0;padding:1rem 1.25rem;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.fss-static-contact-block a{color:#ffd84d;font-weight:600;text-decoration:none}
.fss-static-contact-block a:hover{text-decoration:underline}
.fss-static-phone{font-family:Cinzel,Georgia,serif;font-size:1.4rem;color:#00f5a0;display:inline-block;margin-right:.75rem}
.fss-static-footer{margin-top:2rem;padding:1rem;border-top:1px solid rgba(255,255,255,.08);text-align:center;font-size:.85rem;color:#a39ab8;position:relative;z-index:1}
.fss-static-footer a{color:#ffd84d;text-decoration:none}
.fss-static-footer a:hover{text-decoration:underline}
.fss-static-tag{margin:.5rem 0 0;font-size:.75rem;opacity:.7}
</style>`

// Build the visible body block for a given route.
function fallbackForRoute (route) {
  const heroOpen = `<div id="fss-static-boot" class="fss-static-boot">
  <div class="fss-static-aur" aria-hidden="true"></div>
  <div class="fss-static-inner">
    <div class="fss-static-copy">`
  const heroClose = `    </div>
    <div class="fss-static-media">
      <img src="/franks-pavilion.png" alt="The Franks Standard" width="200" height="200" />
    </div>
  </div>
  ${SHARED_FOOTER}
</div>`

  const contactBlock = `
      <div class="fss-static-contact-block">
        <p style="margin:0 0 .25rem">
          <span class="fss-static-phone"><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></span>
        </p>
        <p style="margin:0">Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> &middot; AI customer service for orders, returns, billing, and general questions.</p>
      </div>`

  // Page-specific body content (visible in HTML source -> indexed by Google).
  let body
  switch (route) {
    case '/contact':
      body = `
      <p class="fss-static-ribbon">Contact</p>
      <h1 class="fss-static-h1"><span class="fss-s1">Reach</span> <span class="fss-s2">The Franks Standard</span></h1>
      <p class="fss-static-sub">Questions from buyers, sellers, press, and partnerships:</p>
      ${contactBlock}
      <p class="fss-static-sub">For step-by-step help and tech issues, see <a href="/support" style="color:#ffd84d">Support &amp; tech</a>. The full app loads next (JavaScript required).</p>`
      break
    case '/support':
      body = `
      <p class="fss-static-ribbon">Support &amp; tech</p>
      <h1 class="fss-static-h1"><span class="fss-s1">We are here</span> <span class="fss-s2">to help.</span></h1>
      <p class="fss-static-sub">Call our AI-powered customer service for orders, returns, billing, and general questions. Complex issues are escalated to a human agent.</p>
      ${contactBlock}`
      break
    case '/download':
      body = `
      <p class="fss-static-ribbon">Install the app</p>
      <h1 class="fss-static-h1"><span class="fss-s1">Install</span> <span class="fss-s2">The Franks Standard</span></h1>
      <p class="fss-static-sub">Add the app to your home screen or desktop &mdash; full screen, fast, no app store. Android, iPhone, iPad, and desktop instructions inside.</p>
      ${contactBlock}`
      break
    case '/sell':
    case '/sellers':
      body = `
      <p class="fss-static-ribbon">Sell with proof</p>
      <h1 class="fss-static-h1"><span class="fss-s1">List with</span> <span class="fss-s2">proof.</span></h1>
      <p class="fss-static-sub">Upload a Certificate of Authenticity or sign the in-platform guarantee. No fakes. Zero tolerance. Sellers keep more &mdash; fair fees.</p>
      ${contactBlock}`
      break
    case '/browse':
    case '/categories':
      body = `
      <p class="fss-static-ribbon">Browse the marketplace</p>
      <h1 class="fss-static-h1"><span class="fss-s1">Authentic</span> <span class="fss-s2">finds only.</span></h1>
      <p class="fss-static-sub">Sports cards, instruments, firearms accessories, coins, art, watches, sneakers, vintage tech &mdash; every listing backed by a COA or signed guarantee.</p>
      ${contactBlock}`
      break
    case '/pricing':
    case '/launch-offer':
      body = `
      <p class="fss-static-ribbon">Pricing</p>
      <h1 class="fss-static-h1"><span class="fss-s1">Fair fees.</span> <span class="fss-s2">Real value.</span></h1>
      <p class="fss-static-sub">No 13%+ tax on your sales. Sellers keep more. See current plans and the launch offer inside.</p>
      ${contactBlock}`
      break
    case '/about':
    case '/how-it-works':
    case '/compare':
      body = `
      <p class="fss-static-ribbon">About The Franks Standard</p>
      <h1 class="fss-static-h1"><span class="fss-s1">If it is here,</span> <span class="fss-s2">it is real.</span></h1>
      <p class="fss-static-sub">Three pillars. One guarantee: list with proof, buy with confidence, protected by The Standard. Counterfeit = permanent ban + full refund.</p>
      ${contactBlock}`
      break
    case '/':
    default:
      body = `
      <p class="fss-static-ribbon">Proof-first marketplace. <span>Live floor energy.</span></p>
      <h1 class="fss-static-h1"><span class="fss-s1">If it is here,</span> <span class="fss-s2">it is real.</span></h1>
      <p class="fss-static-sub">The authenticity-first collectibles and gear marketplace. Every listing backed by a Certificate of Authenticity or signed in-platform guarantee. The full app with gallery and motion loads next (JavaScript required).</p>
      ${contactBlock}`
      break
  }

  return `${START}\n${heroOpen}${body}\n${heroClose}\n${SHARED_STYLE}\n${END}`
}

// Map an HTML file path inside .output/public to its public URL route.
function routeForFile (file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  if (rel === 'index.html' || rel === '200.html' || rel === '404.html') return '/'
  // /contact/index.html -> /contact
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length)
  // /contact.html -> /contact
  if (rel.endsWith('.html')) return '/' + rel.slice(0, -'.html'.length)
  return '/'
}

function ensureCanonical (html, canonicalUrl) {
  // Replace any existing <link rel="canonical"> with the per-page one, otherwise add it.
  const tag = `<link rel="canonical" href="${canonicalUrl}">`
  if (/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, tag)
  }
  return html.replace(/<\/head>/i, `${tag}\n</head>`)
}

function ensureNoindexIfFlagged (html) {
  if (!IS_NOINDEX_BUILD) return html
  if (/<meta[^>]+name=["']robots["'][^>]*>/i.test(html)) {
    return html.replace(/<meta[^>]+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow">')
  }
  return html.replace(/<\/head>/i, '<meta name="robots" content="noindex,nofollow">\n</head>')
}

function patchFile (file) {
  let s = fs.readFileSync(file, 'utf8')
  const route = routeForFile(file)
  const canonical = SITE_URL + (route === '/' ? '/' : route)

  // Always (re)set the per-page canonical URL.
  s = ensureCanonical(s, canonical)
  // Only noindex when an explicit NUXT_NOINDEX=1 build flag is set (e.g. a preview build).
  s = ensureNoindexIfFlagged(s)

  // Inject visible body fallback (only once per file).
  if (!s.includes(START)) {
    if (s.includes(NUXT_EMPTY)) {
      const injection = fallbackForRoute(route)
      s = s.split(NUXT_EMPTY).join(`<div id="__nuxt">\n${injection}\n</div>`)
    } else {
      console.warn('inject-spa-fallback: no #__nuxt div in', path.relative(ROOT, file))
    }
  }

  fs.writeFileSync(file, s, 'utf8')
  const tag = IS_NOINDEX_BUILD ? '[noindex]' : ''
  console.log('inject-spa-fallback:', (path.relative(ROOT, file) || 'index'), '->', canonical, tag)
}

function walkHtml (dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory()) walkHtml(p)
    else if (name.isFile() && p.endsWith('.html')) patchFile(p)
  }
}

if (!fs.existsSync(ROOT)) {
  console.error('inject-spa-fallback: missing .output/public - run nuxt generate first')
  process.exit(1)
}

console.log('inject-spa-fallback: target =', IS_NOINDEX_BUILD
  ? `noindex (VERCEL=${process.env.VERCEL || ''} NUXT_NOINDEX=${process.env.NUXT_NOINDEX || ''})`
  : 'canonical / indexable')
walkHtml(ROOT)
console.log('inject-spa-fallback: done')
