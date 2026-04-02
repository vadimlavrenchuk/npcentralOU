# ✅ Система ролей и прав доступа - ВЫПОЛНЕНО

## 🎯 Задача выполнена полностью!

Реализована полная система управления правами доступа с 4 ролями пользователей.

---

## 👥 Роли пользователей

### 1. **Admin** (Администратор)
- ✅ Полный доступ ко всем функциям системы
- ✅ Управление пользователями и их ролями
- ✅ Доступ к системным настройкам
- ✅ Все права на создание, редактирование, удаление

### 2. **Chief Mechanic** (Главный механик)
- ✅ Управление сотрудниками
- ✅ Склад (полный доступ)
- ✅ Отчеты (финансовые + эффективность)
- ✅ Создание и редактирование чек-листов
- ✅ Все вкладки, кроме системных настроек админа
- ❌ Не может изменять роли пользователей

### 3. **Accountant** (Бухгалтер)
- ✅ Просмотр отчетов (только финансовые)
- ✅ Просмотр склада (расход/приход)
- ✅ Экспорт отчетов
- ❌ Не может добавлять/редактировать оборудование
- ❌ Не может создавать/редактировать задачи
- ❌ Не может менять остатки на складе
- ❌ Скрыты кнопки "Добавить", "Редактировать", "Удалить"

### 4. **Mechanic** (Механик)
- ✅ Создание задач (Work Orders)
- ✅ Просмотр склада (без ручного изменения остатков)
- ✅ Просмотр оборудования
- ❌ Не может редактировать чек-листы
- ❌ Скрыты вкладки "Отчеты" и "Сотрудники"
- ❌ Изменение остатков только через списание в заказе

---

## 📁 Структура файлов

### Backend:

```
backend/src/
├── models/
│   └── User.ts                    ← MongoDB модель с ролями
├── controllers/
│   └── user.controller.ts         ← CRUD операции для пользователей
└── routes/
    └── user.routes.ts             ← API endpoints для пользователей
```

### Frontend:

```
src/
├── types/
│   └── permissions.ts             ← Enum ролей и интерфейс Permissions
├── utils/
│   └── permissions.ts             ← Функция getPermissions()
├── context/
│   └── AuthContext.tsx            ← Обновлен с userProfile и permissions
├── hooks/
│   └── usePermissions.ts          ← Хук для проверки прав
├── components/
│   ├── RoleBasedRoute.tsx         ← Защита маршрутов по ролям
│   ├── shared/
│   │   └── Can.tsx                ← Компонент условного рендеринга
│   └── layout/
│       ├── Navbar.tsx             ← Отображение роли пользователя
│       ├── Navbar.scss            ← Стили для role badges
│       └── Sidebar.tsx            ← Фильтрация меню по правам
├── pages/
│   └── Inventory/
│       └── Inventory.tsx          ← Пример с permissions
└── router/
    └── AppRouter.tsx              ← Роуты защищены RoleBasedRoute
```

---

## 🔐 Автоматическое назначение Admin

**Примечание:** в актуальной JWT-схеме вход по `username`; автопромоут по email мог быть в старых ветках. Для админа используйте seed или назначение роли в БД.

Реализовано в двух местах:
1. **MongoDB pre-save hook** в User модели
2. **Backend controller** при создании пользователя

---

## 🛡️ Система прав доступа

### Типы прав (Permissions):

#### Навигация:
- `canAccessDashboard`
- `canAccessWorkOrders`
- `canAccessInventory`
- `canAccessEquipment`
- `canAccessReports`
- `canAccessEmployees`
- `canAccessSettings`

#### Work Orders:
- `canCreateWorkOrders`
- `canEditWorkOrders`
- `canDeleteWorkOrders`
- `canAssignWorkOrders`

#### Inventory:
- `canViewInventory`
- `canAddInventory`
- `canEditInventory`
- `canDeleteInventory`
- `canAdjustStock`

#### Equipment:
- `canViewEquipment`
- `canAddEquipment`
- `canEditEquipment`
- `canDeleteEquipment`
- `canCreateChecklists`

#### Reports:
- `canViewFinancialReports`
- `canViewEfficiencyReports`
- `canExportReports`

