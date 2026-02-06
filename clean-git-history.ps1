# Git History Cleanup Script
# Удаляет чувствительные данные из всей истории Git

Write-Host "⚠️  ВНИМАНИЕ: Эта операция изменит историю Git!" -ForegroundColor Yellow
Write-Host "Убедитесь, что у вас есть резервная копия." -ForegroundColor Yellow
Write-Host ""
Read-Host "Нажмите Enter для продолжения или Ctrl+C для отмены"

# Создаем резервную копию
Write-Host "`n📦 Создание резервной копии..." -ForegroundColor Cyan
$backupName = "backup-before-cleanup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
git tag $backupName
Write-Host "✅ Резервная копия создана: $backupName" -ForegroundColor Green

# Список паролей для удаления
$passwords = @(
    "REDACTED_PASSWORD"
    "REDACTED_PASSWORD"
)

Write-Host "`n🧹 Очистка истории Git..." -ForegroundColor Cyan

# Используем git filter-branch для замены паролей
foreach ($password in $passwords) {
    Write-Host "  Удаление: $password" -ForegroundColor Yellow
    
    # Создаем sed-подобную команду для PowerShell
    $escapedPassword = [regex]::Escape($password)
    
    git filter-branch --force --tree-filter "
        Get-ChildItem -Recurse -File | ForEach-Object {
            if (Test-Path `$_.FullName) {
                `$content = Get-Content `$_.FullName -Raw -ErrorAction SilentlyContinue
                if (`$content) {
                    `$newContent = `$content -replace '$escapedPassword', 'REDACTED_PASSWORD'
                    if (`$content -ne `$newContent) {
                        Set-Content -Path `$_.FullName -Value `$newContent -NoNewline
                    }
                }
            }
        }
    " --prune-empty --tag-name-filter cat -- --all
}

# Очистка refs и сборка мусора
Write-Host "`n🗑️  Очистка ссылок и сборка мусора..." -ForegroundColor Cyan
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object { git update-ref -d $_ }
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "`n✅ История Git очищена!" -ForegroundColor Green
Write-Host "`n⚠️  ВАЖНО: Теперь нужно:" -ForegroundColor Yellow
Write-Host "1. Проверить, что все работает: git log --all -p -S 'REDACTED_PASSWORD'" -ForegroundColor White
Write-Host "2. Force push в remote: git push origin --force --all" -ForegroundColor White
Write-Host "3. Force push тегов: git push origin --force --tags" -ForegroundColor White
Write-Host "`n   ⚠️  Это удалит старую историю на GitHub!" -ForegroundColor Red
Write-Host "`n4. Сменить пароли в MongoDB Atlas НЕМЕДЛЕННО!" -ForegroundColor Red
