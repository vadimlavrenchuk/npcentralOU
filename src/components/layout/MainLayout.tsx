/**
 * MainLayout - основной layout приложения
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import './MainLayout.scss';

export const MainLayout: React.FC = () => {
  const handleLogout = () => {
    // TODO: implement logout logic
    console.log('Logout');
  };

  return (
    <div className="main-layout">
      <Sidebar />
      
      <div className="main-layout__content">
        <Navbar userName="Иван Петров" onLogout={handleLogout} />
        
        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
