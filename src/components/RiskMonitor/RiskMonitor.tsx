import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AlertOctagon, AlertTriangle, DollarSign, ChevronDown, Truck, ShieldCheck } from 'lucide-react';
import { SUPPLIER_ANALYSES, LENSES } from '../../data/supplierAnalysisFixtures';
import { measuredDimensions } from '../../data/scoring';
import { ANOMALIES } from '../../data/analysisAnomalies';
import { formatRevenueAtRisk } from '../Signal/signalUi';
import {
  CARD, SECTION_LABEL, TH, PILL_SELECT, PASTEL, chip, scorePill, GOLD,
} from '../../theme/tokens';
import type { PastelKey } from '../../theme/tokens';

// Impact bucket per lens key (matches the anomaly feed's mapping)
const LENS_BUCKET: Record<string, 'Delivery' | 'Compliance' | 'Cost'> = {
  geopolitical: 'Delivery', logistics_transport: 'Delivery', environmental_climate: 'Delivery',
  catastrophic_systemic: 'Delivery', multitier_viability: 'Delivery', infrastructure: 'Delivery',
  esg_regulatory: 'Compliance', labor_social: 'Compliance',
  economic_financial: 'Cost', market_competition: 'Cost', tech_cyber: 'Cost', digital_transformation: 'Cost',
};

