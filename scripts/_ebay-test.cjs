const u = process.argv[2] || 'https://www.ebay.com/sch/i.html?_ssn=brandysportinggoods&_ipg=60&rt=nc'
fetch(u, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  },
})
  .then((r) => r.text())
  .then((t) => {
    console.log('len', t.length)
    const ids = [...t.matchAll(/itm\/(\d{10,})/g)].map((m) => m[1])
    console.log('itm ids', [...new Set(ids)].slice(0, 8))
    const jsonIds = [...t.matchAll(/"itemId":"(\d+)"/g)].map((m) => m[1])
    console.log('json ids', [...new Set(jsonIds)].slice(0, 8))
  })
  .catch((e) => console.error(e.message))
