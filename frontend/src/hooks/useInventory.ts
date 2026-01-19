/**
 * useInventory - хук для работы со складом
 */

import { useState, useCallback } from 'react';
import { inventoryService } from '../api';
import type {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryFilters,
  PaginationParams,
} from '../types';

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async (
    filters?: InventoryFilters,
    pagination?: PaginationParams
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryService.getAll(filters, pagination);
      setItems(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки склада');
    } finally {
      setLoading(false);
    }
  }, []);

  const getItem = useCallback(async (id: string): Promise<InventoryItem | null> => {
    try {
      setLoading(true);
      setError(null);
      return await inventoryService.getById(id);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки позиции');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (
    data: CreateInventoryItemDto
  ): Promise<InventoryItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const newItem = await inventoryService.create(data);
      setItems((prev) => [newItem, ...prev]);
      setTotal((prev) => prev + 1);
      return newItem;
    } catch (err: any) {
      setError(err.message || 'Ошибка создания позиции');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (
    id: string,
    data: UpdateInventoryItemDto
  ): Promise<InventoryItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await inventoryService.update(id, data);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления позиции');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await inventoryService.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления позиции');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustQuantity = useCallback(async (
    id: string,
    quantity: number,
    reason?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await inventoryService.adjustQuantity(id, quantity, reason);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка изменения количества');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const lowStockItems = await inventoryService.getLowStock();
      return lowStockItems;
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    total,
    loading,
    error,
    fetchInventory,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    adjustQuantity,
    fetchLowStock,
  };
};
