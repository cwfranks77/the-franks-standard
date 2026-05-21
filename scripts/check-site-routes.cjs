/**
 * HTTP check for public routes (run after deploy).
 *   npm run check:routes
 */

const SITE = (process.env.SITE_URL || 'https://thefranksstandard.com').replace(/\/$/, '')

const ROUTES = [
  '/',
  '/browse',
  '/sell',
  '/sellers',
  '/pricing',
  '/pay',
  '/compare',
  '/categories',
  '/store-builder',
  '/launch-offer',
  '/how-it-works',
  '/about',
  '/contact',
  '/support',
  '/open-door',
  '/download',
  '/video',
  '/roadmap',
  '/terms',
  '/privacy',
  '/prohibited-items',
  '/seller-agreement',
  '/auth/login',
  '/auth/register',
  '/sitemap.xml',
  '/robots.txt',
]

async function check (path) {
  const url = `${SITE}${path}`
  try {
    const res = await fetch(url, { redirect: 'follow' })
    const ok = res.status >= 200 && res.status < 400
    return { path, status: res.status, ok }
  } catch (e) {
    return { path, status: 0, ok: false, err: e.message }
  }
}

async function main () {
  console.log('Checking', SITE, '\n')
  const results = []
  for (const p of ROUTES) {
    const r = await check(p)
    results.push(r)
    const mark = r.ok ? 'OK' : 'FAIL'
    console.log(`${mark.padEnd(5)} ${r.status || 'ERR'}  ${p}${r.err ? ' — ' + r.err : ''}`)
  }
  const failed = results.filter((r) => !r.ok)
  console.log('\n', failed.length ? `${failed.length} failed` : 'All routes OK')
  process.exit(failed.length ? 1 : 0)
}

main()
