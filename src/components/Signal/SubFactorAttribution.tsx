import { ExternalLink } from 'lucide-react';
import type { SubFactorContribution } from '../../types/analysis';
import type { AnalysisEvent } from '../../types/analysis';
import { SECTION_LABEL } from '../../theme/tokens';

// Fixed categorical order — assigned by position, never cycled (validated set).
const SEG_COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'];

interface Props {
  lensLabel: string;
  before: number;
  after: number;
  attribution: SubFactorContribution[];
  selected: string | null;
  onSelect: (subFactor: string | null) => void;
}

/**
 * Visual attribution of a lens break: a horizontal stacked bar splitting the
 * score delta by sub-factor. Segments are clickable and filter the event list.
 */
export default function SubFactorAttribution({ lensLabel, before, after, attribution, selected, onSelect }: Props) {
  const delta = Math.round((after - before) * 10) / 10;
  const totalAbs = attribution.reduce((s, c) => s + Math.abs(c.contribution), 0) || 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className={`${SECTION_LABEL} mb-1`}>Why did this change? — sub-factor attribution</p>
      <p className="text-sm text-gray-800 mb-3">
        <span className="font-semibold">{lensLabel}</span>{' '}
        <span className="tabular-nums">{before} → <span className="font-bold text-red-600">{after}</span></span>
        <span className="ml-1.5 text-xs font-bold text-red-600 tabular-nums">(+{delta})</span>
      </p>

      {/* Stacked contribution bar — 2px white gaps, clickable segments */}
      <div className="flex w-full h-7 rounded-lg overflow-hidden mb-1.5" role="group" aria-label="Score delta by sub-factor">
        {attribution.map((c, i) => (
          <button
            key={c.subFactor}
            onClick={() => onSelect(selected === c.subFactor ? null : c.subFactor)}
            title={`${c.subFactor}: +${c.contribution}`}
            className="relative h-full transition-opacity"
            style={{
              width: `${(Math.abs(c.contribution) / totalAbs) * 100}%`,
              background: SEG_COLORS[i % SEG_COLORS.length],
              opacity: selected && selected !== c.subFactor ? 0.35 : 1,
              borderLeft: i > 0 ? '2px solid white' : undefined,
              outline: selected === c.subFactor ? '2px solid #1F2430' : undefined,
              outlineOffset: -2,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white whitespace-nowrap px-1 overflow-hidden">
              +{c.contribution}
            </span>
          </button>
        ))}
      </div>

      {/* Direct labels under the bar */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
        {attribution.map((c, i) => (
          <button
            key={c.subFactor}
            onClick={() => onSelect(selected === c.subFactor ? null : c.subFactor)}
            className={`flex items-center gap-1.5 text-xs ${selected === c.subFactor ? 'font-bold text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: SEG_COLORS[i % SEG_COLORS.length] }} />
            {c.subFactor}
            <span className="tabular-nums text-gray-400">+{c.contribution}</span>
          </button>
        ))}
        {selected && (
          <button onClick={() => onSelect(null)} className="text-xs text-amber-600 hover:underline font-medium">
            clear filter
          </button>
        )}
      </div>

      {/* Grouped attribution sentences */}
      <ul className="space-y-1.5">
        {attribution.map(c => (
          <li key={c.subFactor} className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-800">{c.eventCount} new event{c.eventCount === 1 ? '' : 's'}</span> in
            {' '}<span className="font-semibold text-gray-800">“{c.subFactor}”</span>,
            avg sentiment <span className="tabular-nums font-semibold">{c.avgSentiment.toFixed(2)}</span> —
            contributed <span className="font-bold text-red-600 tabular-nums">+{c.contribution}</span> of the +{delta}.
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The real score math: events → sentiments → average → (1 − avg) / 2 × 100
// ---------------------------------------------------------------------------
export function EventMath({ events, score }: { events: AnalysisEvent[]; score: number }) {
  const avg = events.length ? events.reduce((s, e) => s + e.sentiment, 0) / events.length : 0;
  const avgR = Math.round(avg * 100) / 100;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className={`${SECTION_LABEL} mb-3`}>Lens reading math — computed from events</p>
      <ul className="space-y-2 mb-3">
        {events.map((e, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <span className={`flex-shrink-0 w-12 text-center px-1 py-0.5 rounded font-bold tabular-nums ${
              e.sentiment <= -0.6 ? 'bg-red-100 text-red-700' : e.sentiment < 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>
              {e.sentiment.toFixed(2)}
            </span>
            <span className="flex-1 min-w-0">
              <span className="text-gray-700">{e.news}</span>
              <span className="block text-[11px] text-gray-400">
                {e.sub_factor}
                {e.occurred_at && <> · {e.occurred_at}</>}
                {e.riskScore !== undefined && <> · event risk {e.riskScore}</>}
                {e.news_link && (
                  <a href={e.news_link} target="_blank" rel="noopener noreferrer" className="ml-1 text-amber-600 hover:underline inline-flex items-center gap-0.5">
                    source <ExternalLink size={9} />
                  </a>
                )}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-700 tabular-nums">
        avg(sentiment) = <span className="font-bold">{avgR.toFixed(2)}</span>
        <span className="mx-2 text-gray-300">→</span>
        (1 − ({avgR.toFixed(2)})) / 2 × 100 = <span className="font-bold text-gray-900">{score}</span>
      </div>
    </div>
  );
}
