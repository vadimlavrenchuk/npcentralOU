/**
 * Sidebar - боковое меню навигации
 */

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  ClipboardList,
  Package,
  Wrench, 
  BarChart3,
  Users,
  Globe,
  Calendar
} from 'lucide-react';
import type { SidebarItem, Language } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import './Sidebar.scss';

const menuItems: SidebarItem[] = [
  { titleKey: 'nav.dashboard', icon: LayoutDashboard, path: '/', permission: 'canAccessDashboard' },
  { titleKey: 'nav.workOrders', icon: ClipboardList, path: '/work-orders', permission: 'canAccessWorkOrders' },
  { titleKey: 'nav.inventory', icon: Package, path: '/inventory', permission: 'canAccessInventory' },
  { titleKey: 'nav.equipment', icon: Wrench, path: '/equipment', permission: 'canAccessEquipment' },
  { titleKey: 'nav.reports', icon: BarChart3, path: '/reports', permission: 'canAccessReports' },
  { titleKey: 'nav.schedule', icon: Calendar, path: '/schedule', permission: 'canAccessSchedule' },
  { titleKey: 'nav.userManagement', icon: Users, path: '/user-management', permission: 'canManageUsers' },
];

const languages: Language[] = [
  { code: 'fi', name: 'FI', flag: '🇫🇮' },
  { code: 'et', name: 'ET', flag: '🇪🇪' },
  { code: 'en', name: 'EN', flag: '🇬🇧' },
  { code: 'ru', name: 'RU', flag: '🇷🇺' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { t, i18n } = useTranslation();
  const { can } = usePermissions();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[2];
  
  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => 
    !item.permission || can(item.permission as any)
  );
  
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__header">
        <h1 className="sidebar__title">{t('app.name')}</h1>
        <p className="sidebar__subtitle">{t('app.subtitle')}</p>
      </div>

      <nav className="sidebar__nav">
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <item.icon className="sidebar__icon" size={20} />
            <span className="sidebar__label">{t(item.titleKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__lang-switcher">
          <button 
            className="sidebar__lang-btn"
            onClick={() => setIsLangOpen(!isLangOpen)}
            aria-label={t('common.language')}
          >
            <Globe size={18} />
            <span>{currentLanguage.flag} {currentLanguage.name}</span>
          </button>
          
          {isLangOpen && (
            <div className="sidebar__lang-dropdown">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`sidebar__lang-option ${lang.code === i18n.language ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="flag">{lang.flag}</span>
                  <span className="name">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
