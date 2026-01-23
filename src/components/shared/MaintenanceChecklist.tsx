import React from 'react';
import type { ChecklistTask } from '../../types';
import './MaintenanceChecklist.scss';

interface MaintenanceChecklistProps {
  tasks: ChecklistTask[];
  onChange?: (tasks: ChecklistTask[]) => void;
  readOnly?: boolean;
  className?: string;
}

export const MaintenanceChecklist: React.FC<MaintenanceChecklistProps> = ({
  tasks,
  onChange,
  readOnly = false,
  className = '',
}) => {
  const handleToggleTask = (index: number) => {
    if (readOnly || !onChange) return;
    
    const updatedTasks = tasks.map((task, i) => {
      if (i === index) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    
    onChange(updatedTasks);
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className={`maintenance-checklist ${className}`}>
      <div className="maintenance-checklist__header">
        <h3 className="maintenance-checklist__title">Maintenance Checklist</h3>
        <div className="maintenance-checklist__progress">
          <span className="maintenance-checklist__progress-text">
            {completedCount} / {tasks.length} completed
          </span>
          <div className="maintenance-checklist__progress-bar">
            <div
              className="maintenance-checklist__progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="maintenance-checklist__empty">
          No maintenance tasks defined
        </div>
      ) : (
        <ul className="maintenance-checklist__list">
          {tasks.map((task, index) => (
            <li
              key={index}
              className={`maintenance-checklist__item ${
                task.completed ? 'maintenance-checklist__item--completed' : ''
              }`}
            >
              <label className="maintenance-checklist__label">
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={() => handleToggleTask(index)}
                  disabled={readOnly}
                  className="maintenance-checklist__checkbox"
                />
                <span className="maintenance-checklist__task-text">
                  {task.task}
                  {task.required && (
                    <span className="maintenance-checklist__required">*</span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
