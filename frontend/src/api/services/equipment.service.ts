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
};
