# Push eBay Browse API credentials to Supabase Edge Function secrets.
# Requires: supabase CLI logged in, EBAY_CLIENT_ID + EBAY_CLIENT_SECRET in .env

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$credEbay = Join-Path (Split-Path -Parent $root) 'franks-standard-credentials\ebay.env'
foreach ($envFile in @(
  (Join-Path $root '.env'),
  (Join-Path $root '.env.local'),
  $credEbay
)) {
  if (-not (Test-Path $envFile)) { continue }
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim(), 'Process')
    }
  }
}

if ($env:SUPABASE_ACCESS_TOKEN) {
  $env:SUPABASE_ACCESS_TOKEN = $env:SUPABASE_ACCESS_TOKEN
}

$id = $env:EBAY_CLIENT_ID
$secret = $env:EBAY_CLIENT_SECRET
if (-not $id -or -not $secret) {
  Write-Host 'Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET in .env'
  Write-Host 'See docs/EBAY-API-SETUP.md'
  exit 1
}

Push-Location $root
if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Host 'Set SUPABASE_ACCESS_TOKEN (sbp_...) or run: npm run ebay:setup' -ForegroundColor Yellow
  exit 1
}
npx supabase@latest secrets set "EBAY_CLIENT_ID=$id" --project-ref rochesyrxiyrxhzmkuwk
npx supabase@latest secrets set "EBAY_CLIENT_SECRET=$secret" --project-ref rochesyrxiyrxhzmkuwk
if ($env:EBAY_MARKETPLACE_ID) {
  npx supabase@latest secrets set "EBAY_MARKETPLACE_ID=$($env:EBAY_MARKETPLACE_ID)" --project-ref rochesyrxiyrxhzmkuwk
} else {
  npx supabase@latest secrets set EBAY_MARKETPLACE_ID=EBAY_US --project-ref rochesyrxiyrxhzmkuwk
}
npx supabase@latest secrets set EBAY_API_ENV=production --project-ref rochesyrxiyrxhzmkuwk
Write-Host 'eBay API secrets set. Redeploy edge functions if needed (push to master or workflow_dispatch).'
Pop-Location
