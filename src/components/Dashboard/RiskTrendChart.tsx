import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { riskTrendData } from '../../data/mockData';

export default function RiskTrendChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Risk Trend (Past 30 Days)</h2>
        <p className="text-sm text-gray-500">Average risk scores by category</p>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={riskTrendData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{ value: 'Day', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#64748b' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  delivery: 'Delivery Risk',
                  compliance: 'Compliance Risk',
                  cost: 'Cost Risk',
                };
                return [value, labels[name as string] || name];
              }}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  delivery: 'Delivery Risk',
                  compliance: 'Compliance Risk',
                  cost: 'Cost Risk',
                };
                return <span className="text-sm text-gray-600">{labels[value] || value}</span>;
              }}
            />
            <Line
              type="monotone"
              dataKey="delivery"
              name="delivery"
              stroke="#DC2626"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#DC2626' }}
            />
            <Line
              type="monotone"
              dataKey="compliance"
              name="compliance"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#F59E0B' }}
            />
            <Line
              type="monotone"
              dataKey="cost"
              name="cost"
              stroke="#1E40AF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#1E40AF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
