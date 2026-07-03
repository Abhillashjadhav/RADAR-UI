import { useMemo, useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisDimension, ParameterChange, SupplierAnalysis } from '../../types/analysis';
import { lensDetection } from '../../data/analysisAnomalies';
import { EventMath } from './SubFactorAttribution';
import ParameterChart from './ParameterChart';
import { chip, SECTION_LABEL } from '../../theme/tokens';

interface Props {
  analysis: SupplierAnalysis;
  dim: AnalysisDimension;
  onClose: () => void;
}

// Existing severity chip recipes (same classes used by the feed/drawer badges)
const SEV_CHIP_RED = 'bg-red-100 text-red-700';
const SEV_CHIP_AMBER = 'bg-amber-100 text-amber-700';
const SEV_CHIP_GREY = 'bg-gray-100 text-gray-500';

function valueText(p: ParameterChange): { before: string; after: string; small?: string } {
  if (p.value_type === 'percent') return { before: `${p.before}%`, after: `${p.after}%` };
  if (p.value_type === 'binary') {
    return {
      before: p.before === 1 ? 'IN FORCE' : 'Not in force',
      after: p.after === 1 ? 'IN FORCE' : 'Not in force',
      small: `${p.before} → ${p.after}`,
    };
  }
  return { before: String(p.before), after: String(p.after), small: p.unit || undefined };
}

function DeltaChip({ p }: { p: ParameterChange }) {
  const changed = p.before !== p.after;
  if (!changed) {
    return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${SEV_CHIP_GREY}`}>no change in window</span>;
  }
  if (p.value_type === 'binary') {
    return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${SEV_CHIP_RED}`}>Triggered</span>;
  }
  const d = Math.round((p.after - p.before) * 10) / 10;
  const up = d > 0;
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${up ? SEV_CHIP_RED : SEV_CHIP_AMBER}`}>
      {up ? '▲ +' : '▼ '}{d} {p.value_type === 'percent' ? 'pts' : ''}
    </span>
  );
}

function ParameterRow({ p, dim, lensDelta }: { p: ParameterChange; dim: AnalysisDimension; lensDelta: number }) {
  const [showEvents, setShowEvents] = useState(false);
  const v = valueText(p);
  const changed = p.before !== p.after;
  const evidence = useMemo(
    () => dim.events.filter(e => e.id && p.event_ids.includes(e.id)),
    [dim.events, p.event_ids],
  );

  return (
    <div id={`param-graph-${p.parameter_id}`} className="rounded-xl border border-gray-100 bg-white p-3.5 space-y-2 scroll-mt-4">
      {/* Name + impact tag */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{p.name}</p>
        <span className={chip(p.impact_bucket)}>{p.impact_bucket}</span>
      </div>

      {/* PARAMETER GRAPH — 30 days of the value in its native unit */}
      {p.history && p.history.length > 1 && <ParameterChart param={p} height={130} />}

      {/* Before → After, prominent, native unit */}
      <p className="tabular-nums">
        <span className={`text-lg font-bold ${changed ? 'text-gray-400 line-through decoration-2' : 'text-gray-900'}`}>
          {v.before}
        </span>
        <span className="mx-2 text-gray-300">→</span>
        <span className={`text-lg font-extrabold ${changed ? 'text-red-600' : 'text-gray-900'}`}>{v.after}</span>
        {v.small && <span className="ml-2 text-[11px] text-gray-400">{v.small}</span>}
        <span className="ml-2 align-middle"><DeltaChip p={p} /></span>
      </p>

      {/* Contribution to the lens delta */}
      {changed && lensDelta !== 0 && (
        <p className="text-xs text-gray-600 tabular-nums">
          Contribution: <span className="font-bold text-red-600">+{p.contribution}</span> of ▲ {lensDelta}
        </p>
      )}

      {/* Plain-language implication */}
      <p className="text-xs text-gray-500 leading-relaxed">{p.implication}</p>

      {/* Evidence link row */}
      {evidence.length > 0 && (
        <div>
          <button
            onClick={() => setShowEvents(s => !s)}
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
          >
            {evidence.length} event{evidence.length === 1 ? '' : 's'} · view sources
            {showEvents ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showEvents && (
            <div className="mt-2">
              <EventMath
                events={evidence}
                score={Math.round(((1 - evidence.reduce((s, e) => s + e.sentiment, 0) / evidence.length) / 2) * 1000) / 10}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Parameter-level attribution drawer: which specific parameter inside this
 * lens changed, and from what to what. Read-only.
 */
export default function ParameterDrawer({ analysis, dim, onClose }: Props) {
  const det = useMemo(() => lensDetection(dim), [dim]);
  const lensDelta = det.status === 'fired' ? det.delta : 0;
  const params = dim.parameter_changes ?? [];
  // Changed parameters ordered by contribution — largest first
  const changed = params.filter(p => p.before !== p.after).sort((a, b) => b.contribution - a.contribution);
  const unchanged = params.filter(p => p.before === p.after);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header: supplier · lens · delta badge */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-xs text-gray-400">{analysis.supplierName}</p>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 flex-wrap">
              {dim.label}
              {lensDelta !== 0 ? (
                <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                  det.latest >= 70 ? SEV_CHIP_RED : SEV_CHIP_AMBER
                }`}>
                  ▲ +{lensDelta}
                </span>
              ) : (
                <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${SEV_CHIP_GREY}`}>
                  no change in window
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400">Score {det.latest} · parameter-level attribution</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#F7F8FA]">
          {changed.length > 0 && (
            <>
              <p className={SECTION_LABEL}>Changed parameters</p>
              {changed.map(p => (
                <ParameterRow key={p.parameter_id} p={p} dim={dim} lensDelta={lensDelta} />
              ))}
            </>
          )}

          {unchanged.length > 0 && (
            <>
              <p className={`${SECTION_LABEL} pt-1`}>Current values — no change in window</p>
              {unchanged.map(p => (
                <ParameterRow key={p.parameter_id} p={p} dim={dim} lensDelta={lensDelta} />
              ))}
            </>
          )}

          {params.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 text-xs text-gray-500">
              No tracked parameters for this lens yet. Current lens score is{' '}
              <span className="font-bold text-gray-800 tabular-nums">{det.latest}</span> — no change in window.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