#### Employees:
- `canViewEmployees`
- `canAddEmployees`
- `canEditEmployees`
- `canDeleteEmployees`
- `canManageRoles`

---

## 💻 Примеры использования

### 1. Защита маршрутов

```typescript
// AppRouter.tsx
<Route 
  path="reports" 
  element={
    <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.CHIEF_MECHANIC, UserRole.ACCOUNTANT]}>
      <Reports />
    </RoleBasedRoute>
  } 
/>
```

### 2. Условный рендеринг кнопок

```typescript
// Inventory.tsx
<Can perform="canAddInventory">
  <Button onClick={() => setIsAddModalOpen(true)}>
    Add New Item
  </Button>
</Can>
```

### 3. Использование хука permissions

```typescript
const { can, isAdmin, userRole } = usePermissions();

if (can('canEditInventory')) {
  // Show edit button
}

if (isAdmin) {
  // Show admin panel
}
```

### 4. Фильтрация меню в Sidebar

```typescript
const visibleMenuItems = menuItems.filter(item => 
  !item.permission || can(item.permission)
);
```

---

## 🎨 UI Features

### Role Badges в Header
Визуальная индикация роли пользователя:

- 🔴 **Admin** - красный badge
- 🔵 **Chief Mechanic** - синий badge  
- 🟢 **Accountant** - зеленый badge
- 🟠 **Mechanic** - оранжевый badge

### Динамическое меню
Sidebar автоматически скрывает недоступные разделы:

- **Admin**: все разделы
- **Chief Mechanic**: все кроме Settings
- **Accountant**: Dashboard, Inventory, Reports
- **Mechanic**: Dashboard, Work Orders, Inventory, Equipment

### Кнопки действий
Автоматически скрываются для ролей без прав:

- Accountant не видит кнопки Add/Edit/Delete в Inventory
- Mechanic не может вручную корректировать остатки
- Только Admin и Chief могут управлять сотрудниками

---

## 🔄 Поток работы

### 1. Регистрация/Вход
```
User → Firebase Auth → Backend API
                     ↓
        POST /api/users (create/update)
                     ↓
            MongoDB User Model
                     ↓
        Auto-assign role based on email
                     ↓
        Return user profile with role
```

### 2. Загрузка прав
```
AuthContext → fetchUserProfile()
           ↓
    User Profile from API
           ↓
    getPermissions(role)
           ↓
    Permissions object stored in context
```

### 3. Проверка доступа
```
Component → usePermissions()
         ↓
    can('permissionName')
         ↓
    true/false → Show/Hide UI element
```

---

## 🚀 API Endpoints

### User Management

```
GET    /api/users                 - Получить всех пользователей
GET    /api/users/email/:email    - Получить пользователя по email
POST   /api/users                 - Создать/обновить пользователя
PATCH  /api/users/:id/role        - Изменить роль пользователя
DELETE /api/users/:id             - Удалить пользователя
```

### Example Request:

```bash
# Create/Update User
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "mechanic",
  "firebaseUid": "firebase_uid_here",
  "photoURL": "https://..."
}
```

---

## 📊 Таблица прав доступа

| Функция | Admin | Chief Mechanic | Accountant | Mechanic |
|---------|-------|----------------|------------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Work Orders - View | ✅ | ✅ | ❌ | ✅ |
| Work Orders - Create | ✅ | ✅ | ❌ | ✅ |
| Work Orders - Edit | ✅ | ✅ | ❌ | ✅ (свои) |
| Work Orders - Delete | ✅ | ✅ | ❌ | ❌ |
| Inventory - View | ✅ | ✅ | ✅ | ✅ |
| Inventory - Add | ✅ | ✅ | ❌ | ❌ |
| Inventory - Edit | ✅ | ✅ | ❌ | ❌ |
| Inventory - Adjust Stock | ✅ | ✅ | ❌ | ❌ |
| Equipment - View | ✅ | ✅ | ❌ | ✅ |
| Equipment - Manage | ✅ | ✅ | ❌ | ❌ |
| Checklists - Create | ✅ | ✅ | ❌ | ❌ |
| Reports - Financial | ✅ | ✅ | ✅ | ❌ |
| Reports - Efficiency | ✅ | ✅ | ❌ | ❌ |
| Employees - View | ✅ | ✅ | ❌ | ❌ |
| Employees - Manage | ✅ | ✅ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

