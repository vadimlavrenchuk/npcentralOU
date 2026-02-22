/**
 * MainLayout - основной layout приложения
 */

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';
import './MainLayout.scss';

export const MainLayout: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="main-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {isSidebarOpen && (
        <div className="main-layout__overlay" onClick={closeSidebar} />
      )}
      
      <div className="main-layout__content">
        <Navbar 
          user={userProfile} 
          onLogout={handleLogout}
          onMenuClick={toggleSidebar}
        />
        
        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
