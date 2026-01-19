/**
 * Sidebar - боковое меню навигации
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  ClipboardList,
  Settings,
  Users
} from 'lucide-react';
import './Sidebar.scss';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Дашборд' },
  { path: '/work-orders', icon: ClipboardList, label: 'Заказы на работы' },
  { path: '/equipment', icon: Wrench, label: 'Оборудование' },
  { path: '/inventory', icon: Package, label: 'Склад' },
  { path: '/maintenance', icon: Settings, label: 'Обслуживание' },
  { path: '/users', icon: Users, label: 'Сотрудники' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">MechanicPro</h1>
        <p className="sidebar__subtitle">Управление участком</p>
      </div>

      <nav className="sidebar__nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <item.icon className="sidebar__icon" size={20} />
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
