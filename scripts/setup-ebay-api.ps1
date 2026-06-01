# One-shot: save eBay keys locally, GitHub secrets, and Supabase Edge secrets.
# Usage:
#   powershell -File scripts/setup-ebay-api.ps1
#   powershell -File scripts/setup-ebay-api.ps1 -ClientId "YourAppId" -ClientSecret "YourCertId"
#
# Get Production keys: https://developer.ebay.com/my/keys

param(
  [string]$ClientId = '',
  [string]$ClientSecret = '',
  [string]$ProjectRef = 'rochesyrxiyrxhzmkuwk'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$credDir = Join-Path (Split-Path -Parent $root) 'franks-standard-credentials'
$ebayEnv = Join-Path $credDir 'ebay.env'

Set-Location $root

function Load-DotEnv([string]$path) {
  if (-not (Test-Path $path)) { return }
  Get-Content $path | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim(), 'Process')
    }
  }
}

foreach ($f in @('.env', '.env.local', $ebayEnv)) {
  Load-DotEnv (Join-Path $root $f)
}

if (-not $ClientId) { $ClientId = $env:EBAY_CLIENT_ID }
if (-not $ClientSecret) { $ClientSecret = $env:EBAY_CLIENT_SECRET }

if (-not $ClientId) {
  Write-Host ''
  Write-Host 'Paste eBay Production App ID (Client ID) from developer.ebay.com -> Application Keys' -ForegroundColor Cyan
  $ClientId = (Read-Host 'EBAY_CLIENT_ID (App ID)').Trim()
}
if (-not $ClientSecret) {
  Write-Host 'Paste eBay Production Cert ID (Client Secret)' -ForegroundColor Cyan
  $ClientSecret = (Read-Host 'EBAY_CLIENT_SECRET (Cert ID)').Trim()
}

if (-not $ClientId -or -not $ClientSecret) {
  Write-Host 'Both Client ID and Client Secret are required.' -ForegroundColor Red
  exit 1
}

New-Item -ItemType Directory -Force -Path $credDir | Out-Null
@(
  '# eBay Browse API — Production keys (local only, never commit)',
  "EBAY_CLIENT_ID=$ClientId",
  "EBAY_CLIENT_SECRET=$ClientSecret",
  'EBAY_MARKETPLACE_ID=EBAY_US',
  'EBAY_API_ENV=production',
  ''
) | Set-Content -Path $ebayEnv -Encoding UTF8
Write-Host "Saved $ebayEnv" -ForegroundColor Green

Write-Host 'Saving to GitHub repo secrets...' -ForegroundColor Cyan
$ClientId | gh secret set EBAY_CLIENT_ID --repo cwfranks77/the-franks-standard
$ClientSecret | gh secret set EBAY_CLIENT_SECRET --repo cwfranks77/the-franks-standard

$token = $env:SUPABASE_ACCESS_TOKEN
if (-not $token) {
  Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
  $clip = [System.Windows.Forms.Clipboard]::GetText().Trim()
  if ($clip -match '^sbp_') { $token = $clip }
}
if (-not $token) {
  Write-Host 'Supabase access token (sbp_...) — paste from https://supabase.com/dashboard/account/tokens' -ForegroundColor Yellow
  $token = (Read-Host 'SUPABASE_ACCESS_TOKEN').Trim()
}
if ($token -match '^sbp_') {
  $env:SUPABASE_ACCESS_TOKEN = $token
  Write-Host 'Pushing secrets to Supabase Edge (direct)...' -ForegroundColor Cyan
  npx supabase@latest secrets set `
    "EBAY_CLIENT_ID=$ClientId" `
    "EBAY_CLIENT_SECRET=$ClientSecret" `
    EBAY_MARKETPLACE_ID=EBAY_US `
    EBAY_API_ENV=production `
    --project-ref $ProjectRef
  if ($LASTEXITCODE -ne 0) { throw 'supabase secrets set failed' }
  Write-Host 'Supabase Edge secrets updated.' -ForegroundColor Green
} else {
  Write-Host 'No sbp_ token — triggering GitHub workflow instead...' -ForegroundColor Yellow
  gh workflow run push-supabase-ebay-secrets.yml --repo cwfranks77/the-franks-standard
  Write-Host 'Watch: gh run watch --repo cwfranks77/the-franks-standard' -ForegroundColor Cyan
}

Write-Host ''
Write-Host 'Done. Test at https://thefranksstandard.com/ops/ebay-prospects (ops unlock).' -ForegroundColor Green
Write-Host 'Import preview: https://thefranksstandard.com/sell/import' -ForegroundColor Green
