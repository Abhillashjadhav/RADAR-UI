import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { suppliers } from '../../data/mockData';
import type { FilterState } from '../../types';
import { formatRevenue, getRiskLevel } from '../../types';

interface TopRisksTableProps {
  filters: FilterState;
}

export default function TopRisksTable({ filters }: TopRisksTableProps) {
  const navigate = useNavigate();

  // Filter and sort suppliers
  const filteredSuppliers = suppliers
    .filter((supplier) => {
      // Filter by risk level
      const level = getRiskLevel(supplier.overallRiskScore);
      if (filters.riskLevel !== 'all' && level !== filters.riskLevel) {
        return false;
      }

      // Filter by impact type
      if (filters.impactType !== 'all' && supplier.primaryImpact !== filters.impactType) {
        return false;
      }

      // Filter by time horizon (simplified - using lastUpdated)
      if (filters.timeHorizon === 'today') {
        const hoursSince = (Date.now() - new Date(supplier.lastUpdated).getTime()) / (1000 * 60 * 60);
        if (hoursSince > 24) return false;
      } else if (filters.timeHorizon === 'week') {
        const daysSince = (Date.now() - new Date(supplier.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 7) return false;
      }

      return true;
    })
    .sort((a, b) => b.overallRiskScore - a.overallRiskScore)
    .slice(0, 5);

  const impactBadgeColors = {
    Delivery: 'bg-red-100 text-red-700',
    Compliance: 'bg-orange-100 text-orange-700',
    Cost: 'bg-blue-100 text-blue-700',
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Risks (Revenue-Weighted Priority)</h2>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <Clock size={14} />
              <span>Updated 5 minutes ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Supplier Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Risk Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Revenue Impact
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSuppliers.map((supplier, index) => (
              <tr
                key={supplier.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-4">
                  <span className="text-lg font-bold text-gray-400 tabular-nums">
                    {index + 1}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => navigate(`/supplier/${supplier.id}`)}
                    className="font-medium text-blue-800 hover:text-blue-600 hover:underline text-left"
                  >
                    {supplier.name}
                  </button>
                  <p className="text-sm text-gray-500">{supplier.location.city}, {supplier.location.country}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${impactBadgeColors[supplier.primaryImpact]}`}>
                    {supplier.primaryImpact}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center justify-center w-12 h-8 rounded-md text-sm font-bold tabular-nums ${getScoreColor(supplier.overallRiskScore)}`}>
                    {supplier.overallRiskScore}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {formatRevenue(supplier.revenueAtRisk)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => navigate(`/supplier/${supplier.id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-800 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={`View details for ${supplier.name}`}
                  >
                    View Details
                    <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSuppliers.length === 0 && (
          <div className="px-5 py-12 text-center text-gray-500">
            No suppliers match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
