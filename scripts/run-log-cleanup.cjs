#!/usr/bin/env node
/** Local runner for 180-day log cleanup (uses service role from env). */
const { createClient } = require('@supabase/supabase-js')
const { runLogCleanup } = require('../backend/cron/log_cleanup.js')

async function main () {
  const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const result = await runLogCleanup(admin)
  console.log(JSON.stringify(result, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
