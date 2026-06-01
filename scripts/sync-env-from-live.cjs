const https = require('https')
const fs = require('fs')
const path = require('path')
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
  let supabaseUrl = ''
  let supabaseKey = ''
  for (const c of chunks.slice(0, 20)) {
    const js = await get('https://thefranksstandard.com' + c)
    if (!js.includes('supabase')) continue
    const urls = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/g) || []
    const keys = (js.match(/eyJhbGciOiJIUzI1NiIs[^"'\\]+/g) || []).filter((k) => k.length > 80)
    if (urls[0]) supabaseUrl = urls[0]
    if (keys[0]) supabaseKey = keys[0]
    if (supabaseUrl && supabaseKey) break
  }
  console.log(JSON.stringify({ supabaseUrl, keyLen: supabaseKey.length, placeholder: supabaseUrl.includes('placeholder') }, null, 2))
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
    const envPath = path.join(__dirname, '..', '.env')
    let raw = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
    const set = (k, v) => {
      const re = new RegExp('^' + k + '=.*$', 'm')
      raw = re.test(raw) ? raw.replace(re, k + '=' + v) : k + '=' + v + '\n' + raw
    }
    set('NUXT_PUBLIC_SUPABASE_URL', supabaseUrl)
    set('NUXT_PUBLIC_SUPABASE_KEY', supabaseKey)
    set('SUPABASE_URL', supabaseUrl)
    set('SUPABASE_KEY', supabaseKey)
    fs.writeFileSync(envPath, raw, 'utf8')
    console.log('Updated .env')
  }
})().catch((e) => { console.error(e); process.exit(1) })