/**
 * Navbar - верхняя панель навигации
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '../shared';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import './Navbar.scss';

interface NavbarProps {
  userName?: string;
  pageTitle?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userName,
  pageTitle,
  onLogout 
}) => {
  const { t } = useTranslation();
  
  return (
    <header className="navbar">
      <div className="navbar__left">
        <h2 className="navbar__page-title">{pageTitle || t('dashboard.title')}</h2>
      </div>

      <div className="navbar__right">
        <LanguageSwitcher />
        
        <Button variant="ghost" size="sm" className="navbar__icon-btn">
          <Bell size={20} />
        </Button>

        <div className="navbar__user">
          <User size={20} />
          <span className="navbar__user-name">{userName || t('common.user')}</span>
        </div>

        {onLogout && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="navbar__icon-btn"
            title={t('common.logout')}
          >
            <LogOut size={20} />
          </Button>
        )}
      </div>
    </header>
  );
};
