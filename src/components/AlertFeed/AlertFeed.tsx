import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Zap } from 'lucide-react';
import { alerts } from '../../data/mockData';
import { sampleSignal } from '../../data/sample-signal';
import { formatRevenueAtRisk, severityTokens } from '../Signal/signalUi';
import AlertCard from './AlertCard';

type FilterOption = 'all' | 'critical' | 'watchlist';

export default function AlertFeed() {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadedCount, setLoadedCount] = useState(8);
  const navigate = useNavigate();

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'critical') return alert.severity === 'critical';
    if (filter === 'watchlist') return alert.severity === 'critical' || alert.severity === 'medium';
    return true;
  });

  const displayedAlerts = filteredAlerts.slice(0, loadedCount);

  const filterLabels: Record<FilterOption, string> = {
    all: 'All Alerts',
    critical: 'Critical Only',
    watchlist: 'My Watchlist',
  };

  const handleAlertClick = (supplierId: string) => {
    navigate(`/supplier/${supplierId}`);
  };

  const handleLoadMore = () => {
    setLoadedCount(prev => prev + 5);
  };

  return (
    <aside className="fixed top-16 right-0 w-[300px] h-[calc(100vh-64px)] bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
        <p className="text-sm text-gray-500">Last 24 hours</p>

        {/* Filter Dropdown */}
        <div className="relative mt-3">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            {filterLabels[filter]}
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              {(Object.keys(filterLabels) as FilterOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setFilter(option);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    filter === option ? 'bg-blue-50 text-blue-800' : 'text-gray-700'
                  }`}
                >
                  {filterLabels[option]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto alert-feed-scroll p-4 space-y-3">
        {/* Active Signal — pinned at top, distinguished from regular alerts.
            Clicking lands on the supplier detail screen with the Signal banner
            pre-loaded (links.investigate carries ?signal=<id>). */}
        {(() => {
          const sev = severityTokens[sampleSignal.severity];
          return (
            <button
              onClick={() => navigate(sampleSignal.links.investigate)}
              className={`w-full p-3 rounded-lg border-2 ${sev.surfaceBg} ${sev.surfaceBorder} text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label={`Investigate active Signal ${sampleSignal.signal_id}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-blue-800" aria-hidden="true" />
                <span className="text-[10px] font-bold tracking-wider text-blue-800 uppercase">
                  New Signal
                </span>
                <span className={`ml-auto text-[10px] font-semibold text-white px-1.5 py-0.5 rounded ${sev.badgeBg}`}>
                  {sev.label}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {sampleSignal.entity.supplier_name}
              </h3>
              <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                {sampleSignal.trigger.event_label}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 tabular-nums">
                  {sampleSignal.trigger.score_before} → <span className="text-red-600 font-semibold">{sampleSignal.trigger.score_after}</span>
                  <span className="text-gray-400"> · </span>
                  {formatRevenueAtRisk(sampleSignal.exposure.revenue_at_risk_usd)}
                </span>
                <span className="text-blue-600 font-medium flex items-center gap-1">
                  Investigate
                  <ArrowRight size={12} />
                </span>
              </div>
            </button>
          );
        })()}

        {displayedAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onClick={() => handleAlertClick(alert.supplierId)}
          />
        ))}

        {/* Load More Button */}
        {loadedCount < filteredAlerts.length ? (
          <button
            onClick={handleLoadMore}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Load More
          </button>
        ) : (
          <p className="text-center text-sm text-gray-400 py-2">No more alerts</p>
        )}
      </div>
    </aside>
  );
}
