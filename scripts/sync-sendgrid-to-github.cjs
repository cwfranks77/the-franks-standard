/**
 * Copy SendGrid API key from local .env → GitHub Actions secrets.
 * Does not print the API key.
 *
 *   npm run mail:sync-sendgrid
 *
 * .env must contain SENDGRID_API_KEY=SG....
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const credEnv = path.join(
  process.env.USERPROFILE || '',
  'OneDrive',
  'Documents',
  'franks-standard-credentials',
  'sendgrid.env',
)
if (fs.existsSync(credEnv)) {
  require('dotenv').config({ path: credEnv })
} else {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
}

const key = (process.env.SENDGRID_API_KEY || '').trim()
const from = (process.env.SENDGRID_FROM_EMAIL || 'info@thefranksstandard.com').trim()
const name = (process.env.SENDGRID_FROM_NAME || 'The Franks Standard').trim()

if (!key.startsWith('SG.')) {
  console.error('Add SENDGRID_API_KEY=SG.... to franks-standard-credentials/sendgrid.env or the-franks-standard/.env')
  process.exit(1)
}

const repo = 'cwfranks77/the-franks-standard'
for (const [secret, value] of [
  ['SENDGRID_API_KEY', key],
  ['SENDGRID_FROM_EMAIL', from],
  ['SENDGRID_FROM_NAME', name],
]) {
  const r = spawnSync('gh', ['secret', 'set', secret, '--body', value, '-R', repo], {
    stdio: 'inherit',
    shell: false,
  })
  if (r.status !== 0) process.exit(r.status)
  console.log('Set GitHub secret', secret)
}

console.log('Done. Run: gh workflow run deploy-supabase-functions.yml -R', repo)
