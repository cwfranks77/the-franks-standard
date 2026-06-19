#!/usr/bin/env node
/**
 * Run BC owner background jobs (auction closer + dispute sweeper).
 * Schedule with Windows Task Scheduler or GitHub Actions cron — not a loop.
 */
require('dotenv').config()

async function main () {
  const base = String(process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const opsKey = String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || '').trim()

  if (!opsKey) {
    console.error('Set NUXT_PUBLIC_OPS_ACCESS_KEY before running owner jobs.')
    process.exit(1)
  }

  const res = await fetch(`${base}/api/ops/bc-owner-jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ops-key': opsKey,
    },
    body: JSON.stringify({}),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Owner jobs failed:', data)
    process.exit(1)
  }

  console.log('BC owner jobs complete:', JSON.stringify(data, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
