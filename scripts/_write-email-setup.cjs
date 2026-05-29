const fs = require('fs')
const email = `# Fix info@thefranksstandard.com — credentials prompt when sending

Your domain uses Namecheap Private Email.

## Step 1 — Reset mailbox password
1. https://ap.www.namecheap.com/domains/domaincontrolpanel/thefranksstandard.com → Private Email
2. Reset password for info@thefranksstandard.com
3. Save in franks-standard-credentials/email.env as EMAIL_USER and EMAIL_PASS

## Step 2 — Test webmail
https://privateemail.com — sign in and send a test. If this works, password is correct.

## Step 3 — Mail app settings (Outlook/iPhone)
- Username: info@thefranksstandard.com (full address)
- IMAP: mail.privateemail.com port 993 SSL
- SMTP: mail.privateemail.com port 587 STARTTLS
- Enable: My outgoing server requires authentication (same password)

## SendGrid vs mailbox
- Outlook/iPhone as info@ → Namecheap password above
- npm run email:campaign → SendGrid API key (https://app.sendgrid.com/settings/api_keys)

Links: https://privateemail.com | https://app.sendgrid.com/settings/sender_auth
`
fs.writeFileSync('C:/Users/ninja/OneDrive/Documents/franks-standard-credentials/EMAIL-SETUP.md', email, 'utf8')
console.log('wrote EMAIL-SETUP.md')
