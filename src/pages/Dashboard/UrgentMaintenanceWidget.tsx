import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Clock, Gauge } from 'lucide-react';
import type { Equipment } from '../../types';
import './UrgentMaintenanceWidget.scss';

interface UrgentMaintenanceWidgetProps {
  className?: string;
}

export const UrgentMaintenanceWidget: React.FC<UrgentMaintenanceWidgetProps> = ({
  className = '',
}) => {
  const { t } = useTranslation();
  const [urgentEquipment, setUrgentEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrgentEquipment();
  }, []);

  const fetchUrgentEquipment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/equipment/urgent?limit=5');
      const data = await response.json();
      if (data.success) {
        setUrgentEquipment(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch urgent equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentRemaining: number): string => {
    if (percentRemaining < 10) return '#ef4444'; // red
    if (percentRemaining < 25) return '#f97316'; // orange
    if (percentRemaining < 50) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const formatTimeRemaining = (equipment: Equipment): string => {
    const nextService = equipment.nextServiceData;
    if (!nextService) return 'N/A';

    if (nextService.daysRemaining !== null) {
      if (nextService.daysRemaining < 0) {
        return `Overdue by ${Math.abs(nextService.daysRemaining)} days`;
      }
      return `${nextService.daysRemaining} days`;
    }

    if (nextService.hoursRemaining !== null) {
      if (nextService.hoursRemaining < 0) {
        return `Overdue by ${Math.abs(nextService.hoursRemaining).toFixed(1)} hours`;
      }
      return `${nextService.hoursRemaining.toFixed(1)} hours`;
    }

    return 'N/A';
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

  if (urgentEquipment.length === 0) {
    return (
      <div className={`urgent-maintenance ${className}`}>
        <div className="urgent-maintenance__empty">
          <AlertTriangle size={48} />
          <p>{t('dashboard.maintenance.noUrgent')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`urgent-maintenance ${className}`}>
      <div className="urgent-maintenance__header">
        <AlertTriangle size={24} className="urgent-maintenance__icon" />
        <h3 className="urgent-maintenance__title">
          {t('dashboard.maintenance.urgentTitle')}
        </h3>
        <span className="urgent-maintenance__badge">{urgentEquipment.length}</span>
      </div>

      <ul className="urgent-maintenance__list">
        {urgentEquipment.map((equipment, index) => (
          <motion.li
            key={equipment.id}
            className="urgent-maintenance__item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="urgent-maintenance__item-header">
              <div className="urgent-maintenance__item-info">
                <h4 className="urgent-maintenance__item-name">{equipment.name}</h4>
                <p className="urgent-maintenance__item-meta">
                  {equipment.type} • {equipment.location}
                </p>
              </div>
              <div className="urgent-maintenance__item-time">
                {equipment.nextServiceData?.type === 'hours' ? (
                  <Gauge size={16} />
                ) : (
                  <Calendar size={16} />
                )}
                <span>{formatTimeRemaining(equipment)}</span>
              </div>
            </div>

            {equipment.nextServiceData && (
              <div className="urgent-maintenance__progress">
                <div className="urgent-maintenance__progress-bar">
                  <motion.div
                    className="urgent-maintenance__progress-fill"
                    style={{
                      backgroundColor: getProgressColor(
                        equipment.nextServiceData.percentRemaining
                      ),
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${equipment.nextServiceData.percentRemaining}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  />
                </div>
                <span className="urgent-maintenance__progress-text">
                  {equipment.nextServiceData.percentRemaining.toFixed(0)}% remaining
                </span>
              </div>
            )}

            {equipment.currentHours !== undefined && (
              <div className="urgent-maintenance__hours">
                <Clock size={14} />
                <span>Current: {equipment.currentHours.toFixed(1)}h</span>
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
