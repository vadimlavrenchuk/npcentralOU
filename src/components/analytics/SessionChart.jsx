import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';

const SLICE_COLORS = {
  setup: '#f59e0b',
  work: '#10b981',
  downtime: '#94a3b8',
  failure: '#ef4444',
};

// eslint-disable-next-line react/prop-types
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/**
 * @param {{ data: import('../../types/aiProcessLog').ParsedLogEntry[] }} props
 */
export default function SessionChart({ data }) {
  const { t } = useTranslation();

  const totals = {};
  for (const entry of data) {
    totals[entry.type] = (totals[entry.type] ?? 0) + entry.financials.durationHours;
  }

  const chartData = Object.entries(totals)
    .filter(([, v]) => v > 0)
    .map(([type, hours]) => ({
      type,
      name: t(`analytics.eventTypes.${type}`),
      value: parseFloat(hours.toFixed(2)),
    }));

  if (chartData.length === 0) return null;

  const totalHours = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="analytics-chart">
      <div className="analytics-chart__head">
        <h3 className="analytics-chart__title">{t('analytics.chart.title')}</h3>
        <p className="analytics-chart__sub">
          {t('analytics.chart.total')}: {totalHours.toFixed(1)}h
        </p>
      </div>
      <div className="analytics-chart__body">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={<CustomLabel />}
            >
              {chartData.map((entry) => (
                <Cell key={entry.type} fill={SLICE_COLORS[entry.type] ?? '#6b7280'} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, _name, item) => [
                `${Number(val ?? 0).toFixed(2)}h`,
                item.payload.name,
              ]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '13px',
              }}
            />
            <Legend iconType="circle" iconSize={10} formatter={(value) => <span className="analytics-chart__legend">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
