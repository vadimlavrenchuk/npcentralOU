/**
 * Financial Report - For Accountants
 * Shows inventory expenses, stock status, and items to order
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, TrendingDown, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { Button, Card } from '../../components/shared';
import { apiClient } from '../../api/client';
import { exportToExcel } from '../../utils/excelExport';
import './FinancialReport.scss';

interface FinancialReportData {
  period: {
    start: string;
    end: string;
  };
  expenses: {
    total: number;
    byCategory: Array<{
      category: string;
      amount: number;
    }>;
    details: Array<{
      orderNumber: string;
      partName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      totalCost: number;
      category: string;
      usedDate: string;
    }>;
  };
  inventory: {
    totalValue: number;
    totalItems: number;
    lowStockCount: number;
  };
  ordersNeeded: {
    items: Array<{
      sku: string;
      name: string;
      currentQuantity: number;
      minQuantity: number;
      needToOrder: number;
      unitPrice: number;
      estimatedCost: number;
      supplier: string;
    }>;
    totalCost: number;
    itemCount: number;
  };
}

export const FinancialReport: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<FinancialReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const report = await apiClient.get<FinancialReportData>(
        `/reports/financial?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      
      setData(report);
    } catch (err: any) {
      console.error('Error fetching financial report:', err);
      setError(err.message || t('reports.financial.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleExportExpenses = () => {
    if (!data) return;
    
    const excelData = data.expenses.details.map(item => ({
      [t('reports.financial.date')]: new Date(item.usedDate).toLocaleDateString(i18n.language),
      [t('reports.financial.order')]: item.orderNumber,
      [t('reports.financial.itemName')]: item.partName,
      [t('reports.financial.sku')]: item.sku,
      [t('reports.financial.category')]: item.category,
      [t('reports.financial.quantity')]: item.quantity,
      [t('reports.financial.price')]: item.unitPrice.toFixed(2),
      [t('reports.financial.amount')]: item.totalCost.toFixed(2)
    }));
    
    exportToExcel(excelData, `${t('reports.financial.expensesDetails')}_${dateRange.startDate}_${dateRange.endDate}.xlsx`);
  };

  const handleExportOrders = () => {
    if (!data) return;
    
    const excelData = data.ordersNeeded.items.map(item => ({
      [t('reports.financial.sku')]: item.sku,
      [t('reports.financial.itemName')]: item.name,
      [t('reports.financial.supplier')]: item.supplier,
      [t('reports.financial.stock')]: item.currentQuantity,
      [t('reports.financial.minimum')]: item.minQuantity,
      [t('reports.financial.toOrder')]: item.needToOrder,
      [t('reports.financial.pricePerUnit')]: item.unitPrice.toFixed(2),
      [t('reports.financial.toPay')]: item.estimatedCost.toFixed(2)
    }));
    
    exportToExcel(excelData, `${t('reports.financial.needToOrder')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return <div className="page-loading">{t('reports.financial.loading')}</div>;
  }

  if (error) {
    return (
      <div className="financial-report">
        <div className="error-state">
          <h2>{t('reports.financial.errorLoading')}</h2>
          <p>{error}</p>
          <Button onClick={fetchData}>{t('reports.financial.retry')}</Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="financial-report">
      <div className="report-header">
        <h1>{t('reports.financial.title')}</h1>
        <div className="date-filter">
          <label>
            {t('reports.financial.dateFrom')}:
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </label>
          <label>
            {t('reports.financial.dateTo')}:
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <Card className="summary-card expenses">
          <div className="card-icon">
            <TrendingDown />
          </div>
          <div className="card-content">
            <h3>{t('reports.financial.expensesPeriod')}</h3>
            <div className="amount">€{data.expenses.total.toFixed(2)}</div>
            <p className="period">{data.period.start} - {data.period.end}</p>
          </div>
        </Card>

        <Card className="summary-card inventory">
          <div className="card-icon">
            <Package />
          </div>
          <div className="card-content">
            <h3>{t('reports.financial.warehouseValue')}</h3>
            <div className="amount">€{data.inventory.totalValue.toFixed(2)}</div>
            <p className="period">{data.inventory.totalItems} {t('reports.financial.itemsInStock')}</p>
          </div>
        </Card>

        <Card className="summary-card orders">
          <div className="card-icon">
            <ShoppingCart />
          </div>
          <div className="card-content">
            <h3>{t('reports.financial.paySuppliers')}</h3>
            <div className="amount">€{data.ordersNeeded.totalCost.toFixed(2)}</div>
            <p className="period">{data.ordersNeeded.itemCount} {t('reports.financial.itemsToOrder')}</p>
          </div>
        </Card>
      </div>

      {/* Expenses by Category */}
      {data.expenses.byCategory.length > 0 && (
        <Card className="expenses-category">
          <div className="card-header">
            <h2>{t('reports.financial.expensesByCategory')}</h2>
          </div>
          <div className="category-list">
            {data.expenses.byCategory.map(cat => (
              <div key={cat.category} className="category-item">
                <span className="category-name">{cat.category}</span>
                <span className="category-amount">€{cat.amount.toFixed(2)}</span>
                <div className="category-bar">
                  <div 
                    className="category-fill" 
                    style={{ width: `${(cat.amount / data.expenses.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expenses Details */}
      <Card className="expenses-details">
        <div className="card-header">
          <h2>{t('reports.financial.expensesDetails')}</h2>
          <Button onClick={handleExportExpenses} icon={<Download size={18} />}>
            {t('reports.financial.downloadExcel')}
          </Button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{t('reports.financial.date')}</th>
                <th>{t('reports.financial.order')}</th>
                <th>{t('reports.financial.itemName')}</th>
                <th>{t('reports.financial.sku')}</th>
                <th>{t('reports.financial.category')}</th>
                <th className="text-right">{t('reports.financial.quantity')}</th>
                <th className="text-right">{t('reports.financial.price')}</th>
                <th className="text-right">{t('reports.financial.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.details.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.usedDate).toLocaleDateString(i18n.language)}</td>
                  <td>{item.orderNumber}</td>
                  <td>{item.partName}</td>
                  <td className="sku">{item.sku}</td>
                  <td>{item.category}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">€{item.unitPrice.toFixed(2)}</td>
                  <td className="text-right amount">€{item.totalCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7}><strong>{t('reports.financial.total')}:</strong></td>
                <td className="text-right"><strong>€{data.expenses.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Items to Order */}
      {data.ordersNeeded.items.length > 0 && (
        <Card className="orders-needed">
          <div className="card-header">
            <h2>{t('reports.financial.needToOrder')}</h2>
            <Button onClick={handleExportOrders} icon={<Download size={18} />} variant="primary">
              {t('reports.financial.downloadForPayment')}
            </Button>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>{t('reports.financial.sku')}</th>
                  <th>{t('reports.financial.itemName')}</th>
                  <th>{t('reports.financial.supplier')}</th>
                  <th className="text-right">{t('reports.financial.stock')}</th>
                  <th className="text-right">{t('reports.financial.minimum')}</th>
                  <th className="text-right">{t('reports.financial.toOrder')}</th>
                  <th className="text-right">{t('reports.financial.pricePerUnit')}</th>
                  <th className="text-right">{t('reports.financial.toPay')}</th>
                </tr>
              </thead>
              <tbody>
                {data.ordersNeeded.items.map((item, index) => (
                  <tr key={index} className={item.currentQuantity === 0 ? 'critical' : 'warning'}>
                    <td className="sku">{item.sku}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.supplier}</td>
                    <td className="text-right">{item.currentQuantity}</td>
                    <td className="text-right">{item.minQuantity}</td>
                    <td className="text-right order-quantity">{item.needToOrder}</td>
                    <td className="text-right">€{item.unitPrice.toFixed(2)}</td>
                    <td className="text-right amount">€{item.estimatedCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={7}><strong>{t('reports.financial.totalToPay')}:</strong></td>
                  <td className="text-right"><strong>€{data.ordersNeeded.totalCost.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {data.ordersNeeded.items.length === 0 && (
        <Card className="no-orders">
          <p>{t('reports.financial.allStockSufficient')}</p>
        </Card>
      )}
    </div>
  );
};
