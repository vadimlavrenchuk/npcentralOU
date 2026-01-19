/**
 * Dashboard Page - главная страница с аналитикой (Premium High-Tech)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card } from '../components/shared';
import { useDashboard } from '../hooks';
import { 
  ClipboardList, 
  Wrench, 
  Package, 
  AlertTriangle 
} from 'lucide-react';
import './Dashboard.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return <div className="page-loading">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="page-error">{t('dashboard.error')}: {error}</div>;
  }

  return (
    <div className="dashboard">
      <motion.h1 
        className="dashboard__title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('dashboard.title')}
      </motion.h1>

      {/* Statistics Cards */}
      <motion.div 
        className="dashboard__stats"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <Card className="stat-card stat-card--primary">
            <div className="stat-card__icon">
              <ClipboardList size={32} />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats?.workOrders.total || 0}</div>
              <div className="stat-card__label">{t('dashboard.stats.workOrders')}</div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="stat-card stat-card--warning">
            <div className="stat-card__icon">
              <AlertTriangle size={32} />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats?.workOrders.pending || 0}</div>
              <div className="stat-card__label">{t('dashboard.stats.pending')}</div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <Wrench size={32} />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats?.equipment.operational || 0}</div>
              <div className="stat-card__label">{t('dashboard.stats.operational')}</div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="stat-card stat-card--danger">
            <div className="stat-card__icon">
              <Package size={32} />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats?.inventory.lowStock || 0}</div>
              <div className="stat-card__label">{t('dashboard.stats.lowStock')}</div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="dashboard__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card title={t('dashboard.recentActivity')} className="dashboard__card">
          <p>{t('dashboard.noActivity')}</p>
        </Card>

        <Card title={t('dashboard.upcomingMaintenance')} className="dashboard__card">
          <p>{t('dashboard.noMaintenance')}</p>
        </Card>
      </motion.div>
    </div>
  );
};
