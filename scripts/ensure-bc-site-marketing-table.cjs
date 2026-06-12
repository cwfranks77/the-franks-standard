/**
 * Create site_marketing_content on Supabase (fixes owner SEO save on bcpoweraudio.com).
 *
 *   npm run ops:ensure-bc-marketing-table
 *
 * Needs SUPABASE_ACCESS_TOKEN (supabase login or GitHub secret).
 */
const { spawnSync } = require('child_process')
const path = require('path')

const PROJECT_REF = 'rochesyrxiyrxhzmkuwk'
const SQL_FILE = path.join(__dirname, 'ensure-bc-site-marketing-table.sql')

function run (args) {
  const r = spawnSync('npx', ['supabase@latest', ...args], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('Linking Supabase project', PROJECT_REF)
run(['link', '--project-ref', PROJECT_REF])

console.log('Applying', path.basename(SQL_FILE))
run(['db', 'query', '--file', SQL_FILE, '--linked'])

console.log('Done — refresh the B&C owner panel (SEO + antique ledger) and click Save.')
