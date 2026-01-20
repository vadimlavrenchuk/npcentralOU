/**
 * useInventory - хук для работы со складом
 */

import { useState, useCallback, useEffect } from 'react';
import { inventoryService } from '../api';
import type {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryFilters,
  PaginationParams,
} from '../types';

// Demo data with multilingual names
const DEMO_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    sku: 'EL-001',
    name: 'Electric Motor 3kW',
    nameTranslations: {
      ru: 'Электродвигатель 3кВт',
      fi: 'Sähkömoottori 3kW',
      et: 'Elektrimootor 3kW',
      en: 'Electric Motor 3kW'
    },
    category: 'Electrics',
    quantity: 5,
    minQuantity: 2,
    unit: 'pcs',
    unitPrice: 150.00,
    location: 'Warehouse A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    sku: 'ME-002',
    name: 'V-belt A-1250',
    nameTranslations: {
      ru: 'Ремень клиновой А-1250',
      fi: 'Kiilahihna A-1250',
      et: 'Kiilrihm A-1250',
      en: 'V-belt A-1250'
    },
    category: 'Mechanics',
    quantity: 2,
    minQuantity: 5,
    unit: 'pcs',
    unitPrice: 12.50,
    location: 'Warehouse B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    sku: 'HY-003',
    name: 'Hydraulic Hose 1/2"',
    nameTranslations: {
      ru: 'Гидравлический шланг 1/2"',
      fi: 'Hydrauliletku 1/2"',
      et: 'Hüdrovoolik 1/2"',
      en: 'Hydraulic Hose 1/2"'
    },
    category: 'Hydraulics',
    quantity: 15,
    minQuantity: 10,
    unit: 'm',
    unitPrice: 8.50,
    location: 'Warehouse A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    sku: 'PN-004',
    name: 'Pneumatic Cylinder 50mm',
    nameTranslations: {
      ru: 'Пневмоцилиндр 50мм',
      fi: 'Pneumaattinen sylinteri 50mm',
      et: 'Pneumaatiline silinder 50mm',
      en: 'Pneumatic Cylinder 50mm'
    },
    category: 'Pneumatics',
    quantity: 8,
    minQuantity: 3,
    unit: 'pcs',
    unitPrice: 75.00,
    location: 'Warehouse C',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    sku: 'CS-005',
    name: 'Industrial Oil 10L',
    nameTranslations: {
      ru: 'Индустриальное масло 10Л',
      fi: 'Teollisuusöljy 10L',
      et: 'Tööstusõli 10L',
      en: 'Industrial Oil 10L'
    },
    category: 'Consumables',
    quantity: 3,
    minQuantity: 5,
    unit: 'L',
    unitPrice: 25.00,
    location: 'Warehouse A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
      
      // Fetch from real API
      const response = await inventoryService.getAll(filters, pagination);
      // response is already unwrapped by apiClient (returns response.data.data)
      // So response = { total, data } where data is the array
      if (Array.isArray(response)) {
        setItems(response);
        setTotal(response.length);
      } else if (response && typeof response === 'object' && 'data' in response) {
        setItems((response as any).data || []);
        setTotal((response as any).total || 0);
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Ошибка загрузки склада');
      // Fallback to empty array on error
      setItems([]);
      setTotal(0);
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
      setItems((prev) => [newItem, ...(Array.isArray(prev) ? prev : [])]);
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
    quantityChange: number,
    operation: 'add' | 'subtract'
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await inventoryService.adjustQuantity(id, quantityChange, operation);
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
