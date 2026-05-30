#!/usr/bin/env node
/**
 * Pre-deploy QA: production build + internal route/link check.
 * Run: node scripts/site-qa-precheck.cjs
 */
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')

function run (cmd, label) {
  console.log(`\n▶ ${label}`)
  execSync(cmd, { cwd: root, stdio: 'inherit', env: process.env })
}

run('npm run build', 'Production build')
run('node scripts/check-site-routes.cjs', 'Route / link check')

const mustExist = [
  'ops/print-pack/index.html',
  'ops/print-coa/index.html',
  'verify/coa/index.html',
  'sell/index.html',
  'auth/login/index.html',
]

const out = path.join(root, '.output', 'public')
const missing = mustExist.filter((rel) => !fs.existsSync(path.join(out, rel)))
if (missing.length) {
  console.error('\n✗ Missing prerendered HTML:', missing.join(', '))
  process.exit(1)
}

console.log('\n✓ site-qa-precheck passed (build + routes + critical HTML)')
