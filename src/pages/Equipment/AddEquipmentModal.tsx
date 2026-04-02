/**
 * Add Equipment Modal - форма добавления оборудования
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../../components/shared';
import type { CreateEquipmentDto } from '../../types';
import './AddEquipmentModal.scss';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEquipmentDto) => Promise<void>;
}

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEquipmentDto>({
    name: '',
    type: '',
    model: '',
    serialNumber: '',
    manufacturer: '',
    location: '',
    maintenanceInterval: {
      value: 0,
      unit: 'days',
    },
    currentHours: 0,
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIntervalChange = (field: 'value' | 'unit', value: any) => {
    setFormData((prev) => ({
      ...prev,
      maintenanceInterval: {
        ...prev.maintenanceInterval!,
        [field]: field === 'value' ? Number(value) : value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        type: '',
        model: '',
        serialNumber: '',
        manufacturer: '',
        location: '',
        maintenanceInterval: {
          value: 0,
          unit: 'days',
        },
        currentHours: 0,
        notes: '',
      });
    } catch (error) {
      console.error('Failed to create equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('equipment.addNew')}>
      <form onSubmit={handleSubmit} className="add-equipment-form">
        <div className="form-grid">
          {/* Name */}
          <div className="form-field">
            <label htmlFor="name">{t('equipment.name')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Type */}
          <div className="form-field">
            <label htmlFor="type">{t('equipment.type')} *</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </div>

          {/* Model */}
          <div className="form-field">
            <label htmlFor="model">{t('equipment.model')} *</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          {/* Serial Number */}
          <div className="form-field">
            <label htmlFor="serialNumber">{t('equipment.serialNumber')} *</label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Manufacturer */}
          <div className="form-field">
            <label htmlFor="manufacturer">{t('equipment.manufacturer')}</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
            />
          </div>

          {/* Location */}
          <div className="form-field">
            <label htmlFor="location">{t('equipment.location')} *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* Current Hours */}
          <div className="form-field">
            <label htmlFor="currentHours">{t('maintenance.currentHours')}</label>
            <input
              type="number"
              id="currentHours"
              name="currentHours"
              value={formData.currentHours}
              onChange={handleChange}
              min="0"
            />
          </div>

          {/* Maintenance Interval */}
          <div className="form-field form-field--full">
            <label>{t('maintenance.interval')}</label>
            <div className="interval-inputs">
              <input
                type="number"
                value={formData.maintenanceInterval?.value || 0}
                onChange={(e) => handleIntervalChange('value', e.target.value)}
                min="0"
                placeholder="0"
              />
              <select
                value={formData.maintenanceInterval?.unit || 'days'}
                onChange={(e) => handleIntervalChange('unit', e.target.value)}
              >
                <option value="days">{t('maintenance.units.days')}</option>
                <option value="months">{t('maintenance.units.months')}</option>
                <option value="hours">{t('maintenance.units.hours')}</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-field form-field--full">
            <label htmlFor="notes">{t('common.notes')}</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
