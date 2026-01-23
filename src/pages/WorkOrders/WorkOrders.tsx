/**
 * Work Orders Page - страница заказов на работы
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button, Card, Modal, Input, PriorityBadge, PartSelector } from '../../components/shared';
import { useWorkOrders } from '../../hooks';
import { WorkOrderPriority, WorkOrderStatus } from '../../types';
import type { CreateWorkOrderDto, PartUsage } from '../../types';
import './WorkOrders.scss';

export const WorkOrders: React.FC = () => {
  const { t } = useTranslation();
  const { 
    workOrders, 
    loading, 
    error, 
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder 
  } = useWorkOrders();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateWorkOrderDto>({
    title: '',
    description: '',
    priority: WorkOrderPriority.MEDIUM,
    status: WorkOrderStatus.PENDING,
    parts: [],
    estimatedHours: undefined,
    dueDate: undefined,
    notes: '',
  });

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'estimatedHours' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      priority: WorkOrderPriority.MEDIUM,
      status: WorkOrderStatus.PENDING,
      parts: [],
      estimatedHours: undefined,
      dueDate: undefined,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: any) => {
    const orderId = order.id || order._id;
    setIsEditMode(true);
    setEditingId(orderId);
    setFormData({
      title: order.title,
      description: order.description,
      priority: order.priority,
      status: order.status,
      parts: order.parts || [],
      estimatedHours: order.estimatedHours,
      dueDate: order.dueDate ? order.dueDate.split('T')[0] : undefined,
      notes: order.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      return;
    }

    let result;
    if (isEditMode && editingId) {
      result = await updateWorkOrder(editingId, formData);
    } else {
      result = await createWorkOrder(formData);
    }
    
    if (result) {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        priority: WorkOrderPriority.MEDIUM,
        status: WorkOrderStatus.PENDING,
        parts: [],
        estimatedHours: undefined,
        dueDate: undefined,
        notes: '',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('workOrders.confirmDelete') || 'Are you sure you want to delete this work order?')) {
      await deleteWorkOrder(id);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getStatusLabel = (status: WorkOrderStatus) => {
    const labels: Record<WorkOrderStatus, string> = {
      [WorkOrderStatus.PENDING]: t('workOrders.status.pending') || 'Pending',
      [WorkOrderStatus.IN_PROGRESS]: t('workOrders.status.in_progress') || 'In Progress',
      [WorkOrderStatus.COMPLETED]: t('workOrders.status.completed') || 'Completed',
      [WorkOrderStatus.CANCELLED]: t('workOrders.status.cancelled') || 'Cancelled',
    };
    return labels[status];
  };

  if (loading && (!workOrders || workOrders.length === 0)) {
    return <div className="page-loading">{t('common.loading')}</div>;
  }

  return (
    <div className="work-orders">
      <div className="work-orders__header">
        <h1 className="work-orders__title">{t('workOrders.title')}</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={20} />}
          onClick={handleOpenCreate}
        >
          {t('workOrders.createNew')}
        </Button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <Card>
        {!workOrders || workOrders.length === 0 ? (
          <div className="empty-state">
            <p>{t('workOrders.noData')}</p>
          </div>
        ) : (
          <div className="work-orders__table-container">
            <table className="work-orders__table">
              <thead>
                <tr>
                  <th>{t('workOrders.table.priority') || 'Priority'}</th>
                  <th>{t('workOrders.table.title') || 'Title'}</th>
                  <th>{t('workOrders.table.description') || 'Description'}</th>
                  <th>{t('workOrders.table.status') || 'Status'}</th>
                  <th>{t('workOrders.table.dueDate') || 'Due Date'}</th>
                  <th>{t('workOrders.table.estimatedHours') || 'Est. Hours'}</th>
                  <th>{t('workOrders.table.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.filter(order => order).map((order) => {
                  const orderId = order.id || order._id;
                  return (
                  <tr key={orderId} className={`priority--${order.priority}`}>
                    <td>
                      <PriorityBadge priority={order.priority} />
                    </td>
                    <td className="work-orders__table-title">{order.title}</td>
                    <td className="work-orders__table-description">{order.description}</td>
                    <td>
                      <span className={`status status--${order.status}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>{formatDate(order.dueDate)}</td>
                    <td>{order.estimatedHours || '-'}</td>
                    <td>
                      <div className="work-orders__actions">
                        <button 
                          className="action-button action-button--edit"
                          onClick={() => handleOpenEdit(order)}
                          title={t('common.edit') || 'Edit'}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="action-button action-button--delete"
                          onClick={() => handleDelete(orderId)}
                          title={t('common.delete') || 'Delete'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingId(null);
        }}
        title={isEditMode ? (t('workOrders.edit') || 'Edit Work Order') : t('workOrders.createNew')}
        size="md"
      >
        <form className="work-order-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">{t('workOrders.form.title') || 'Title'} *</label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={t('workOrders.form.titlePlaceholder') || 'Enter work order title'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('workOrders.form.description') || 'Description'} *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('workOrders.form.descriptionPlaceholder') || 'Enter work order description'}
              rows={4}
              required
              className="form-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">{t('workOrders.form.priority') || 'Priority'} *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value={WorkOrderPriority.LOW}>{t('workOrders.priority.low') || 'Low'}</option>
                <option value={WorkOrderPriority.MEDIUM}>{t('workOrders.priority.medium') || 'Medium'}</option>
                <option value={WorkOrderPriority.HIGH}>{t('workOrders.priority.high') || 'High'}</option>
                <option value={WorkOrderPriority.CRITICAL}>{t('workOrders.priority.critical') || 'Critical'}</option>
              </select>
            </div>

            {isEditMode && (
              <div className="form-group">
                <label htmlFor="status">{t('workOrders.form.status') || 'Status'} *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value={WorkOrderStatus.PENDING}>{t('workOrders.status.pending') || 'Pending'}</option>
                  <option value={WorkOrderStatus.IN_PROGRESS}>{t('workOrders.status.in_progress') || 'In Progress'}</option>
                  <option value={WorkOrderStatus.COMPLETED}>{t('workOrders.status.completed') || 'Completed'}</option>
                  <option value={WorkOrderStatus.CANCELLED}>{t('workOrders.status.cancelled') || 'Cancelled'}</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedHours">{t('workOrders.form.estimatedHours') || 'Estimated Hours'}</label>
              <Input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                value={formData.estimatedHours || ''}
                onChange={handleInputChange}
                placeholder="0"
                min={0}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">{t('workOrders.form.dueDate') || 'Due Date'}</label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">{t('workOrders.form.notes') || 'Notes'}</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder={t('workOrders.form.notesPlaceholder') || 'Additional notes (optional)'}
              rows={3}
              className="form-textarea"
            />
          </div>

          {/* Part Selector Component */}
          <PartSelector
            selectedParts={formData.parts || []}
            onChange={(parts) => setFormData((prev) => ({ ...prev, parts }))}
          />

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setIsEditMode(false);
              setEditingId(null);
            }}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button type="submit" variant="primary">
              {isEditMode ? (t('common.save') || 'Save') : (t('common.create') || 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
