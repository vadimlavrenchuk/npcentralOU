/**
 * Inventory Page - страница склада
 */

import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card } from '../components/shared';
import { useInventory } from '../hooks';

export const Inventory: React.FC = () => {
  const { items, loading, error, fetchInventory } = useInventory();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  if (loading && items.length === 0) {
    return <div className="page-loading">Загрузка...</div>;
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1 className="page-title">Склад</h1>
        <Button variant="primary" icon={<Plus size={20} />}>
          Добавить позицию
        </Button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <Card>
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Нет позиций на складе</p>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <div key={item.id}>
                <h3>{item.name}</h3>
                <p>Количество: {item.quantity} {item.unit}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
