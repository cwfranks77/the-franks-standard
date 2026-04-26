// Post-build: inject a branded static shell so crawlers and no-JS clients see
// the real brand (Nuxt ssr: false otherwise ships an empty #__nuxt only).
const fs = require('node:fs')
const path = require('node:path')

const INJECTION = `<!--fss:spa-fallback-start-->
<div id="fss-static-boot" class="fss-static-boot" aria-hidden="true">
  <div class="fss-static-aur" aria-hidden="true"></div>
  <div class="fss-static-inner">
    <div class="fss-static-copy">
      <p class="fss-static-ribbon">Proof-first marketplace. <span>Live floor energy.</span></p>
      <h1 class="fss-static-h1"><span class="fss-s1">If it is here,</span> <span class="fss-s2">it is real.</span></h1>
      <p class="fss-static-sub">The full app with gallery and motion loads next (JavaScript required).</p>
    </div>
    <div class="fss-static-media">
      <img src="/franks-pavilion.png" alt="The Franks Standard" width="200" height="200" />
    </div>
  </div>
</div>
<style id="fss-static-boot-style">
#fss-static-boot-style,.fss-static-aur{box-sizing:border-box}
.fss-static-boot{min-height:60vh;position:relative;overflow:hidden;padding:clamp(1rem,4vw,2.5rem);color:#e8e4f0;font-family:Inter,system-ui,sans-serif}
.fss-static-aur{position:absolute;inset:0;pointer-events:none;opacity:.7;background:radial-gradient(ellipse 80% 50% at 0% 0%,rgba(255,45,122,.28) 0%,transparent 50%),radial-gradient(ellipse 60% 40% at 100% 10%,rgba(0,224,255,.14) 0%,transparent 45%),linear-gradient(180deg,#0a0518 0%,#120a22 100%)}
.fss-static-inner{max-width:1200px;margin:0 auto;position:relative;z-index:1;display:grid;gap:1.5rem;align-items:center;padding-top:1rem;grid-template-columns:1fr}
@media(min-width:900px){.fss-static-inner{grid-template-columns:1.1fr 0.9fr;padding-top:2rem}.fss-static-h1{font-size:clamp(1.5rem,3vw,2.6rem)}}
.fss-static-ribbon{text-transform:uppercase;letter-spacing:.12em;font-size:.7rem;color:#00f5a0;font-weight:700}
.fss-static-h1{font-family:Cinzel,Georgia,serif;font-size:clamp(1.4rem,4vw,2.1rem);line-height:1.2;margin:.75rem 0 .5rem}
.fss-s2{background:linear-gradient(90deg,#ffd84d 0%,#fff3a6 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.fss-static-sub{color:#a39ab8;font-size:.95rem;max-width:32rem;margin:0}
.fss-static-media{text-align:center}
.fss-static-media img{max-width:min(200px,42vw);height:auto;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
</style>
<!--fss:spa-fallback-end-->`

const NUXT_EMPTY = '<div id="__nuxt"></div>'

const ROOT = path.join(__dirname, '..', '.output', 'public')

function walkHtml (dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory()) walkHtml(p)
    else if (name.isFile() && (name.name.endsWith('.html') || name.name === '200.html' || name.name === '404.html')) {
      patchFile(p)
    }
  }
}

function patchFile (file) {
  let s = fs.readFileSync(file, 'utf8')
  if (s.includes('fss:spa-fallback-start') || !s.includes(NUXT_EMPTY)) return
  s = s.split(NUXT_EMPTY).join(`<div id="__nuxt">\n${INJECTION}\n</div>`)
  if (!s.includes('fss:spa-fallback-start')) {
    console.warn('inject-spa-fallback: no replacement for', file)
    return
  }
  fs.writeFileSync(file, s, 'utf8')
  console.log('inject-spa-fallback:', path.relative(ROOT, file) || 'index')
}

if (!fs.existsSync(ROOT)) {
  console.error('inject-spa-fallback: missing .output/public - run nuxt generate first')
  process.exit(1)
}

walkHtml(ROOT)
console.log('inject-spa-fallback: done')