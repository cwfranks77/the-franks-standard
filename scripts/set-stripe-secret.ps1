param(
  [string]$Key = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not $Key) {
  Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
  $Key = [System.Windows.Forms.Clipboard]::GetText().Trim()
}

if ($Key -notmatch '^sk_(live|test)_[A-Za-z0-9]+$') {
  Write-Host "No valid Stripe secret on clipboard. Copy the key from Stripe, then run this script again."
  exit 1
}

$secretsFile = Join-Path $root ".env.supabase-secrets"
$lines = @(
  "# Local only - never commit",
  "STRIPE_SECRET_KEY=$Key",
  "SITE_URL=https://thefranksstandard.com",
  "STRIPE_PLATFORM_FEE_BPS=500"
)
[System.IO.File]::WriteAllLines($secretsFile, $lines, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Saved to .env.supabase-secrets"

Push-Location $root
if (Get-Command supabase -ErrorAction SilentlyContinue) {
  Write-Host "Pushing to Supabase Edge secrets..."
  supabase secrets set "STRIPE_SECRET_KEY=$Key" "SITE_URL=https://thefranksstandard.com" "STRIPE_PLATFORM_FEE_BPS=500"
  if ($LASTEXITCODE -eq 0) { Write-Host "Supabase secrets updated." }
  else { Write-Host "Run: supabase login && supabase link --project-ref YOUR_REF" }
} else {
  Write-Host "Paste in Supabase Dashboard -> Edge Functions -> Secrets -> STRIPE_SECRET_KEY"
}
Pop-Location