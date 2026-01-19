# Routing Architecture Documentation

## Structure Overview

### Router Setup
Location: `src/router/AppRouter.tsx`

All routes are configured with `MainLayout` wrapper:
- `/` - Dashboard (Home page)
- `/work-orders` - Work Orders management
- `/inventory` - Inventory/Stock management  
- `/equipment` - Equipment management
- `/reports` - Reports and analytics
- `/employees` - Employee management (alias: `/users` redirects here)

### Page Structure
Each page now has its own folder with component and styles:

```
src/pages/
├── Dashboard/
│   ├── Dashboard.tsx
│   ├── Dashboard.scss
│   └── index.ts
├── WorkOrders/
│   ├── WorkOrders.tsx
│   ├── WorkOrders.scss
│   └── index.ts
├── Inventory/
│   ├── Inventory.tsx
│   ├── Inventory.scss
│   └── index.ts
├── Equipment/
│   ├── Equipment.tsx
│   ├── Equipment.scss
│   └── index.ts
├── Reports/
│   ├── Reports.tsx
│   ├── Reports.scss
│   └── index.ts
├── Employees/
│   ├── Employees.tsx
│   ├── Employees.scss
│   └── index.ts
└── index.ts (exports all pages)
```

### Layout Integration
`MainLayout` component (`src/components/layout/MainLayout.tsx`) includes:
- `<Sidebar />` - navigation menu with active link highlighting
- `<Navbar />` - top navigation bar
- `<Outlet />` - renders child routes (pages)

### Navigation
Sidebar uses `<NavLink>` from react-router-dom with automatic active class:
- Active link gets `.sidebar__link--active` class
- Smooth transitions and hover effects
- Icon + translated label for each menu item

## Key Features

✅ **Clean folder structure** - each page in its own directory  
✅ **SCSS only** - all .css files removed, using .scss exclusively  
✅ **React Router DOM** - v7.12.0 with nested routes  
✅ **Active link detection** - automatic highlighting of current page  
✅ **Multilingual** - all navigation labels support 4 languages (FI/ET/EN/RU)  
✅ **Outlet pattern** - sidebar remains fixed while page content changes  
✅ **Type-safe** - full TypeScript support throughout routing

## Components

### AppRouter
Main routing configuration with all routes and redirects.

### MainLayout  
Persistent layout wrapper with Sidebar + Navbar + Outlet.

### Sidebar
Navigation menu with NavLink components and language switcher.

## Usage

Import pages from centralized export:
```tsx
import { Dashboard, Inventory, WorkOrders } from './pages';
```

Navigate programmatically:
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/inventory');
```

Access current route:
```tsx
import { useLocation } from 'react-router-dom';

const location = useLocation();
console.log(location.pathname); // e.g. "/work-orders"
```
