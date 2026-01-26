import { Truck, ShieldCheck, DollarSign } from 'lucide-react';
import { suppliers } from '../../data/mockData';
import { formatRevenue } from '../../types';

export default function ImpactCards() {
  // Calculate stats by impact type
  const getImpactStats = (impactType: 'Delivery' | 'Compliance' | 'Cost') => {
    const filtered = suppliers.filter(
      (s) => s.primaryImpact === impactType && s.overallRiskScore >= 60
    );
    const count = filtered.length;
    const revenue = filtered.reduce((sum, s) => sum + s.revenueAtRisk, 0);
    return { count, revenue };
  };

  const deliveryStats = getImpactStats('Delivery');
  const complianceStats = getImpactStats('Compliance');
  const costStats = getImpactStats('Cost');

  const impactCards = [
    {
      title: 'Delivery Risk',
      count: deliveryStats.count,
      revenue: deliveryStats.revenue,
      description: 'Port congestion, factory fires, capacity shortages',
      icon: Truck,
      color: 'red' as const,
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      textColor: 'text-red-600',
    },
    {
      title: 'Compliance Risk',
      count: complianceStats.count,
      revenue: complianceStats.revenue,
      description: 'Sanctions violations, forced labor flags',
      icon: ShieldCheck,
      color: 'orange' as const,
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
    {
      title: 'Cost Risk',
      count: costStats.count,
      revenue: costStats.revenue,
      description: 'Commodity price spikes, currency fluctuation',
      icon: DollarSign,
      color: 'blue' as const,
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Impact Breakdown</h2>

      {impactCards.map((card) => (
        <div
          key={card.title}
          className={`p-5 rounded-xl border ${card.borderColor} ${card.bgColor} bg-white`}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`p-3 rounded-lg ${card.iconBg}`}>
              <card.icon className={card.textColor} size={24} />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{card.title}</h3>
                <span className={`text-3xl font-bold tabular-nums ${card.textColor}`}>
                  {card.count}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{card.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500 uppercase font-medium">Revenue at Risk</span>
                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                  {formatRevenue(card.revenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
