/**
 * useEquipment - хук для работы с оборудованием
 */

import { useState, useCallback } from 'react';
import { equipmentService } from '../api';
import type {
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  EquipmentFilters,
  PaginationParams,
} from '../types';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = useCallback(async (
    filters?: EquipmentFilters,
    pagination?: PaginationParams
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await equipmentService.getAll(filters, pagination);
      setEquipment(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки оборудования');
    } finally {
      setLoading(false);
    }
  }, []);

  const getEquipment = useCallback(async (id: string): Promise<Equipment | null> => {
    try {
      setLoading(true);
      setError(null);
      return await equipmentService.getById(id);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки оборудования');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEquipment = useCallback(async (
    data: CreateEquipmentDto
  ): Promise<Equipment | null> => {
    try {
      setLoading(true);
      setError(null);
      const newEquipment = await equipmentService.create(data);
      setEquipment((prev) => [newEquipment, ...prev]);
      setTotal((prev) => prev + 1);
      return newEquipment;
    } catch (err: any) {
      setError(err.message || 'Ошибка создания оборудования');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEquipment = useCallback(async (
    id: string,
    data: UpdateEquipmentDto
  ): Promise<Equipment | null> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await equipmentService.update(id, data);
      setEquipment((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления оборудования');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEquipment = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await equipmentService.delete(id);
      setEquipment((prev) => prev.filter((e) => e.id !== id));
      setTotal((prev) => prev - 1);
      return true;
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления оборудования');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    equipment,
    total,
    loading,
    error,
    fetchEquipment,
    getEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
};
