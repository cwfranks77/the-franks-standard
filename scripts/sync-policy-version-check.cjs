#!/usr/bin/env node
/** Fail CI if edge policy version drifts from frontend bundle. */
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const bundle = fs.readFileSync(path.join(root, 'utils/sellerPolicyBundle.js'), 'utf8')
const edge = fs.readFileSync(path.join(root, 'supabase/functions/_shared/sellerPolicyAcceptance.ts'), 'utf8')
const m1 = bundle.match(/SELLER_POLICY_VERSION\s*=\s*'([^']+)'/)
const m2 = edge.match(/CURRENT_SELLER_POLICY_VERSION\s*=\s*'([^']+)'/)
if (!m1 || !m2 || m1[1] !== m2[1]) {
  console.error('Policy version mismatch:', m1?.[1], 'vs', m2?.[1])
  process.exit(1)
}
console.log('OK policy version', m1[1])
