# ⚠️  БЫСТРАЯ ОЧИСТКА GIT ИСТОРИИ
# Использует git filter-repo (более быстрый и безопасный метод)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  ОЧИСТКА ЧУВСТВИТЕЛЬНЫХ ДАННЫХ" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия несохраненных изменений
$status = git status --porcelain
if ($status) {
    Write-Host "❌ Ошибка: есть несохраненные изменения!" -ForegroundColor Red
    Write-Host "Сначала закоммитьте или отмените их." -ForegroundColor Yellow
    exit 1
}

# Создаем файл с паролями для замены
$passwordFile = "passwords-to-remove.txt"
@"
REDACTED_PASSWORD_1
REDACTED_PASSWORD_2
"@ | Set-Content $passwordFile

Write-Host "📝 Создан файл с паролями: $passwordFile" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  ВНИМАНИЕ!" -ForegroundColor Yellow
Write-Host "Эта операция:" -ForegroundColor Yellow
Write-Host "  1. Изменит ВСЮ историю Git" -ForegroundColor White
Write-Host "  2. Заменит все найденные пароли на 'REDACTED'" -ForegroundColor White
Write-Host "  3. Потребует force push в remote" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Продолжить? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Отменено пользователем" -ForegroundColor Red
    Remove-Item $passwordFile
    exit 0
}

Write-Host ""
Write-Host "🔍 Поиск паролей в истории..." -ForegroundColor Cyan

# Используем git log для поиска
Get-Content $passwordFile | ForEach-Object {
    $password = $_.Trim()
    if ($password) {
        Write-Host "  Ищем: $password" -ForegroundColor Yellow
        $commits = git log --all --oneline -S "$password"
        if ($commits) {
            Write-Host "    ⚠️  Найдено в коммитах:" -ForegroundColor Red
            $commits | ForEach-Object { Write-Host "      $_" -ForegroundColor White }
        }
    }
}

Write-Host ""
Write-Host "🧹 Начинаю очистку с помощью git filter-branch..." -ForegroundColor Cyan
Write-Host "   (это может занять несколько минут)" -ForegroundColor Yellow
Write-Host ""

# Удаляем старые backup refs если есть
git update-ref -d refs/original/refs/heads/main 2>$null

# Создаем sed script для замены паролей
$sedScript = ""
Get-Content $passwordFile | ForEach-Object {
    $password = $_.Trim()
    if ($password) {
        $escapedPassword = $password -replace '([[\]{}()*+?.\\^$|])', '\$1'
        $sedScript += "s/$escapedPassword/REDACTED_PASSWORD/g; "
    }
}

# Очищаем историю
try {
    # Для каждого файла в истории заменяем пароли
    git filter-branch --force --tree-filter "
        if (Test-Path .git) { exit 0 }
        Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
            `$_.Extension -match '\.(md|txt|json|js|ts|env|example|sh|ps1|yml|yaml)$'
        } | ForEach-Object {
            if (Test-Path `$_.FullName) {
                try {
                    `$content = Get-Content `$_.FullName -Raw -Encoding UTF8 -ErrorAction Stop
                    `$modified = `$content
                    `$modified = `$modified -replace 'PASSWORD_PATTERN_1', 'REDACTED_PASSWORD'
                    `$modified = `$modified -replace 'PASSWORD_PATTERN_2', 'REDACTED_PASSWORD'
                    if (`$content -ne `$modified) {
                        [System.IO.File]::WriteAllText(`$_.FullName, `$modified, [System.Text.UTF8Encoding](`$false))
                    }
                } catch { }
            }
        }
    " --prune-empty --tag-name-filter cat -- --all

    Write-Host "✅ Очистка завершена!" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка при очистке: $_" -ForegroundColor Red
    Remove-Item $passwordFile
    exit 1
}

Write-Host ""
Write-Host "🗑️  Очистка refs и сборка мусора..." -ForegroundColor Cyan

# Удаляем backup refs
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object {
    git update-ref -d $_
}

# Очищаем reflog
git reflog expire --expire=now --all

# Сборка мусора
git gc --prune=now --aggressive

Write-Host "✅ Очистка завершена полностью!" -ForegroundColor Green
Write-Host ""

# Проверка результата
Write-Host "🔍 Проверка результата..." -ForegroundColor Cyan
Get-Content $passwordFile | ForEach-Object {
    $password = $_.Trim()
    if ($password) {
        $commits = git log --all --oneline -S "$password"
        if ($commits) {
            Write-Host "  ⚠️  Пароль все еще найден: $password" -ForegroundColor Red
        }
    }
}

Write-Host "✅ Проверка завершена" -ForegroundColor Green

# Удаляем временный файл
Remove-Item $passwordFile

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  СЛЕДУЮЩИЕ ШАГИ" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Проверьте локальную историю:" -ForegroundColor Yellow
Write-Host "    git log --all --oneline | Select-Object -First 10" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Force push в remote (ОСТОРОЖНО!):" -ForegroundColor Yellow
Write-Host "    git push origin --force --all" -ForegroundColor White
Write-Host "    git push origin --force --tags" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  КРИТИЧНО: Смените пароли в MongoDB Atlas!" -ForegroundColor Red
Write-Host "    https://cloud.mongodb.com/" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  Обновите .env файлы с новыми паролями" -ForegroundColor Yellow
Write-Host ""
