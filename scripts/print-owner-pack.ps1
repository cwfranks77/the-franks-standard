# Opens the owner print pack in your default browser with print dialog.
# Choose your HP printer in the dialog (same network as this PC).
$base = if ($env:NUXT_PUBLIC_SITE_URL) { $env:NUXT_PUBLIC_SITE_URL.TrimEnd('/') } else { 'https://thefranksstandard.com' }
$url = "$base/ops/print/pack?print=1"
Write-Host "Opening print pack: $url"
Write-Host ""
Write-Host "HP printers on this PC:"
Get-Printer -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'HP|hewlett' } | Format-Table Name, PrinterStatus, PortName -AutoSize
if (-not (Get-Printer -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'HP|hewlett' })) {
  Write-Host "(No HP printer name found — check Settings > Printers or use any installed printer in the browser dialog.)"
}
Start-Process $url
