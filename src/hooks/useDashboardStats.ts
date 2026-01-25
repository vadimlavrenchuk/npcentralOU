import { useState, useEffect, useCallback } from 'react';
import { statsService, type DashboardStats } from '../api/services/stats.service';
import { eventBus, EVENTS } from '../utils/eventBus';

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
    
    // Listen for data changes
    const handleDataChange = () => {
      fetchStats();
    };
    
    eventBus.on(EVENTS.WORK_ORDER_CREATED, handleDataChange);
    eventBus.on(EVENTS.WORK_ORDER_UPDATED, handleDataChange);
    eventBus.on(EVENTS.WORK_ORDER_DELETED, handleDataChange);
    eventBus.on(EVENTS.EQUIPMENT_UPDATED, handleDataChange);
    eventBus.on(EVENTS.INVENTORY_UPDATED, handleDataChange);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    
    return () => {
      eventBus.off(EVENTS.WORK_ORDER_CREATED, handleDataChange);
      eventBus.off(EVENTS.WORK_ORDER_UPDATED, handleDataChange);
      eventBus.off(EVENTS.WORK_ORDER_DELETED, handleDataChange);
      eventBus.off(EVENTS.EQUIPMENT_UPDATED, handleDataChange);
      eventBus.off(EVENTS.INVENTORY_UPDATED, handleDataChange);
      clearInterval(interval);
    };
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
