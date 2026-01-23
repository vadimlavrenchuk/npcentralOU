/**
 * Equipment Service - API запросы для оборудования
 */

import { apiClient } from '../client';
import type {
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  PaginatedResponse,
  EquipmentFilters,
  PaginationParams,
} from '../../types';

export const equipmentService = {
  async getAll(
    filters?: EquipmentFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Equipment>> {
    const params = { ...filters, ...pagination };
    return apiClient.get<PaginatedResponse<Equipment>>('/equipment', { params });
  },

  async getById(id: string): Promise<Equipment> {
    return apiClient.get<Equipment>(`/equipment/${id}`);
  },

  async create(data: CreateEquipmentDto): Promise<Equipment> {
    return apiClient.post<Equipment>('/equipment', data);
  },

  async update(id: string, data: UpdateEquipmentDto): Promise<Equipment> {
    return apiClient.patch<Equipment>(`/equipment/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/equipment/${id}`);
  },

  async updateStatus(id: string, status: string): Promise<Equipment> {
    return apiClient.patch<Equipment>(`/equipment/${id}/status`, { status });
  },

  // Preventive Maintenance methods
  async updateCurrentHours(id: string, hours: number): Promise<Equipment> {
    return apiClient.patch<Equipment>(`/equipment/${id}/hours`, { hours });
  },

  async recordService(id: string, serviceHours?: number): Promise<Equipment> {
    return apiClient.post<Equipment>(`/equipment/${id}/service`, { serviceHours });
  },

  async getUrgentEquipment(limit: number = 5): Promise<Equipment[]> {
    const response = await apiClient.get<{ data: Equipment[] }>(`/equipment/urgent`, {
      params: { limit },
    });
    return response.data;
  },

  async getMaintenanceStats(): Promise<{
    total: number;
    urgent: number;
    dueThisWeek: number;
    dueThisMonth: number;
    overdue: number;
  }> {
    const response = await apiClient.get<{ data: any }>('/equipment/stats/maintenance');
    return response.data;
  },
};
