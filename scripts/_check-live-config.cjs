const https = require('https')
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let d = ''
      res.on('data', (c) => (d += c))
      res.on('end', () => resolve(d))
    }).on('error', reject)
  })
}
;(async () => {
  const html = await get('https://thefranksstandard.com/')
  const chunks = [...html.matchAll(/\/_nuxt\/[^"']+\.js/g)].map((m) => m[0])
  console.log('chunks', chunks.slice(0, 5))
  for (const c of chunks.slice(0, 8)) {
    const js = await get('https://thefranksstandard.com' + c)
    if (js.includes('supabase')) {
      const idx = js.indexOf('supabase')
      console.log('\nFOUND in', c)
      console.log(js.slice(Math.max(0, idx - 60), idx + 100))
    }
  }
  if (html.includes('__NUXT__')) {
    const m = html.match(/window\.__NUXT__[^<]+/)
    if (m) console.log('\nNUXT snippet:', m[0].slice(0, 500))
  }
})().catch((e) => { console.error(e); process.exit(1) })