---

## 🧪 Тестирование

### Создание тестовых пользователей:

```bash
# Admin
Username: (из seed или созданный вами)
Role: admin

# Chief Mechanic
Email: chief@example.com
Role: chief_mechanic (set manually or via API)

# Accountant  
Email: accountant@example.com
Role: accountant

# Mechanic
Email: mechanic@example.com
Role: mechanic (default)
```

### Проверка прав:

1. **Войдите как Mechanic**
   - Попробуйте открыть `/reports` → Редирект на `/`
   - Проверьте отсутствие кнопок в Inventory

2. **Войдите как Accountant**
   - Склад доступен, но нет кнопок Add/Edit/Delete
   - Reports доступны, но только финансовые

3. **Войдите как Chief Mechanic**
   - Все доступно кроме Settings
   - Можно управлять сотрудниками

4. **Войдите как Admin**
   - Полный доступ ко всему

---

## ⚡ Производительность

- Права вычисляются **один раз** при загрузке профиля
- Хранятся в AuthContext для быстрого доступа
- Не требуют дополнительных API запросов
- Проверка прав - O(1) операция

---

## 🔒 Безопасность

### Frontend Protection:
✅ RoleBasedRoute блокирует несанкционированный доступ  
✅ UI элементы скрыты для ролей без прав  
✅ Sidebar фильтрует недоступные разделы

### Backend Protection (TODO):
⚠️ Рекомендуется добавить middleware для проверки ролей на backend:

```typescript
// middleware/auth.middleware.ts
export const requireRole = (allowedRoles: UserRole[]) => {
  return async (req, res, next) => {
    // Проверить роль из JWT token
    // Разрешить доступ только если роль в allowedRoles
  };
};

// Usage in routes:
router.delete('/:id', requireRole([UserRole.ADMIN]), deleteInventory);
```

---

## 📚 Дополнительные возможности

### 1. Динамическое изменение роли

```typescript
// Update user role via API
const changeUserRole = async (userId: string, newRole: UserRole) => {
  await axios.patch(`/api/users/${userId}/role`, { role: newRole });
  // Refresh user profile
  await refreshUserProfile();
};
```

### 2. Проверка множественных ролей

```typescript
const { hasRole } = usePermissions();

if (hasRole([UserRole.ADMIN, UserRole.CHIEF_MECHANIC])) {
  // Show management features
}
```

### 3. Fallback UI для Can компонента

```typescript
<Can 
  perform="canEditInventory"
  fallback={<div>У вас нет прав на редактирование</div>}
>
  <EditButton />
</Can>
```

---

## ✅ Чеклист выполненных задач

- [x] User Model в MongoDB с полями: email, name, role
- [x] Enum для ролей: admin, chief_mechanic, accountant, mechanic
- [x] Backend API для управления пользователями
- [x] AuthContext обновлен с userProfile и permissions
- [x] Функция getPermissions() для каждой роли
- [x] usePermissions() хук
- [x] RoleBasedRoute компонент
- [x] Can компонент для условного рендеринга
- [x] AppRouter с защитой маршрутов
- [x] Sidebar с фильтрацией по правам
- [x] Navbar с role badges
- [x] Inventory обновлен с permissions
- [x] Назначение роли admin через seed / админку
- [x] Защита от ручного ввода URL
- [x] Документация

---

## 🎉 Результат

Полностью рабочая система ролей и прав доступа:

✅ **4 роли** с детальными правами  
✅ **Автоматический admin** для указанного email  
✅ **Frontend защита** маршрутов и UI  
✅ **Динамическое меню** в зависимости от роли  
✅ **Role badges** в header  
✅ **Гибкая система permissions**  
✅ **Легко расширяемая** архитектура  

**Статус:** ✅ **ГОТОВО К ИСПОЛЬЗОВАНИЮ**

---

## 📖 См. также:

- [FIREBASE_AUTH_COMPLETE.md](./FIREBASE_AUTH_COMPLETE.md) - Firebase аутентификация
- [BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md) - Backend API документация
- Backend User API: `http://localhost:3000/api/users`
