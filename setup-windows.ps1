# The Franks Standard — one-step local run (Windows). Not Hardhat; this is Nuxt + Supabase.
# Right-click → Run with PowerShell, or: powershell -ExecutionPolicy Bypass -File setup-windows.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== The Franks Standard — local setup ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example" -ForegroundColor Green
}

# Ensure Supabase URL is set (your prod project)
$url = "https://rochesyrxiyrxhzmkuwk.supabase.co"
$envPath = Join-Path $PSScriptRoot ".env"
$raw = [System.IO.File]::ReadAllText($envPath)
if ($raw -notmatch "NUXT_PUBLIC_SUPABASE_URL=https://") {
  if ($raw -match "NUXT_PUBLIC_SUPABASE_URL=") {
    $raw = $raw -replace "NUXT_PUBLIC_SUPABASE_URL=.*", "NUXT_PUBLIC_SUPABASE_URL=$url"
  } else {
    $raw = "NUXT_PUBLIC_SUPABASE_URL=$url`r`n" + $raw
  }
  [System.IO.File]::WriteAllText($envPath, $raw, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Set NUXT_PUBLIC_SUPABASE_URL in .env" -ForegroundColor Green
}

$raw = [System.IO.File]::ReadAllText($envPath)
if ($raw -notmatch "NUXT_PUBLIC_SUPABASE_KEY=eyJ") {
  Write-Host "ACTION: Open .env in VS Code and paste your anon key after NUXT_PUBLIC_SUPABASE_KEY=" -ForegroundColor Yellow
  Write-Host "        Supabase → Project Settings → API → anon public" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "ACTION (once): In Supabase → SQL → paste ALL of: supabase\migrations\001_franks_schema.sql → Run" -ForegroundColor Yellow
Write-Host ""

Write-Host "Installing npm packages..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Starting dev server at http://localhost:3000 ..." -ForegroundColor Green
npm run dev