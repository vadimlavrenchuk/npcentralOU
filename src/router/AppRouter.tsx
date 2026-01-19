/**
 * AppRouter - главный роутер приложения
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { 
  Dashboard, 
  WorkOrders, 
  Equipment, 
  Inventory,
  Reports,
  Employees
} from '../pages';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Главная страница - Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* Рабочие заказы */}
        <Route path="work-orders" element={<WorkOrders />} />
        
        {/* Склад */}
        <Route path="inventory" element={<Inventory />} />
        
        {/* Оборудование */}
        <Route path="equipment" element={<Equipment />} />
        
        {/* Отчеты */}
        <Route path="reports" element={<Reports />} />
        
        {/* Сотрудники/Пользователи */}
        <Route path="employees" element={<Employees />} />
        <Route path="users" element={<Navigate to="/employees" replace />} />
        
        {/* 404 - редирект на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
