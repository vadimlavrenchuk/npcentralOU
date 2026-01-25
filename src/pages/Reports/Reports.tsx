/**
 * Reports Page - Advanced Analytics & Data Export
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, TrendingUp, DollarSign, AlertCircle, Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Button, Card } from '../../components/shared';
import { Can } from '../../components/shared/Can';
import { usePermissions } from '../../hooks/usePermissions';
import { exportMonthlyReport } from '../../utils/csvExport';
import { apiClient } from '../../api/client';
import { FinancialReport } from './FinancialReport';
import './Reports.scss';

interface ReportSummary {
  expenses: {
    month: string;
    totalCost: number;
    itemsUsed: number;
  };
  efficiency: {
    averageCompletionTime: number;
    completedOrders: number;
    pendingOrders: number;
    overdueOrders: number;
  };
  topIssues: Array<{
    equipmentId: string;
    equipmentName: string;
    issueCount: number;
    totalCost: number;
  }>;
  weeklyBreakdowns: Array<{
    week: string;
    count: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { can, isAccountant } = usePermissions();
  
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.get<ReportSummary>(
        `/reports/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      
      setSummary(data);
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const data = await apiClient.get<any>(
        `/reports/export?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      
      const month = new Date(dateRange.startDate).toLocaleDateString('en-US', { month: 'long' });
      const year = new Date(dateRange.startDate).getFullYear();
      
      exportMonthlyReport(data, month, year);
    } catch (err: any) {
      console.error('Error exporting data:', err);
      alert(t('reports.exportError'));
    } finally {
      setExporting(false);
    }
  };

  // Accountants see financial report instead of technical report
  if (isAccountant) {
    return <FinancialReport />;
  }

  if (loading) {
    return <div className="page-loading">{t('reports.loading')}</div>;
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="page-error">
          <AlertCircle size={48} />
          <p>{error}</p>
          <Button onClick={fetchReportData}>{t('reports.retry')}</Button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return <div className="page-loading">{t('reports.noData')}</div>;
  }

  // Prepare data for charts
  const top5Equipment = summary.topIssues.slice(0, 5);
  
  const statusData = [
    { name: t('reports.status.completed'), value: summary.efficiency.completedOrders, color: COLORS[1] },
    { name: t('reports.status.pending'), value: summary.efficiency.pendingOrders, color: COLORS[2] },
    { name: t('reports.status.overdue'), value: summary.efficiency.overdueOrders, color: COLORS[3] }
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('reports.title')}</h1>
          <p className="page-subtitle">
            {summary.expenses.month}
            {isAccountant && <span className="accountant-badge"> • {t('reports.viewOnly')}</span>}
          </p>
        </div>
        
        <div className="header-actions">
          <div className="date-range-selector">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="date-input"
            />
            <span>{t('reports.dateRange.to')}</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="date-input"
            />
          </div>
          
          <Can perform="canExportReports">
            <Button
              variant="primary"
              icon={<Download size={20} />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? t('reports.exporting') : t('reports.export')}
            </Button>
          </Can>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <Card className="kpi-card kpi-card--expenses">
          <div className="kpi-icon">
            <DollarSign size={32} />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-title">{t('reports.kpi.totalExpenses')}</h3>
            <p className="kpi-value">€{summary.expenses.totalCost.toFixed(2)}</p>
            <p className="kpi-subtitle">{summary.expenses.itemsUsed} {t('reports.kpi.itemsUsed')}</p>
          </div>
        </Card>

        <Card className="kpi-card kpi-card--efficiency">
          <div className="kpi-icon">
            <Clock size={32} />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-title">{t('reports.kpi.avgCompletionTime')}</h3>
            <p className="kpi-value">{summary.efficiency.averageCompletionTime}h</p>
            <p className="kpi-subtitle">{summary.efficiency.completedOrders} {t('reports.kpi.ordersCompleted')}</p>
          </div>
        </Card>

        <Card className="kpi-card kpi-card--issues">
          <div className="kpi-icon">
            <TrendingUp size={32} />
          </div>
          <div className="kpi-content">
            <h3 className="kpi-title">{t('reports.kpi.activeIssues')}</h3>
            <p className="kpi-value">{summary.efficiency.pendingOrders}</p>
            <p className="kpi-subtitle">{summary.efficiency.overdueOrders} {t('reports.kpi.overdue')}</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Bar Chart - Top 5 Most Expensive Equipment */}
        <Card className="chart-card">
          <h2 className="chart-title">{t('reports.charts.topEquipment')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top5Equipment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="equipmentName" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}`} />
              <Legend />
              <Bar dataKey="totalCost" fill={COLORS[0]} name="Total Cost (€)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Line Chart - Weekly Breakdown */}
        <Card className="chart-card">
          <h2 className="chart-title">{t('reports.charts.weeklyBreakdown')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.weeklyBreakdowns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={COLORS[0]} 
                strokeWidth={2}
                name="Issues Count"
                dot={{ fill: COLORS[0], r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart - Order Status Distribution */}
        <Card className="chart-card chart-card--pie">
          <h2 className="chart-title">{t('reports.charts.statusDistribution')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Equipment Issues Table */}
        <Card className="chart-card chart-card--table">
          <h2 className="chart-title">{t('reports.charts.topIssues')}</h2>
          <div className="equipment-table-wrapper">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>{t('reports.table.equipment')}</th>
                  <th>{t('reports.table.issueCount')}</th>
                  <th>{t('reports.table.totalCost')}</th>
                </tr>
              </thead>
              <tbody>
                {summary.topIssues.slice(0, 10).map((item, index) => (
                  <tr key={item.equipmentId}>
                    <td>
                      <span className="rank-badge">{index + 1}</span>
                      {item.equipmentName}
                    </td>
                    <td>{item.issueCount}</td>
                    <td className="cost-cell">€{item.totalCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isAccountant && (
        <div className="accountant-notice">
          <AlertCircle size={20} />
          <p>{t('reports.accountantNotice')}</p>
        </div>
      )}
    </div>
  );
};
