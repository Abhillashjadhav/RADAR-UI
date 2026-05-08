import { Link } from 'react-router-dom';
import { ArrowUpRight, MoreHorizontal, Reply } from 'lucide-react';
import type { Signal } from '../../types/signal';
import { sampleSignal } from '../../data/sample-signal';
import {
  formatDetectedAt,
  formatRevenueAtRisk,
  impactBucketTokens,
  lensHumanLabel,
  severityTokens,
} from './signalUi';

interface TeamsCardPreviewProps {
  signal?: Signal;
}

// Standalone preview surface: renders what a RADAR Signal looks like when
// posted into a Microsoft Teams channel. Reachable at /preview/teams-card
// for design review.
export default function TeamsCardPreview({ signal = sampleSignal }: TeamsCardPreviewProps) {
  const sev = severityTokens[signal.severity];
  const impact = impactBucketTokens[signal.exposure.impact_bucket];
  const delta = signal.trigger.score_after - signal.trigger.score_before;
  const worsening = delta > 0;
  const headline = `${signal.entity.supplier_name} — ${signal.trigger.event_label.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-slate-100 p-6 sm:p-10">
      <div className="mx-auto max-w-2xl">
        {/* Demo-only context line so reviewers know what they're looking at. */}
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Preview · Microsoft Teams channel
        </p>

        {/* Teams-style chrome wrapper */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Channel breadcrumb */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Supply Chain Risk</span>
            <span className="text-gray-300">›</span>
            <span>RADAR Signals</span>
          </div>

          {/* Posted message */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Sender avatar — RADAR brand mark */}
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
              >
                RDR
              </div>

              <div className="flex-1 min-w-0">
                {/* Sender + metadata */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">RADAR</span>
                  <span className="text-xs text-gray-500">Bot · via Workflows</span>
                  <span className="text-xs text-gray-400">{formatDetectedAt(signal.detected_at)}</span>
                </div>

                {/* Adaptive-card body */}
                <div
                  className={`mt-2 rounded-lg border ${sev.surfaceBorder} bg-white overflow-hidden`}
                  role="article"
                  aria-label={`RADAR Signal ${signal.signal_id} — severity ${sev.label.toLowerCase()}`}
                >
                  {/* Severity stripe — colour + label so severity isn't communicated by colour alone */}
                  <div className={`h-1.5 ${sev.stripe}`} aria-hidden="true" />

                  <div className="p-4 space-y-4">
                    {/* Top row: severity badge + signal id */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${sev.badgeBg}`}
                      >
                        {sev.label}
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums">{signal.signal_id}</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-base font-semibold text-gray-900 leading-snug">
                      {headline}
                    </h2>

                    {/* Entity chips — tier + commodity + impact */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        Tier {signal.entity.tier}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {signal.entity.commodity}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${impact.pill}`}
                        title={`Primary impact: ${impact.label.toLowerCase()}`}
                      >
                        {impact.label}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {lensHumanLabel[signal.trigger.lens]}
                      </span>
                    </div>

                    {/* Score delta + revenue + confidence */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Score</p>
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
                        <p className="text-xs text-gray-500 mb-1">Revenue at risk</p>
                        <p className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatRevenueAtRisk(signal.exposure.revenue_at_risk_usd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Confidence</p>
                        <p className="text-sm font-semibold text-gray-900 tabular-nums">
                          {Math.round(signal.confidence * 100)}%
                        </p>
                      </div>
                    </div>

                    {/* Exposure detail */}
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="text-gray-500">Parts: </span>
                        <span className="font-medium text-gray-700 tabular-nums">
                          {signal.exposure.part_numbers.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Programs: </span>
                        <span className="font-medium text-gray-700">
                          {signal.exposure.programs.join(', ')}
                        </span>
                        <span className="text-gray-400"> · </span>
                        <span className="text-gray-500">Open orders: </span>
                        <span className="font-medium text-gray-700 tabular-nums">
                          {signal.exposure.open_orders}
                        </span>
                      </div>
                    </div>

                    {/* Recommendations — rank-ordered */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Recommended actions
                      </p>
                      <ol className="space-y-2">
                        {signal.recommendations.map((rec) => (
                          <li
                            key={rec.rank}
                            className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50"
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
                              <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
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
                    </div>

                    {/* Sources — native <details> instead of a custom tooltip primitive */}
                    <details className="group">
                      <summary className="text-xs text-gray-600 cursor-pointer select-none hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                        <span className="font-medium">Sources</span>
                        <span className="text-gray-400">
                          {' '}
                          · {signal.trigger.sources_human.length} attributions
                        </span>
                      </summary>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600 pl-3 border-l-2 border-gray-200">
                        {signal.trigger.sources_human.map((s, i) => (
                          <li key={signal.trigger.sources[i] ?? i}>{s}</li>
                        ))}
                      </ul>
                    </details>

                    {/* Footer CTAs */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      <Link
                        to={signal.links.acknowledge}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Acknowledge
                      </Link>
                      <Link
                        to={signal.links.investigate}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Investigate
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Teams reply affordance row */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <Reply size={12} />
                    Reply
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="More actions"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Preview only · This route is not authenticated and is intended for design review.
        </p>
      </div>
    </div>
  );
}
