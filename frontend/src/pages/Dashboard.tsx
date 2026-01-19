/**
 * Dashboard Page - главная страница с аналитикой
 */

import React from 'react';
import { Card } from '../components/shared';
import { useDashboard } from '../hooks';
import { 
  ClipboardList, 
  Wrench, 
  Package, 
  AlertTriangle 
} from 'lucide-react';
import './Dashboard.scss';

export const Dashboard: React.FC = () => {
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return <div className="page-loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="page-error">Ошибка: {error}</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Панель управления</h1>

      {/* Statistics Cards */}
      <div className="dashboard__stats">
        <Card className="stat-card stat-card--primary">
          <div className="stat-card__icon">
            <ClipboardList size={32} />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats?.workOrders.total || 0}</div>
            <div className="stat-card__label">Всего заказов</div>
          </div>
        </Card>

        <Card className="stat-card stat-card--warning">
          <div className="stat-card__icon">
            <AlertTriangle size={32} />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats?.workOrders.pending || 0}</div>
            <div className="stat-card__label">В ожидании</div>
          </div>
        </Card>

        <Card className="stat-card stat-card--success">
          <div className="stat-card__icon">
            <Wrench size={32} />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats?.equipment.operational || 0}</div>
            <div className="stat-card__label">Работает</div>
          </div>
        </Card>

        <Card className="stat-card stat-card--danger">
          <div className="stat-card__icon">
            <Package size={32} />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats?.inventory.lowStock || 0}</div>
            <div className="stat-card__label">Низкий запас</div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="dashboard__content">
        <Card title="Последняя активность" className="dashboard__card">
          <p>Здесь будет отображаться последняя активность</p>
        </Card>

        <Card title="Предстоящее обслуживание" className="dashboard__card">
          <p>Здесь будет отображаться предстоящее обслуживание</p>
        </Card>
      </div>
    </div>
  );
};
