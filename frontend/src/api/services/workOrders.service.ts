/**
 * Work Orders Service - API запросы для заказов на работы
 */

import { apiClient } from '../client';
import type {
  WorkOrder,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  PaginatedResponse,
  WorkOrderFilters,
  PaginationParams,
} from '../../types';

export const workOrdersService = {
  /**
   * Получить список всех заказов на работы с фильтрами и пагинацией
   */
  async getAll(
    filters?: WorkOrderFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<WorkOrder>> {
    const params = { ...filters, ...pagination };
    return apiClient.get<PaginatedResponse<WorkOrder>>('/work-orders', { params });
  },

  /**
   * Получить заказ по ID
   */
  async getById(id: string): Promise<WorkOrder> {
    return apiClient.get<WorkOrder>(`/work-orders/${id}`);
  },

  /**
   * Создать новый заказ
   */
  async create(data: CreateWorkOrderDto): Promise<WorkOrder> {
    return apiClient.post<WorkOrder>('/work-orders', data);
  },

  /**
   * Обновить заказ
   */
  async update(id: string, data: UpdateWorkOrderDto): Promise<WorkOrder> {
    return apiClient.patch<WorkOrder>(`/work-orders/${id}`, data);
  },

  /**
   * Удалить заказ
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/work-orders/${id}`);
  },

  /**
   * Назначить механика на заказ
   */
  async assign(id: string, mechanicId: string): Promise<WorkOrder> {
    return apiClient.patch<WorkOrder>(`/work-orders/${id}/assign`, { assignedToId: mechanicId });
  },

  /**
   * Изменить статус заказа
   */
  async updateStatus(id: string, status: string): Promise<WorkOrder> {
    return apiClient.patch<WorkOrder>(`/work-orders/${id}/status`, { status });
  },
};
