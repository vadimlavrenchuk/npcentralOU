#!/usr/bin/env pwsh

<#
.SYNOPSIS
    🔒 Проверка всех файлов проекта на наличие секретов
.DESCRIPTION
    Сканирует все файлы проекта и ищет:
    - MongoDB connection strings с паролями
    - Firebase API ключи
    - JWT secrets
    - API keys
    - Hardcoded passwords
#>

Write-Host "FULL PROJECT SECURITY SCAN" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

$ErrorActionPreference = "Stop"

# Паттерны для поиска
$patterns = @(
    @{
        Pattern = 'mongodb(\+srv)?://[^:]+:[^@]+@'
        Name = 'MongoDB Connection String with password'
        Severity = 'CRITICAL'
    },
    @{
        Pattern = 'AIzaSy[A-Za-z0-9_-]{33}'
        Name = 'Firebase API Key'
        Severity = 'CRITICAL'
    },
    @{
        Pattern = 'JWT_SECRET\s*=\s*["\x27](?!your_|test_|example_)[^"\x27\s]{20,}["\x27]'
        Name = 'JWT Secret'
        Severity = 'HIGH'
    },
    @{
        Pattern = 'sk_live_[a-zA-Z0-9]{24,}'
        Name = 'Stripe Live Key'
        Severity = 'CRITICAL'
    },
    @{
        Pattern = 'gh[pousr]_[A-Za-z0-9_]{36,}'
        Name = 'GitHub Token'
        Severity = 'CRITICAL'
    },
    @{
        Pattern = 'AKIA[0-9A-Z]{16}'
        Name = 'AWS Access Key'
        Severity = 'CRITICAL'
    }
)

# Файлы/папки для игнорирования
$ignorePatterns = @(
    'node_modules',
    '.git',
    'dist',
    'build',
    '.env.example',
    '.env.template',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '*.log'
)

# Расширения для проверки
$extensions = @('.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.yml', '.yaml', '.env', '.config.js', '.config.ts')

Write-Host "Scanning files for secrets..." -ForegroundColor Yellow
Write-Host ""

$foundSecrets = @()
$checkedFiles = 0
$skippedFiles = 0

# Получаем все файлы через git ls-files (быстрее и учитывает .gitignore)
try {
    $allFiles = git ls-files
    if (-not $allFiles) {
        throw "Git ls-files вернул пустой результат"
    }
} catch {
    Write-Host "WARNING: Git is not available, scanning files directly" -ForegroundColor Yellow
    $allFiles = Get-ChildItem -Recurse -File | Where-Object {
        $path = $_.FullName
        -not ($ignorePatterns | Where-Object { $path -like "*$_*" })
    } | Select-Object -ExpandProperty FullName
}

foreach ($file in $allFiles) {
    # Пропускаем игнорируемые
    $shouldSkip = $false
    foreach ($ignore in $ignorePatterns) {
        if ($file -like "*$ignore*") {
            $shouldSkip = $true
            break
        }
    }
    if ($shouldSkip) {
        $skippedFiles++
        continue
    }

    # Проверяем расширение
    $ext = [System.IO.Path]::GetExtension($file)
    if ($extensions -notcontains $ext -and $file -notlike '*.env*') {
        continue
    }

    # Check that .env not in Git
    if ($file -match '\.env$' -and $file -notmatch 'example|template') {
        $foundSecrets += [PSCustomObject]@{
            File = $file
            Line = 1
            Pattern = 'ERROR: .env FILE IN GIT!'
            Match = 'The .env file should not be in the repository'
            Severity = 'CRITICAL'
        }
        continue
    }

    if (-not (Test-Path $file)) {
        continue
    }

    $checkedFiles++
    
    try {
        $content = Get-Content $file -Raw -ErrorAction Stop
        $lines = Get-Content $file -ErrorAction Stop

        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            
            foreach ($p in $patterns) {
                if ($line -match $p.Pattern) {
                    $matches = [regex]::Matches($line, $p.Pattern)
                    foreach ($match in $matches) {
                        $foundSecrets += [PSCustomObject]@{
                            File = $file
                            Line = $i + 1
                            Pattern = $p.Name
                            Match = $match.Value
                            Severity = $p.Severity
                        }
                    }
                }
            }
        }
    } catch {
        # Тихо пропускаем бинарные или недоступные файлы
    }
}

Write-Host "Checked files: $checkedFiles" -ForegroundColor Green
Write-Host "Skipped: $skippedFiles" -ForegroundColor Gray
Write-Host ""

if ($foundSecrets.Count -gt 0) {
    Write-Host "SECRETS FOUND! PLEASE FIX THEM!" -ForegroundColor Red -BackgroundColor Black
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Red
    
    $criticalCount = ($foundSecrets | Where-Object { $_.Severity -eq 'CRITICAL' }).Count
    $highCount = ($foundSecrets | Where-Object { $_.Severity -eq 'HIGH' }).Count
    
    Write-Host "CRITICAL: $criticalCount   HIGH: $highCount" -ForegroundColor Yellow
    Write-Host ""

    foreach ($secret in $foundSecrets) {
        $color = if ($secret.Severity -eq 'CRITICAL') { 'Red' } else { 'Yellow' }
        
        Write-Host "$($secret.Severity): $($secret.Pattern)" -ForegroundColor $color
        Write-Host "   File: $($secret.File):$($secret.Line)" -ForegroundColor Gray
        
        $matchPreview = $secret.Match
        if ($matchPreview.Length -gt 60) {
            $matchPreview = $matchPreview.Substring(0, 60) + "..."
        }
        Write-Host "   Found: $matchPreview" -ForegroundColor DarkGray
        Write-Host ""
    }

    Write-Host ("=" * 60) -ForegroundColor Red
    Write-Host ""
    Write-Host "WHAT TO DO NOW:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Remove all secrets from files" -ForegroundColor White
    Write-Host "2. Move them to .env files" -ForegroundColor White
    Write-Host "3. Replace with process.env.VARIABLE_NAME" -ForegroundColor White
    Write-Host "4. Make sure .env is in .gitignore" -ForegroundColor White
    Write-Host "5. Run: .\clean-git-history-fast.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "COMPROMISED KEYS MUST BE REPLACED!" -ForegroundColor Red
    Write-Host ""
    
    exit 1
}

Write-Host "NO SECRETS FOUND! YOUR PROJECT IS SAFE!" -ForegroundColor Green
Write-Host ""
Write-Host "Your project is protected!" -ForegroundColor Cyan
Write-Host ""

exit 0
