/**
 * Work Orders Page - страница заказов на работы
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button, Card, Modal } from '../../components/shared';
import { useWorkOrders } from '../../hooks';
import './WorkOrders.scss';

export const WorkOrders: React.FC = () => {
  const { t } = useTranslation();
  const { 
    workOrders, 
    loading, 
    error, 
    fetchWorkOrders,
    createWorkOrder 
  } = useWorkOrders();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const handleCreate = async () => {
    // TODO: Implement form logic
    setIsModalOpen(false);
  };

  if (loading && workOrders.length === 0) {
    return <div className="page-loading">{t('common.loading')}</div>;
  }

  return (
    <div className="work-orders">
      <div className="work-orders__header">
        <h1 className="work-orders__title">{t('workOrders.title')}</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={20} />}
          onClick={() => setIsModalOpen(true)}
        >
          {t('workOrders.createNew')}
        </Button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <Card>
        {workOrders.length === 0 ? (
          <div className="empty-state">
            <p>{t('workOrders.noData')}</p>
          </div>
        ) : (
          <div className="work-orders__list">
            {workOrders.map((order) => (
              <div key={order.id} className="work-order-item">
                <div className="work-order-item__header">
                  <h3>{order.title}</h3>
                  <span className={`status status--${order.status}`}>
                    {t(`workOrders.status.${order.status}`)}
                  </span>
                </div>
                <p>{order.description}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('workOrders.createNew')}
      >
        <p>{t('workOrders.form.title')}</p>
      </Modal>
    </div>
  );
};
