/**
 * MainLayout - основной layout приложения
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';
import './MainLayout.scss';

export const MainLayout: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <div className="main-layout__content">
        <Navbar user={userProfile} onLogout={handleLogout} />
        
        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
