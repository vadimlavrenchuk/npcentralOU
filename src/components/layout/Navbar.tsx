/**
 * Navbar - верхняя панель навигации
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '../shared';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import './Navbar.scss';
import type { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  user?: FirebaseUser | null;
  userName?: string;
  pageTitle?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user,
  userName,
  pageTitle,
  onLogout 
}) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const displayName = user?.displayName || userName || t('common.user');
  const photoURL = user?.photoURL;
  
  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'admin': return 'role-badge--admin';
      case 'chief_mechanic': return 'role-badge--chief';
      case 'accountant': return 'role-badge--accountant';
      case 'mechanic': return 'role-badge--mechanic';
      default: return '';
    }
  };
  
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'chief_mechanic': return 'Chief Mechanic';
      case 'accountant': return 'Accountant';
      case 'mechanic': return 'Mechanic';
      default: return '';
    }
  };
  
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
          {photoURL ? (
            <img 
              src={photoURL} 
              alt={displayName} 
              className="navbar__user-avatar"
            />
          ) : (
            <User size={20} />
          )}
          <div className="navbar__user-info">
            <span className="navbar__user-name">{displayName}</span>
            {userProfile?.role && (
              <span className={`navbar__user-role ${getRoleBadgeClass(userProfile.role)}`}>
                {getRoleLabel(userProfile.role)}
              </span>
            )}
          </div>
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
