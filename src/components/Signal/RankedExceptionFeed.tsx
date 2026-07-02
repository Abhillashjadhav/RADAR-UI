import { useState, useMemo } from 'react';
import { Download, ChevronUp, ChevronDown } from 'lucide-react';
import type { Anomaly } from '../../data/anomalyMockData';
import { anomalyStrength } from '../../data/anomalyMockData';
import { formatRevenueAtRisk } from './signalUi';

interface Props {
  anomalies: Anomaly[];
  onSelect: (a: Anomaly) => void;
}

type SortKey = 'strength' | 'score' | 'delta' | 'exposure' | 'tier';
type SortDir = 'asc' | 'desc';

const IMPACT_PILL: Record<string, string> = {
  delivery:   'bg-red-100 text-red-700',
  compliance: 'bg-orange-100 text-orange-700',
  cost:       'bg-blue-100 text-blue-700',
};

export default function RankedExceptionFeed({ anomalies, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('strength');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [impactFilter, setImpactFilter] = useState<'all' | 'delivery' | 'compliance' | 'cost'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | '1' | '2'>('all');

  const rows = useMemo(() => {
    let list = anomalies.filter(a => a.scoreAfter > a.scoreBaseline); // only actual anomalies
    if (impactFilter !== 'all') list = list.filter(a => a.impactBucket === impactFilter);
    if (tierFilter !== 'all') list = list.filter(a => a.tier === Number(tierFilter));

    // Insufficient-data anomalies (no priced cost exposure) can't be ranked by
    // exposure — keep them, but always sort them below the priced/ranked ones.
    const priced = list.filter(a => a.costExposureUsd !== null);
    const unpriced = list.filter(a => a.costExposureUsd === null);

    priced.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'strength') cmp = (anomalyStrength(a) ?? 0) - (anomalyStrength(b) ?? 0);
      else if (sortKey === 'score') cmp = a.scoreAfter - b.scoreAfter;
      else if (sortKey === 'delta') cmp = (a.scoreAfter - a.scoreBaseline) - (b.scoreAfter - b.scoreBaseline);
      else if (sortKey === 'exposure') cmp = (a.costExposureUsd ?? 0) - (b.costExposureUsd ?? 0);
      else if (sortKey === 'tier') cmp = a.tier - b.tier;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return [...priced, ...unpriced];
  }, [anomalies, sortKey, sortDir, impactFilter, tierFilter]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortDir === 'desc' ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />)
      : <ChevronDown size={12} className="inline opacity-20" />;

  const exportCSV = () => {
    const header = ['Rank', 'Supplier', 'Tier', 'Lens', 'Impact', 'Score', 'Delta', 'Cost Exposure ($)', 'Strength', 'Break Date', 'Verified', 'Status'];
    const data = rows.map((a, i) => {
      const st = anomalyStrength(a);
      return [
        i + 1,
        a.supplierName,
        `T${a.tier}`,
        a.lensLabel,
        a.impactBucket,
        a.scoreAfter,
        a.scoreAfter - a.scoreBaseline,
        a.costExposureUsd ?? 'insufficient data',
        st === null ? 'n/a' : Math.round(st),
        a.breakDate,
        a.verified ? 'Yes' : 'No',
        a.status,
      ];
    });
    const csv = [header, ...data].map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const el = document.createElement('a');
    el.href = url; el.download = 'anomaly-exceptions.csv'; el.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Ranked Exception Feed</h3>
          <p className="text-xs text-gray-400">Ranked by anomaly strength × annual cost exposure · insufficient-data suppliers sorted last</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-100 bg-gray-50 flex-wrap">
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
          {(['all', '1', '2'] as const).map(f => (
            <button key={f} onClick={() => setTierFilter(f)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                tierFilter === f ? 'bg-amber-400 text-gray-900' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'all' ? 'All Tiers' : `T${f}`}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto">{rows.length} exceptions</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-8">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Supplier</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Lens</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Impact</th>
              <th
                className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                onClick={() => toggleSort('score')}
              >Score <SortIcon k="score" /></th>
              <th
                className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                onClick={() => toggleSort('delta')}
              >Δ Score <SortIcon k="delta" /></th>
              <th
                className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                onClick={() => toggleSort('exposure')}
              >Cost Exposure <SortIcon k="exposure" /></th>
              <th
                className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none"
                onClick={() => toggleSort('strength')}
              >Strength <SortIcon k="strength" /></th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Break Date</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((a, idx) => {
              const delta = a.scoreAfter - a.scoreBaseline;
              const scoreColor = a.scoreAfter >= 70 ? 'text-red-600 bg-red-50' : a.scoreAfter >= 40 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
              const strength = anomalyStrength(a);
              return (
                <tr
                  key={a.id}
                  className="hover:bg-amber-50 cursor-pointer transition-colors"
                  onClick={() => onSelect(a)}
                >
                  <td className="px-4 py-2.5 text-xs text-gray-400 tabular-nums">{idx + 1}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-gray-900">{a.supplierName}</p>
                    <p className="text-xs text-gray-400">T{a.tier}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">{a.lensLabel}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${IMPACT_PILL[a.impactBucket]}`}>
                      {a.impactBucket}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center justify-center w-9 h-7 rounded text-xs font-bold tabular-nums ${scoreColor}`}>
                      {a.scoreAfter}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-semibold text-red-600 tabular-nums">▲ {delta}</span>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900 tabular-nums">
                    {a.costExposureUsd !== null
                      ? formatRevenueAtRisk(a.costExposureUsd)
                      : <span className="text-xs italic text-gray-400">exposure n/a</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {strength === null ? (
                      <span className="text-xs italic text-gray-400">n/a</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5" style={{ maxWidth: 60 }}>
                          <div
                            className="bg-red-400 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (strength / 500) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 tabular-nums">{Math.round(strength)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{a.breakDate || '—'}</td>
                  <td className="px-4 py-2.5">
                    {a.verified
                      ? <span className="text-xs text-green-600 font-medium">✓</span>
                      : <span className="text-xs text-amber-600 font-medium">⚠ Unverified</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="py-10 text-center text-gray-400 text-sm">No anomalies match the current filters.</p>
        )}
      </div>
    </div>
  );
}
