# =======================================================
#   STRICT ENFORCEMENT ENGINE: VARIABLE RETAIL MARKUP RULES
#   TARGET DOMAIN: B&C PERFORMANCE AUDIO CONTRACT GATEWAYS
#   STRICT ENFORCEMENT: ONLY EXECUTE MATHEMATICAL MARKUPS ON SOURCE DATA
# =======================================================

Clear-Host
Write-Host "=== ENGAGING CATEGORY PROFIT PROTECTION ENFORCEMENT ===" -ForegroundColor Red

# Strict Category Markup Vectors
$computerMarkup = 1.35   # 35% margin tier
$audioMarkup    = 1.55   # 55% margin tier
$marineMarkup   = 1.65   # 65% margin tier

# Exact Wholesale Baseline Costs from Distributor Inventory
$laptopWholesale  = 1499.00
$receiverWholesale = 899.64
$speakersWholesale = 249.30

# Isolated Front-Facing Computation Filters
$laptopRetail   = [math]::Round(($laptopWholesale * $computerMarkup), 2)
$receiverRetail = [math]::Round(($receiverWholesale * $audioMarkup), 2)
$speakersRetail = [math]::Round(($speakersWholesale * $marineMarkup), 2)

Write-Host "-------------------------------------------------------" -ForegroundColor Charcoal
Write-Host "[?] MAPPED: Computers & Workstations Tier Locked" -ForegroundColor Green
Write-Host "    Wholesale Cost Baseline: Hidden" -ForegroundColor Yellow
Write-Host "    Protected MSRP Retail Price Display: `$${laptopRetail}" -ForegroundColor White
Write-Host "-------------------------------------------------------" -ForegroundColor Charcoal
Write-Host "[?] MAPPED: Home Theater & Audio Tier Locked" -ForegroundColor Green
Write-Host "    Wholesale Cost Baseline: Hidden" -ForegroundColor Yellow
Write-Host "    Protected MSRP Retail Price Display: `$${receiverRetail}" -ForegroundColor White
Write-Host "-------------------------------------------------------" -ForegroundColor Charcoal
Write-Host "[?] MAPPED: Marine & Powersports Tier Locked" -ForegroundColor Green
Write-Host "    Wholesale Cost Baseline: Hidden" -ForegroundColor Yellow
Write-Host "    Protected MSRP Retail Price Display: `$${speakersRetail}" -ForegroundColor White
Write-Host "-------------------------------------------------------" -ForegroundColor Charcoal

Write-Host "STATUS: MARKUP RULES ENFORCED. WHOLESALE COSTS SECURELY SHIELDED." -ForegroundColor Emerald
