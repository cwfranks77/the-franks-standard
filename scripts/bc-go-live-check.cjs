/**
 * Quick live checks for www.bcpoweraudio.com after deploy.
 *   node scripts/bc-go-live-check.cjs
 */
const SITE = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.bcpoweraudio.com').replace(/\/$/, '')

const checks = [
  { name: 'Storefront', url: `${SITE}/bc-audio/` },
  { name: 'SMS consent', url: `${SITE}/bc-audio/sms-consent` },
  { name: 'Petra catalog JSON', url: `${SITE}/catalog/petra-products.json` },
]

async function run () {
  let failed = 0
  console.log(`=== B&C go-live check: ${SITE} ===\n`)

  for (const check of checks) {
    try {
      const res = await fetch(check.url, { redirect: 'follow' })
      if (!res.ok) {
        console.log(`[FAIL] ${check.name}: HTTP ${res.status}`)
        failed++
        continue
      }
      if (check.name === 'Petra catalog JSON') {
        const data = await res.json()
        const count = Number(data?.count || data?.products?.length || 0)
        const external = data?.imagePolicy === 'external-only'
        if (count < 100) {
          console.log(`[FAIL] ${check.name}: only ${count} products`)
          failed++
        } else if (!external) {
          console.log(`[WARN] ${check.name}: ${count} products but imagePolicy not external-only`)
          console.log(`[OK]   ${check.name}: ${count} products`)
        } else {
          console.log(`[OK]   ${check.name}: ${count} products, external images`)
        }
        continue
      }
      const html = await res.text()
      const hasBcPhone = html.includes('833') || html.includes('322-8439')
      if (check.name === 'Storefront' && hasBcPhone) {
        console.log(`[OK]   ${check.name}: B&C line (833) present in page shell`)
      } else if (check.name === 'Storefront') {
        console.log(`[WARN] ${check.name}: page loads but B&C 833 line not found in HTML shell`)
      }
      console.log(`[OK]   ${check.name}: HTTP ${res.status}`)
    } catch (err) {
      console.log(`[FAIL] ${check.name}: ${err.message}`)
      failed++
    }
  }

  console.log('')
  if (failed === 0) {
    console.log('RESULT: SITE CHECK PASSED — catalog and pages are live.')
    process.exit(0)
  }
  console.log(`RESULT: ${failed} check(s) failed.`)
  process.exit(1)
}

run()
