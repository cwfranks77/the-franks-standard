param(
  [string]$EnvFile = '',
  [string]$Repo = 'cwfranks77/the-franks-standard'
)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
function Load-DotEnv($path) {
  if (-not (Test-Path $path)) { return }
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $i = $line.IndexOf('=')
    if ($i -lt 1) { return }
    $k = $line.Substring(0, $i).Trim()
    $v = $line.Substring($i + 1).Trim().Trim('"').Trim("'")
    if ($k) { Set-Item -Path "env:$k" -Value $v }
  }
}
$candidates = @()
if ($EnvFile) { $candidates += $EnvFile }
$candidates += (Join-Path (Get-Location) '.env')
$candidates += 'C:\Users\ninja\OneDrive\Documents\ZentraMeshNative\token\.env'
foreach ($p in $candidates) {
  if ($p -and (Test-Path $p)) { Load-DotEnv $p; Write-Host "Loaded $p"; break }
}
$required = @('X_API_KEY','X_API_SECRET','X_ACCESS_TOKEN','X_ACCESS_SECRET')
foreach ($name in $required) {
  $val = [Environment]::GetEnvironmentVariable($name)
  if (-not $val -or $val.Length -lt 8) { Write-Error "Missing $name"; exit 1 }
  $val | gh secret set $name --repo $Repo
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "OK: $name"
}
Write-Host 'Done. X secrets updated on GitHub.'