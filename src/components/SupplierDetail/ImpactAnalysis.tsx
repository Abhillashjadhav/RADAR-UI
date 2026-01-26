import { AlertTriangle, Info, Clock, CheckSquare, Square } from 'lucide-react';
import type { Supplier } from '../../types';
import { formatRevenue } from '../../types';

interface ImpactAnalysisProps {
  supplier: Supplier;
}

export default function ImpactAnalysis({ supplier }: ImpactAnalysisProps) {
  const impactColors = {
    Delivery: 'bg-red-600',
    Compliance: 'bg-orange-500',
    Cost: 'bg-blue-600',
  };

  // Generate contextual intelligence based on supplier
  const contextualIntelligence = [
    `${supplier.name} supplies PCBs for your QX-400 avionics module`,
    'Current inventory: 45 days. Lead time extension exceeds buffer.',
    'Customer delivery commitments at risk for Boeing (PO #89234) and Airbus (PO #89567)',
    'Alternate suppliers (Flex Chennai, Wistron Pune) also affected by same disruption',
  ];

  // Generate timeline events
  const timelineEvents = [
    { date: 'Jan 15', event: 'Typhoon Saola hits Hong Kong' },
    { date: 'Jan 18', event: 'Shenzhen port operations at 40% capacity' },
    { date: 'Jan 22', event: 'Backlog reaches 12-day delay' },
    { date: 'Jan 24', event: `${supplier.name} flags shipment delays` },
  ];

  // Generate recommended actions
  const recommendedActions = [
    { text: `Contact ${supplier.name} to confirm revised ETA`, assignee: 'John Smith', checked: false },
    { text: 'Evaluate air freight option for critical PO #89234', estimate: '$45K', checked: false },
    { text: 'Notify Boeing and Airbus of potential 10-day slip', checked: false },
    { text: 'Expedite qualification of Flex Chennai as backup', target: '30 days', checked: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full space-y-6">
      {/* Section 1: Primary Impact */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-4 py-1.5 rounded-lg text-white text-sm font-semibold ${impactColors[supplier.primaryImpact]}`}>
            {supplier.primaryImpact.toUpperCase()} RISK
          </span>
        </div>
        <p className="text-gray-700 mb-4">{supplier.topRiskDescription}</p>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Revenue at Risk</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              {formatRevenue(supplier.revenueAtRisk)}
            </p>
          </div>
          <div className="h-12 w-px bg-gray-200" />
          <div>
            <p className="text-sm text-gray-500 mb-1">Timeline</p>
            <p className="text-sm font-semibold text-gray-900">Impact expected: Feb 10-28, 2025</p>
          </div>
        </div>
      </div>

      {/* Section 2: Why This Matters */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Info size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Why This Matters (Contextual Intelligence)</h3>
        </div>
        <ul className="space-y-2">
          {contextualIntelligence.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-blue-600 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 3: Root Cause Details */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Root Cause Timeline</h3>
        </div>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-4 relative">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  index === timelineEvents.length - 1
                    ? 'bg-red-500 border-red-500'
                    : 'bg-white border-gray-300'
                } z-10`} />
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">{event.date}</span>
                  <p className="text-sm text-gray-700">{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Recommended Actions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Recommended Actions (AI-generated)</h3>
        </div>
        <div className="space-y-3">
          {recommendedActions.map((action, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {action.checked ? (
                <CheckSquare size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Square size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-900">{action.text}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {action.assignee && (
                    <span>Assign to: <span className="font-medium">{action.assignee}</span></span>
                  )}
                  {action.estimate && (
                    <span>Cost estimate: <span className="font-medium">{action.estimate}</span></span>
                  )}
                  {action.target && (
                    <span>Target: <span className="font-medium">{action.target}</span></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
