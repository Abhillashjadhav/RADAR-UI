import { X, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Anomaly } from '../../data/anomalyMockData';
import { formatRevenueAtRisk } from './signalUi';
import AnomalyTrendChart from './AnomalyTrendChart';
import ScoreBreakdown from './ScoreBreakdown';

interface Props {
  anomaly: Anomaly;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}

const IMPACT_PILL: Record<string, string> = {
  delivery:   'bg-red-100 text-red-700',
  compliance: 'bg-orange-100 text-orange-700',
  cost:       'bg-blue-100 text-blue-700',
};

export default function AnomalyDrawer({ anomaly, onClose, onAcknowledge }: Props) {
  const delta = anomaly.scoreAfter - anomaly.scoreBaseline;
  const isActive = anomaly.status === 'active';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${IMPACT_PILL[anomaly.impactBucket]}`}>
                {anomaly.impactBucket.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                {anomaly.lensLabel}
              </span>
              {!anomaly.verified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle size={11} /> Unverified
                </span>
              )}
              {anomaly.provisionalBaseline && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
                  Provisional baseline
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-900">{anomaly.supplierName}</h2>
            <p className="text-xs text-gray-400">T{anomaly.tier} · {anomaly.lensLabel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Score</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {anomaly.scoreAfter}
                {delta !== 0 && (
                  <span className={`ml-2 text-sm font-semibold ${delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
                  </span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Revenue at Risk</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {formatRevenueAtRisk(anomaly.revenueAtRiskUsd)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Break Date</p>
              <p className="text-base font-bold text-gray-900">
                {anomaly.breakDate ? anomaly.breakDate.slice(5) : '—'}
              </p>
            </div>
          </div>

          {/* Score breakdown — the trust-maker */}
          <ScoreBreakdown bd={anomaly.breakdown} />

          {/* Trend chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Signal history — {anomaly.history.length}-day window
            </p>
            <AnomalyTrendChart anomaly={anomaly} height={200} />
          </div>

          {/* Sources */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sources</p>
            <ul className="space-y-2">
              {anomaly.sources.map((src, i) => {
                const isDead = !src.url;
                return (
                  <li key={i} className="flex items-start gap-2">
                    {isDead ? (
                      <>
                        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm text-gray-700">{src.label}</span>
                          <span className="ml-2 text-xs text-amber-600 font-medium">[link unavailable — unverified]</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 hover:underline flex items-center gap-1"
                        >
                          {src.label}
                          <ExternalLink size={11} />
                        </a>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Acknowledged info */}
          {anomaly.status === 'acknowledged' && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Acknowledged</p>
                <p className="text-xs text-green-700 mt-0.5">
                  By {anomaly.acknowledgedBy} on {anomaly.acknowledgedAt}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer action */}
        {isActive && (
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={() => onAcknowledge(anomaly.id)}
              className="w-full py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Acknowledge — remove from active feed
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Returns if the signal recurs after a quiet period. Suppression is per supplier × factor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
