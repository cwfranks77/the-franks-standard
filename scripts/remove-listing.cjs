#!/usr/bin/env node
/**
 * Remove a marketplace listing (hard delete) using Supabase service role.
 *
 *   set SUPABASE_SERVICE_ROLE_KEY=...   (Dashboard → Settings → API → service_role)
 *   node scripts/remove-listing.cjs a6dbea51-b644-421f-a53d-af7e6c09427c
 *
 * Or archive only (keeps row):
 *   node scripts/remove-listing.cjs <id> --archive
 *
 * Or via deployed ops edge function (same key as 5× logo unlock):
 *   set OPS_ACCESS_KEY=your-phrase
 *   node scripts/remove-listing.cjs <id> --ops
 */
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const listingId = process.argv[2]
const archiveOnly = process.argv.includes('--archive')
const useOps = process.argv.includes('--ops')

if (!listingId) {
  console.error('Usage: node scripts/remove-listing.cjs <listing-uuid> [--archive] [--ops]')
  process.exit(1)
}

const url = (process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://rochesyrxiyrxhzmkuwk.supabase.co').replace(/\/$/, '')

async function viaServiceRole () {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || ''
  if (!key) return false

  if (archiveOnly) {
    const res = await fetch(`${url}/rest/v1/listings?id=eq.${listingId}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status: 'archived', integrity_status: 'suspended' }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`${res.status} ${text}`)
    const rows = JSON.parse(text || '[]')
    console.log(`Archived ${rows.length} listing(s).`)
    return true
  }

  const res = await fetch(`${url}/rest/v1/listings?id=eq.${listingId}`, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=representation',
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${text}`)
  const rows = JSON.parse(text || '[]')
  console.log(`Deleted ${rows.length} listing(s).`)
  return true
}

async function viaOpsEdge () {
  const opsKey = process.env.OPS_ACCESS_KEY || process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || ''
  if (!opsKey) return false

  const action = archiveOnly ? 'suspend_listing' : 'delete_listing'
  const res = await fetch(`${url}/functions/v1/ops-integrity-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ops_key: opsKey, listing_id: listingId }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  console.log(`Ops edge: ${action} ok for ${listingId}`)
  return true
}

async function main () {
  if (useOps) {
    if (await viaOpsEdge()) return
    console.error('OPS_ACCESS_KEY not set. Use your operator unlock phrase in env OPS_ACCESS_KEY.')
    process.exit(1)
  }

  if (await viaServiceRole()) return

  console.error('Set SUPABASE_SERVICE_ROLE_KEY in .env (or run migration 038 in Supabase SQL editor).')
  console.error('Listing to remove:', listingId)
  process.exit(1)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
