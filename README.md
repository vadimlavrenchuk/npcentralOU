# MechanicPro - Workshop Management System

Premium MERN stack application for mechanical workshop management with multilingual support.

## � Production
- **Live URL:** https://verifed-est.ee
- **Access:** учётные записи в вашей MongoDB; в открытом репозитории пароли не описываются. Локально после `npm run seed` смотрите вывод терминала и смените пароль.

## 📚 Documentation Index

### 🚀 Quick Start
- **[START_HERE.md](START_HERE.md)** - Complete guide for beginners
- **[COPY_ME_FOR_AI.txt](COPY_ME_FOR_AI.txt)** - Copy-paste this for new AI sessions

### 🤖 For AI Assistants
- **[AI_CONTEXT.md](AI_CONTEXT.md)** - Quick project context (2 min read)
- **[AI_CHEATSHEET.md](AI_CHEATSHEET.md)** - Tips and common scenarios
- **[HOW_TO_WORK_WITH_AI.md](HOW_TO_WORK_WITH_AI.md)** - Guide for other projects

### 🚢 Deployment
- **[DEPLOYMENT_CONFIG.md](DEPLOYMENT_CONFIG.md)** - Full deployment guide
- **[INFRASTRUCTURE_DIAGRAM.md](INFRASTRUCTURE_DIAGRAM.md)** - Visual diagrams
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - General deployment info

### 💻 Scripts
```bash
npm run deploy:frontend  # Deploy frontend only
npm run deploy:backend   # Deploy backend only
npm run deploy:all       # Full deployment
```

## �🎨 Features

- ✨ **Premium Glassmorphism UI** with framer-motion animations
- 🌍 **4-Language Support**: Finnish, Estonian, English, Russian (i18next)
- 📦 **Smart Inventory Module** with multilingual items and low-stock alerts
- 🔍 **Live Search** by SKU and localized names
- 📊 **Dashboard** with animated stat cards
- 🎯 **Clean Architecture**: hooks, services, types, store
- 🚀 **Modern Stack**: Vite 7.3 + React 19 + TypeScript + SASS

## 📁 Project Structure

```
src/
├── api/                    # API client & services
│   ├── client.ts
│   └── services/
│       ├── dashboard.service.ts
│       ├── equipment.service.ts
│       ├── inventory.service.ts
│       └── workOrders.service.ts
├── components/
│   ├── layout/             # Layout components
│   │   ├── MainLayout.tsx  # Main layout with Outlet
│   │   ├── Sidebar.tsx     # Navigation with NavLink
│   │   └── Navbar.tsx
│   └── shared/             # Reusable components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── LanguageSwitcher.tsx
├── hooks/                  # Custom React hooks
│   ├── useDashboard.ts
│   ├── useEquipment.ts
│   ├── useInventory.ts
│   └── useWorkOrders.ts
├── i18n/                   # Internationalization
│   └── config.ts
├── locales/                # Translation files
│   ├── fi.json (Finnish)
│   ├── et.json (Estonian)
│   ├── en.json (English)
│   └── ru.json (Russian)
├── pages/                  # Page components (each in own folder)
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard.scss
│   │   └── index.ts
│   ├── WorkOrders/
│   ├── Inventory/
│   ├── Equipment/
│   ├── Reports/
│   └── Employees/
├── router/                 # React Router configuration
│   └── AppRouter.tsx
├── store/                  # Zustand state management
│   ├── authStore.ts
│   └── uiStore.ts
├── styles/                 # Global styles
│   ├── global.scss
│   ├── variables.scss
│   └── mixins.scss
└── types/                  # TypeScript definitions
    └── index.ts
```

## 🛣️ Routing

Routes are configured in `src/router/AppRouter.tsx`:
- `/` - Dashboard
- `/work-orders` - Work Orders Management
- `/inventory` - Inventory/Stock Management
- `/equipment` - Equipment Management
- `/reports` - Reports and Analytics
- `/employees` - Employee Management

All routes wrapped in `MainLayout` with `<Outlet />` pattern.  
Sidebar uses `<NavLink>` for automatic active state detection.

