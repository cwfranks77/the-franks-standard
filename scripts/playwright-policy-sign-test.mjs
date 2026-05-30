/**
 * Captures failing network calls on /sell policy sign (requires signed-in session).
 * Usage:
 *   $env:TEST_SELLER_EMAIL="you@example.com"
 *   $env:TEST_SELLER_PASSWORD="yourpassword"
 *   node scripts/playwright-policy-sign-test.mjs
 */
import { chromium } from 'playwright'

const BASE = 'https://thefranksstandard.com'
const email = process.env.TEST_SELLER_EMAIL
const password = process.env.TEST_SELLER_PASSWORD

if (!email || !password) {
  console.error('Set TEST_SELLER_EMAIL and TEST_SELLER_PASSWORD to run signed-in test.')
  process.exit(2)
}

const failures = []

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

page.on('response', (res) => {
  const url = res.url()
  const status = res.status()
  if (status >= 500 && (url.includes('supabase') || url.includes('thefranksstandard'))) {
    failures.push({ status, url: url.slice(0, 200) })
  }
})

await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.fill('input[type="email"]', email)
await page.fill('input[type="password"]', password)
await page.getByRole('button', { name: /sign in|log in/i }).click({ timeout: 15000 })
await page.waitForTimeout(4000)

await page.goto(`${BASE}/sell/`, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(2000)

const policyVisible = await page.getByText(/Seller policy agreement/i).isVisible().catch(() => false)
console.log('policy gate visible:', policyVisible)

if (policyVisible) {
  await page.fill('#seller-policy-legal-name', 'Playwright Test Signer')
  await page.locator('.agree-all input[type="checkbox"]').check()
  await page.getByRole('button', { name: /Digitally sign/i }).click()
  await page.waitForTimeout(8000)
}

const errText = await page.locator('.error-text').textContent().catch(() => '')
console.log('UI error:', errText || '(none)')
console.log('HTTP 500+ failures:', failures.length ? failures : '(none captured)')

await browser.close()
process.exit(failures.length || errText ? 1 : 0)
