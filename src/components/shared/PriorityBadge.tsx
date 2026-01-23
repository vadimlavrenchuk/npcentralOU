/**
 * Priority Badge Component - displays work order priority with color coding
 */

import React from 'react';
import { WorkOrderPriority } from '../../types';
import './PriorityBadge.scss';

interface PriorityBadgeProps {
  priority: WorkOrderPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityLabel = (priority: WorkOrderPriority): string => {
    const labels: Record<WorkOrderPriority, string> = {
      [WorkOrderPriority.CRITICAL]: 'Critical',
      [WorkOrderPriority.HIGH]: 'High',
      [WorkOrderPriority.MEDIUM]: 'Medium',
      [WorkOrderPriority.LOW]: 'Low',
    };
    return labels[priority];
  };

  return (
    <span className={`priority-badge priority-badge--${priority} ${className}`}>
      {getPriorityLabel(priority)}
    </span>
  );
};
