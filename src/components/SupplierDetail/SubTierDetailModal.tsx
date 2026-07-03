import { useState, useMemo } from 'react';
import { X, Download, Search, ChevronUp, ChevronDown, AlertTriangle, GitMerge } from 'lucide-react';
import type { SubTierFullNode } from '../../data/subtierMockData';
import { flattenNetwork } from '../../data/subtierMockData';
import type { PriorityNode } from '../../utils/selectPrioritySuppliers';
import { formatRevenue } from '../../types';
import { popChangeFor, lensFor, nodeMatchesLens, LENSES } from '../../data/popLens';

interface SubTierDetailModalProps {
  root: SubTierFullNode;
  prioritySet: PriorityNode[];
  onClose: () => void;
  /** Column label for the exposure metric (e.g. "Cost Exposure" for live data). */
  exposureLabel?: string;
}

type SortKey = 'tier' | 'name' | 'riskScore' | 'revenueAtRisk' | 'pop';
type SortDir = 'asc' | 'desc';

const impactBadge: Record<string, string> = {
  Delivery: 'bg-red-100 text-red-700',
  Compliance: 'bg-orange-100 text-orange-700',
  Cost: 'bg-blue-100 text-blue-700',
};

export default function SubTierDetailModal({ root, prioritySet, onClose, exposureLabel = 'Rev. at Risk' }: SubTierDetailModalProps) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [impactFilter, setImpactFilter] = useState<'all' | 'Delivery' | 'Compliance' | 'Cost'>('all');
  const [lensFilter, setLensFilter] = useState<string>('all'); // 12-lens key or 'all'
  const [sortKey, setSortKey] = useState<SortKey>('tier');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const allRows = useMemo(() => flattenNetwork(root).filter(n => n.tier > 0), [root]);
  const priorityIds = useMemo(() => new Set(prioritySet.map(p => p.node.id)), [prioritySet]);

  const rows = useMemo(() => {
    let filtered = allRows;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(n =>
        n.name.toLowerCase().includes(q) ||
        n.location.city.toLowerCase().includes(q) ||
        n.commodity.toLowerCase().includes(q)
      );
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(n => n.tier === Number(tierFilter));
    }

    if (impactFilter !== 'all') {
      filtered = filtered.filter(n => n.primaryImpact === impactFilter);
    }

    if (lensFilter !== 'all') {
      filtered = filtered.filter(n => nodeMatchesLens(n.name, n.topRiskLens, lensFilter));
    }

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'tier') cmp = a.tier - b.tier;
      else if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'riskScore') cmp = a.riskScore - b.riskScore;
      else if (sortKey === 'revenueAtRisk') cmp = (a.revenueAtRisk ?? -1) - (b.revenueAtRisk ?? -1);
      else if (sortKey === 'pop') {
        // no-history rows always sink to the bottom, whichever direction
        const pa = popChangeFor(a.name); const pb = popChangeFor(b.name);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        cmp = pa - pb;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [allRows, search, tierFilter, impactFilter, lensFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    // POP starts descending so the biggest movers surface on top ("reds on top")
    else { setSortKey(key); setSortDir(key === 'pop' ? 'desc' : 'asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? (sortDir === 'asc' ? <ChevronUp size={13} className="inline ml-0.5" /> : <ChevronDown size={13} className="inline ml-0.5" />)
      : <ChevronDown size={13} className="inline ml-0.5 opacity-30" />
  );

  const exportCSV = () => {
    const header = ['Tier', 'Supplier', 'City', 'Country', 'ZIP', 'Commodity', 'Lens', 'Risk Score', 'POP Change', 'Impact', `${exposureLabel} ($M)`, 'Exposure Status', 'Cost Estimated', 'SPOF', 'Choke Point', 'Priority'];
    const rowData = allRows.map(n => [
      `T${n.tier}`,
      n.name,
      n.location.city,
      n.location.country,
      n.location.zip ?? '',
      n.commodity,
      lensFor(n.name)?.label ?? n.topRiskLensLabel,
      n.riskScore,
      popChangeFor(n.name) ?? '',
      n.primaryImpact,
      n.revenueAtRisk !== null ? n.revenueAtRisk.toFixed(4) : '',
      n.revenueAtRisk !== null ? 'known' : 'insufficient data',
      n.costEstimated ? 'Yes' : 'No',
      n.isSPOF ? 'Yes' : 'No',
      n.isChokePoint ? 'Yes' : 'No',
      priorityIds.has(n.id) ? 'Yes' : 'No',
    ]);
    const csv = [header, ...rowData].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtier-network-bom.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tierIndent: Record<number, string> = { 1: '', 2: 'pl-6', 3: 'pl-12' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Full Sub-Tier Network — Bill of Materials</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {allRows.length} suppliers across T1–T3 &middot; <span className="text-red-600 font-medium">{priorityIds.size} priority rows highlighted</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search suppliers, locations, commodities…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-1">
            {(['all', '1', '2', '3', '4', '5'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  tierFilter === t
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t === 'all' ? 'All Tiers' : `T${t}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'Delivery', 'Compliance', 'Cost'] as const).map(imp => (
              <button
                key={imp}
                onClick={() => setImpactFilter(imp)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  impactFilter === imp
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {imp === 'all' ? 'All Impact' : imp}
              </button>
            ))}
          </div>

          <select
            value={lensFilter}
            onChange={e => setLensFilter(e.target.value)}
            aria-label="Lens filter"
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              lensFilter !== 'all' ? 'bg-amber-400 border-amber-400 text-gray-900' : 'bg-white border-gray-300 text-gray-600'
            }`}
          >
            <option value="all">All Lenses</option>
            {LENSES.map(l => (
              <option key={l.key} value={l.key}>{l.label}</option>
            ))}
          </select>

          <span className="text-xs text-gray-400 ml-auto">{rows.length} of {allRows.length} shown</span>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('tier')}
                >
                  Tier <SortIcon k="tier" />
                </th>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('name')}
                >
                  Supplier <SortIcon k="name" />
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Commodity
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lens
                </th>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('riskScore')}
                >
                  Risk Score <SortIcon k="riskScore" />
                </th>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('pop')}
                >
                  POP Change <SortIcon k="pop" />
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('revenueAtRisk')}
                >
                  {exposureLabel} <SortIcon k="revenueAtRisk" />
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(node => {
                const isPriority = priorityIds.has(node.id);
                const rowScore = node.riskScore;
                const scoreColor = rowScore >= 70 ? 'text-red-600 bg-red-50' : rowScore >= 40 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';

                return (
                  <tr
                    key={node.id}
                    className={`transition-colors ${isPriority ? 'bg-red-50 hover:bg-red-100/60' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        node.tier === 1 ? 'bg-blue-100 text-blue-700' :
                        node.tier === 2 ? 'bg-purple-100 text-purple-700' :
                        node.tier === 3 ? 'bg-gray-100 text-gray-700' :
                        node.tier === 4 ? 'bg-teal-100 text-teal-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        T{node.tier}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 ${tierIndent[node.tier] ?? ''}`}>
                      <span className={`font-medium ${isPriority ? 'text-red-900' : 'text-gray-900'}`}>
                        {node.name}
                      </span>
                      {isPriority && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          Priority
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {node.location.city}, {node.location.country}
                      {node.location.zip && <span className="text-gray-400"> {node.location.zip}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{node.commodity}</td>
                    <td className="px-4 py-2.5">
                      {(() => {
                        const lens = lensFor(node.name);
                        if (lens) {
                          return (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              {lens.label}
                            </span>
                          );
                        }
                        return <span className="text-xs text-gray-400">{node.topRiskLensLabel}</span>;
                      })()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center justify-center w-10 h-7 rounded font-bold tabular-nums text-xs ${scoreColor}`}>
                        {node.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {(() => {
                        const pop = popChangeFor(node.name);
                        if (pop === null) return <span className="text-gray-300">—</span>;
                        if (pop > 0) return <span className="text-xs font-bold text-red-600">▲ +{pop}</span>;
                        if (pop < 0) return <span className="text-xs font-bold text-green-600">▼ {pop}</span>;
                        return <span className="text-xs font-semibold text-gray-400">0</span>;
                      })()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${impactBadge[node.primaryImpact] ?? ''}`}>
                        {node.primaryImpact}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900 tabular-nums">
                      {node.revenueAtRisk !== null ? (
                        <span className="inline-flex items-center gap-1">
                          {formatRevenue(node.revenueAtRisk)}
                          {node.costEstimated && (
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">est.</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs italic text-gray-400">exposure n/a</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {node.isSPOF && (
                          <span title="Single Point of Failure" className="text-red-500">
                            <AlertTriangle size={14} />
                          </span>
                        )}
                        {node.isChokePoint && (
                          <span title="Choke Point" className="text-orange-500">
                            <GitMerge size={14} />
                          </span>
                        )}
                        {!node.isSPOF && !node.isChokePoint && <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">
              No suppliers match the current filters.
            </div>
          )}
        </div>

        {/* Footer legend */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
            Priority rows (in main view graph)
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-red-500" />
            SPOF — single point of failure
          </div>
          <div className="flex items-center gap-1.5">
            <GitMerge size={12} className="text-orange-500" />
            Choke point — multiple paths converge
          </div>
        </div>
      </div>
    </div>
  );
}
