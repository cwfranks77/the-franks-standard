/**
 * Local test: node scripts/ebay-preview-cli.cjs YOUR_EBAY_USERNAME
 * Does not require Supabase — uses the same HTML parser as the edge function.
 */
const { parseEbaySellerHtml } = require('../supabase/functions/_shared/ebayParse.ts')

async function main () {
  const username = process.argv[2]
  if (!username) {
    console.error('Usage: node scripts/ebay-preview-cli.cjs <ebay_seller_username>')
    process.exit(1)
  }
  const url = `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(username)}&_ipg=120&rt=nc`
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })
  const html = await res.text()
  const items = parseEbaySellerHtml(html, 12)
  console.log(JSON.stringify({ status: res.status, count: items.length, items }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
