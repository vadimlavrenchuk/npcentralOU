# Firebase Authentication Setup Guide

## 🔥 Интеграция Firebase завершена!

Все компоненты аутентификации успешно добавлены в проект. Теперь осталось только настроить Firebase консоль и добавить ваши данные.

## 📋 Что уже сделано:

✅ Firebase SDK установлен  
✅ AuthContext создан для управления состоянием пользователя  
✅ Страница Login с Glassmorphism дизайном  
✅ Protected Routes - защита маршрутов от неавторизованных пользователей  
✅ Navbar обновлен для отображения аватара и имени из Firebase  
✅ Logout функционал интегрирован  

## 🚀 Как настроить Firebase (5 минут):

### Шаг 1: Создайте проект в Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите **"Add project"** (Добавить проект)
3. Введите имя проекта (например, "npcentralou-app")
4. Следуйте инструкциям (Google Analytics можно отключить)

### Шаг 2: Добавьте Web App

1. На главной странице проекта нажмите значок **</> (Web)**
2. Введите имя приложения (например, "NPCentral Web")
3. Нажмите **"Register app"**
4. **Скопируйте конфигурацию** - вам нужны эти данные:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Шаг 3: Включите Authentication

1. В левом меню выберите **"Build" → "Authentication"**
2. Нажмите **"Get started"**
3. Включите методы входа:
   - **Email/Password** - нажмите "Enable" → Save
   - **Google** - нажмите "Enable" → Save

### Шаг 4: Добавьте конфигурацию в проект

Откройте файл `src/config/firebaseConfig.ts` и замените:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // Замените на ваш
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Шаг 5: Создайте тестового пользователя (опционально)

В Firebase Console → Authentication → Users → Add user:
- Email: test@example.com
- Password: test123456

## 🎨 Что вы получили:

### 1. **Страница Login** (`/login`)
- Стильный Glassmorphism дизайн
- Вход через Email/Password
- Вход через Google
- Регистрация новых пользователей
- Обработка ошибок

### 2. **AuthContext** - глобальное управление аутентификацией
```typescript
import { useAuth } from './context/AuthContext';

const { currentUser, login, logout, signup, loginWithGoogle } = useAuth();
```

### 3. **Protected Routes** - автоматическая защита
- Неавторизованные пользователи → редирект на `/login`
- После входа → редирект на главную

### 4. **User Profile в Header**
- Отображает имя пользователя из Firebase
- Показывает аватар (если загружен в Google)
- Кнопка Logout

## 🔐 Безопасность

⚠️ **ВАЖНО**: Не коммитьте файл `firebaseConfig.ts` с реальными ключами в публичный репозиторий!

Рекомендуется использовать переменные окружения:

1. Создайте файл `.env` в корне проекта:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Обновите `firebaseConfig.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

3. Добавьте `.env` в `.gitignore`

## 🧪 Как протестировать:

1. Запустите приложение:
```bash
npm run dev
```

2. Откройте браузер → приложение перенаправит вас на `/login`

3. Попробуйте:
   - Зарегистрировать нового пользователя
   - Войти через Email/Password
   - Войти через Google
   - Увидеть свое имя и аватар в header
   - Выйти из системы

## 📂 Структура файлов:

```
src/
├── config/
│   └── firebaseConfig.ts          # Firebase конфигурация
├── context/
│   └── AuthContext.tsx            # Auth контекст и хуки
├── components/
│   ├── ProtectedRoute.tsx         # Защита маршрутов
│   └── layout/
│       ├── Navbar.tsx             # Обновлен для Firebase user
│       ├── Navbar.scss            # Стили для avatar
│       └── MainLayout.tsx         # Интегрирован logout
├── pages/
│   └── Login/
│       ├── Login.tsx              # Страница входа
│       └── Login.scss             # Glassmorphism стили
├── router/
│   └── AppRouter.tsx              # Роуты с защитой
└── App.tsx                        # AuthProvider обертка
```

## 🎯 Дополнительные возможности:

### Сброс пароля
Можно добавить функцию восстановления пароля в AuthContext:

```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};
```

### Обновление профиля
Пользователь может обновить имя и фото:

```typescript
import { updateProfile } from 'firebase/auth';

await updateProfile(currentUser, {
  displayName: "Новое Имя",
  photoURL: "https://example.com/photo.jpg"
});
```

### Firebase Rules
Настройте правила безопасности в Firebase Console → Firestore/Storage:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ❓ Troubleshooting

**Проблема**: "Firebase: Error (auth/configuration-not-found)"
- **Решение**: Проверьте, что вы включили Email/Password в Firebase Console

**Проблема**: "Firebase: Error (auth/unauthorized-domain)"
- **Решение**: В Firebase Console → Authentication → Settings → Authorized domains, добавьте ваш домен (localhost уже должен быть там)

**Проблема**: Пользователь перенаправляется на login после входа
- **Решение**: Проверьте, что AuthProvider обернут вокруг роутера в App.tsx

## 🎉 Готово!

Теперь у вас полностью рабочая система аутентификации с Firebase! 

Для вопросов и помощи: [Firebase Documentation](https://firebase.google.com/docs/auth)
