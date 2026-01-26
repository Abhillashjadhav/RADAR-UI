import type { FilterState, TimeHorizon, RiskLevel, ImpactType } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const timeHorizonOptions: { value: TimeHorizon; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'quarter', label: 'This Quarter' },
  ];

  const riskLevelOptions: { value: RiskLevel | 'all'; label: string }[] = [
    { value: 'critical', label: 'Critical' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'all', label: 'All' },
  ];

  const impactTypeOptions: { value: ImpactType | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Cost', label: 'Cost' },
  ];

  const handleTimeHorizonChange = (value: TimeHorizon) => {
    onFilterChange({ ...filters, timeHorizon: value });
  };

  const handleRiskLevelChange = (value: RiskLevel | 'all') => {
    onFilterChange({ ...filters, riskLevel: value });
  };

  const handleImpactTypeChange = (value: ImpactType | 'all') => {
    onFilterChange({ ...filters, impactType: value });
  };

  return (
    <div className="flex items-center gap-8 py-3 px-4 bg-white rounded-lg border border-gray-200">
      {/* Time Horizon */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Time Horizon:</span>
        <div className="flex gap-1">
          {timeHorizonOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeHorizonChange(option.value)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                filters.timeHorizon === option.value
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Risk Level */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Risk Level:</span>
        <div className="flex gap-1">
          {riskLevelOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleRiskLevelChange(option.value)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                filters.riskLevel === option.value
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Impact Type */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Impact Type:</span>
        <div className="flex gap-1">
          {impactTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleImpactTypeChange(option.value)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                filters.impactType === option.value
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
