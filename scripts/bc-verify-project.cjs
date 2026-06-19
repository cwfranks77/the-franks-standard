#!/usr/bin/env node
/**
 * Verify B&C project is ready to deploy.
 * Exit 0 = all checks passed.
 */
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const required = [
  'bc-performance-audio/src/pages/bc-audio/ops/panel.vue',
  'bc-performance-audio/src/pages/bc-audio/account.vue',
  'bc-performance-audio/src/server/api/ops/site-content.ts',
  'bc-performance-audio/src/server/api/checkout/live-split-payment.post.ts',
  'bc-performance-audio/src/server/api/customer/profile.post.ts',
  'bc-performance-audio/src/composables/useBcCustomerAccount.ts',
  'bc-performance-audio/src/composables/useOpsSession.ts',
  'bc-performance-audio/src/utils/opsClientAuth.js',
  'bc-performance-audio/src/utils/dropshipCatalogs.js',
  'bc-performance-audio/supabase/migrations/001_bc_owner_tables.sql',
  'bc-performance-audio/supabase/migrations/002_bc_customer_accounts.sql',
  'bc-performance-audio/supabase/migrations/003_site_content_and_rls.sql',
]

let missing = 0
for (const rel of required) {
  const p = path.join(root, rel)
  if (fs.existsSync(p)) {
    console.log('  ok', rel)
  } else {
    console.log('  MISSING', rel)
    missing++
  }
}

const envExample = path.join(root, '.env.bc-owner.example')
if (fs.existsSync(envExample)) {
  console.log('  ok .env.bc-owner.example')
} else {
  console.log('  MISSING .env.bc-owner.example')
  missing++
}

console.log('')
if (missing === 0) {
  console.log('BC project verification PASSED')
  process.exit(0)
}
console.log(`BC project verification FAILED (${missing} missing)`)
process.exit(1)
