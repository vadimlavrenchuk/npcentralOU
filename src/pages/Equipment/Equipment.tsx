/**
 * Equipment Page - страница оборудования
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Wrench } from 'lucide-react';
import { Button, Card } from '../../components/shared';
import { MaintenanceModal } from './MaintenanceModal';
import { AddEquipmentModal } from './AddEquipmentModal';
import { useEquipment } from '../../hooks';
import { equipmentService } from '../../api/services';
import type { Equipment as EquipmentType, CreateEquipmentDto } from '../../types';
import './Equipment.scss';

export const Equipment: React.FC = () => {
  const { t } = useTranslation();
  const { equipment, loading, error, fetchEquipment, createEquipment } = useEquipment();
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleAddEquipment = () => {
    setIsAddModalOpen(true);
  };

  const handleCreateEquipment = async (data: CreateEquipmentDto) => {
    await createEquipment(data);
    setIsAddModalOpen(false);
  };

  const handleEquipmentClick = (item: EquipmentType) => {
    setSelectedEquipment(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleUpdateHours = async (equipmentId: string, hours: number) => {
    try {
      await equipmentService.updateCurrentHours(equipmentId, hours);
      // Refresh equipment list
      await fetchEquipment();
      // Update selected equipment
      if (selectedEquipment && selectedEquipment.id === equipmentId) {
        const updated = equipment.find(e => e.id === equipmentId);
        if (updated) {
          setSelectedEquipment(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update hours:', err);
    }
  };

  const handleRecordService = async (equipmentId: string) => {
    try {
      await equipmentService.recordService(equipmentId);
      // Refresh equipment list
      await fetchEquipment();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to record service:', err);
    }
  };

  if (loading && (!equipment || equipment.length === 0)) {
    return <div className="page-loading">{t('common.loading')}</div>;
  }

  return (
    <div className="equipment-page">
      <div className="page-header">
        <h1 className="page-title">{t('equipment.title')}</h1>
        <Button variant="primary" icon={<Plus size={20} />} onClick={handleAddEquipment}>
          {t('equipment.addNew')}
        </Button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <Card>
        {!equipment || equipment.length === 0 ? (
          <div className="empty-state">
            <p>{t('equipment.noData')}</p>
          </div>
        ) : (
          <div className="equipment-list">
            {equipment.map((item) => (
              <div
                key={item.id}
                className="equipment-item"
                onClick={() => handleEquipmentClick(item)}
              >
                <div className="equipment-info">
                  <h3>{item.name}</h3>
                  <p className="model">{item.model}</p>
                  <p className="serial">{item.serialNumber}</p>
                </div>
                <div className="equipment-status">
                  <span className={`status-badge status-${item.status}`}>
                    {t(`equipment.status.${item.status}`)}
                  </span>
                  {item.maintenanceInterval && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Wrench size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquipmentClick(item);
                      }}
                    >
                      {t('maintenance.manage')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Maintenance Modal */}
      {selectedEquipment && (
        <MaintenanceModal
          equipment={selectedEquipment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateHours={handleUpdateHours}
          onRecordService={handleRecordService}
        />
      )}

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEquipment}
      />
    </div>
  );
};
