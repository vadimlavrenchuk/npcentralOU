import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Gauge,
  Edit 
} from 'lucide-react';
import type { Equipment } from '../../types';
import { Button } from '../../components/shared';
import { MotorHoursInput } from '../../components/shared/MotorHoursInput';
import { equipmentService } from '../../api/services/equipment.service';
import './MaintenanceInfo.scss';

interface MaintenanceInfoProps {
  equipment: Equipment;
  onUpdate?: () => void;
}

export const MaintenanceInfo: React.FC<MaintenanceInfoProps> = ({
  equipment,
  onUpdate,
}) => {
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  const handleUpdateHours = async (hours: number) => {
    try {
      await equipmentService.updateCurrentHours(equipment.id, hours);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update hours:', error);
      throw error;
    }
  };

  const handleRecordService = async () => {
    if (!confirm('Record service completion for this equipment?')) return;
    
    try {
      await equipmentService.recordService(equipment.id, equipment.currentHours);
      if (onUpdate) {
        onUpdate();
      }
      alert('Service recorded successfully!');
    } catch (error) {
      console.error('Failed to record service:', error);
      alert('Failed to record service');
    }
  };

  const getStatusColor = () => {
    if (!equipment.nextServiceData) return 'green';
    if (equipment.isUrgent) return 'red';
    if (equipment.nextServiceData.percentRemaining < 25) return 'orange';
    if (equipment.nextServiceData.percentRemaining < 50) return 'yellow';
    return 'green';
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const nextService = equipment.nextServiceData;
  const hasMaintenanceInterval = !!equipment.maintenanceInterval;

  if (!hasMaintenanceInterval) {
    return (
      <div className="maintenance-info maintenance-info--empty">
        <AlertCircle size={48} />
        <h3>No Maintenance Schedule</h3>
        <p>This equipment does not have a preventive maintenance schedule configured.</p>
      </div>
    );
  }

  return (
    <div className={`maintenance-info maintenance-info--${getStatusColor()}`}>
      <div className="maintenance-info__header">
        <h3 className="maintenance-info__title">
          {equipment.isUrgent && <AlertCircle className="maintenance-info__urgent-icon" />}
          Preventive Maintenance Status
        </h3>
        {equipment.isUrgent && (
          <span className="maintenance-info__urgent-badge">URGENT</span>
        )}
      </div>

      <div className="maintenance-info__grid">
        {/* Current Hours */}
        {equipment.currentHours !== undefined && (
          <div className="maintenance-info__card">
            <div className="maintenance-info__card-header">
              <Gauge size={20} />
              <span>Current Hours</span>
            </div>
            <div className="maintenance-info__card-value">
              {equipment.currentHours.toFixed(1)}h
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsHoursModalOpen(true)}
              className="maintenance-info__card-action"
            >
              <Edit size={16} />
              Update
            </Button>
          </div>
        )}

        {/* Maintenance Interval */}
        {equipment.maintenanceInterval && (
          <div className="maintenance-info__card">
            <div className="maintenance-info__card-header">
              <Clock size={20} />
              <span>Maintenance Interval</span>
            </div>
            <div className="maintenance-info__card-value">
              {equipment.maintenanceInterval.value}{' '}
              {equipment.maintenanceInterval.unit}
            </div>
          </div>
        )}

        {/* Last Service */}
        {equipment.lastService && (
          <div className="maintenance-info__card">
            <div className="maintenance-info__card-header">
              <CheckCircle size={20} />
              <span>Last Service</span>
            </div>
            <div className="maintenance-info__card-value">
              {formatDate(equipment.lastService.date)}
            </div>
            {equipment.lastService.hours !== undefined && (
              <div className="maintenance-info__card-meta">
                at {equipment.lastService.hours.toFixed(1)}h
              </div>
            )}
          </div>
        )}

        {/* Next Service */}
        {nextService && (
          <div className="maintenance-info__card">
            <div className="maintenance-info__card-header">
              <Calendar size={20} />
              <span>Next Service</span>
            </div>
            <div className="maintenance-info__card-value">
              {nextService.date ? formatDate(nextService.date) : 
               nextService.hours ? `${nextService.hours.toFixed(1)}h` : 'N/A'}
            </div>
            {nextService.daysRemaining !== null && (
              <div className={`maintenance-info__card-meta ${
                nextService.daysRemaining < 0 ? 'maintenance-info__card-meta--overdue' : ''
              }`}>
                {nextService.daysRemaining < 0 
                  ? `Overdue by ${Math.abs(nextService.daysRemaining)} days`
                  : `in ${nextService.daysRemaining} days`}
              </div>
            )}
            {nextService.hoursRemaining !== null && (
              <div className={`maintenance-info__card-meta ${
                nextService.hoursRemaining < 0 ? 'maintenance-info__card-meta--overdue' : ''
              }`}>
                {nextService.hoursRemaining < 0 
                  ? `Overdue by ${Math.abs(nextService.hoursRemaining).toFixed(1)}h`
                  : `in ${nextService.hoursRemaining.toFixed(1)}h`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {nextService && (
        <div className="maintenance-info__progress">
          <div className="maintenance-info__progress-header">
            <span>Resource Remaining</span>
            <span className="maintenance-info__progress-percentage">
              {nextService.percentRemaining.toFixed(0)}%
            </span>
          </div>
          <div className="maintenance-info__progress-bar">
            <div
              className={`maintenance-info__progress-fill maintenance-info__progress-fill--${getStatusColor()}`}
              style={{ width: `${Math.max(0, Math.min(100, nextService.percentRemaining))}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="maintenance-info__actions">
        <Button
          variant="primary"
          onClick={handleRecordService}
        >
          <CheckCircle size={18} />
          Record Service Completion
        </Button>
      </div>

      {/* Motor Hours Modal */}
      {isHoursModalOpen && (
        <MotorHoursInput
          isOpen={isHoursModalOpen}
          onClose={() => setIsHoursModalOpen(false)}
          currentHours={equipment.currentHours || 0}
          equipmentName={equipment.name}
          onSubmit={handleUpdateHours}
        />
      )}
    </div>
  );
};
