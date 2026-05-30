import { chromium } from 'playwright'

const BASE = 'https://thefranksstandard.com'

async function classify (page) {
  await page.waitForTimeout(2000)
  const url = page.url()
  const text = await page.locator('body').innerText()
  return {
    url,
    chooser: /What are you selling/i.test(text),
    coa: /Authenticity proof \(COA\)/i.test(text),
    policy: /Seller Policy Agreement|Accept seller policies|Digital signature/i.test(text),
    sellHub: /Sell on The Franks Standard/i.test(text) && /Direct Sale/i.test(text),
    login: /auth\/login/i.test(url),
    redirectParam: new URL(url).searchParams.get('redirect'),
    snippet: text.replace(/\s+/g, ' ').slice(0, 220),
  }
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

// Header quick tile Sell
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.locator('a.quick-tile--gold').filter({ hasText: 'Sell' }).first().click({ timeout: 10000 })
console.log(JSON.stringify({ test: 'header-quick-tile-sell', ...(await classify(page)) }))

// Home List an item
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.locator('a.mkt-btn').filter({ hasText: 'List an item' }).first().click({ timeout: 10000 })
console.log(JSON.stringify({ test: 'home-list-an-item', ...(await classify(page)) }))

// Direct routes
for (const path of ['/sell/start/', '/sell/', '/sell', '/sell/?kind=general']) {
  await page.goto(BASE + path.replace(/^\//, '/'), { waitUntil: 'domcontentloaded', timeout: 60000 })
  console.log(JSON.stringify({ test: `direct-${path}`, ...(await classify(page)) }))
}

// Chooser buttons
await page.goto(`${BASE}/sell/start/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: /Non-collectible/i }).click({ timeout: 10000 })
console.log(JSON.stringify({ test: 'click-non-collectible', ...(await classify(page)) }))

await page.goto(`${BASE}/sell/start/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByRole('button', { name: /^Collectible$/i }).click({ timeout: 10000 })
console.log(JSON.stringify({ test: 'click-collectible', ...(await classify(page)) }))

await browser.close()
