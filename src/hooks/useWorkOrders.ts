/**
 * useWorkOrders - хук для работы с заказами
 */

import { useState, useCallback } from 'react';
import { workOrdersService } from '../api';
import type {
  WorkOrder,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderFilters,
  PaginationParams,
  PaginatedResponse,
} from '../types';

interface UseWorkOrdersResult {
  workOrders: WorkOrder[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchWorkOrders: (filters?: WorkOrderFilters, pagination?: PaginationParams) => Promise<void>;
  getWorkOrder: (id: string) => Promise<WorkOrder | null>;
  createWorkOrder: (data: CreateWorkOrderDto) => Promise<WorkOrder | null>;
  updateWorkOrder: (id: string, data: UpdateWorkOrderDto) => Promise<WorkOrder | null>;
  deleteWorkOrder: (id: string) => Promise<boolean>;
  assignMechanic: (id: string, mechanicId: string) => Promise<boolean>;
  updateStatus: (id: string, status: string) => Promise<boolean>;
}

export const useWorkOrders = (): UseWorkOrdersResult => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = useCallback(async (
    filters?: WorkOrderFilters,
    pagination?: PaginationParams
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workOrdersService.getAll(filters, pagination);
      setWorkOrders(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки заказов');
      console.error('Error fetching work orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkOrder = useCallback(async (id: string): Promise<WorkOrder | null> => {
    try {
      setLoading(true);
      setError(null);
      const workOrder = await workOrdersService.getById(id);
      return workOrder;
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки заказа');
      console.error('Error fetching work order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkOrder = useCallback(async (
    data: CreateWorkOrderDto
  ): Promise<WorkOrder | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Sending create request:', data);
      const newWorkOrder = await workOrdersService.create(data);
      console.log('Received work order:', newWorkOrder);
      setWorkOrders((prev) => [newWorkOrder, ...(Array.isArray(prev) ? prev : [])]);
      setTotal((prev) => prev + 1);
      return newWorkOrder;
    } catch (err: any) {
      setError(err.message || 'Ошибка создания заказа');
      console.error('Error creating work order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorkOrder = useCallback(async (
    id: string,
    data: UpdateWorkOrderDto
  ): Promise<WorkOrder | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Updating work order:', id, data);
      const updated = await workOrdersService.update(id, data);
      console.log('Updated work order received:', updated);
      
      if (!updated) {
        throw new Error('No data returned from update');
      }
      
      setWorkOrders((prev) =>
        prev.map((wo) => {
          const woId = wo.id || wo._id;
          const updatedId = updated.id || updated._id;
          return woId === id || woId === updatedId ? updated : wo;
        })
      );
      return updated;
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления заказа');
      console.error('Error updating work order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWorkOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await workOrdersService.delete(id);
      setWorkOrders((prev) => prev.filter((wo) => {
        const woId = wo.id || wo._id;
        return woId !== id;
      }));
      setTotal((prev) => prev - 1);
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления заказа');
      console.error('Error deleting work order:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignMechanic = useCallback(async (
    id: string,
    mechanicId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await workOrdersService.assign(id, mechanicId);
      setWorkOrders((prev) =>
        prev.map((wo) => (wo.id === id ? updated : wo))
      );
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка назначения механика');
      console.error('Error assigning mechanic:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (
    id: string,
    status: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await workOrdersService.updateStatus(id, status);
      setWorkOrders((prev) =>
        prev.map((wo) => (wo.id === id ? updated : wo))
      );
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления статуса');
      console.error('Error updating status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    workOrders,
    total,
    loading,
    error,
    fetchWorkOrders,
    getWorkOrder,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    assignMechanic,
    updateStatus,
  };
};
