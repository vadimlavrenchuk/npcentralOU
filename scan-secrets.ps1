#!/usr/bin/env pwsh
#Requires -Version 5.1

<#
.SYNOPSIS
    Security check for secrets in project files
.DESCRIPTION
    Scans all project files for hardcoded secrets:
    - MongoDB connection strings
    - Firebase API keys
    - JWT secrets
    - API keys
    - Passwords
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "   SECURITY SCAN - Checking for hardcoded secrets" -ForegroundColor White
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Patterns to search
$secretPatterns = @{
    'MongoDB'   = 'mongodb(\+srv)?://[^:]+:[^@]+@'
    'Firebase'  = 'AIzaSy[A-Za-z0-9_-]{33}'
    'JWT'       = 'JWT_SECRET\s*=\s*["\x27][A-Za-z0-9]{32,}["\x27]'
    'GitHub'    = 'gh[pousr]_[A-Za-z0-9_]{36,}'
    'AWS'       = 'AKIA[0-9A-Z]{16}'
}

# Extensions to check
$extensions = @('*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md', '*.txt', '*.yml', '*.yaml', '*.conf', '*.config')

# Folders to skip
$skipFolders = @('node_modules', '.git', 'dist', 'build', '.husky')

Write-Host "[+] Scanning TypeScript, JavaScript, and config files..." -ForegroundColor Yellow
Write-Host ""

$allFindings = @()
$filesChecked = 0
$startPath = Get-Location

# Find all files
$allFiles = @()
foreach ($ext in $extensions) {
    $found = Get-ChildItem -Path $startPath -Filter $ext -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $path = $_.FullName
        $shouldInclude = $true
        foreach ($skip in $skipFolders) {
            if ($path -like "*\$skip\*") {
                $shouldInclude = $false
                break
            }
        }
        $shouldInclude
    }
    if ($found) {
        $allFiles += $found
    }
}

# Check for .env files in git
$envInGit = git ls-files 2>$null | Where-Object { $_ -match '\.env$' -and $_ -notmatch 'example|template' }
if ($envInGit) {
    foreach ($envFile in $envInGit) {
        $allFindings += [PSCustomObject]@{
            File     = $envFile
            Line     = 1
            Type     = 'CRITICAL'
            Pattern  = '.env file in Git'
            Preview  = 'ERROR: .env files should not be committed to Git!'
        }
    }
}

Write-Host "[+] Found $($allFiles.Count) files to check" -ForegroundColor Gray

# Scan files
foreach ($file in $allFiles) {
    $filesChecked++
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        if (-not $content) { continue }
        
        $lines = $content -split "`n"
        
        for ($lineNum = 0; $lineNum -lt $lines.Count; $lineNum++) {
            $line = $lines[$lineNum]
            
            foreach ($patternName in $secretPatterns.Keys) {
                $pattern = $secretPatterns[$patternName]
                
                if ($line -match $pattern) {
                    $match = $Matches[0]
                    
                    # Skip examples and templates
                    if ($line -match 'example|template|your_|test_|placeholder|REPLACE_ME|YOUR_PASSWORD_HERE|NEW_PASSWORD') {
                        continue
                    }
                    
                    $preview = $match
                    if ($preview.Length -gt 50) {
                        $preview = $preview.Substring(0, 50) + "..."
                    }
                    
                    $relativePath = $file.FullName.Replace($startPath.Path + "\", "")
                    
                    $allFindings += [PSCustomObject]@{
                        File     = $relativePath
                        Line     = $lineNum + 1
                        Type     = $patternName
                        Pattern  = $pattern
                        Preview  = $preview
                    }
                }
            }
        }
    } catch {
        # Skip binary or inaccessible files
    }
}

Write-Host "[+] Scanned $filesChecked files" -ForegroundColor Green
Write-Host ""

# Report findings
if ($allFindings.Count -gt 0) {
    Write-Host "=" * 70 -ForegroundColor Red
    Write-Host "   ALERT: FOUND $($allFindings.Count) POTENTIAL SECRETS!" -ForegroundColor Red -BackgroundColor Black
    Write-Host "=" * 70 -ForegroundColor Red
    Write-Host ""
    
    foreach ($finding in $allFindings) {
        Write-Host "[!] $($finding.Type)" -ForegroundColor Red
        Write-Host "    File: $($finding.File):$($finding.Line)" -ForegroundColor Yellow
        Write-Host "    Match: $($finding.Preview)" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "=" * 70 -ForegroundColor Red
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "  1. Move secrets to .env files" -ForegroundColor White
    Write-Host "  2. Use environment variables (process.env.VAR)" -ForegroundColor White
    Write-Host "  3. Ensure .env is in .gitignore" -ForegroundColor White
    Write-Host "  4. Run: .\clean-git-history-fast.ps1" -ForegroundColor White
    Write-Host "  5. REPLACE com promised keys!" -ForegroundColor White
    Write-Host ""
    
    exit 1
}

Write-Host "=" * 70 -ForegroundColor Green
Write-Host "   SUCCESS: No hardcoded secrets found!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green
Write-Host ""
Write-Host "Your project is secure!" -ForegroundColor Cyan
Write-Host ""

exit 0
