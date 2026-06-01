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
  console.log('html has roches', html.includes('rochesyrxiyrxhzmkuwk'))
  console.log('html has placeholder', html.includes('placeholder.supabase'))
  const chunks = [...html.matchAll(/\/_nuxt\/[^"']+/g)].map((m) => m[0])
  console.log('chunks', chunks.length)
  for (const c of chunks) {
    const js = await get('https://thefranksstandard.com' + c)
    if (js.includes('roches') || js.includes('placeholder') || js.includes('supabase.co')) {
      console.log('HIT', c)
      const i = js.indexOf('roches')
      if (i < 0) continue
      console.log(js.slice(Math.max(0, i - 30), i + 80))
    }
  }
})().catch((e) => { console.error(e); process.exit(1) })
