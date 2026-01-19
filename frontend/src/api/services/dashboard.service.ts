/**
 * Dashboard Service - API запросы для дашборда
 */

import { apiClient } from '../client';
import type { DashboardStats } from '../../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },

  async getRecentActivity(limit?: number): Promise<any[]> {
    return apiClient.get<any[]>('/dashboard/activity', { params: { limit } });
  },

  async getUpcomingMaintenance(days?: number): Promise<any[]> {
    return apiClient.get<any[]>('/dashboard/maintenance/upcoming', { params: { days } });
  },
};
