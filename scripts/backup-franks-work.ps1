# Backup The Franks Standard project + credentials + work manifest.
# Run from anywhere:
#   powershell -ExecutionPolicy Bypass -File "C:\Users\ninja\OneDrive\Documents\the-franks-standard\scripts\backup-franks-work.ps1"
# Optional:
#   -Destination "D:\Backups"
#   -ZipOnly
#   -IncludeNodeModules

param(
  [string]$Destination = (Join-Path $env:USERPROFILE "Desktop\franks-standard-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"),
  [switch]$ZipOnly,
  [switch]$IncludeNodeModules
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$credRoot = Join-Path (Split-Path $repoRoot -Parent) 'franks-standard-credentials'

$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$manifestName = 'BACKUP-MANIFEST.txt'

# Files and folders from recent Franks Standard work (shipping, escrow, vendor terms, mail).
$workPaths = @(
  'pages/sell.vue',
  'pages/listing/[id].vue',
  'pages/vendor-terms.vue',
  'pages/order/[id].vue',
  'pages/how-it-works.vue',
  'pages/prohibited-items.vue',
  'layouts/default.vue',
  'package.json',
  'package-lock.json',
  'supabase-schema.sql',
  'supabase/migrations/024_marketplace_connect_escrow.sql',
  'supabase/migrations/025_shipping_tracker_escrow.sql',
  'supabase/migrations/033_order_stripe_tracking_canonical.sql',
  'supabase/migrations/034_listing_seller_shipping_cost.sql',
  'supabase/migrations/035_listing_shipping_cost.sql',
  'supabase/functions/create-checkout-session/index.ts',
  'supabase/functions/stripe-webhook/index.ts',
  'supabase/functions/confirm-order-receipt/index.ts',
  'supabase/functions/inventory-source-webhook/index.ts',
  'supabase/functions/inventory-source-dispatch/index.ts',
  'supabase/functions/mark-order-shipped/index.ts',
  'supabase/functions/stripe-connect-onboard/index.ts',
  'supabase/functions/stripe-connect-sync/index.ts',
  'supabase/functions/shipping-tracker-webhook/index.ts',
  'supabase/functions/_shared/markOrderPaid.ts',
  'supabase/functions/_shared/dropshipStripeSplit.ts',
  'supabase/functions/_shared/marketplaceConnectEscrow.ts',
  'supabase/functions/_shared/shippingTracker.ts',
  'supabase/functions/_shared/authenticityScan.ts',
  'scripts/verify-shipping-checkout.cjs',
  'scripts/test-mailbox.cjs',
  'scripts/test-bc-audio-mailbox.cjs',
  'scripts/configure-bc-audio-mail.ps1',
  'scripts/mail-inbox-check.cjs',
  'scripts/mail-send-test.cjs',
  'scripts/set-mailbox-now.ps1',
  'scripts/backup-franks-work.ps1',
  'docs/MARKETPLACE-ESCROW-CARRIER-PAYOUT.md',
  'docs/MARKETPLACE-CONNECT-ESCROW.md',
  'docs/STRIPE-FULL-PAYMENTS.md',
  'docs/WHAT-BROKE-2026-05.md',
  'docs/GOOGLE-WORKSPACE-SETUP.md',
  '.github/workflows/deploy-supabase-functions.yml',
  'utils/stripeCompliance.ts',
  'utils/marketplaceCategories.ts',
  'utils/authenticityScan.js'
)

$credFiles = @(
  'email.env',
  'email-bc-audio.env',
  'MAILBOX-PASSWORD.txt',
  'EMAIL-SETUP.md'
)

$excludeDirs = @('node_modules', '.output', '.nuxt', 'dist', '.git\objects\pack')
if ($IncludeNodeModules) {
  $excludeDirs = $excludeDirs | Where-Object { $_ -ne 'node_modules' }
}

function Write-Manifest {
  param([string]$OutDir)
  $mf = Join-Path $OutDir $manifestName
  $lines = @(
    "The Franks Standard — backup manifest",
    "Created: $stamp",
    "Repo: $repoRoot",
    "Credentials: $credRoot",
    "",
    "=== KEY WORK FILES (copied under repo/) ==="
  )
  foreach ($rel in $workPaths) {
    $full = Join-Path $repoRoot $rel
    $status = if (Test-Path -LiteralPath $full) { 'OK' } else { 'MISSING' }
    $lines += "  [$status] $rel"
  }
  $lines += ''
  $lines += '=== CREDENTIALS (copied under credentials/) ==='
  foreach ($f in $credFiles) {
    $full = Join-Path $credRoot $f
    $status = if (Test-Path -LiteralPath $full) { 'OK' } else { 'MISSING' }
    $lines += "  [$status] $f"
  }
  if (Test-Path (Join-Path $repoRoot '.git')) {
    Push-Location $repoRoot
    try {
      $lines += ''
      $lines += '=== GIT STATUS ==='
      $lines += (git status -sb 2>&1 | Out-String).Trim()
      $lines += ''
      $lines += '=== GIT DIFF FILES ==='
      $lines += (git diff --name-only 2>&1 | Out-String).Trim()
      $lines += ''
      $lines += '=== GIT UNTRACKED ==='
      $lines += (git ls-files --others --exclude-standard 2>&1 | Out-String).Trim()
    } finally {
      Pop-Location
    }
  }
  Set-Content -Path $mf -Value ($lines -join "`r`n") -Encoding UTF8
  return $mf
}

function Copy-TreeFiltered {
  param(
    [string]$Source,
    [string]$Target
  )
  if (-not (Test-Path $Source)) {
    Write-Warning "Skip missing: $Source"
    return
  }
  New-Item -ItemType Directory -Path $Target -Force | Out-Null
  robocopy $Source $Target /E /XD $excludeDirs /NFL /NDL /NJH /NJS /nc /ns /np 2>&1 | Out-Null
  if ($LASTEXITCODE -ge 8) {
    throw "robocopy failed for $Source (exit $LASTEXITCODE)"
  }
}

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Franks Standard — full work backup' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host "Destination: $Destination"
Write-Host ''

$destRepo = Join-Path $Destination 'the-franks-standard'
$destCred = Join-Path $Destination 'franks-standard-credentials'
$zipPath = "$Destination.zip"

if (-not $ZipOnly) {
  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  Write-Host 'Copying repo...' -ForegroundColor Yellow
  Copy-TreeFiltered -Source $repoRoot -Target $destRepo
  Write-Host 'Copying credentials...' -ForegroundColor Yellow
  if (Test-Path $credRoot) {
    Copy-TreeFiltered -Source $credRoot -Target $destCred
  } else {
    Write-Warning "Credentials folder not found: $credRoot"
  }
  $mf = Write-Manifest -OutDir $Destination
  Write-Host "Manifest: $mf" -ForegroundColor Green
}

Write-Host 'Creating zip...' -ForegroundColor Yellow
if ($ZipOnly) {
  $stage = Join-Path $env:TEMP ('franks-backup-stage-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $stage -Force | Out-Null
  Copy-TreeFiltered -Source $repoRoot -Target (Join-Path $stage 'the-franks-standard')
  if (Test-Path $credRoot) {
    Copy-TreeFiltered -Source $credRoot -Target (Join-Path $stage 'franks-standard-credentials')
  }
  Write-Manifest -OutDir $stage | Out-Null
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath -Force
  Remove-Item $stage -Recurse -Force
} else {
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  Compress-Archive -Path (Join-Path $Destination '*') -DestinationPath $zipPath -Force
}

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
if (-not $ZipOnly) {
  Write-Host "  Folder: $Destination"
}
Write-Host "  Zip:    $zipPath"
Write-Host ''
Write-Host 'Restore: unzip, then open the-franks-standard folder in Cursor.'
Write-Host ''
