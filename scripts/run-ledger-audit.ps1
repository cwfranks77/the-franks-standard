# =======================================================
#   MASTER OPERATIONAL ENFORCEMENT RULES (CRITICAL PROMPT SHIELD)
#   1. LEGAL BUSINESS NAME: B&C Performance Audio LLC
#   2. PARENT HOLDING ENTITY: The Franks Standard LLC
#   3. ACTIVE STANDALONE DOMAIN: ://bcpoweraudio.com
#   4. LOUISIANA STATE TAX ACCOUNT TOKEN: LaTAP #4fhxw5
#   5. APPROVED ROUTING METHOD: Form R-1064 Resale Certificate
#   6. SANDBOX COMPILATION BUDGET: Hard-Locked Flat at $0
#   7. PRIVACY BARRIER: Personal Human Cell Number Is Encrypted
# =======================================================

Clear-Host
Write-Host "=== THE FRANKS STANDARD AUTOMATED INVENTORY LEDGER ===" -ForegroundColor Cyan
if (Test-Path "src/content/antique-ledger.json") {
    $items = Get-Content "src/content/antique-ledger.json" -Raw | ConvertFrom-Json
    $totalCost = 0; $totalSales = 0; $totalTax = 0; $totalReserve = 0
    foreach ($item in $items) {
        $profit = $item.sale_price - $item.purchase_price
        $totalCost += $item.purchase_price
        $totalSales += $item.sale_price
        $totalTax += $item.collected_sales_tax
        $totalReserve += $item.income_tax_reserve
        Write-Host "-------------------------------------------------------" -ForegroundColor Gray
        Write-Host "ITEM: $($item.title)" -ForegroundColor Yellow
        Write-Host ("  [OK] Cost basis: `${0:N2} | Sold for: `${1:N2}" -f $item.purchase_price, $item.sale_price) -ForegroundColor White
        Write-Host ("  [OK] Net Profit: `${0:N2}" -f $profit) -ForegroundColor Green
        Write-Host ("  [->] Route to Account 5 (Sales Tax): `${0:N2}" -f $item.collected_sales_tax) -ForegroundColor Cyan
        Write-Host ("  [->] Route to Account 6 (Income Cushion): `${0:N2}" -f $item.income_tax_reserve) -ForegroundColor Cyan
    }
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host "MASTER MARGIN ACCOUNTING SUMMARY:" -ForegroundColor White
    Write-Host ("  TOTAL INVENTORY INVESTMENT COST: `${0:N2}" -f $totalCost) -ForegroundColor White
    Write-Host ("  TOTAL GROSS RETAIL REVENUE:      `${0:N2}" -f $totalSales) -ForegroundColor Green
    Write-Host ("  CRITICAL SALES TAX LIABILITY:    `${0:N2}" -f $totalTax) -ForegroundColor Red
    Write-Host ("  CRITICAL INCOME CUSHION RESERVE: `${0:N2}" -f $totalReserve) -ForegroundColor Red
    Write-Host "=======================================================" -ForegroundColor Cyan
} else {
    Write-Host "[!] ERROR: Antique ledger database file missing." -ForegroundColor Red
}
