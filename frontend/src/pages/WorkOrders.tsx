/**
 * Work Orders Page - страница заказов на работы
 */

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, Modal } from '../components/shared';
import { useWorkOrders } from '../hooks';
import './WorkOrders.scss';

export const WorkOrders: React.FC = () => {
  const { 
    workOrders, 
    loading, 
    error, 
    fetchWorkOrders,
  } = useWorkOrders();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  if (loading && workOrders.length === 0) {
    return <div className="page-loading">Загрузка...</div>;
  }

  return (
    <div className="work-orders">
      <div className="work-orders__header">
        <h1 className="work-orders__title">Заказы на работы</h1>
        <Button 
          variant="primary" 
          icon={<Plus size={20} />}
          onClick={() => setIsModalOpen(true)}
        >
          Создать заказ
        </Button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <Card>
        {workOrders.length === 0 ? (
          <div className="empty-state">
            <p>Нет заказов на работы</p>
          </div>
        ) : (
          <div className="work-orders__list">
            {workOrders.map((order) => (
              <div key={order.id} className="work-order-item">
                <div className="work-order-item__header">
                  <h3>{order.title}</h3>
                  <span className={`status status--${order.status}`}>
                    {order.status}
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
        title="Создать заказ на работу"
      >
        <p>Форма создания заказа будет здесь</p>
      </Modal>
    </div>
  );
};
