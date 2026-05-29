/**
 * Sync EMAIL_PASS in email.env from franks-standard-credentials/MAILBOX-PASSWORD.txt
 * (does not print the password).
 */
const fs = require('fs')
const path = require('path')

const credDir = path.join(process.env.USERPROFILE || '', 'OneDrive', 'Documents', 'franks-standard-credentials')
const passFile = path.join(credDir, 'MAILBOX-PASSWORD.txt')
const envFile = path.join(credDir, 'email.env')

if (!fs.existsSync(passFile) || !fs.existsSync(envFile)) {
  console.error('Missing MAILBOX-PASSWORD.txt or email.env in', credDir)
  process.exit(1)
}

const passLine = fs.readFileSync(passFile, 'utf8').split(/\r?\n/).find((l) => /^Password:\s*/i.test(l))
if (!passLine) {
  console.error('No Password: line in MAILBOX-PASSWORD.txt')
  process.exit(1)
}
const pass = passLine.replace(/^Password:\s*/i, '').trim()

let envText = fs.readFileSync(envFile, 'utf8')
if (/^EMAIL_PASS=/m.test(envText)) {
  envText = envText.replace(/^EMAIL_PASS=.*$/m, `EMAIL_PASS=${pass}`)
} else {
  envText += `\nEMAIL_PASS=${pass}\n`
}
fs.writeFileSync(envFile, envText)
console.log('Updated EMAIL_PASS in email.env from MAILBOX-PASSWORD.txt')
