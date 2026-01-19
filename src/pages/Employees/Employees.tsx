/**
 * Employees Page - управление сотрудниками
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/shared';
import './Employees.scss';

export const Employees: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="employees-page">
      <h1>{t('nav.users')}</h1>
      <Card>
        <p>Страница сотрудников в разработке</p>
      </Card>
    </div>
  );
};
