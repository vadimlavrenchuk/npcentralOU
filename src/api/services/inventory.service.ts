/**
 * Inventory Service - API запросы для склада
 */

import { apiClient } from '../client';
import type {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  PaginatedResponse,
  InventoryFilters,
  PaginationParams,
} from '../../types';

export const inventoryService = {
  async getAll(
    filters?: InventoryFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<InventoryItem>> {
    const params = { ...filters, ...pagination };
    return apiClient.get<PaginatedResponse<InventoryItem>>('/inventory', { params });
  },

  async getById(id: string): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(`/inventory/${id}`);
  },

  async create(data: CreateInventoryItemDto): Promise<InventoryItem> {
    return apiClient.post<InventoryItem>('/inventory', data);
  },

  async update(id: string, data: UpdateInventoryItemDto): Promise<InventoryItem> {
    return apiClient.patch<InventoryItem>(`/inventory/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/inventory/${id}`);
  },

  async adjustQuantity(id: string, quantity: number, reason?: string): Promise<InventoryItem> {
    return apiClient.patch<InventoryItem>(`/inventory/${id}/adjust`, { quantity, reason });
  },

  async getLowStock(): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>('/inventory/low-stock');
  },
};
