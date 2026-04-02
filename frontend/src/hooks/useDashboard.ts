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
      const data = await dashboardService.getStats();
      setStats(data);
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