See [ROUTING.md](./ROUTING.md) for detailed documentation.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env` file in root (use `.env.example` as template):
```env
VITE_API_URL=http://localhost:5001/api
```

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **Vite 7.3.1** - Build tool with HMR
- **TypeScript 5.9.3** - Type safety
- **React Router DOM 7.12.0** - Routing with nested routes
- **SASS 1.97.2** - Modern CSS with @use syntax
- **i18next + react-i18next** - Internationalization
- **Zustand 5.0.10** - State management with persist
- **framer-motion** - Animation library
- **Lucide React 0.562.0** - Icon library
- **Axios 1.13.2** - HTTP client

### Backend (Planned)
- **Node.js + Express** - API server (port 5001)
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication

## 🎨 Design System

### Colors
- Background: Dark slate gradient `#0f172a` → `#1e293b`
- Cards: `rgba(30, 41, 59, 0.65)` with blur(15px)
- Accents: Blue (#2563eb), Green (#10b981), Yellow (#f59e0b), Red (#ef4444)

### Typography
- Font: System font stack with -0.01em letter-spacing
- Headings: -0.02em letter-spacing, font-weight 600
- Text shadows for readability on glassmorphic backgrounds

### Glassmorphism
- Backdrop-filter: `blur(15px)`
- Semi-transparent backgrounds: `rgba(15, 23, 42, 0.75)`
- Subtle borders: `0.5px solid rgba(255, 255, 255, 0.1)`

## 📦 Key Features Detail

### Smart Inventory Module
- **Multilingual Items**: Each item has translations in 4 languages
- **Low-Stock Detection**: Items with quantity ≤ minQuantity get red glow
- **Live Search**: Filter by SKU or localized name
- **Category Filter**: 5 categories (Electrics, Mechanics, Hydraulics, Pneumatics, Consumables)
- **Stock Operations**: Receive/Issue stock with modal interface
- **Real-time Updates**: Simulated API with 300ms delay

### Dashboard
- **Animated Stats**: framer-motion spring animations with stagger
- **Colored Glow Effects**: Different colors for each status (primary, success, warning, danger)
- **Responsive Grid**: Adapts to screen size

### Layout System
- **Fixed Sidebar**: Navigation remains while content changes via Outlet
- **Active Link Detection**: NavLink automatically highlights current page
- **Language Switcher**: Globe icon with flag dropdown in sidebar footer
- **Responsive**: Mobile-friendly with proper breakpoints

## 🌐 Internationalization

All UI text supports 4 languages with instant switching:
- Finnish (fi) - 🇫🇮
- Estonian (et) - 🇪🇪  
- English (en) - 🇬🇧
- Russian (ru) - 🇷🇺

Language detection:
1. Browser language (auto-detect)
2. Saved preference (localStorage)
3. Fallback to English

## 🔐 Security

### Environment Variables Protection

- ✅ `.env` files protected in `.gitignore` (root + backend)
- ✅ No API keys in repository
- ✅ `.env.example` templates with safe placeholders
- ✅ Type-safe environment variables via `vite-env.d.ts`
- ✅ GitGuardian monitoring for leaked secrets
- 🔒 See [backend/SECURITY.md](backend/SECURITY.md) for security guidelines

### Important Security Notes

⚠️ **NEVER commit real credentials!**

1. Always use `.env.example` as template
2. Copy to `.env` and fill with your actual credentials
3. Verify `.env` is in `.gitignore` before committing
4. If credentials are leaked, **rotate them immediately**

### Git Pre-commit Checks

Before every commit, verify:
```bash
git status          # Check no .env files
git diff --cached   # Review staged changes
```

## 📝 Development Notes

### Code Style
- **SCSS Only**: All .css files removed, using modern @use syntax
- **Clean Imports**: Centralized exports from index.ts files
- **Type Safety**: Full TypeScript coverage with strict mode
- **Component Structure**: Layout vs Shared components separation
- **Hook Pattern**: Custom hooks for data fetching and state

### Next Steps
- [ ] Backend Express server implementation
- [ ] MongoDB schema design and connection
- [ ] JWT authentication system
- [ ] Real API endpoint integration
- [ ] Connect frontend services to backend
- [ ] Add more pages (Reports, Employees with full functionality)
- [ ] Unit tests with Vitest
- [ ] E2E tests with Playwright

## 📄 License

MIT

---

Built with ❤️ using React 19, Vite 7, and TypeScript
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
