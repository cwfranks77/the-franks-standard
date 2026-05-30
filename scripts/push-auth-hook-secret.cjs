/**
 * Push Supabase Auth "Send Email" hook secret to GitHub + Supabase Edge.
 *
 * 1. Supabase → Auth → Hooks → Send Email → copy full Secret (v1,whsec_...)
 * 2. Save to franks-standard-credentials/send-hook.env (see send-hook.env.example)
 * 3. npm run auth:push-hook-secret
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const CRED = path.join(
  process.env.USERPROFILE || '',
  'OneDrive',
  'Documents',
  'franks-standard-credentials',
  'send-hook.env',
)

if (!fs.existsSync(CRED)) {
  console.error('Create', CRED, 'with SEND_EMAIL_HOOK_SECRET=v1,whsec_...')
  console.error('Copy secret from Supabase Auth Hooks → Send Email')
  process.exit(1)
}

let secret = ''
for (const line of fs.readFileSync(CRED, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^SEND_EMAIL_HOOK_SECRET=(.*)$/)
  if (m) secret = m[1].trim()
}
if (!secret.startsWith('v1,whsec_')) {
  console.error('send-hook.env needs SEND_EMAIL_HOOK_SECRET=v1,whsec_...')
  process.exit(1)
}

const repo = 'cwfranks77/the-franks-standard'
const ref = 'rochesyrxiyrxhzmkuwk'

console.log('Setting GitHub secret SEND_EMAIL_HOOK_SECRET...')
let r = spawnSync('gh', ['secret', 'set', 'SEND_EMAIL_HOOK_SECRET', '--body', secret, '-R', repo], {
  stdio: 'inherit',
  shell: false,
})
if (r.status !== 0) process.exit(r.status)

console.log('Pushing to Supabase Edge...')
r = spawnSync(
  'npx',
  ['supabase@latest', 'secrets', 'set', `SEND_EMAIL_HOOK_SECRET=${secret}`, '--project-ref', ref],
  { stdio: 'inherit', shell: true, env: process.env },
)
if (r.status !== 0) {
  console.error('Supabase push failed — run: gh workflow run deploy-supabase-functions.yml -R', repo)
  process.exit(r.status)
}

console.log('Done. Test signup at https://thefranksstandard.com/auth/register')
