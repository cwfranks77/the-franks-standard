# Opens Namecheap pages to register brandysportinggoods.com and set up store mail.
# Run: powershell -ExecutionPolicy Bypass -File scripts/setup-brandys-email.ps1

$ErrorActionPreference = 'Stop'
$domain = 'brandysportinggoods.com'

Write-Host ""
Write-Host "=== Brandy's Sporting Goods — email setup ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "INTERIM (use today on thefranksstandard.com):" -ForegroundColor Yellow
Write-Host "  1. Namecheap -> thefranksstandard.com -> Private Email -> Mailboxes"
Write-Host "  2. Add mailbox OR forward: brandy@thefranksstandard.com -> info@thefranksstandard.com"
Write-Host "  3. Or create mailbox brandy@ with its own password"
Write-Host "  4. Save password in franks-standard-credentials\brandys-email.env"
Write-Host ""

Write-Host "BRANDED (after domain purchase):" -ForegroundColor Green
Write-Host "  1. Register $domain"
Write-Host "  2. Private Email on that domain -> info@$domain"
Write-Host "  3. Aliases: support@, orders@ -> info@"
Write-Host ""

$urls = @(
  "https://www.namecheap.com/domains/registration/results/?domain=$domain",
  "https://ap.www.namecheap.com/domains/domaincontrolpanel/thefranksstandard.com/advancedns",
  "https://ap.www.namecheap.com/domains/domaincontrolpanel/thefranksstandard.com/privateemail/",
  "https://privateemail.com"
)

foreach ($u in $urls) {
  Start-Process $u
  Start-Sleep -Milliseconds 800
}

Write-Host "Opened Namecheap domain search + thefranksstandard.com email panel + webmail." -ForegroundColor Cyan
Write-Host "After you create brandy@, update brandys-email.env and run: npm run mail:test-brandys"
Write-Host ""
