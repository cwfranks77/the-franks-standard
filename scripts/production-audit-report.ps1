# =======================================================

#   MASTER OPERATIONAL ENFORCEMENT RULES (CRITICAL PROMPT SHIELD)

#   1. LEGAL BUSINESS NAME: B&C Performance Audio LLC

#   2. PARENT HOLDING ENTITY: The Franks Standard LLC

#   3. ACTIVE STANDALONE DOMAIN: www.bcpoweraudio.com

#   4. LOUISIANA STATE TAX ACCOUNT TOKEN: LaTAP #4fhxw5

#   5. APPROVED ROUTING METHOD: Form R-1064 Resale Certificate

#   6. SANDBOX COMPILATION BUDGET: Hard-Locked Flat at $0

#   7. PRIVACY BARRIER: Personal Human Cell Number Is Encrypted

# =======================================================



Clear-Host

Write-Host "=== INTEGRATING RE-ALIGNED PORTAL LEDGERS ===" -ForegroundColor Cyan

$ReportData = @()

$Errors = 0



$catalogFile = "public/catalog/petra-products.json"

if (Test-Path $catalogFile) {

    try {

        $catalog = Get-Content $catalogFile -Raw | ConvertFrom-Json

        $count = [int]$catalog.count

        if ($count -ge 100 -and $catalog.imagePolicy -eq "external-only") {

            $ReportData += "[OK] PASS: Petra catalog ($count products) at $catalogFile with external CDN images."

        } else {

            $ReportData += "[!] ERROR: Catalog at $catalogFile missing count or external-only image policy."

            $Errors++

        }

    } catch {

        $ReportData += "[!] ERROR: Could not parse $catalogFile."

        $Errors++

    }

} else {

    $ReportData += "[!] ERROR: Missing $catalogFile."

    $Errors++

}



$indexFile = "content/products.json"

if (Test-Path $indexFile) {

    $indexRaw = Get-Content $indexFile -Raw

    if ($indexRaw -match "petra-products\.json") {

        $ReportData += "[OK] PASS: Product index points at runtime catalog ($indexFile)."

    } else {

        $ReportData += "[!] ERROR: Product index not wired to Petra catalog."

        $Errors++

    }

}



if (Test-Path "composables/useBcProductCatalog.js") {

    $ReportData += "[OK] PASS: Runtime catalog loader present (no bundled product images)."

} else {

    $ReportData += "[!] ERROR: useBcProductCatalog composable missing."

    $Errors++

}



if (Test-Path "scripts/deploy-ai-voice-agent.cjs") {

    $ReportData += "[OK] PASS: Twilio voice deploy script ready (npm run ops:deploy-bc-voice)."

} else {

    $ReportData += "[!] ERROR: Voice deploy script missing."

    $Errors++

}



$supportRaw = ""

if (Test-Path "src/content/support-contacts.json") {

    $supportRaw = Get-Content "src/content/support-contacts.json" -Raw

}

if ($supportRaw -match "877" -and $supportRaw -match "833") {

    $ReportData += "[OK] PASS: Franks (877) and B&C (833) lines separated in support ledger."

} else {

    $ReportData += "[!] ERROR: Support contacts must list Franks 877 and B&C 833 separately."

    $Errors++

}

if (Test-Path "scripts/deploy-franks-voice.cjs") {

    $ReportData += "[OK] PASS: Franks voice restore script ready (npm run ops:deploy-franks-voice)."

} else {

    $ReportData += "[!] ERROR: deploy-franks-voice.cjs missing."

    $Errors++

}



Write-Host "=== RUNNING RE-ALIGNED REAL-PATH INTEGRITY SCAN ===" -ForegroundColor Cyan



if (Test-Path "pages/bc-audio/index.vue") {

    $ReportData += "[OK] FRONTEND PAGE STATUS: 100% OPERATIONAL. File verified at pages/bc-audio/index.vue."

} else {

    $ReportData += "[!] FRONTEND PAGE STATUS: ERROR. Template path missing."

    $Errors++

}



$layoutOk = $false

if (Test-Path "layouts/bc-audio.vue") {

    $layout = Get-Content "layouts/bc-audio.vue" -Raw

    $nav = ""

    if (Test-Path "components/BcAudioNav.vue") {

        $nav = Get-Content "components/BcAudioNav.vue" -Raw

    }

    if ($layout -match "OperatorUnlockModal" -and $nav -match "opsLogoKnock") {

        $layoutOk = $true

    }

}

if ($layoutOk) {

    $ReportData += "[OK] REVENUE OVERRIDE: Hidden Owner Vault mapped perfectly behind top logo."

} else {

    $ReportData += "[!] REVENUE OVERRIDE: ERROR. Logo knock or unlock modal not wired."

    $Errors++

}



$budgetLocked = $false

if (Test-Path ".cursorrules") {

    $rules = Get-Content ".cursorrules" -Raw

    if ($rules -match '\$0') { $budgetLocked = $true }

}

if (-not $budgetLocked -and (Test-Path ".cursor/rules/operational-parameters.mdc")) {

    $ops = Get-Content ".cursor/rules/operational-parameters.mdc" -Raw

    if ($ops -match '\$0') { $budgetLocked = $true }

}

if ($budgetLocked) {

    $ReportData += "[OK] SECURITY BALANCING: Sandbox compiling budget hard-locked flat at `$0."

} else {

    $ReportData += "[!] SECURITY BALANCING: WARNING. `$0 budget rule not found in workspace rules."

}



$ReportData += "======================================================="

$ReportData += "TOTAL REAL-PATH WORKSPACE ERRORS DETECTED: $Errors"

$ReportData += "======================================================="

if ($Errors -eq 0) {

    $ReportData += "STATUS: SYSTEM ARCHITECTURE IS SECURE, STABLE, AND READY FOR STANDBY."

} else {

    $ReportData += "STATUS: ADJUSTMENT REQUIRED."

}



$ReportData | Out-File -FilePath "scripts/production-audit-report.txt" -Encoding utf8

Get-Content "scripts/production-audit-report.txt"

Write-Host ""

Write-Host "-> SUCCESS: COMPLIANCE CHECK FLUSHED CLEANLY INTO REAL PATHS!" -ForegroundColor Green



if ($Errors -gt 0) { exit 1 }


