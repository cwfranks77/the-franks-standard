$ErrorActionPreference = 'Continue'
$bk = Join-Path $env:USERPROFILE 'OneDrive\Laptop-Backup-2026-06-06'
$log = Join-Path $bk 'backup-log.txt'
$removed = @()
$backed = @()
$skipped = @()

function Log($msg) { $msg | Tee-Object -FilePath $log -Append }

function Backup-Then-Remove($src, $destSub) {
    if (-not (Test-Path $src)) { return }
    $dest = Join-Path $bk $destSub
    $name = Split-Path $src -Leaf
    $destPath = Join-Path $dest $name
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    try {
        if (Test-Path $src -PathType Container) {
            robocopy $src $destPath /E /COPY:DAT /R:1 /W:1 /NFL /NDL /NJH /NJS /NC /NS | Out-Null
            if ($LASTEXITCODE -ge 8) { throw "robocopy failed $LASTEXITCODE" }
        } else {
            Copy-Item -Path $src -Destination $destPath -Force
        }
        $srcSize = if (Test-Path $src -PathType Container) {
            (Get-ChildItem $src -Recurse -Force -EA SilentlyContinue | Measure-Object Length -Sum).Sum
        } else { (Get-Item $src).Length }
        $destSize = if (Test-Path $destPath -PathType Container) {
            (Get-ChildItem $destPath -Recurse -Force -EA SilentlyContinue | Measure-Object Length -Sum).Sum
        } else { (Get-Item $destPath).Length }
        if ($srcSize -ne $destSize) { throw "size mismatch src=$srcSize dest=$destSize" }
        Remove-Item $src -Recurse -Force
        $script:backed += $src
        $script:removed += $src
        Log "OK backup+removed: $src"
    } catch {
        $script:skipped += "$src :: $($_.Exception.Message)"
        Log "SKIP: $src :: $($_.Exception.Message)"
    }
}

Log "=== BACKUP START $(Get-Date -Format 'yyyy-MM-dd HH:mm') ==="

# Desktop loose files (not project folders)
$desktopLoose = @(
    'AGENT-MALFUNCTION-REPORT-2026-06-01.md',
    'Antminer Phone URL.txt',
    'AudioDoctor-v1.1.apk',
    'franks-standard-all-work-2026-06-01.txt',
    'FretPilot-debug.apk',
    'PlayConsole-FeatureGraphic.png',
    'PlayConsole-Icon-512.png',
    'TRANSFER-ALL-IN-ONE.cjs',
    'TRANSFER-franks-standard-2026-06-01.txt',
    'zentrafuel_logo_200x200.png',
    'ZENTRAWARE_CMD.txt',
    'ZENTRAWARE_TOMORROW.txt'
)
foreach ($f in $desktopLoose) {
    Backup-Then-Remove (Join-Path $env:USERPROFILE "Desktop\$f") 'Desktop-loose'
}

# Uncertain deploy temp folder
Backup-Then-Remove (Join-Path $env:USERPROFILE 'Desktop\bcpoweraudio-deploy-temp') 'Desktop-folders'

# Project uncertain (NOT deleting .env.local or main repo)
$proj = 'C:\Users\ninja\Desktop\franks-restored'
Backup-Then-Remove (Join-Path $proj 'franks-standard-credentials') 'Project-uncertain\franks-standard-credentials'
$reportScripts = @(
    'cursor-session-clipboard.txt','cursor-work-log.txt','site-state-and-tasks-clipboard.txt',
    'cursor-to-ai-handoff-summary.txt','production-audit-report.txt'
)
foreach ($f in $reportScripts) {
    Backup-Then-Remove (Join-Path $proj "scripts\$f") 'Project-uncertain\scripts-reports'
}
# Keep local copy — site still needs this file; backup only
$sc = Join-Path $proj 'src\content\support-contacts.json'
if (Test-Path $sc) {
    $dest = Join-Path $bk 'Project-uncertain\src-content'
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Copy-Item $sc (Join-Path $dest 'support-contacts.json') -Force
    Log "OK backup-only (kept local): $sc"
}

# Downloads: failed partial (no backup — not a real file)
Get-ChildItem (Join-Path $env:USERPROFILE 'Downloads') -Filter '*.crdownload' -EA SilentlyContinue | ForEach-Object {
    try {
        $sz = [math]::Round($_.Length/1GB, 2)
        Remove-Item $_.FullName -Force
        $removed += $_.FullName
        Log "OK removed failed download ($sz GB): $($_.Name)"
    } catch { Log "SKIP crdownload: $($_.Name)" }
}

# Downloads: old installers / large setup files (re-downloadable)
$dl = Join-Path $env:USERPROFILE 'Downloads'
$installerPatterns = '*.exe','*.msi','*.msixbundle'
Get-ChildItem $dl -File -Include $installerPatterns -EA SilentlyContinue | Where-Object {
    $_.Length -gt 40MB
} | ForEach-Object {
    Backup-Then-Remove $_.FullName 'Downloads-installers'
}

# Large zip archives in downloads
Get-ChildItem $dl -File -Filter '*.zip' -EA SilentlyContinue | Where-Object { $_.Length -gt 50MB } | ForEach-Object {
    Backup-Then-Remove $_.FullName 'Downloads-installers'
}
Get-ChildItem $dl -File -Filter '*.rar' -EA SilentlyContinue | Where-Object { $_.Length -gt 40MB } | ForEach-Object {
    Backup-Then-Remove $_.FullName 'Downloads-installers'
}

Log "=== SUMMARY ==="
Log "Backed up and removed: $($removed.Count) items"
Log "Skipped: $($skipped.Count) items"
$bkSize = (Get-ChildItem $bk -Recurse -Force -EA SilentlyContinue | Measure-Object Length -Sum).Sum
Log ("Backup folder size: {0:N2} GB" -f ($bkSize/1GB))
Log "=== END ==="

Write-Host "Backup folder: $bk"
Write-Host "Backed+removed: $($removed.Count) | Skipped: $($skipped.Count)"
Write-Host ("Backup size: {0:N2} GB" -f ($bkSize/1GB))
