/**
 * One-time: copy mailbox password from local email.env → GitHub Actions secrets.
 * Does not print the password.
 *
 *   npm run mail:sync-github
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const CRED = path.join(
  process.env.USERPROFILE || '',
  'OneDrive',
  'Documents',
  'franks-standard-credentials',
  'email.env',
)

if (!fs.existsSync(CRED)) {
  console.error('Missing', CRED)
  process.exit(1)
}

const vars = {}
for (const line of fs.readFileSync(CRED, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) vars[m[1]] = m[2].trim()
}

if (!vars.EMAIL_USER || !vars.EMAIL_PASS) {
  console.error('email.env needs EMAIL_USER and EMAIL_PASS')
  process.exit(1)
}

const repo = 'cwfranks77/the-franks-standard'
for (const [name, value] of [
  ['MAILBOX_SMTP_USER', vars.EMAIL_USER],
  ['MAILBOX_SMTP_PASSWORD', vars.EMAIL_PASS],
]) {
  const r = spawnSync('gh', ['secret', 'set', name, '--body', value, '-R', repo], {
    stdio: 'inherit',
    shell: true,
  })
  if (r.status !== 0) process.exit(r.status)
  console.log('Set GitHub secret', name)
}

console.log('Done. Run: gh workflow run push-supabase-mailbox-secrets.yml -R', repo)
