/**
 * useDashboard - хук для работы с дашбордом
 */

import { useState, useCallback, useEffect } from 'react';
import { dashboardService } from '../api';
import type { DashboardStats } from '../types';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock данные (временно, пока нет backend)
      const mockData = {
        workOrders: {
          total: 24,
          pending: 8,
          inProgress: 5,
          completed: 11,
          byPriority: {
            low: 6,
            medium: 10,
            high: 5,
            critical: 3,
          },
        },
        equipment: {
          total: 42,
          operational: 35,
          maintenance: 5,
          broken: 2,
        },
        inventory: {
          total: 156,
          lowStock: 12,
          outOfStock: 3,
          totalValue: 85000,
        },
        recentActivity: {
          completedWorkOrders: 11,
          pendingWorkOrders: 8,
          upcomingMaintenance: 4,
        },
      };
      
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats(mockData);
      
      // Раскомментируйте когда backend будет готов:
      // const data = await dashboardService.getStats();
      // setStats(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки статистики');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async (limit?: number) => {
    try {
      return await dashboardService.getRecentActivity(limit);
    } catch (err: any) {
      console.error('Error fetching recent activity:', err);
      return [];
    }
  }, []);

  const fetchUpcomingMaintenance = useCallback(async (days?: number) => {
    try {
      return await dashboardService.getUpcomingMaintenance(days);
    } catch (err: any) {
      console.error('Error fetching upcoming maintenance:', err);
      return [];
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    fetchRecentActivity,
    fetchUpcomingMaintenance,
  };
};
