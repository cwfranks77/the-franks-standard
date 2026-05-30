#!/usr/bin/env node
/** Fail CI if edge policy version drifts from frontend bundle. */
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const ver = fs.readFileSync(path.join(root, 'utils/sellerPolicyVersion.js'), 'utf8')
const edge = fs.readFileSync(path.join(root, 'supabase/functions/_shared/sellerPolicyAcceptance.ts'), 'utf8')
const rpc = fs.readFileSync(path.join(root, 'supabase/migrations/032_record_seller_policy_acceptance_rpc.sql'), 'utf8')
const m0 = ver.match(/SELLER_POLICY_VERSION\s*=\s*'([^']+)'/)
const m2 = edge.match(/CURRENT_SELLER_POLICY_VERSION\s*=\s*'([^']+)'/)
const m3 = rpc.match(/distinct from '([^']+)'/)
if (!m0 || !m2 || !m3 || m0[1] !== m2[1] || m0[1] !== m3[1]) {
  console.error('Policy version mismatch:', m0?.[1], 'edge', m2?.[1], 'rpc', m3?.[1])
  process.exit(1)
}
console.log('OK policy version', m0[1])
