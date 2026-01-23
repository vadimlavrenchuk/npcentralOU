import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import './MotorHoursInput.scss';

interface MotorHoursInputProps {
  isOpen: boolean;
  onClose: () => void;
  currentHours: number;
  equipmentName: string;
  onSubmit: (hours: number) => Promise<void>;
}

export const MotorHoursInput: React.FC<MotorHoursInputProps> = ({
  isOpen,
  onClose,
  currentHours,
  equipmentName,
  onSubmit,
}) => {
  const [hours, setHours] = useState<string>(currentHours.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hoursValue = parseFloat(hours);

    if (isNaN(hoursValue) || hoursValue < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    if (hoursValue < currentHours) {
      setError('New hours value cannot be less than current hours');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(hoursValue);
      onClose();
      setHours(hoursValue.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hours');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      setHours(currentHours.toString());
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Motor Hours"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="motor-hours-input">
        <div className="motor-hours-input__info">
          <p className="motor-hours-input__equipment">{equipmentName}</p>
          <p className="motor-hours-input__current">
            Current hours: <strong>{currentHours.toFixed(1)}</strong>
          </p>
        </div>

        <div className="motor-hours-input__field">
          <Input
            label="New Motor Hours"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Enter current motor hours"
            min={currentHours}
            step="0.1"
            required
            autoFocus
            error={error}
          />
          <p className="motor-hours-input__hint">
            Enter the current meter reading from the equipment
          </p>
        </div>

        {error && (
          <div className="motor-hours-input__error">
            {error}
          </div>
        )}

        <div className="motor-hours-input__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Hours'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
