# 🔐 Обновление пароля MongoDB на Production сервере

## ✅ Что уже сделано

- [x] Пароль изменен в MongoDB Atlas
- [x] Локальный `backend/.env` обновлен
- [x] Backend локально запустился успешно

## ⚠️ Что нужно сделать

- [ ] Обновить `.env` на production сервере
- [ ] Перезапустить backend контейнер
- [ ] Проверить что всё работает

---

## 🚀 Пошаговая инструкция

### Шаг 1: Подключитесь к серверу

```powershell
ssh root@kontrollitud.ee
```

Или используйте PuTTY/WinSCP если привычнее.

---

### Шаг 2: Откройте .env файл на сервере

```bash
cd /var/www/mechanic-pro-demo
nano .env
```

**Или через WinSCP:**
1. Подключитесь к `kontrollitud.ee`
2. Перейдите в `/var/www/mechanic-pro-demo/`
3. Откройте файл `.env`

---

### Шаг 3: Обновите MongoDB URI

Найдите строку с `MONGO_URI`:

**Старая (скомпрометированная):**
```env
MONGO_URI=mongodb+srv://vadimlavrenchuk:OLD_COMPROMISED_PASSWORD@mechanicpro.wjylube.mongodb.net/...
```

**Новая (замените на вашу):**
```env
MONGO_URI=mongodb+srv://vadimlavrenchuk:NEW_SECURE_PASSWORD@mechanicpro.wjylube.mongodb.net/MechanicPro?retryWrites=true&w=majority&appName=MechanicPro
```

⚠️ **ВАЖНО:** Используйте тот же новый пароль, что и в локальном `backend/.env`!

Если используете nano:
- Ctrl+O для сохранения
- Enter для подтверждения
- Ctrl+X для выхода

---

### Шаг 4: Перезапустите контейнер

```bash
cd /var/www/mechanic-pro-demo
docker compose down
docker compose up -d
```

**Или быстрее (перезапуск без пересборки):**
```bash
docker compose restart
```

---

### Шаг 5: Проверьте логи

```bash
docker logs mechanic-pro-demo --tail 30
```

**Что должны увидеть:**
```
✅ MongoDB Atlas connected successfully
🚀 Server is running on port 5000
```

**Если ошибка:**
```
❌ MongoDB connection failed
```

Значит пароль введен неправильно - повторите Шаг 3.

---

### Шаг 6: Проверьте сайт

Откройте в браузере:
- https://verifed-est.ee
- Попробуйте открыть страницу Inventory
- Данные должны загружаться из MongoDB

---

## 🆘 Альтернативный способ (через команды с локального ПК)

Если не хотите заходить на сервер через SSH:

### Вариант A: Обновить .env удаленно

```powershell
# Создайте временный файл с новым паролем
$newMongoUri = "mongodb+srv://vadimlavrenchuk:YOUR_NEW_PASSWORD_HERE@mechanicpro.wjylube.mongodb.net/MechanicPro?retryWrites=true&w=majority&appName=MechanicPro"

# Обновите .env на сервере
ssh root@kontrollitud.ee "sed -i 's|MONGO_URI=.*|MONGO_URI=$newMongoUri|' /var/www/mechanic-pro-demo/.env"

# Перезапустите контейнер
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose restart"

# Проверьте логи
ssh root@kontrollitud.ee "docker logs mechanic-pro-demo --tail 20"
```

### Вариант B: Через SCP (безопаснее)

```powershell
# 1. Создайте временный .env файл локально
$content = @"
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://vadimlavrenchuk:YOUR_NEW_PASSWORD_HERE@mechanicpro.wjylube.mongodb.net/MechanicPro?retryWrites=true&w=majority&appName=MechanicPro
CORS_ORIGIN=https://verifed-est.ee
"@

Set-Content -Path "temp-production.env" -Value $content

# 2. Загрузите на сервер
scp temp-production.env root@kontrollitud.ee:/var/www/mechanic-pro-demo/.env

# 3. Удалите временный файл
Remove-Item temp-production.env

# 4. Перезапустите контейнер
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose restart"

# 5. Проверьте
ssh root@kontrollitud.ee "docker logs mechanic-pro-demo --tail 20"
```

---

## 📋 Checklist

- [ ] SSH подключение к `kontrollitud.ee` работает
- [ ] Файл `.env` на сервере найден: `/var/www/mechanic-pro-demo/.env`
- [ ] Старый пароль `REDACTED_PASSWORD` заменен на новый
- [ ] Docker контейнер перезапущен
- [ ] В логах видно "MongoDB Atlas connected successfully"
- [ ] Сайт https://verifed-est.ee работает
- [ ] Данные загружаются из базы данных

---

## 🔍 Проверка текущего пароля на сервере

Чтобы узнать какой пароль сейчас на сервере:

```bash
ssh root@kontrollitud.ee "cat /var/www/mechanic-pro-demo/.env | grep MONGO_URI"
```

Если видите старый пароль `REDACTED_PASSWORD` - обязательно обновите!

---

## ⚡ Быстрое решение (копипаста)

Скопируйте и выполните в PowerShell:

```powershell
# === ОБНОВЛЕНИЕ PRODUCTION ПАРОЛЯ ===

# 1. Проверка текущего пароля на сервере
Write-Host "`nТекущий пароль на сервере:" -ForegroundColor Yellow
ssh root@kontrollitud.ee "grep MONGO_URI /var/www/mechanic-pro-demo/.env"

# 2. Ваш новый пароль (замените если другой)
$newPassword = "YOUR_NEW_PASSWORD_HERE"

# 3. Обновление .env
Write-Host "`nОбновляю .env на сервере..." -ForegroundColor Yellow
$newUri = "mongodb+srv://vadimlavrenchuk:$newPassword@mechanicpro.wjylube.mongodb.net/MechanicPro?retryWrites=true&w=majority&appName=MechanicPro"
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && sed -i 's|MONGO_URI=.*|MONGO_URI=$newUri|' .env"

# 4. Перезапуск контейнера
Write-Host "`nПерезапускаю контейнер..." -ForegroundColor Yellow
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose restart"

# 5. Ожидание (контейнер запускается)
Write-Host "`nОжидание 5 секунд..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 6. Проверка логов
Write-Host "`nЛоги контейнера:" -ForegroundColor Green
ssh root@kontrollitud.ee "docker logs mechanic-pro-demo --tail 30"

Write-Host "`nГотово! Проверьте https://verifed-est.ee" -ForegroundColor Green
```

---

## 🎯 Финальная проверка

После обновления откройте:

1. **Backend Health:** https://verifed-est.ee/health
   - Должно вернуть: `{"status":"ok","timestamp":"..."}`

2. **Frontend:** https://verifed-est.ee
   - Страница должна загрузиться

3. **API Test:** https://verifed-est.ee/api/inventory
   - Должны вернуться товары из базы

Если всё работает - **готово!** ✅

---

## 📞 Проблемы?

### Ошибка: "Permission denied (publickey)"
Проблема с SSH ключом. Используйте пароль или настройте SSH ключи.

### Ошибка: "docker: command not found"
Docker не установлен или не в PATH. Проверьте:
```bash
ssh root@kontrollitud.ee "which docker"
```

### Ошибка: "MongoDB connection failed"
Проверьте:
1. Пароль скопирован правильно (без лишних пробелов)
2. Username совпадает: `vadimlavrenchuk`
3. IP сервера в MongoDB Atlas whitelist

---

**Время выполнения:** 3-5 минут  
**Сложность:** Легко  
**Приоритет:** Высокий (но не критичный, т.к. старый пароль уже удален из GitHub)
