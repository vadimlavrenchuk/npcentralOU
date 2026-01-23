/**
 * Maintenance Modal - модальное окно управления ТО
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button, Modal } from '../../components/shared';
import { MotorHoursInput } from '../../components/shared/MotorHoursInput';
import { MaintenanceChecklist } from '../../components/shared/MaintenanceChecklist';
import type { Equipment, ChecklistTask } from '../../types';
import './MaintenanceModal.scss';

interface MaintenanceModalProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  onUpdateHours?: (equipmentId: string, hours: number) => Promise<void>;
  onRecordService?: (equipmentId: string) => Promise<void>;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onUpdateHours,
  onRecordService,
}) => {
  const { t } = useTranslation();
  const [showHoursInput, setShowHoursInput] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistTask[]>(
    equipment.checklistTemplate || []
  );
  const [isRecordingService, setIsRecordingService] = useState(false);

  const handleUpdateHours = async (newHours: number) => {
    if (onUpdateHours) {
      await onUpdateHours(equipment.id, newHours);
      setShowHoursInput(false);
    }
  };

  const handleRecordService = async () => {
    setIsRecordingService(true);
    try {
      if (onRecordService) {
        await onRecordService(equipment.id);
        // Reset checklist after service recorded
        setChecklist(equipment.checklistTemplate || []);
      }
    } finally {
      setIsRecordingService(false);
    }
  };

  const handleChecklistChange = (updatedChecklist: ChecklistTask[]) => {
    setChecklist(updatedChecklist);
  };

  const isServiceComplete = checklist.every(
    (task) => !task.required || task.completed
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('maintenance.management')}>
      <div className="maintenance-modal">
        {/* Equipment Info */}
        <div className="equipment-info">
          <h3>{equipment.name}</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">{t('equipment.model')}:</span>
              <span className="value">{equipment.model}</span>
            </div>
            <div className="info-item">
              <span className="label">{t('equipment.serialNumber')}:</span>
              <span className="value">{equipment.serialNumber}</span>
            </div>
            <div className="info-item">
              <span className="label">{t('maintenance.currentHours')}:</span>
              <span className="value">{equipment.currentHours || 0}</span>
            </div>
            {equipment.maintenanceInterval && (
              <div className="info-item">
                <span className="label">{t('maintenance.interval')}:</span>
                <span className="value">
                  {equipment.maintenanceInterval.value}{' '}
                  {t(`maintenance.units.${equipment.maintenanceInterval.unit}`)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Motor Hours Update */}
        <div className="hours-section">
          <Button
            variant="secondary"
            onClick={() => setShowHoursInput(true)}
            fullWidth
          >
            {t('maintenance.updateHours')}
          </Button>
        </div>

        {/* Maintenance Checklist */}
        {equipment.checklistTemplate && equipment.checklistTemplate.length > 0 && (
          <div className="checklist-section">
            <h4>{t('maintenance.checklist')}</h4>
            <MaintenanceChecklist
              tasks={checklist}
              onChange={handleChecklistChange}
            />
          </div>
        )}

        {/* Record Service Button */}
        {equipment.checklistTemplate && equipment.checklistTemplate.length > 0 && (
          <div className="service-section">
            <Button
              variant="primary"
              onClick={handleRecordService}
              disabled={!isServiceComplete || isRecordingService}
              fullWidth
            >
              {isRecordingService
                ? t('common.saving')
                : t('maintenance.recordService')}
            </Button>
            {!isServiceComplete && (
              <p className="help-text">
                {t('maintenance.completeRequiredTasks')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Motor Hours Input Modal */}
      {showHoursInput && (
        <MotorHoursInput
          isOpen={showHoursInput}
          onClose={() => setShowHoursInput(false)}
          currentHours={equipment.currentHours || 0}
          equipmentName={equipment.name}
          onSubmit={handleUpdateHours}
        />
      )}
    </Modal>
  );
};
