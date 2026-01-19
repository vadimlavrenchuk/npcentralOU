/**
 * Equipment Page - страница оборудования
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button, Card } from '../components/shared';
import { useEquipment } from '../hooks';

export const Equipment: React.FC = () => {
  const { t } = useTranslation();
  const { equipment, loading, error, fetchEquipment } = useEquipment();

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  if (loading && equipment.length === 0) {
    return <div className="page-loading">{t('common.loading')}</div>;
  }

  return (
    <div className="equipment-page">
      <div className="page-header">
        <h1 className="page-title">{t('equipment.title')}</h1>
        <Button variant="primary" icon={<Plus size={20} />}>
          {t('equipment.addNew')}
        </Button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <Card>
        {equipment.length === 0 ? (
          <div className="empty-state">
            <p>{t('equipment.noData')}</p>
          </div>
        ) : (
          <div>
            {equipment.map((item) => (
              <div key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.model}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