const BUCKET_COLOR = { Delivery: '#DC2626', Compliance: '#F59E0B', Cost: '#3B82F6' } as const;

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------
function StatTile({ icon: Icon, pastel, value, label, sub, valueClass = 'text-gray-900' }: {
  icon: typeof AlertOctagon; pastel: PastelKey; value: string; label: string; sub: string; valueClass?: string;
}) {
  return (
    <div className={`${CARD} p-4`}>
      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${PASTEL[pastel]}`}>
        <Icon size={18} />
      </span>
      <p className={`text-3xl font-extrabold tabular-nums leading-none ${valueClass}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-1.5">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Monitor page — every number computed from the fixtures via scoring.ts
// ---------------------------------------------------------------------------
export default function RiskMonitor() {
  const [impactFilter, setImpactFilter] = useState<'All' | 'Delivery' | 'Compliance' | 'Cost'>('All');

  // ---- stats from measured lenses only (50-fallbacks never counted) ----
  const stats = useMemo(() => {
    let critical = 0, medium = 0;
    const revAtRisk = new Set<string>();
    for (const a of SUPPLIER_ANALYSES) {
      for (const d of measuredDimensions(a)) {
        if (d.score >= 70) { critical++; revAtRisk.add(a.id); }
        else if (d.score >= 40) medium++;
      }
    }
    const revenue = SUPPLIER_ANALYSES
      .filter(a => revAtRisk.has(a.id))
      .reduce((s, a) => s + a.revenueImpact, 0);
    return { critical, medium, revenue };
  }, []);

  // ---- Top 5 revenue-weighted: overallScore × exposure ----
  const top5 = useMemo(() => {
    const rows = SUPPLIER_ANALYSES.map(a => {
      const top = measuredDimensions(a).sort((x, y) => y.score - x.score)[0];
      const bucket = top ? LENS_BUCKET[top.key] : 'Delivery';
      return { a, top, bucket, weight: a.overallScore * a.revenueImpact };
    }).filter(r => impactFilter === 'All' || r.bucket === impactFilter);
    return rows.sort((x, y) => y.weight - x.weight).slice(0, 5);
  }, [impactFilter]);

  // ---- Impact breakdown from the anomaly feed ----
  const breakdown = useMemo(() => {
    const buckets = { Delivery: { n: 0, rev: 0 }, Compliance: { n: 0, rev: 0 }, Cost: { n: 0, rev: 0 } };
    for (const an of ANOMALIES) {
      const key = (an.impactBucket.charAt(0).toUpperCase() + an.impactBucket.slice(1)) as keyof typeof buckets;
      buckets[key].n++;
      buckets[key].rev += an.exposureUsd ?? 0;
    }
    return buckets;
  }, []);

  // ---- Risk by Category: avg measured score per lens, no-data excluded ----
  const byCategory = useMemo(() => {
    return LENSES.map(({ key, label }) => {
      const dims = SUPPLIER_ANALYSES.flatMap(a => a.dimensions.filter(d => d.key === key && d.has_event_data));
      if (dims.length === 0) return null;
      const score = Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length * 10) / 10;
      const events = dims.reduce((s, d) => s + d.event_count, 0);
      return { key, label, score, events };
    }).filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score);
  }, []);

  // ---- 30-day trend per impact bucket from anomaly score histories ----
  const trend = useMemo(() => {
    const byBucket: Record<string, { date: string; value: number }[][]> = { Delivery: [], Compliance: [], Cost: [] };
    for (const an of ANOMALIES) {
      const key = an.impactBucket.charAt(0).toUpperCase() + an.impactBucket.slice(1);
      byBucket[key]?.push(an.history.slice(-30));
    }
    const dates = ANOMALIES[0]?.history.slice(-30).map(p => p.date) ?? [];
    return dates.map((date, i) => {
      const row: Record<string, string | number | null> = { date: date.slice(5) };
      for (const bucket of ['Delivery', 'Compliance', 'Cost'] as const) {
        const series = byBucket[bucket];
        row[bucket] = series.length
          ? Math.round(series.reduce((s, h) => s + (h[i]?.value ?? 0), 0) / series.length * 10) / 10
          : null;
      }
      return row;
    });
  }, []);

  const maxCat = byCategory[0]?.score ?? 100;

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      {/* Title + filter pills */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Risk Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">Production scoring — every number traces to (1 − avg sentiment) / 2 × 100</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className={PILL_SELECT}>Time Horizon: This Quarter <ChevronDown size={12} /></button>
          <button className={PILL_SELECT}>Risk Level: All <ChevronDown size={12} /></button>
          <div className="flex items-center gap-1">
            {(['All', 'Delivery', 'Compliance', 'Cost'] as const).map(f => (
              <button
                key={f}
                onClick={() => setImpactFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  impactFilter === f ? 'bg-amber-400 text-gray-900' : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-300'
                }`}
              >
                {f === 'All' ? 'Impact: All' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile icon={AlertOctagon} pastel="red" value={String(stats.critical)} valueClass="text-red-600"
          label="Critical Risks" sub="measured lenses ≥ 70 — no-data excluded" />
        <StatTile icon={AlertTriangle} pastel="amber" value={String(stats.medium)} valueClass="text-amber-600"
          label="Medium Risks" sub="measured lenses 40–69" />
        <StatTile icon={DollarSign} pastel="green" value={formatRevenueAtRisk(stats.revenue)} valueClass="text-amber-500"
          label="Revenue at Risk" sub="suppliers carrying a critical lens" />
      </div>

      {/* Top 5 table + Impact breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${CARD} lg:col-span-2 overflow-hidden`}>
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Top 5 Risks</h2>
            <p className="text-xs text-gray-400">Revenue-weighted priority — overall score × exposure</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60">
              <tr>
                <th className={`${TH} w-10`}>#</th>
                <th className={TH}>Supplier</th>
                <th className={TH}>Risk Type</th>
                <th className={TH}>Score</th>
                <th className={TH}>Revenue Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {top5.map(({ a, top, bucket }, i) => (
                <tr key={a.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-gray-300 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-amber-600 hover:text-amber-700 font-semibold text-sm">{a.supplierName}</span>
                    <span className="block text-xs text-gray-400">{a.location}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={chip(bucket)}>
                      {bucket === 'Delivery' ? <Truck size={11} className="mr-1" /> : bucket === 'Compliance' ? <ShieldCheck size={11} className="mr-1" /> : <DollarSign size={11} className="mr-1" />}
                      {top ? top.label : bucket}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className={scorePill(a.overallScore)}>{a.overallScore}</span></td>
                  <td className="px-4 py-3 font-bold text-gray-900 tabular-nums">{formatRevenueAtRisk(a.revenueImpact)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Impact breakdown */}
        <div className="space-y-3">
          <p className={SECTION_LABEL}>Impact Breakdown</p>
          {(['Delivery', 'Compliance', 'Cost'] as const).map(bucket => (
            <div key={bucket} className={`${CARD} p-4 flex items-center gap-3`}>
              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${
                bucket === 'Delivery' ? PASTEL.red : bucket === 'Compliance' ? PASTEL.amber : PASTEL.blue
              }`}>
                {bucket === 'Delivery' ? <Truck size={17} /> : bucket === 'Compliance' ? <ShieldCheck size={17} /> : <DollarSign size={17} />}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{bucket}</p>
                <p className="text-xs text-gray-400">{breakdown[bucket].n} active anomal{breakdown[bucket].n === 1 ? 'y' : 'ies'}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 tabular-nums">{formatRevenueAtRisk(breakdown[bucket].rev)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk by Category + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${CARD} p-5`}>
          <h2 className="text-sm font-bold text-gray-900 mb-1">Risk by Category</h2>
          <p className="text-xs text-gray-400 mb-4">Measured lenses only — “No data” lenses never rank</p>
          <ul className="space-y-3">
            {byCategory.map(c => (
              <li key={c.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    {c.label}
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{c.events} events</span>
                  </span>
                  <span className="text-xs font-bold text-gray-900 tabular-nums">{c.score}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(c.score / Math.max(maxCat, 1)) * 100}%`, background: GOLD }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${CARD} p-5`}>
          <h2 className="text-sm font-bold text-gray-900 mb-1">Risk Trend</h2>
          <p className="text-xs text-gray-400 mb-3">30 days · average lens score per impact bucket</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} interval={6} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E5E7EB' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
              {(['Delivery', 'Compliance', 'Cost'] as const).map(bucket => (
                <Line key={bucket} type="monotone" dataKey={bucket} stroke={BUCKET_COLOR[bucket]}
                  strokeWidth={2} dot={false} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
