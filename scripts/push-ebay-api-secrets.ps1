# Push eBay Browse API credentials to Supabase Edge Function secrets.
# Requires: supabase CLI logged in, EBAY_CLIENT_ID + EBAY_CLIENT_SECRET in .env

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim(), 'Process')
    }
  }
}

$id = $env:EBAY_CLIENT_ID
$secret = $env:EBAY_CLIENT_SECRET
if (-not $id -or -not $secret) {
  Write-Host 'Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET in .env'
  Write-Host 'See docs/EBAY-API-SETUP.md'
  exit 1
}

Push-Location $root
npx supabase@latest link --project-ref rochesyrxiyrxhzmkuwk
npx supabase@latest secrets set "EBAY_CLIENT_ID=$id"
npx supabase@latest secrets set "EBAY_CLIENT_SECRET=$secret"
if ($env:EBAY_MARKETPLACE_ID) {
  npx supabase@latest secrets set "EBAY_MARKETPLACE_ID=$($env:EBAY_MARKETPLACE_ID)"
} else {
  npx supabase@latest secrets set EBAY_MARKETPLACE_ID=EBAY_US
}
Write-Host 'eBay API secrets set. Redeploy edge functions if needed (push to master or workflow_dispatch).'
Pop-Location
