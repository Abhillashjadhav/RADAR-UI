import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { Signal } from '../../types/signal';
import {
  formatRevenueAtRisk,
  impactBucketTokens,
  lensHumanLabel,
  severityTokens,
} from './signalUi';

interface SignalBannerProps {
  signal: Signal;
  onAcknowledge: () => void;
}

// Pinned-to-top banner shown on the supplier detail screen when the URL
// carries ?signal=<id>. No equivalent banner/alert primitive exists in the
// repo — closest analog is AlertCard, so we mirror its severity surface
// pattern (bg-{sev}-50 + border-{sev}-200) and the rounded-xl card chrome
// used elsewhere on the screen.
export default function SignalBanner({ signal, onAcknowledge }: SignalBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const sev = severityTokens[signal.severity];
  const impact = impactBucketTokens[signal.exposure.impact_bucket];
  const delta = signal.trigger.score_after - signal.trigger.score_before;
  const worsening = delta > 0;

  return (
    <section
      className={`rounded-xl border ${sev.surfaceBorder} ${sev.surfaceBg} mb-6 overflow-hidden`}
      role="region"
      aria-label={`Active Signal ${signal.signal_id}`}
    >
      {/* Severity stripe */}
      <div className={`h-1.5 ${sev.stripe}`} aria-hidden="true" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Severity + impact tags + signal id */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${sev.badgeBg}`}
              >
                {sev.label}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${impact.pill}`}
                title={`Primary impact: ${impact.label.toLowerCase()}`}
              >
                {impact.label}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                {lensHumanLabel[signal.trigger.lens]}
              </span>
              <span className="text-xs text-gray-500 tabular-nums">{signal.signal_id}</span>
            </div>

            {/* Headline */}
            <h2 className="text-base font-semibold text-gray-900 leading-snug">
              {signal.entity.supplier_name} — {signal.trigger.event_label.toLowerCase()}
            </h2>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
              <div>
                <p className="text-xs text-gray-500">Score</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums flex items-center gap-1">
                  <span className="text-gray-500">{signal.trigger.score_before}</span>
                  <span aria-hidden="true">→</span>
                  <span className={worsening ? 'text-red-600' : 'text-green-600'}>
                    {signal.trigger.score_after}
                  </span>
                  <span
                    className={`ml-1 text-xs font-semibold ${
                      worsening ? 'text-red-600' : 'text-green-600'
                    }`}
                    aria-label={
                      worsening
                        ? `Score worsened by ${Math.abs(delta)} points`
                        : `Score improved by ${Math.abs(delta)} points`
                    }
                  >
                    {worsening ? '▲' : '▼'} {Math.abs(delta)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Revenue at risk</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">
                  {formatRevenueAtRisk(signal.exposure.revenue_at_risk_usd)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Confidence</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">
                  {Math.round(signal.confidence * 100)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Open orders</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">
                  {signal.exposure.open_orders}
                </p>
              </div>
            </div>
          </div>

          {/* Acknowledge CTA — pinned right */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onAcknowledge}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X size={14} />
              Acknowledge
            </button>
          </div>
        </div>

        {/* Recommendations — collapsed by default */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {signal.recommendations.length} recommended action
            {signal.recommendations.length === 1 ? '' : 's'}
          </button>

          {expanded && (
            <ol className="mt-3 space-y-2">
              {signal.recommendations.map((rec) => (
                <li
                  key={rec.rank}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-200"
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-800 text-white text-xs font-semibold flex items-center justify-center tabular-nums"
                    aria-label={`Rank ${rec.rank}`}
                  >
                    {rec.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{rec.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{rec.detail}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                      {rec.coverage_pct !== undefined && (
                        <span>
                          Coverage:{' '}
                          <span className="font-medium text-gray-700 tabular-nums">
                            {Math.round(rec.coverage_pct * 100)}%
                          </span>
                        </span>
                      )}
                      {rec.effort_hours !== undefined && (
                        <span>
                          Effort:{' '}
                          <span className="font-medium text-gray-700 tabular-nums">
                            {rec.effort_hours}h
                          </span>
                        </span>
                      )}
                      {rec.owner && (
                        <span>
                          Owner:{' '}
                          <span className="font-medium text-gray-700">{rec.owner}</span>
                        </span>
                      )}
                      {rec.target && (
                        <span>
                          Target:{' '}
                          <span className="font-medium text-gray-700">{rec.target}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Sources */}
        <details className="mt-3 group">
          <summary className="text-xs text-gray-600 cursor-pointer select-none hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
            <span className="font-medium">Sources</span>
            <span className="text-gray-400">
              {' '}
              · {signal.trigger.sources_human.length} attributions
            </span>
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-gray-600 pl-3 border-l-2 border-gray-300">
            {signal.trigger.sources_human.map((s, i) => (
              <li key={signal.trigger.sources[i] ?? i}>{s}</li>
            ))}
          </ul>
        </details>

        {/* Investigate link is the canonical drill-down — render it as a
            secondary link so it's available even when this banner is the
            entry point (e.g. during dev). */}
        <div className="mt-3 text-xs">
          <Link
            to={signal.links.investigate}
            className="text-blue-700 hover:text-blue-800 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Open canonical investigation link →
          </Link>
        </div>
      </div>
    </section>
  );
}
