const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const CRED_DIR = path.join(__dirname, '..', '..', 'franks-standard-credentials')
const pass = process.argv[2] || 'Sportsman#570'

const mailboxes = [
  {
    file: 'email.env',
    user: 'info@thefranksstandard.com',
    comment: 'Namecheap Private Email - primary mailbox',
  },
  {
    file: 'brandys-email.env',
    user: 'brandy@thefranksstandard.com',
    comment: 'Optional store mailbox (set same password in Namecheap if mailbox exists)',
  },
]

fs.mkdirSync(CRED_DIR, { recursive: true })

for (const box of mailboxes) {
  const envPath = path.join(CRED_DIR, box.file)
  const body = [
    `# ${box.comment}`,
    `EMAIL_USER=${box.user}`,
    `EMAIL_PASS=${pass}`,
    '',
  ].join('\n')
  fs.writeFileSync(envPath, body, 'utf8')
  console.log('Wrote', envPath)
}

const note = [
  'The Franks Standard — mailbox passwords (local copy for scripts)',
  'Set the SAME password in Namecheap Private Email for each mailbox listed below.',
  '',
  ...mailboxes.map((b) => `${b.user} → ${pass}`),
  '',
  'Webmail: https://privateemail.com',
  'Username: full email address (e.g. info@thefranksstandard.com)',
  '',
  'Namecheap control panel:',
  'https://ap.www.namecheap.com/domains/domaincontrolpanel/thefranksstandard.com/privateemail/',
  '',
  'Namecheap ACCOUNT login is NOT info@ — use the email you used when buying the domain.',
  'See NAMECHEAP-LOGIN-RECOVERY.md',
  '',
].join('\n')

fs.writeFileSync(path.join(CRED_DIR, 'MAILBOX-PASSWORD.txt'), note, 'utf8')
console.log('Wrote MAILBOX-PASSWORD.txt')

console.log('\nTesting info@ IMAP/SMTP...')
const r = spawnSync(process.execPath, [path.join(__dirname, 'test-mailbox.cjs')], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
})
if (r.status !== 0) {
  console.log('\n>>> Login failed on the SERVER — password is not set in Namecheap yet.')
  console.log('>>> Run: npm run mail:set-now')
  console.log('>>> Paste Sportsman#570 in Namecheap → Private Email → info@ → Change password')
  console.log('>>> Then test https://privateemail.com and run npm run mail:test again')
}
process.exit(r.status ?? 1)
