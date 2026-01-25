# Конфигурация Деплоя

## 🎯 Целевой Домен
**ОСНОВНОЙ ДОМЕН ДЛЯ ДЕПЛОЯ: https://verifed-est.ee**

⚠️ **ВАЖНО:** Не деплоить на kontrollitud.ee - это другой проект!

---

## 📋 Инфраструктура

### Сервер
- **Хост:** kontrollitud.ee (физический сервер)
- **IP:** 65.109.166.160
- **SSH:** `ssh root@kontrollitud.ee`

### Домены на одном сервере
1. **kontrollitud.ee** - ДРУГОЙ проект (НЕ трогать!)
2. **verifed-est.ee** - ЭТОТ проект (MechanicPro)

### Docker Контейнеры
```bash
# Backend контейнер
docker ps | grep mechanic
# Имя: mechanic-pro-demo
# Порт: 0.0.0.0:5005->5000/tcp

# Nginx Proxy Manager
docker ps | grep proxy
# Имя: proxy_app_1
```

---

## 🚀 Процесс Деплоя

### 1. Frontend Деплой

```powershell
# Шаг 1: Сборка frontend с production переменными
$env:VITE_API_URL='/api'
npm run build

# Шаг 2: Загрузка на сервер
scp -r dist/* root@kontrollitud.ee:/tmp/frontend-verifed/

# Шаг 3: Деплой в nginx контейнер
ssh root@kontrollitud.ee "docker exec proxy_app_1 rm -rf /var/www/mechanic-pro-demo/frontend/* && docker cp /tmp/frontend-verifed/. proxy_app_1:/var/www/mechanic-pro-demo/frontend/ && rm -rf /tmp/frontend-verifed"
```

### 2. Backend Деплой

```powershell
# Шаг 1: Загрузка backend кода
scp -r backend/src backend/package.json backend/tsconfig.json root@kontrollitud.ee:/var/www/mechanic-pro-demo/backend/

# Шаг 2: Пересборка контейнера
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose down && docker compose up -d --build"

# Шаг 3 (если нужно): Запуск seed
ssh root@kontrollitud.ee "docker exec mechanic-pro-demo node dist/config/seed.js"
```

---

## 📁 Пути на Сервере

### Frontend (в nginx контейнере)
```
/var/www/mechanic-pro-demo/frontend/
├── assets/
├── index.html
└── vite.svg
```

### Backend (на хосте)
```
/var/www/mechanic-pro-demo/
├── docker-compose.yml
├── Dockerfile
└── backend/
    ├── src/
    ├── package.json
    └── tsconfig.json
```

### Nginx Конфиги (в proxy контейнере)
```
/data/nginx/proxy_host/
├── 1.conf  -> kontrollitud.ee (НЕ трогать!)
└── 2.conf  -> verifed-est.ee (наш проект)
```

---

## 🔧 Конфигурация Nginx (2.conf)

```nginx
server {
  listen 80;
  listen 443 ssl http2;
  server_name verifed-est.ee www.verifed-est.ee;

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/npm-3/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/npm-3/privkey.pem;

  # API requests -> Backend
  location /api/ {
    proxy_pass http://172.17.0.1:5005;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Health endpoint
  location /health {
    proxy_pass http://172.17.0.1:5005;
  }

  # Static frontend
  location / {
    root /var/www/mechanic-pro-demo/frontend;
    try_files $uri $uri/ /index.html;
    index index.html;
  }
}
```

---

## 🔐 Учетные Данные

### Админ панель
- **URL:** https://verifed-est.ee
- **Логин:** admin
- **Пароль:** admin123

### База Данных
- **Тип:** MongoDB Atlas
- **Connection String:** в файле `.env` на сервере

---

## 🧪 Проверка Деплоя

```bash
# 1. Проверка backend
ssh root@kontrollitud.ee "docker logs mechanic-pro-demo --tail 20"

# 2. Проверка API
ssh root@kontrollitud.ee "curl -s http://localhost:5005/health"

# 3. Проверка через nginx
ssh root@kontrollitud.ee "curl -s https://verifed-est.ee/health"

# 4. Проверка login (создать файл login.json локально)
# Содержимое: {"username":"admin","password":"admin123"}
scp login-test.json root@kontrollitud.ee:/tmp/login.json
ssh root@kontrollitud.ee "curl -s -X POST https://verifed-est.ee/api/auth/login -H 'Content-Type: application/json' -d @/tmp/login.json"
```

---

## ❗ Типичные Проблемы

### 404 на /api/auth/login
**Причина:** Старый backend код в контейнере  
**Решение:** Загрузить новый backend код и пересобрать контейнер

### "Неверный логин или пароль"
**Причина:** Пользователь не создан в БД  
**Решение:** `ssh root@kontrollitud.ee "docker exec mechanic-pro-demo node dist/config/seed.js"`

### Frontend показывает старую версию
**Причина:** Кэш браузера  
**Решение:** 
1. Ctrl+Shift+R (жесткая перезагрузка)
2. Очистить кэш браузера
3. Открыть в режиме инкогнито

### Backend не отвечает
**Причина:** Контейнер не запущен  
**Решение:** 
```bash
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose up -d"
```

---

## 💡 Для Новой Сессии с AI

**Скажи AI в начале сессии:**

```
Проект: MechanicPro
Деплой: https://verifed-est.ee (НЕ kontrollitud.ee!)
Сервер: ssh root@kontrollitud.ee
Backend: Docker контейнер mechanic-pro-demo (порт 5005)
Frontend: В nginx контейнере proxy_app_1 (/var/www/mechanic-pro-demo/frontend/)
Nginx конфиг: /data/nginx/proxy_host/2.conf

См. файл DEPLOYMENT_CONFIG.md для деталей.
```

---

## 📝 Быстрые Команды

```bash
# Рестарт backend
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose restart"

# Логи backend
ssh root@kontrollitud.ee "docker logs -f mechanic-pro-demo"

# Проверка контейнеров
ssh root@kontrollitud.ee "docker ps"

# Полный редеплой
npm run build && \
scp -r dist/* root@kontrollitud.ee:/tmp/frontend-verifed/ && \
ssh root@kontrollitud.ee "docker cp /tmp/frontend-verifed/. proxy_app_1:/var/www/mechanic-pro-demo/frontend/ && rm -rf /tmp/frontend-verifed"
```
