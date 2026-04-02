# JWT Authentication System - Implementation Complete

## Описание изменений

Система полностью переведена с Firebase Google Auth на локальную JWT авторизацию.

## 🔐 Безопасность

### Backend
- JWT токены для авторизации (срок жизни: 7 дней)
- Пароли хешируются с bcrypt (salt rounds: 10)
- Все API маршруты защищены middleware аутентификации
- Role-based access control (RBAC)

### Модель User
```typescript
{
  username: string (уникальный, lowercase)
  password: string (хеш bcrypt)
  name: string
  role: UserRole (admin | chief_mechanic | accountant | mechanic)
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 📋 API Endpoints

### Авторизация (публичные)
- `POST /api/auth/login` - Вход по username/password
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Получить текущего пользователя (требует токен)

### Управление пользователями (только admin)
- `GET /api/users` - Список всех пользователей
- `POST /api/users` - Создать пользователя
- `PATCH /api/users/:id` - Обновить пользователя
- `PATCH /api/users/:id/role` - Изменить роль
- `PATCH /api/users/:id/toggle-status` - Заблокировать/разблокировать
- `DELETE /api/users/:id` - Удалить пользователя

## 🎯 Дефолтный администратор

При первом запуске seed скрипта создаётся пользователь-администратор (логин/пароль см. в `backend/src/config/seed.ts` и в выводе `npm run seed`).

**⚠️ ВАЖНО:** Смените пароль после первого входа; не копируйте дефолтные значения в документацию для продакшена.

## 🚀 Запуск

### Пересоздать базу с дефолтным админом
```bash
cd backend
npm run seed
```

### Запуск backend
```bash
cd backend
npm run dev
```

### Запуск frontend
```bash
npm run dev
```

## 🎨 Frontend

### Страница входа
- Простая форма username/password
- Нет самостоятельной регистрации
- Сообщение: "Для получения доступа обратитесь к администратору"

### Админ-панель `/user-management`
Доступна только для роли `admin`:
- ✅ Создание новых пользователей
- ✅ Изменение роли (Admin, Chief Mechanic, Accountant, Mechanic)
- ✅ Блокировка/разблокировка аккаунтов
- ✅ Удаление пользователей
- 🔒 Защита от удаления/блокировки собственного аккаунта

## 🔑 JWT Токены

### Хранение
- Токены хранятся в `localStorage` под ключом `auth_token`
- Автоматически добавляются в заголовок `Authorization: Bearer <token>`

### Проверка токенов
- Backend middleware проверяет токен на каждом защищенном маршруте
- При невалидном токене - перенаправление на `/login`
- При заблокированном аккаунте - ошибка 403

## 🛡️ Permissions

Добавлено новое разрешение:
- `canManageUsers: boolean` - Только для admin, доступ к `/user-management`

## 📝 Что было удалено

- ❌ Firebase SDK и конфигурация
- ❌ Google Sign-In
- ❌ Firebase UID в модели User
- ❌ Автоматическая регистрация пользователей
- ❌ Email поле (заменено на username)

## 🎓 Использование

### Создание нового пользователя (через API)
```bash
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "mechanic1",
  "password": "securepass123",
  "name": "Иван Механик",
  "role": "mechanic"
}
```

### Вход
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "<пароль из вывода seed, только для dev>"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "username": "admin",
    "name": "Administrator",
    "role": "admin",
    "isActive": true
  }
}
```

## ⚙️ Environment Variables

Добавьте в `.env` (опционально):
```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

По умолчанию:
- JWT_SECRET: 'your-secret-key-change-in-production'
- JWT_EXPIRES_IN: '7d'

## 🔒 Безопасные практики

1. ✅ Новые пользователи создаются только админом
2. ✅ Пароли хешируются, не хранятся в открытом виде
3. ✅ JWT токены имеют срок действия
4. ✅ Заблокированные пользователи не могут войти
5. ✅ Все API защищены аутентификацией
6. ✅ CORS настроен правильно

## 📦 Новые зависимости

Backend:
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cookie-parser": "^1.4.6",
  "@types/bcryptjs": "^2.4.6",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/cookie-parser": "^1.4.6"
}
```

## ✅ Тестирование

1. Запустите seed: `npm run seed`
2. Войдите с учётными данными из вывода `npm run seed` (локально)
3. Создайте тестового пользователя через `/user-management`
4. Выйдите и войдите под новым пользователем
5. Проверьте блокировку аккаунта

## 🎉 Готово!

Система полностью готова к использованию. Все пользователи управляются через админ-панель.
