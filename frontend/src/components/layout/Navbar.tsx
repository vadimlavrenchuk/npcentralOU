/**
 * Navbar - верхняя панель навигации
 */

import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '../shared';
import './Navbar.scss';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userName = 'Пользователь',
  onLogout 
}) => {
  return (
    <header className="navbar">
      <div className="navbar__left">
        <h2 className="navbar__page-title">Панель управления</h2>
      </div>

      <div className="navbar__right">
        <Button variant="ghost" size="sm" className="navbar__icon-btn">
          <Bell size={20} />
        </Button>

        <div className="navbar__user">
          <User size={20} />
          <span className="navbar__user-name">{userName}</span>
        </div>

        {onLogout && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="navbar__icon-btn"
          >
            <LogOut size={20} />
          </Button>
        )}
      </div>
    </header>
  );
};
