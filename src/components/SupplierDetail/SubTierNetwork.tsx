import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  GitMerge,
  Truck,
  ShieldCheck,
  DollarSign,
  Info,
  ExternalLink,
} from 'lucide-react';
import { LARGE_NETWORK } from '../../data/largeNetworkGenerator';
import type { SubTierFullNode } from '../../data/subtierMockData';
import { selectPrioritySuppliers } from '../../utils/selectPrioritySuppliers';
import type { PriorityNode } from '../../utils/selectPrioritySuppliers';
import SubTierDetailModal from './SubTierDetailModal';
import { formatRevenue } from '../../types';

// ---------------------------------------------------------------------------
// Impact config
// ---------------------------------------------------------------------------
const IMPACT_CONFIG = {
  Delivery:   { icon: Truck,       border: 'border-red-400',    badge: 'bg-red-100 text-red-700',       ring: 'ring-red-400'    },
  Compliance: { icon: ShieldCheck, border: 'border-orange-400', badge: 'bg-orange-100 text-orange-700', ring: 'ring-orange-400' },
  Cost:       { icon: DollarSign,  border: 'border-blue-400',   badge: 'bg-blue-100 text-blue-700',     ring: 'ring-blue-400'   },
} as const;

const REASON_LABELS: Record<string, string> = {
  spof: 'SPOF',
  choke: 'Choke Point',
  'critical-risk': 'Critical Risk',
  pareto: 'Top Revenue Exposure',
};

// ---------------------------------------------------------------------------
// Coverage selector buttons
// ---------------------------------------------------------------------------
const COVERAGE_OPTIONS = [
  { label: '70%', value: 0.70 },
  { label: '80%', value: 0.80 },
  { label: '90%', value: 0.90 },
] as const;

