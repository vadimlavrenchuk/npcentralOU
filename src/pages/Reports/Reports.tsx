/**
 * Reports Page - отчеты и аналитика
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/shared';
import './Reports.scss';

export const Reports: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="reports-page">
      <h1>{t('nav.reports')}</h1>
      <Card>
        <p>Страница отчетов в разработке</p>
      </Card>
    </div>
  );
};
