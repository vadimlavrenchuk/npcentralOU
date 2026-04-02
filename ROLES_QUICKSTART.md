# 🚀 Quick Start - Система ролей и прав доступа

## Быстрый старт (3 минуты)

### 1. Убедитесь что Backend запущен

```bash
cd backend
npm run dev
```

Backend должен работать на `http://localhost:3000`

### 2. Проверьте MongoDB подключение

Убедитесь что MongoDB запущен и подключен через файл `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/npcentral
```

### 3. Запустите Frontend

```bash
npm run dev
```

### 4. Тестируйте роли!

## 📝 Создание тестовых пользователей

### Способ 1: Через Firebase Auth (Рекомендуется)

1. Откройте приложение → `/login`
2. Зарегистрируйте пользователя
3. Backend автоматически создаст User в MongoDB с ролью по умолчанию

**Admin (если настроено в вашей версии):**
- Укажите в коде/конфиге тестовый email владельца или используйте seed + назначение роли `admin` в MongoDB.

**Остальные пользователи:**
- Новые пользователи получают роль `mechanic` по умолчанию
- Измените роль через API (см. ниже)

### Способ 2: Через API напрямую

```bash
# Создать Chief Mechanic
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "chief@example.com",
    "name": "Chief Mechanic",
    "role": "chief_mechanic"
  }'

# Создать Accountant
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "accountant@example.com",
    "name": "Accountant User",
    "role": "accountant"
  }'

# Создать Mechanic
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mechanic@example.com",
    "name": "Mechanic User",
    "role": "mechanic"
  }'
```

### Способ 3: Изменить роль существующего пользователя

```bash
# Получить список пользователей
curl http://localhost:3000/api/users

# Изменить роль (замените USER_ID на реальный _id из MongoDB)
curl -X PATCH http://localhost:3000/api/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -d '{"role": "chief_mechanic"}'
```

## ✅ Проверка функционала

### Тест 1: Admin (учётная запись с ролью admin)

1. Войдите как admin
2. ✅ Видны все разделы в меню
3. ✅ Badge "ADMIN" (красный) в header
4. ✅ Все кнопки доступны

### Тест 2: Chief Mechanic

1. Войдите как chief mechanic
2. ✅ Видны все разделы кроме Settings
3. ✅ Badge "CHIEF MECHANIC" (синий)
4. ✅ Может управлять Inventory, Equipment, Reports, Employees

### Тест 3: Accountant

1. Войдите как accountant
2. ✅ Видны только: Dashboard, Inventory, Reports
3. ✅ Badge "ACCOUNTANT" (зеленый)
4. ❌ Нет кнопок Add/Edit/Delete в Inventory
5. ❌ При попытке открыть /equipment или /work-orders → редирект на /

### Тест 4: Mechanic

1. Войдите как mechanic
2. ✅ Видны: Dashboard, Work Orders, Inventory, Equipment
3. ✅ Badge "MECHANIC" (оранжевый)
4. ❌ Нет кнопок корректировки остатков в Inventory
5. ❌ При попытке открыть /reports или /employees → редирект на /

## 🔍 Проверка защиты маршрутов

Попробуйте вручную ввести URL:

**Как Mechanic:**
```
http://localhost:5173/reports    → редирект на /
http://localhost:5173/employees  → редирект на /
```

**Как Accountant:**
```
http://localhost:5173/work-orders → редирект на /
http://localhost:5173/equipment   → редирект на /
```

## 🎯 Что проверять в UI

### Dashboard
- ✅ Доступен всем ролям

### Work Orders
- ✅ Admin, Chief Mechanic, Mechanic - видят и могут создавать
- ❌ Accountant - не видит в меню

### Inventory
- ✅ Все видят
- ✅ Admin, Chief - кнопки Add/Edit/Delete/Adjust Stock
- ❌ Accountant, Mechanic - только просмотр

### Equipment
- ✅ Admin, Chief, Mechanic - видят
- ❌ Accountant - не видит в меню

### Reports
- ✅ Admin, Chief, Accountant - видят
- ❌ Mechanic - не видит в меню

### Employees
- ✅ Admin, Chief - видят и могут управлять
- ❌ Accountant, Mechanic - не видят в меню

## 🐛 Troubleshooting

### Проблема: Роль не обновляется

**Решение:**
1. Выйдите из системы (Logout)
2. Войдите снова
3. AuthContext автоматически загрузит новую роль из backend

### Проблема: API возвращает 500 ошибку

**Проверьте:**
1. MongoDB запущен
2. Backend подключен к MongoDB
3. Смотрите логи backend в консоли

### Проблема: Пользователь не создается

**Решение:**
1. Проверьте что Firebase Auth успешно создал пользователя
2. Проверьте логи backend - должен быть POST запрос к /api/users
3. Проверьте MongoDB - должен быть документ в коллекции `users`

## 📊 Мониторинг

### Проверить пользователей в MongoDB

```bash
# Через MongoDB Compass или mongosh
use npcentral
db.users.find().pretty()
```

### Проверить через API

```bash
# Получить всех пользователей
curl http://localhost:3000/api/users

# Получить пользователя по email
curl http://localhost:3000/api/users/email/admin@example.com
```

## 🎉 Готово!

Теперь у вас работает полная система ролей:
- ✅ 4 роли с разными правами
- ✅ Автоматический admin
- ✅ Защищенные маршруты
- ✅ Динамическое меню
- ✅ Условные кнопки

## 📚 Документация

Полная документация: [ROLES_AND_PERMISSIONS_COMPLETE.md](./ROLES_AND_PERMISSIONS_COMPLETE.md)
