import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import type { WorkOrder } from '../../types';
import { eventBus, EVENTS } from '../../utils/eventBus';
import './UrgentMaintenanceWidget.scss';

interface UrgentMaintenanceWidgetProps {
  className?: string;
}

export const UrgentMaintenanceWidget: React.FC<UrgentMaintenanceWidgetProps> = ({
  className = '',
}) => {
  const { t } = useTranslation();
  const [urgentOrders, setUrgentOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrgentOrders();
    
    // Listen for work order changes
    const handleDataChange = () => {
      fetchUrgentOrders();
    };
    
    eventBus.on(EVENTS.WORK_ORDER_CREATED, handleDataChange);
    eventBus.on(EVENTS.WORK_ORDER_UPDATED, handleDataChange);
    eventBus.on(EVENTS.WORK_ORDER_DELETED, handleDataChange);
    
    return () => {
      eventBus.off(EVENTS.WORK_ORDER_CREATED, handleDataChange);
      eventBus.off(EVENTS.WORK_ORDER_UPDATED, handleDataChange);
      eventBus.off(EVENTS.WORK_ORDER_DELETED, handleDataChange);
    };
  }, []);

  const fetchUrgentOrders = async () => {
    try {
      const response = await fetch('/api/work-orders?status=pending&limit=10');
      const data = await response.json();
      if (data.data) {
        // Filter critical and high priority orders, sort by priority
        const urgent = data.data
          .filter((order: WorkOrder) => 
            order.priority === 'critical' || order.priority === 'high'
          )
          .slice(0, 5);
        setUrgentOrders(urgent);
      }
    } catch (error) {
      console.error('Failed to fetch urgent work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return '#ef4444'; // red
      case 'high': return '#f97316'; // orange
      case 'medium': return '#eab308'; // yellow
      default: return '#22c55e'; // green
    }
  };

  const formatDueDate = (dueDate?: string): string => {
    if (!dueDate) return t('common.notSet') || 'Not set';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${t('common.overdue') || 'Overdue'} ${Math.abs(diffDays)}d`;
    }
    if (diffDays === 0) return t('common.today') || 'Today';
    if (diffDays === 1) return t('common.tomorrow') || 'Tomorrow';
    return `${diffDays}d`;
  };

  const getPriorityLabel = (priority: string): string => {
    const labels: Record<string, string> = {
      critical: t('workOrders.priority.critical') || 'Critical',
      high: t('workOrders.priority.high') || 'High',
      medium: t('workOrders.priority.medium') || 'Medium',
      low: t('workOrders.priority.low') || 'Low',
    };
    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <div className={`urgent-maintenance ${className}`}>
        <div className="urgent-maintenance__loading">
          {t('common.loading')}...
        </div>
      </div>
    );
  }

  if (urgentOrders.length === 0) {
    return (
      <div className={`urgent-maintenance ${className}`}>
        <div className="urgent-maintenance__empty">
          <AlertTriangle size={48} />
          <p>{t('dashboard.maintenance.noUrgent') || 'Все оборудование в хорошем состоянии'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`urgent-maintenance ${className}`}>
      <div className="urgent-maintenance__header">
        <AlertTriangle size={24} className="urgent-maintenance__icon" />
        <h3 className="urgent-maintenance__title">
          {t('dashboard.maintenance.urgentTitle') || 'Срочные заказы'}
        </h3>
        <span className="urgent-maintenance__badge">{urgentOrders.length}</span>
      </div>

      <ul className="urgent-maintenance__list">
        {urgentOrders.map((order, index) => {
          const equipmentName = typeof order.equipmentId === 'object' && order.equipmentId !== null
            ? (order.equipmentId as any).name
            : '';
          
          return (
            <motion.li
              key={order.id}
              className="urgent-maintenance__item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="urgent-maintenance__item-header">
                <div className="urgent-maintenance__item-info">
                  <h4 className="urgent-maintenance__item-name">{order.title}</h4>
                  <p className="urgent-maintenance__item-meta">
                    {equipmentName || order.description}
                  </p>
                </div>
                <div className="urgent-maintenance__item-time">
                  <Calendar size={16} />
                  <span>{formatDueDate(order.dueDate)}</span>
                </div>
              </div>

              <div className="urgent-maintenance__progress">
                <div 
                  className="urgent-maintenance__priority-badge"
                  style={{ backgroundColor: getPriorityColor(order.priority) }}
                >
                  {getPriorityLabel(order.priority)}
                </div>
                
                {order.estimatedHours && (
                  <div className="urgent-maintenance__hours">
                    <Clock size={14} />
                    <span>{order.estimatedHours}h</span>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};
