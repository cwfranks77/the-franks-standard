#!/usr/bin/env node
/**
 * Blocks dangerous RLS patterns in Supabase migrations before they reach production.
 * Run: node scripts/check-supabase-security.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
const failures = []

const SENSITIVE_TABLES = [
  'profiles',
  'orders',
  'dropship_orders',
  'dropship_events',
  'distributors',
  'seller_dropship_secrets',
  'seller_dropship_settings',
  'abl_licenses',
  'abl_profiles',
  'stripe_margin_split_audits',
  'ops_incidents',
  'contact_messages',
]

const BANNED_PATTERNS = [
  {
    re: /create\s+policy\s+[^;]*\bon\s+public\.profiles\b[^;]*\busing\s*\(\s*true\s*\)/gis,
    msg: 'profiles table must NEVER have USING (true) — use public_store_profiles view for storefront data',
  },
  {
    re: /create\s+policy\s+[^;]*\bon\s+public\.(dropship_orders|dropship_events|distributors)\b[^;]*\busing\s*\(\s*true\s*\)/gis,
    msg: 'dropship/distributor tables must not allow read-all policies (USING true)',
  },
  {
    re: /create\s+policy\s+"Public profiles are readable"/i,
    msg: 'Do not re-create the removed "Public profiles are readable" policy',
  },
  {
    re: /create\s+policy\s+"Dropship orders read authenticated"/i,
    msg: 'Do not re-create removed broad dropship_orders authenticated read policy',
  },
]

const LOCKDOWN_MIGRATION = '058_profiles_public_read_lockdown.sql'

function walkSqlFiles (dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) continue
    if (name.endsWith('.sql')) files.push(path)
  }
  return files.sort()
}

for (const file of walkSqlFiles(migrationsDir)) {
  const sql = readFileSync(file, 'utf8')
  const base = file.replace(process.cwd(), '').replace(/\\/g, '/')
  const fileName = base.split('/').pop() || ''
  const isHistorical = fileName < LOCKDOWN_MIGRATION

  for (const { re, msg } of BANNED_PATTERNS) {
    re.lastIndex = 0
    if (re.test(sql)) {
      failures.push(`${base}: ${msg}`)
    }
  }

  if (isHistorical) continue

  for (const table of SENSITIVE_TABLES) {
    const openRead = new RegExp(
      `create\\s+policy[\\s\\S]*?on\\s+public\\.${table}[\\s\\S]*?for\\s+select[\\s\\S]*?using\\s*\\(\\s*true\\s*\\)`,
      'i',
    )
    if (openRead.test(sql)) {
      failures.push(`${base}: open SELECT on public.${table} with USING (true) is not allowed`)
    }
  }
}

const required = [
  '058_profiles_public_read_lockdown.sql',
  '059_security_hardening.sql',
  '060_security_hardening_followup.sql',
]
for (const name of required) {
  try {
    statSync(join(migrationsDir, name))
  } catch {
    failures.push(`Missing required security migration: supabase/migrations/${name}`)
  }
}

if (failures.length) {
  console.error('Supabase security check FAILED:\n')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log('Supabase security migration check passed.')
