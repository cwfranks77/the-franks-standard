# Configure bc-audio@thefranksstandard.com on this PC (Namecheap Private Email + Windows Mail)
$ErrorActionPreference = 'Stop'
$credDir = Join-Path $env:USERPROFILE 'OneDrive\Documents\franks-standard-credentials'
$envFile = Join-Path $credDir 'email-bc-audio.env'
$passFile = Join-Path $credDir 'MAILBOX-PASSWORD.txt'

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' bc-audio@thefranksstandard.com setup' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Provider: Namecheap Private Email (mail.privateemail.com)'
Write-Host ''
Write-Host 'STEP A — Namecheap (mailbox must exist + password set)'
Write-Host '  1. Log into Namecheap with your domain account (NOT the mailbox address)'
Write-Host '  2. Domain List -> MANAGE (thefranksstandard.com) -> Private Email -> Manage mailboxes'
Write-Host '  3. Confirm bc-audio@ exists; set/reset password and Save'
Write-Host '  4. Test webmail: https://privateemail.com  (full email + new password)'
Write-Host ''
Write-Host 'STEP B — Save password on this PC'
Write-Host "  File: $envFile"
if (Test-Path $passFile) {
  $line = Get-Content $passFile | Where-Object { $_ -match '^Password:\s*(.+)$' } | Select-Object -First 1
  if ($line -match '^Password:\s*(.+)$') {
    $pass = $Matches[1].Trim()
    $content = @(
      '# Namecheap Private Email - bc-audio@thefranksstandard.com',
      'EMAIL_USER=bc-audio@thefranksstandard.com',
      "EMAIL_PASS=$pass"
    ) -join "`n"
    Set-Content -Path $envFile -Value $content -Encoding UTF8
    Write-Host '  Wrote EMAIL_PASS from MAILBOX-PASSWORD.txt' -ForegroundColor Green
  }
} else {
  Write-Host '  Add EMAIL_PASS=... to email-bc-audio.env after you set the Namecheap password'
}
Write-Host ''
Write-Host 'STEP C — Windows Mail / Outlook (manual)'
Write-Host '  Settings -> Accounts -> Email & accounts -> Add account -> Advanced setup -> IMAP'
Write-Host '  Email address:    bc-audio@thefranksstandard.com'
Write-Host '  Username:         bc-audio@thefranksstandard.com  (full address)'
Write-Host '  Incoming (IMAP):    mail.privateemail.com  port 993  SSL/TLS'
Write-Host '  Outgoing (SMTP):    mail.privateemail.com  port 587  STARTTLS  (sign-in required)'
Write-Host '  If 587 fails, try SMTP port 465 with SSL.'
Write-Host ''
Write-Host 'STEP D — Verify from repo:'
Write-Host '  cd the-franks-standard'
Write-Host '  npm run mail:test:bc-audio'
Write-Host ''

Start-Process 'https://ap.www.namecheap.com/domains/domaincontrolpanel/thefranksstandard.com/privateemail/'
Start-Sleep -Seconds 1
Start-Process 'https://privateemail.com'
Start-Sleep -Seconds 1
Start-Process 'ms-settings:emailandaccounts'

Set-Location (Join-Path $PSScriptRoot '..')
if (Test-Path $envFile) {
  $raw = Get-Content $envFile -Raw
  if ($raw -match 'EMAIL_PASS=\s*\S') {
    Write-Host 'Running mail:test:bc-audio ...' -ForegroundColor Yellow
    npm run mail:test:bc-audio
  } else {
    Write-Host 'Skip auto-test: EMAIL_PASS empty in email-bc-audio.env' -ForegroundColor Yellow
  }
}
