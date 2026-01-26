import { useState } from 'react';
import { AlertTriangle, Eye, DollarSign, Building2 } from 'lucide-react';
import { getCriticalCount, getMediumCount, getTotalRevenueAtRisk } from '../../data/mockData';
import type { FilterState } from '../../types';
import FilterBar from './FilterBar';
import TopRisksTable from './TopRisksTable';
import RiskTrendChart from './RiskTrendChart';
import ImpactCards from './ImpactCards';

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    timeHorizon: 'today',
    riskLevel: 'critical',
    impactType: 'all',
  });

  const criticalCount = getCriticalCount();
  const mediumCount = getMediumCount();
  const totalRevenue = getTotalRevenueAtRisk();

  const metrics = [
    {
      title: 'Critical Risks',
      value: criticalCount,
      subtitle: 'Require action this week',
      color: 'red' as const,
      icon: AlertTriangle,
    },
    {
      title: 'Medium Risks',
      value: mediumCount,
      subtitle: 'Monitor closely',
      color: 'yellow' as const,
      icon: Eye,
    },
    {
      title: 'Revenue at Risk',
      value: `$${totalRevenue.toFixed(1)}M`,
      subtitle: 'Across all active alerts',
      color: 'gray' as const,
      icon: DollarSign,
    },
    {
      title: 'Suppliers Monitored',
      value: 247,
      subtitle: 'Across 12 risk categories',
      color: 'gray' as const,
      icon: Building2,
    },
  ];

  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    gray: 'bg-slate-50 border-slate-200 text-slate-600',
    green: 'bg-green-50 border-green-200 text-green-600',
  };

  const iconBgClasses = {
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    gray: 'bg-slate-100',
    green: 'bg-green-100',
  };

  return (
    <div className="p-6">
      {/* Hero Metrics Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-5 rounded-xl border ${colorClasses[metric.color]} bg-white`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className={`text-3xl font-bold tabular-nums ${
                  metric.color === 'red' ? 'text-red-600' :
                  metric.color === 'yellow' ? 'text-yellow-600' : 'text-gray-900'
                }`}>
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${iconBgClasses[metric.color]}`}>
                <metric.icon className={
                  metric.color === 'red' ? 'text-red-600' :
                  metric.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
                } size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* Main Content - 2 Columns */}
      <div className="grid grid-cols-5 gap-6 mt-6">
        {/* Left Column (60% = 3/5) */}
        <div className="col-span-3 space-y-6">
          <TopRisksTable filters={filters} />
          <RiskTrendChart />
        </div>

        {/* Right Column (40% = 2/5) */}
        <div className="col-span-2">
          <ImpactCards />
        </div>
      </div>
    </div>
  );
}
