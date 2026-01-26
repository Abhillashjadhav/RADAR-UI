import type { RiskLenses } from '../../types';

interface RiskLensChartProps {
  riskLenses: RiskLenses;
}

export default function RiskLensChart({ riskLenses }: RiskLensChartProps) {
  const lensConfig = [
    { key: 'economic', label: 'Economic/Financial' },
    { key: 'geopolitical', label: 'Geopolitical' },
    { key: 'cyber', label: 'Tech/Cyber' },
    { key: 'esg', label: 'ESG/Regulatory' },
    { key: 'catastrophic', label: 'Catastrophic/Systemic' },
    { key: 'environmental', label: 'Environmental/Climate' },
    { key: 'supplierViability', label: 'Multi-tier Supplier Viability' },
    { key: 'logistics', label: 'Logistics & Transport' },
    { key: 'infrastructure', label: 'Infrastructure' },
    { key: 'labor', label: 'Labor & Social' },
    { key: 'competition', label: 'Market Competition' },
    { key: 'digital', label: 'Digital Transformation' },
  ] as const;

  const getBarColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Find highest risk categories
  const sortedLenses = [...lensConfig].sort(
    (a, b) => riskLenses[b.key] - riskLenses[a.key]
  );
  const topRisks = sortedLenses.slice(0, 2).map((l) => l.key);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Risk Lens Breakdown</h2>
        <p className="text-sm text-gray-500">Risk assessment across 12 categories</p>
      </div>

      <div className="space-y-3">
        {lensConfig.map(({ key, label }) => {
          const score = riskLenses[key];
          const isTopRisk = topRisks.includes(key);

          return (
            <div key={key} className={`${isTopRisk ? 'bg-gray-50 -mx-2 px-2 py-1 rounded' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs ${isTopRisk ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                  {label}
                  {isTopRisk && (
                    <span className="ml-1 text-red-500">●</span>
                  )}
                </span>
                <span className={`text-xs font-semibold tabular-nums ${getTextColor(score)}`}>
                  {score}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          ● Indicates highest risk categories requiring immediate attention
        </p>
      </div>
    </div>
  );
}
