/**
 * Stats Service - API requests for dashboard statistics
 */

import { apiClient } from '../client';

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalQuantity: number;
  activeOrders: number;
  completedOrders: number;
}

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/stats');
  },
};
