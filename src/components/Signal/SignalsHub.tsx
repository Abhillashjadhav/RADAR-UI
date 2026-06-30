import { useState, useMemo, useReducer } from 'react';
import { AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import { ANOMALIES } from '../../data/anomalyMockData';
import type { Anomaly } from '../../data/anomalyMockData';
import { formatRevenueAtRisk } from './signalUi';
import AnomalyDrawer from './AnomalyDrawer';
import RankedExceptionFeed from './RankedExceptionFeed';

// ---------------------------------------------------------------------------
// Persistence helpers — acknowledge state in localStorage
// ---------------------------------------------------------------------------
const ACK_KEY = (id: string) => `radar.anomaly.ack.${id}`;

function loadAcknowledged(): Set<string> {
  const ids = ANOMALIES
    .filter(a => a.status === 'acknowledged')
    .map(a => a.id);
  const fromStorage = ANOMALIES
    .filter(a => localStorage.getItem(ACK_KEY(a.id)) === '1')
    .map(a => a.id);
  return new Set([...ids, ...fromStorage]);
}

// ---------------------------------------------------------------------------
// Impact pill styles
// ---------------------------------------------------------------------------
const IMPACT_PILL: Record<string, string> = {
  delivery:   'bg-red-100 text-red-700',
  compliance: 'bg-orange-100 text-orange-700',
  cost:       'bg-blue-100 text-blue-700',
};

const SCORE_COLOR = (s: number) =>
  s >= 70 ? 'text-red-600 bg-red-50' :
  s >= 40 ? 'text-yellow-600 bg-yellow-50' :
  'text-green-600 bg-green-50';

// ---------------------------------------------------------------------------
// Anomaly feed row
// ---------------------------------------------------------------------------
function FeedRow({
  anomaly,
  isAcknowledged,
  onSelect,
}: {
  anomaly: Anomaly;
  isAcknowledged: boolean;
  onSelect: () => void;
}) {
  const delta = anomaly.scoreAfter - anomaly.scoreBaseline;
  const hasBreakout = delta > 0;

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer transition-colors ${isAcknowledged ? 'opacity-50' : 'hover:bg-blue-50'}`}
    >
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 text-sm">{anomaly.supplierName}</div>
        <div className="text-xs text-gray-400">T{anomaly.tier}</div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">{anomaly.lensLabel}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center w-9 h-7 rounded text-xs font-bold tabular-nums ${SCORE_COLOR(anomaly.scoreAfter)}`}>
            {anomaly.scoreAfter}
          </span>
          {hasBreakout && (
            <span className="text-xs font-semibold text-red-600 tabular-nums whitespace-nowrap">▲ {delta}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${IMPACT_PILL[anomaly.impactBucket]}`}>
          {anomaly.impactBucket}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900 tabular-nums">
        {formatRevenueAtRisk(anomaly.revenueAtRiskUsd)}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {anomaly.breakDate || '—'}
      </td>
      <td className="px-4 py-3">
        {anomaly.verified ? (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle size={12} /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <AlertTriangle size={12} /> Unverified
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {isAcknowledged ? (
          <span className="text-xs text-gray-400 font-medium">Acknowledged</span>
        ) : (
          <span className="text-xs text-blue-600 font-medium">Active</span>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main SignalsHub — anomaly feed home
// ---------------------------------------------------------------------------
type Tab = 'feed' | 'ranked';

export default function SignalsHub() {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const [tab, setTab] = useState<Tab>('feed');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [impactFilter, setImpactFilter] = useState<'all' | 'delivery' | 'compliance' | 'cost'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Acknowledge state — read from localStorage + seed data on each render
  const acknowledged = loadAcknowledged();

  const handleAcknowledge = (id: string) => {
    localStorage.setItem(ACK_KEY(id), '1');
    setSelectedAnomaly(null);
    bump();
  };

  // Active anomalies = any with a breakout (delta > 0), not acknowledged
  const activeCount = ANOMALIES.filter(
    a => a.scoreAfter > a.scoreBaseline && !acknowledged.has(a.id)
  ).length;

  const filteredRows = useMemo(() => {
    let list = showAcknowledged
      ? ANOMALIES
      : ANOMALIES.filter(a => !acknowledged.has(a.id));

    if (impactFilter !== 'all') list = list.filter(a => a.impactBucket === impactFilter);
    if (verifiedFilter === 'verified') list = list.filter(a => a.verified);
    if (verifiedFilter === 'unverified') list = list.filter(a => !a.verified);

    return list;
  }, [impactFilter, verifiedFilter, showAcknowledged, acknowledged]);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signals</h1>
          <p className="text-sm text-gray-500 mt-1">Anomaly feed · breakout detection across all monitored suppliers</p>
        </div>
        {activeCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-red-700">{activeCount} active anomal{activeCount === 1 ? 'y' : 'ies'}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'feed' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle size={15} />
          Anomaly Feed
        </button>
        <button
          onClick={() => setTab('ranked')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'ranked' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart2 size={15} />
          Ranked Exceptions
        </button>
      </div>

      {tab === 'ranked' && (
        <RankedExceptionFeed
          anomalies={ANOMALIES.filter(a => !acknowledged.has(a.id))}
          onSelect={setSelectedAnomaly}
        />
      )}

      {tab === 'feed' && (
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Feed filters */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50 flex-wrap">
            <div className="flex gap-1">
              {(['all', 'delivery', 'compliance', 'cost'] as const).map(f => (
                <button key={f} onClick={() => setImpactFilter(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    impactFilter === f ? 'bg-blue-800 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {f === 'all' ? 'All Impact' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(['all', 'verified', 'unverified'] as const).map(f => (
                <button key={f} onClick={() => setVerifiedFilter(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    verifiedFilter === f ? 'bg-blue-800 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 ml-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={e => setShowAcknowledged(e.target.checked)}
                className="rounded"
              />
              Show acknowledged
            </label>
            <span className="text-xs text-gray-400 ml-auto">{filteredRows.length} rows</span>
          </div>

          {/* Feed table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Supplier</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Risk Factor</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Score</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Impact</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Revenue at Risk</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Break Date</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Source</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map(a => (
                  <FeedRow
                    key={a.id}
                    anomaly={a}
                    isAcknowledged={acknowledged.has(a.id)}
                    onSelect={() => setSelectedAnomaly(a)}
                  />
                ))}
              </tbody>
            </table>
            {filteredRows.length === 0 && (
              <div className="py-14 text-center">
                <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No active anomalies match the current filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Anomaly detail drawer */}
      {selectedAnomaly && (
        <AnomalyDrawer
          anomaly={{
            ...selectedAnomaly,
            status: acknowledged.has(selectedAnomaly.id) ? 'acknowledged' : selectedAnomaly.status,
          }}
          onClose={() => setSelectedAnomaly(null)}
          onAcknowledge={handleAcknowledge}
        />
      )}
    </div>
  );
}
