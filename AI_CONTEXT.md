# 🚀 Быстрый Старт - Для AI Assistant

## Контекст Проекта
- **Проект:** MechanicPro - система управления техобслуживанием
- **Деплой:** https://verifed-est.ee ⚠️ **НЕ kontrollitud.ee!**
- **Сервер:** ssh root@kontrollitud.ee (один сервер, два домена)

## Инфраструктура
```
Сервер kontrollitud.ee (физический)
├── Домен 1: kontrollitud.ee → /var/www/kontrollitud.ee/ (ДРУГОЙ проект!)
└── Домен 2: verifed-est.ee → /var/www/mechanic-pro-demo/ (ЭТОТ проект!)
    ├── Backend: Docker контейнер "mechanic-pro-demo" (порт 5005)
    └── Frontend: Nginx контейнер "proxy_app_1" (/var/www/mechanic-pro-demo/frontend/)
```

## Команды Деплоя

### Frontend
```powershell
$env:VITE_API_URL='/api'; npm run build
scp -r dist/* root@kontrollitud.ee:/tmp/frontend-verifed/
ssh root@kontrollitud.ee "docker cp /tmp/frontend-verifed/. proxy_app_1:/var/www/mechanic-pro-demo/frontend/ && rm -rf /tmp/frontend-verifed"
```

### Backend
```powershell
scp -r backend/src backend/package.json backend/tsconfig.json root@kontrollitud.ee:/var/www/mechanic-pro-demo/backend/
ssh root@kontrollitud.ee "cd /var/www/mechanic-pro-demo && docker compose down && docker compose up -d --build"
```

## Файлы Документации
- `DEPLOYMENT_CONFIG.md` - Полная документация деплоя
- `DEPLOYMENT.md` - Общая документация проекта
- `README.md` - Описание проекта

## Ключевые Моменты
1. ✅ Всегда деплоить на **verifed-est.ee**
2. ❌ Никогда не трогать **kontrollitud.ee**
3. 🔑 Логин: admin / admin123
4. 🐳 Backend контейнер: **mechanic-pro-demo**
5. 🌐 Nginx контейнер: **proxy_app_1**
6. 📝 Nginx конфиг: **/data/nginx/proxy_host/2.conf**
