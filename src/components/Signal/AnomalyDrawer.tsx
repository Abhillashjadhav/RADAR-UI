import { useMemo, useState } from 'react';
import { X, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Anomaly } from '../../data/anomalyMockData';
import { formatRevenueAtRisk } from './signalUi';
import AnomalyTrendChart from './AnomalyTrendChart';
import ScoreBreakdown from './ScoreBreakdown';
import SubFactorAttribution, { EventMath } from './SubFactorAttribution';
import { chip, SECTION_LABEL, GOLD_BTN } from '../../theme/tokens';

interface Props {
  anomaly: Anomaly;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}

export default function AnomalyDrawer({ anomaly, onClose, onAcknowledge }: Props) {
  const delta = Math.round((anomaly.scoreAfter - anomaly.scoreBaseline) * 10) / 10;
  const isActive = anomaly.status === 'active';
  const [subFactorFilter, setSubFactorFilter] = useState<string | null>(null);

  const hasAttribution = !!anomaly.attribution && anomaly.attribution.length > 0;

  // Events shown in the math panel: all lens events, or just the selected sub-factor's
  const mathEvents = useMemo(() => {
    const all = anomaly.dimension?.events ?? [];
    if (!subFactorFilter) return all;
    return all.filter(e => e.sub_factor === subFactorFilter);
  }, [anomaly.dimension, subFactorFilter]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={chip(anomaly.impactBucket)}>{anomaly.impactBucket.toUpperCase()}</span>
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
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#F7F8FA]">
          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3">
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
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Cost Exposure</p>
              <p className="text-xl font-bold text-amber-600 tabular-nums">
                {anomaly.costExposureUsd !== null
                  ? formatRevenueAtRisk(anomaly.costExposureUsd)
                  : <span className="text-sm italic text-gray-400">n/a</span>}
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Break Date</p>
              <p className="text-base font-bold text-gray-900">
                {anomaly.breakDate ? anomaly.breakDate.slice(5) : '—'}
              </p>
            </div>
          </div>

          {/* Trend chart — the detection layer (score is the tripwire) */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className={`${SECTION_LABEL} mb-3`}>
              Baseline vs breakout — {anomaly.history.length}-day score history
            </p>
            <AnomalyTrendChart anomaly={anomaly} height={200} />
          </div>

          {/* Attribution layer — WHICH sub-factor moved the score */}
          {hasAttribution ? (
            <>
              <SubFactorAttribution
                lensLabel={anomaly.lensLabel}
                before={anomaly.scoreBaseline}
                after={anomaly.scoreAfter}
                attribution={anomaly.attribution!}
                selected={subFactorFilter}
                onSelect={setSubFactorFilter}
              />
              <EventMath events={mathEvents} score={
                // score of the filtered set, or the lens score when unfiltered
                subFactorFilter
                  ? Math.round(((1 - mathEvents.reduce((s, e) => s + e.sentiment, 0) / Math.max(1, mathEvents.length)) / 2) * 1000) / 10
                  : anomaly.scoreAfter
              } />
            </>
          ) : (
            <ScoreBreakdown bd={anomaly.breakdown} />
          )}

          {/* All 12 lenses — no-data renders greyed, never as a measured 50 */}
          {anomaly.analysis && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className={`${SECTION_LABEL} mb-3`}>
                All 12 lenses — {anomaly.analysis.supplierName} · overall {anomaly.analysis.overallScore}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {anomaly.analysis.dimensions.map(d => (
                  <div
                    key={d.key}
                    className={`rounded-lg px-2.5 py-2 border ${
                      d.has_event_data
                        ? d.key === anomaly.lens
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-gray-100 bg-white'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{d.abbr}</p>
                    {d.has_event_data ? (
                      <p className={`text-sm font-bold tabular-nums ${
                        d.score >= 70 ? 'text-red-600' : d.score >= 40 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {d.score}
                        <span className="ml-1 text-[10px] font-medium text-gray-400">{d.event_count} ev</span>
                      </p>
                    ) : (
                      <p className="text-[11px] font-semibold text-gray-400">No data</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className={`${SECTION_LABEL} mb-3`}>Sources</p>
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
                          className="text-sm text-amber-700 hover:underline flex items-center gap-1"
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
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
            <button onClick={() => onAcknowledge(anomaly.id)} className={`${GOLD_BTN} w-full`}>
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
