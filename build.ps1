# God Complex Foundry System - Build Script
# Usage: .\build.ps1 [-Version <version>] [-SkipZip]

param(
    [string]$Version = "",
    [switch]$SkipZip
)

$ErrorActionPreference = "Stop"

# Get current version from system.json
$systemJson = Get-Content "system.json" | ConvertFrom-Json
$currentVersion = $systemJson.version

# If no version specified, prompt for next version
if (-not $Version) {
    Write-Host "Current version: $currentVersion" -ForegroundColor Cyan
    Write-Host "Enter new version (or press Enter to keep $currentVersion): " -ForegroundColor Yellow -NoNewline
    $Version = Read-Host
    if (-not $Version) { $Version = $currentVersion }
}

Write-Host "Building version $Version..." -ForegroundColor Green

# Update version in system.json
if ($Version -ne $currentVersion) {
    $systemJson.version = $Version
    $systemJson | ConvertTo-Json -Depth 10 | Set-Content "system.json" -Encoding UTF8
    Write-Host "Updated system.json to version $Version" -ForegroundColor Green
}

# Create build directory
$buildDir = "build"
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
}
New-Item -ItemType Directory -Path $buildDir | Out-Null

# Files to include in the build
$includeFiles = @(
    "system.json",
    "template.json",
    "module",
    "templates",
    "styles",
    "languages",
    "macros",
    "data"
)

# Copy files to build directory
foreach ($item in $includeFiles) {
    $source = Join-Path $PWD $item
    $dest = Join-Path $buildDir $item
    if (Test-Path $source) {
        if ((Get-Item $source).PSIsContainer) {
            Copy-Item -Recurse -Force $source $dest
        } else {
            Copy-Item -Force $source $dest
        }
        Write-Host "  Copied: $item" -ForegroundColor Gray
    }
}

if (-not $SkipZip) {
    # Create zip file
    $zipName = "godcomplex-$Version.zip"
    $zipPath = Join-Path $PWD $zipName
    
    if (Test-Path $zipPath) {
        Remove-Item -Force $zipPath
    }
    
    # Compress build directory to zip
    Compress-Archive -Path (Join-Path $buildDir "*") -DestinationPath $zipPath -Force
    Write-Host ""
    Write-Host "Created: $zipPath" -ForegroundColor Green
    Write-Host "Size: $([math]::Round((Get-Item $zipPath).Length / 1KB, 2)) KB" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test the build locally by installing the zip in Foundry" -ForegroundColor White
Write-Host "  2. Commit changes: git add -A && git commit -m 'release: v$Version'" -ForegroundColor White
Write-Host "  3. Tag the release: git tag -a v$Version -m 'Version $Version'" -ForegroundColor White
Write-Host "  4. Push to GitHub: git push origin main --tags" -ForegroundColor White
Write-Host "  5. Create GitHub release with the zip file attached" -ForegroundColor White
Write-Host ""