// ---------------------------------------------------------------------------
// Why these? popover
// ---------------------------------------------------------------------------
function SelectionPopover() {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-0.5 text-blue-700 hover:underline focus:outline-none text-xs"
        aria-expanded={open}
      >
        <Info size={12} />
        Why these?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-5 z-20 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-left">
            <p className="text-xs font-semibold text-gray-700 mb-2">Selection logic</p>
            <p className="text-xs text-gray-500 mb-3">
              A supplier enters the priority set if <strong>any</strong> of these rules match:
            </p>
            <ol className="space-y-1.5 text-xs text-gray-700">
              <li className="flex gap-2"><span className="font-semibold text-red-600">1.</span> Sole-source on a critical path (SPOF) — always included</li>
              <li className="flex gap-2"><span className="font-semibold text-orange-600">2.</span> Multiple paths converge (Choke Point) — always included</li>
              <li className="flex gap-2"><span className="font-semibold text-red-600">3.</span> Risk score ≥ 70 — always included</li>
              <li className="flex gap-2"><span className="font-semibold text-blue-600">4.</span> In the smallest set covering the selected % of Revenue at Risk (Pareto)</li>
            </ol>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              Use the 70 / 80 / 90 % buttons to see how coverage changes the count.
            </p>
          </div>
        </>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Priority card (one per prioritized supplier in the main grid)
// ---------------------------------------------------------------------------
function PriorityCard({
  pn,
  isSelected,
  onSelect,
}: {
  pn: PriorityNode;
  isSelected: boolean;
  onSelect: (n: SubTierFullNode) => void;
}) {
  const { node, reasons } = pn;
  const cfg = IMPACT_CONFIG[node.primaryImpact];
  const scoreColor =
    node.riskScore >= 70 ? 'bg-red-600 text-white' :
    node.riskScore >= 40 ? 'bg-yellow-500 text-white' :
    'bg-green-500 text-white';

  return (
    <button
      onClick={() => onSelect(node)}
      className={[
        'w-full text-left rounded-xl border-2 p-3 transition-all duration-150 hover:shadow-md',
        cfg.border,
        isSelected ? `ring-2 ${cfg.ring} ring-offset-1 shadow-md` : 'shadow-sm',
      ].join(' ')}
    >
      {/* Top row: score + name + flags */}
      <div className="flex items-start gap-2">
        <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${scoreColor}`}>
          {node.riskScore}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{node.name}</p>
          <p className="text-xs text-gray-400 truncate">{node.location.city}, {node.location.country}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {node.isSPOF && (
            <span title="Single Point of Failure">
              <AlertTriangle size={13} className="text-red-500" />
            </span>
          )}
          {node.isChokePoint && (
            <span title="Choke Point">
              <GitMerge size={13} className="text-orange-500" />
            </span>
          )}
          <span className="text-xs text-gray-400 font-mono">T{node.tier}</span>
        </div>
      </div>

      {/* Impact + revenue row */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${cfg.badge}`}>
          {node.primaryImpact}
        </span>
        {node.revenueAtRisk !== null && (
          <span className="text-xs text-gray-500 font-medium tabular-nums">
            {formatRevenue(node.revenueAtRisk)} at risk
          </span>
        )}
      </div>

      {/* Reason pills */}
      <div className="mt-1.5 flex flex-wrap gap-1">
        {reasons.slice(0, 2).map(r => (
          <span key={r} className="px-1.5 py-0.5 rounded text-xs text-gray-500 bg-gray-100">
            {REASON_LABELS[r]}
          </span>
        ))}
        {reasons.length > 2 && (
          <span className="px-1.5 py-0.5 rounded text-xs text-gray-400 bg-gray-50">
            +{reasons.length - 2} more
          </span>
        )}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Selected node side panel
// ---------------------------------------------------------------------------
function NodePanel({ priorityInfo }: { priorityInfo: PriorityNode }) {
  const { node, reasons } = priorityInfo;
  const cfg = IMPACT_CONFIG[node.primaryImpact];
  const Icon = cfg.icon;

  return (
    <div className={`border-2 ${cfg.border} rounded-xl p-4 flex flex-col gap-4`}>
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
            <Icon size={11} />
            {node.primaryImpact}
          </span>
          {node.isSPOF && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
              <AlertTriangle size={11} />
              SPOF
            </span>
          )}
          {node.isChokePoint && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600">
              <GitMerge size={11} />
              Choke Point
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{node.name}</h3>
        <p className="text-xs text-gray-400">{node.location.city}, {node.location.country} · T{node.tier} · {node.commodity}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Risk Factor</p>
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
          {node.topRiskLens} — {node.topRiskLensLabel}
        </span>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Revenue at Risk</p>
        <p className="text-sm font-bold text-gray-900 tabular-nums">
          {node.revenueAtRisk !== null ? formatRevenue(node.revenueAtRisk) : '—'}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Why prioritized</p>
        <div className="flex flex-wrap gap-1">
          {reasons.map(r => (
            <span key={r} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {REASON_LABELS[r] ?? r}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recommended Action</p>
        <p className="text-xs text-gray-700 leading-relaxed">{node.action}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export default function SubTierNetwork({ supplierId: _ }: { supplierId: string }) {
  const [analyzed, setAnalyzed] = useState(false);
  const [coverageTarget, setCoverageTarget] = useState<0.70 | 0.80 | 0.90>(0.80);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Delivery' | 'Compliance' | 'Cost'>('all');
  const [selectedNode, setSelectedNode] = useState<SubTierFullNode | null>(null);
  const [showModal, setShowModal] = useState(false);

  const result = useMemo(
    () => selectPrioritySuppliers(LARGE_NETWORK, { paretoTarget: coverageTarget }),
    [coverageTarget],
  );

  const { prioritySet, totalCount, coverageAchieved, exceedsLegibilityCap, caption } = result;

  const filteredPriority = useMemo(
    () =>
      activeFilter === 'all'
        ? prioritySet
        : prioritySet.filter(p => p.node.primaryImpact === activeFilter),
    [prioritySet, activeFilter],
  );

  const selectedPriority = useMemo(
    () => (selectedNode ? prioritySet.find(p => p.node.id === selectedNode.id) ?? null : null),
    [selectedNode, prioritySet],
  );

  const pctCovered = Math.round(coverageAchieved * 100);

  const handleAnalyze = () => {
    setAnalyzed(true);
    setSelectedNode(null);
  };

  const handleReset = () => {
    setAnalyzed(false);
    setSelectedNode(null);
    setActiveFilter('all');
    setCoverageTarget(0.80);
  };

  const handleCoverageChange = (v: 0.70 | 0.80 | 0.90) => {
    setCoverageTarget(v);
    setSelectedNode(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sub-Tier Network</h2>
          <p className="text-sm text-gray-400">PCB Assembly · T0 → T5 · {totalCount} suppliers</p>
        </div>
        {!analyzed ? (
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            ANALYZE
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* ---- Pre-analyze hint ---- */}
      {!analyzed && (
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-4">
          <Info size={13} />
          Run ANALYZE to surface the suppliers that need attention now across all {totalCount} in the network.
        </div>
      )}

      {/* ---- Post-analyze: headline + controls ---- */}
      {analyzed && (
        <div className="mb-4 space-y-3">
          {/* Headline */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-blue-900">
              {prioritySet.length} of {totalCount} suppliers need attention now
              {' '}—{' '}
              covering <span className="text-blue-700">{pctCovered}%</span> of revenue at risk
            </p>
            <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-2">
              <span>{caption}</span>
              <SelectionPopover />
            </p>
          </div>

          {/* Coverage control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Coverage target:</span>
            {COVERAGE_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => handleCoverageChange(value as 0.70 | 0.80 | 0.90)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  coverageTarget === value
                    ? 'bg-blue-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-1">
              → {prioritySet.length} suppliers, {pctCovered}% covered
            </span>
          </div>

          {/* Impact filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400">Filter:</span>
            {(['all', 'Delivery', 'Compliance', 'Cost'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); setSelectedNode(null); }}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeFilter === f
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Buckets' : f}
              </button>
            ))}
            {activeFilter !== 'all' && (
              <span className="text-xs text-gray-400">
                {filteredPriority.length} of {prioritySet.length} shown
              </span>
            )}
          </div>

          {/* Soft cap notice */}
          {exceedsLegibilityCap && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <AlertTriangle size={13} />
              {prioritySet.length} suppliers selected — showing as list for readability.
            </div>
          )}
        </div>
      )}

      {/* ---- Main content: card grid + side panel ---- */}
      {analyzed && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Cards (left) */}
          <div className={`${selectedNode ? 'lg:col-span-3' : 'lg:col-span-5'} overflow-y-auto max-h-[480px] pr-1`}>
            {filteredPriority.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No suppliers match this filter.</p>
            ) : exceedsLegibilityCap ? (
              /* Tabular list mode for large counts */
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Score</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Impact</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Rev. at Risk</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPriority.map(pn => {
                    const cfg = IMPACT_CONFIG[pn.node.primaryImpact];
                    const scoreColor =
                      pn.node.riskScore >= 70 ? 'bg-red-600 text-white' :
                      pn.node.riskScore >= 40 ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white';
                    const isSelected = selectedNode?.id === pn.node.id;
                    return (
                      <tr
                        key={pn.node.id}
                        onClick={() => setSelectedNode(pn.node)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="py-2 px-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${scoreColor}`}>
                            {pn.node.riskScore}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <p className="font-medium text-gray-900 text-sm">{pn.node.name}</p>
                          <p className="text-xs text-gray-400">{pn.node.location.city} · T{pn.node.tier}</p>
                        </td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${cfg.badge}`}>
                            {pn.node.primaryImpact}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-700 tabular-nums font-medium">
                          {pn.node.revenueAtRisk !== null ? formatRevenue(pn.node.revenueAtRisk) : '—'}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex gap-1">
                            {pn.node.isSPOF && <span title="SPOF"><AlertTriangle size={13} className="text-red-500" /></span>}
                            {pn.node.isChokePoint && <span title="Choke Point"><GitMerge size={13} className="text-orange-500" /></span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Card grid mode for counts ≤ LEGIBILITY_CAP */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredPriority.map(pn => (
                  <PriorityCard
                    key={pn.node.id}
                    pn={pn}
                    isSelected={selectedNode?.id === pn.node.id}
                    onSelect={setSelectedNode}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detail panel (right) */}
          {selectedNode && selectedPriority && (
            <div className="lg:col-span-2">
              <NodePanel priorityInfo={selectedPriority} />
            </div>
          )}

          {!selectedNode && (
            <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
              <p className="text-xs text-gray-300 text-center leading-relaxed px-4">
                Click a supplier card to see risk factor, exposure, and recommended action.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---- Footer legend + see all link ---- */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
          Critical (≥70)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          Medium (40–69)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          Low (&lt;40)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <AlertTriangle size={12} className="text-red-500" />
          SPOF
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <GitMerge size={12} className="text-orange-500" />
          Choke Point
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
        >
          See all {totalCount} suppliers
          <ExternalLink size={11} />
        </button>
      </div>

      {/* ---- Full BOM modal ---- */}
      {showModal && (
        <SubTierDetailModal
          root={LARGE_NETWORK}
          prioritySet={prioritySet}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
