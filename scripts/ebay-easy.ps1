# Opens eBay for the "save page + upload" flow — no developer account needed.
$search = 'https://www.ebay.com/sch/i.html?_nkw=sports+cards+PSA&_sacat=2536&_ipg=120&rt=nc'
$import = 'https://thefranksstandard.com/sell/import'
$prospects = 'https://thefranksstandard.com/ops/ebay-prospects'

Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.MessageBox]::Show(
@'
THE FRANKS STANDARD — eBay (no developer account)

FIND SELLERS TO RECRUIT:
1) eBay search opens in your browser — scroll 2 pages
2) Press Ctrl+S → save as "Webpage, HTML only"
3) Open thefranksstandard.com → 5-tap logo → ops password
4) eBay seller skim → upload that HTML file

IMPORT YOUR OWN LISTINGS:
1) Same save on YOUR eBay store page
2) sell/import → upload HTML  OR  upload CSV from Seller Hub

Developer API is optional. This works today.
'@,
  'eBay easy mode',
  [System.Windows.Forms.MessageBoxButtons]::OK
) | Out-Null

Start-Process $search
Start-Sleep -Seconds 1
Start-Process $prospects
Write-Host 'Opened eBay search + ops prospect page.' -ForegroundColor Green
