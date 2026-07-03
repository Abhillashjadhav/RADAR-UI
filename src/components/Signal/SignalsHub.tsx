import { useState, useMemo, useReducer } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, BarChart2, MessageSquare, AlertOctagon, FileCheck, ArrowRight } from 'lucide-react';
import { ANOMALIES } from '../../data/analysisAnomalies';
import type { Anomaly } from '../../data/anomalyMockData';
import { formatRevenueAtRisk, lensHumanLabel, severityTokens } from './signalUi';
import { sampleSignal } from '../../data/sample-signal';
import AnomalyDrawer from './AnomalyDrawer';
import RankedExceptionFeed from './RankedExceptionFeed';
import ParameterDrawer from './ParameterDrawer';
import { SUPPLIER_ANALYSES } from '../../data/supplierAnalysisFixtures';
import { LENSES } from '../../data/popLens';

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
  onLensClick,
}: {
  anomaly: Anomaly;
  isAcknowledged: boolean;
  onSelect: () => void;
  onLensClick: () => void;
}) {
  const delta = Math.round((anomaly.scoreAfter - anomaly.scoreBaseline) * 10) / 10;
  const hasBreakout = delta > 0;

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer transition-colors ${isAcknowledged ? 'opacity-50' : 'hover:bg-amber-50'}`}
    >
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 text-sm">{anomaly.supplierName}</div>
        <div className="text-xs text-gray-400">T{anomaly.tier}</div>
      </td>
      <td className="px-4 py-3">
        {/* Lens tile — clickable, opens parameter-level attribution */}
        <button
          onClick={e => { e.stopPropagation(); onLensClick(); }}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-700 hover:underline text-left"
          title="View parameter-level attribution"
        >
          {anomaly.lensLabel}
          {hasBreakout && (
            <span className="px-1 py-0.5 rounded text-[10px] font-bold tabular-nums bg-red-100 text-red-700">
              ▲ +{delta}
            </span>
          )}
        </button>
      </td>
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
          <span className="text-xs text-amber-600 font-medium">Active</span>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main SignalsHub — anomaly feed home
// ---------------------------------------------------------------------------
type Tab = 'feed' | 'ranked' | 'demo';

export default function SignalsHub() {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const [tab, setTab] = useState<Tab>('feed');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  // Parameter drawer state lives in the URL (?lens=geopolitical[&supplier=SUPA-001])
  // so a drawer state is shareable / screenshottable.
  const [searchParams, setSearchParams] = useSearchParams();
  const lensParam = searchParams.get('lens');
  const supplierParam = searchParams.get('supplier');
  const paramDrawer = useMemo(() => {
    if (!lensParam) return null;
    const analysis = supplierParam
      ? SUPPLIER_ANALYSES.find(s => s.id === supplierParam)
      : ANOMALIES.find(an => an.lens === lensParam)?.analysis
        ?? SUPPLIER_ANALYSES.find(s => s.dimensions.some(d => d.key === lensParam && d.has_event_data));
    const dim = analysis?.dimensions.find(d => d.key === lensParam && d.has_event_data);
    return analysis && dim ? { analysis, dim } : null;
  }, [lensParam, supplierParam]);

  const openParameterDrawer = (a: Anomaly) => {
    setSearchParams({ lens: a.lens, supplier: a.supplierId });
  };
  const closeParameterDrawer = () => setSearchParams({}, { replace: true });
  const [impactFilter, setImpactFilter] = useState<'all' | 'delivery' | 'compliance' | 'cost'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [lensFilter, setLensFilter] = useState<string>('all'); // 12-lens key or 'all'
  const [biggestMovers, setBiggestMovers] = useState(true);    // default: delta desc, reds on top
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
    if (lensFilter !== 'all') list = list.filter(a => a.lens === lensFilter);

    // "Which suppliers are higher risk this week than last" — delta desc by default
    return [...list].sort((a, b) =>
      biggestMovers
        ? (b.scoreAfter - b.scoreBaseline) - (a.scoreAfter - a.scoreBaseline)
        : (b.breakDate || '').localeCompare(a.breakDate || ''),
    );
  }, [impactFilter, verifiedFilter, lensFilter, biggestMovers, showAcknowledged, acknowledged]);

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
            tab === 'feed' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle size={15} />
          Anomaly Feed
        </button>
        <button
          onClick={() => setTab('ranked')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'ranked' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart2 size={15} />
          Ranked Exceptions
        </button>
        <button
          onClick={() => setTab('demo')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'demo' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare size={15} />
          Signal Demo
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
                    impactFilter === f ? 'bg-amber-400 text-gray-900' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {f === 'all' ? 'All Impact' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(['all', 'verified', 'unverified'] as const).map(f => (
                <button key={f} onClick={() => setVerifiedFilter(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    verifiedFilter === f ? 'bg-amber-400 text-gray-900' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={lensFilter}
              onChange={e => setLensFilter(e.target.value)}
              aria-label="Lens filter"
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                lensFilter !== 'all' ? 'bg-amber-400 border-amber-400 text-gray-900' : 'bg-white border-gray-300 text-gray-600'
              }`}
            >
              <option value="all">All Lenses</option>
              {LENSES.map(l => (
                <option key={l.key} value={l.key}>{l.label}</option>
              ))}
            </select>
            <button
              onClick={() => setBiggestMovers(m => !m)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                biggestMovers ? 'bg-amber-400 text-gray-900' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              ▲ Biggest movers
            </button>
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
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Risk Lens</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Lens Reading</th>
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
                    onLensClick={() => openParameterDrawer(a)}
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

      {tab === 'demo' && (() => {
        const sev = severityTokens[sampleSignal.severity];
        const cards = [
          {
            to: '/preview/teams-card',
            icon: MessageSquare,
            title: 'Teams Card Preview',
            subtitle: 'Deliverable A',
            description: 'How the RADAR Signal renders when posted into a Microsoft Teams channel — sender chrome, severity stripe, score delta, recommendations, Acknowledge + Investigate CTAs.',
            ctaLabel: 'Open preview',
          },
          {
            to: sampleSignal.links.investigate,
            icon: AlertOctagon,
            title: 'Investigation Console',
            subtitle: 'Deliverable B · banner active',
            description: 'Supplier detail screen with the Signal banner pinned at the top. The Geopolitical risk lens auto-scrolls into view and is highlighted. Recommendations expandable. Acknowledge persists in localStorage.',
            ctaLabel: 'Open investigation',
          },
          {
            to: `/supplier/${sampleSignal.entity.supplier_id}`,
            icon: FileCheck,
            title: 'Control · No Signal',
            subtitle: 'Regression check',
            description: 'The same supplier detail screen without the ?signal query param. Demonstrates that the Signal banner is purely additive — when no signal is active, the screen behaves exactly as it did before.',
            ctaLabel: 'Open control view',
          },
        ];
        return (
          <div>
            <header className="mb-6">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Signal Model · Demo</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">RADAR Signal — three surfaces</h2>
              <p className="text-sm text-gray-600 max-w-3xl">
                RADAR is repositioning from a destination dashboard into a background monitoring service
                that pushes alerts when action is required. The dashboard isn't the front door — the alert is.
                The three views below show the alert (Teams card), the drill-down behind it (investigation console),
                and the unaffected baseline (control).
              </p>
            </header>

            {/* Active Signal summary */}
            <section className={`rounded-xl border ${sev.surfaceBorder} ${sev.surfaceBg} mb-6 overflow-hidden`}>
              <div className={`h-1.5 ${sev.stripe}`} />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${sev.badgeBg}`}>{sev.label}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                    {lensHumanLabel[sampleSignal.trigger.lens]}
                  </span>
                  <span className="text-xs text-gray-500 tabular-nums">{sampleSignal.signal_id}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 leading-snug">
                  {sampleSignal.entity.supplier_name} — {sampleSignal.trigger.event_label.toLowerCase()}
                </h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm">
                  <div><span className="text-gray-500">Score </span><span className="font-semibold tabular-nums">{sampleSignal.trigger.score_before} → <span className="text-red-600">{sampleSignal.trigger.score_after}</span></span></div>
                  <div><span className="text-gray-500">Revenue at risk </span><span className="font-semibold tabular-nums">{formatRevenueAtRisk(sampleSignal.exposure.revenue_at_risk_usd)}</span></div>
                  <div><span className="text-gray-500">Confidence </span><span className="font-semibold tabular-nums">{Math.round(sampleSignal.confidence * 100)}%</span></div>
                  <div><span className="text-gray-500">Tier </span><span className="font-semibold tabular-nums">{sampleSignal.entity.tier}</span></div>
                </div>
              </div>
            </section>

            {/* Three surface entry cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {cards.map(({ to, icon: Icon, title, subtitle, description, ctaLabel }) => (
                <Link key={to} to={to} className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-amber-400 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">{subtitle}</p>
                      <h4 className="font-semibold text-gray-900">{title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:text-amber-700">
                    {ctaLabel}<ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Direct routes</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">/preview/teams-card</code> — Teams card preview</li>
                <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">/supplier/{sampleSignal.entity.supplier_id}?signal={sampleSignal.signal_id}</code> — investigation console (banner active)</li>
                <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">/supplier/{sampleSignal.entity.supplier_id}</code> — control (no banner)</li>
              </ul>
            </section>
          </div>
        );
      })()}

      {/* Parameter-level attribution drawer (URL-driven, read-only) */}
      {paramDrawer && (
        <ParameterDrawer
          analysis={paramDrawer.analysis}
          dim={paramDrawer.dim}
          onClose={closeParameterDrawer}
        />
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
