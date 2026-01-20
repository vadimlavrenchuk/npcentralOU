import { useState, useEffect, useCallback } from 'react';
import { statsService, type DashboardStats } from '../api/services/stats.service';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
