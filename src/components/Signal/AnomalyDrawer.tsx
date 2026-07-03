import { useMemo, useState } from 'react';
import { X, ExternalLink, AlertTriangle, CheckCircle, Hourglass } from 'lucide-react';
import type { Anomaly } from '../../data/anomalyMockData';
import type { AnalysisDimension, ParameterChange } from '../../types/analysis';
import { formatRevenueAtRisk } from './signalUi';
// AnomalyTrendChart intentionally NOT mounted here anymore — the lens
// baseline-vs-breakout chart lives on the lens/anomaly detail surfaces.
import ScoreBreakdown from './ScoreBreakdown';
import SubFactorAttribution, { EventMath } from './SubFactorAttribution';
import ParameterChart from './ParameterChart';
import { lensDetection, BASELINE_DAYS } from '../../data/analysisAnomalies';
import { attributeDelta } from '../../data/scoring';
import { chip, SECTION_LABEL, GOLD_BTN } from '../../theme/tokens';

interface Props {
  anomaly: Anomaly;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}

// ---------------------------------------------------------------------------
// PARAMETER GRAPHS — the top section. One mini-chart per changed parameter,
// ordered by contribution (largest first), y-axis in the native unit.
// ---------------------------------------------------------------------------
function ParameterGraphs({ dim, lensDelta }: { dim: AnalysisDimension; lensDelta: number }) {
  const params = useMemo(() => {
    const all = (dim.parameter_changes ?? []).filter(p => p.history && p.history.length > 1);
    const changed = all.filter(p => p.before !== p.after).sort((a, b) => b.contribution - a.contribution);
    const unchanged = all.filter(p => p.before === p.after);
    return [...changed, ...unchanged];
  }, [dim]);

  if (params.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
      <p className={SECTION_LABEL}>Parameter graphs — what actually changed (30 days)</p>
      {params.map(p => (
        <div key={p.parameter_id} id={`param-graph-${p.parameter_id}`} className="scroll-mt-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{p.name}</p>
            <span className={chip(p.impact_bucket)}>{p.impact_bucket}</span>
          </div>
          <ParameterChart param={p} height={130} />
          <p className="text-xs text-gray-500 leading-relaxed mt-1 tabular-nums">
            {p.before !== p.after && lensDelta !== 0 && (
              <>Contribution <span className="font-bold text-red-600">+{p.contribution}</span> of ▲ {lensDelta} · </>
            )}
            {p.before === p.after && <span className="font-semibold text-gray-400">no change in window · </span>}
            {p.implication}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lens context — score / band note / building states. No trend chart here.
// ---------------------------------------------------------------------------
function LensContext({ dim }: { dim: AnalysisDimension }) {
  const det = useMemo(() => lensDetection(dim), [dim]);

  if (det.status === 'building') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2 text-xs text-amber-800">
        <Hourglass size={14} className="flex-shrink-0 mt-0.5" />
        <span>
          <strong>Baseline building ({det.daysOfHistory}/{BASELINE_DAYS} days)</strong> — anomaly
          detection needs {BASELINE_DAYS} days of stored runs for this lens before it can fire.
          Score {det.latest} is the current state, not an anomaly.
        </span>
      </div>
    );
  }
  if (det.status === 'fired') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
        Lens score <span className="font-bold text-gray-800 tabular-nums">{det.latest}</span> fired by{' '}
        {det.firedBy === 'relative_jump' ? 'relative jump ≥15%' : 'band break'} — 30-day mean{' '}
        <span className="tabular-nums">{det.baselineMean}</span> ± 2σ (σ={det.sigma}), band {det.bandLow}–{det.bandHigh}.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
      No anomaly — latest score <span className="font-bold text-gray-800 tabular-nums">{det.latest}</span> sits
      inside the 30-day band ({det.bandLow}–{det.bandHigh}, baseline mean {det.baselineMean}).
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------
export default function AnomalyDrawer({ anomaly, onClose, onAcknowledge }: Props) {
  const delta = Math.round((anomaly.scoreAfter - anomaly.scoreBaseline) * 10) / 10;
  const isActive = anomaly.status === 'active';
  const [selectedLensKey, setSelectedLensKey] = useState<string>(anomaly.lens);
  const [subFactorFilter, setSubFactorFilter] = useState<string | null>(null);

  const selectedDim: AnalysisDimension | undefined = useMemo(
    () => anomaly.analysis?.dimensions.find(d => d.key === selectedLensKey && d.has_event_data),
    [anomaly.analysis, selectedLensKey],
  );

  const det = useMemo(() => selectedDim ? lensDetection(selectedDim) : null, [selectedDim]);
  const lensDelta = det?.status === 'fired' ? det.delta : 0;
  const attribution = useMemo(
    () => det?.status === 'fired' ? attributeDelta(det.baselineEvents, det.newEvents) : [],
    [det],
  );

  // Attribution segment → scroll-link to the matching parameter graph
  const scrollToParam = (subFactor: string | null) => {
    setSubFactorFilter(subFactor);
    if (!subFactor || !selectedDim?.parameter_changes) return;
    const tokens = subFactor.toLowerCase().split(/\W+/).filter(t => t.length > 3);
    const match: ParameterChange | undefined =
      selectedDim.parameter_changes.find(p =>
        tokens.some(t => p.name.toLowerCase().includes(t))) ?? selectedDim.parameter_changes[0];
    if (match) {
      document.getElementById(`param-graph-${match.parameter_id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const mathEvents = useMemo(() => {
    const all = selectedDim?.events ?? [];
    return subFactorFilter ? all.filter(e => e.sub_factor === subFactorFilter) : all;
  }, [selectedDim, subFactorFilter]);
  const mathScore = subFactorFilter && mathEvents.length
    ? Math.round(((1 - mathEvents.reduce((s, e) => s + e.sentiment, 0) / mathEvents.length) / 2) * 1000) / 10
    : det?.latest ?? anomaly.scoreAfter;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header (unchanged): supplier · lens · delta badge */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={chip(anomaly.impactBucket)}>{anomaly.impactBucket.toUpperCase()}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                {anomaly.lensLabel}
              </span>
              {delta !== 0 && (
                <span className={`text-xs px-2 py-0.5 rounded font-bold tabular-nums ${
                  anomaly.scoreAfter >= 70 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  ▲ +{delta}
                </span>
              )}
              {!anomaly.verified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle size={11} /> Unverified
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
          {/* Key metrics — score is the STATE; the badge is the anomaly */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Score</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{anomaly.scoreAfter}</p>
              {delta !== 0 && (
                <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                  anomaly.scoreAfter >= 70 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  ▲ +{delta} vs 30-day baseline
                </span>
              )}
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

          {/* 1. PARAMETER GRAPHS — what actually changed, first thing seen */}
          {selectedDim && <ParameterGraphs dim={selectedDim} lensDelta={lensDelta} />}

          {/* 2. Attribution split bar — segments scroll-link to their graphs */}
          {selectedDim && det?.status === 'fired' && attribution.length > 0 && (
            <SubFactorAttribution
              lensLabel={selectedDim.label}
              before={det.scoreBaseline}
              after={det.latest}
              attribution={attribution}
              selected={subFactorFilter}
              onSelect={scrollToParam}
            />
          )}
          {!selectedDim && <ScoreBreakdown bd={anomaly.breakdown} />}

          {/* 3. Lens context at the BOTTOM — tiles + lens-level info, no trend chart */}
          {anomaly.analysis && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className={`${SECTION_LABEL} mb-3`}>
                All 12 lenses — {anomaly.analysis.supplierName} · overall {anomaly.analysis.overallScore}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {anomaly.analysis.dimensions.map(d => {
                  if (!d.has_event_data) {
                    return (
                      <div key={d.key} className="rounded-lg px-2.5 py-2 border border-gray-100 bg-gray-50 opacity-60">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{d.abbr}</p>
                        <p className="text-[11px] font-semibold text-gray-400">No data</p>
                      </div>
                    );
                  }
                  const dDet = lensDetection(d);
                  const active = selectedLensKey === d.key;
                  return (
                    <button
                      key={d.key}
                      onClick={() => { setSelectedLensKey(d.key); setSubFactorFilter(null); }}
                      className={`rounded-lg px-2.5 py-2 border text-left transition-colors ${
                        active ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-white hover:border-amber-200'
                      }`}
                    >
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{d.abbr}</p>
                      <p className={`text-sm font-bold tabular-nums ${
                        d.score >= 70 ? 'text-red-600' : d.score >= 40 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {d.score}
                      </p>
                      {dDet.status === 'fired' && (
                        <span className={`inline-flex px-1 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                          dDet.latest >= 70 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          ▲ +{dDet.delta}
                        </span>
                      )}
                      {dDet.status === 'building' && (
                        <span className="inline-flex px-1 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500">
                          Building {dDet.daysOfHistory}/{BASELINE_DAYS}
                        </span>
                      )}
                      {dDet.status === 'stable' && (
                        <span className="inline-flex text-[10px] text-gray-400">{d.event_count} ev</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {selectedDim && <LensContext dim={selectedDim} />}

          {/* Events (unchanged, bottom) */}
          {selectedDim && selectedDim.events.length > 0 && (
            <EventMath events={mathEvents} score={mathScore} />
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

        {/* Footer action (unchanged) */}
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
