import { useState } from 'react';
import {
  AlertTriangle,
  GitMerge,
  Truck,
  ShieldCheck,
  DollarSign,
  ChevronDown,
  Info,
  ExternalLink,
} from 'lucide-react';
import { PCB_NETWORK } from '../../data/subtierMockData';
import type { SubTierFullNode } from '../../data/subtierMockData';
import { selectPrioritySuppliers } from '../../utils/selectPrioritySuppliers';
import type { PriorityNode } from '../../utils/selectPrioritySuppliers';
import SubTierDetailModal from './SubTierDetailModal';
import { formatRevenue } from '../../types';

// ---- Impact bucket display config ----------------------------------------
const IMPACT_CONFIG = {
  Delivery:   { icon: Truck,       border: 'border-red-400',    badge: 'bg-red-100 text-red-700',    ring: 'ring-red-400'    },
  Compliance: { icon: ShieldCheck, border: 'border-orange-400', badge: 'bg-orange-100 text-orange-700', ring: 'ring-orange-400' },
  Cost:       { icon: DollarSign,  border: 'border-blue-400',   badge: 'bg-blue-100 text-blue-700',  ring: 'ring-blue-400'   },
} as const;

// ---- Sub-tree renderer ----------------------------------------------------
interface NodeProps {
  node: SubTierFullNode;
  priorityMap: Map<string, PriorityNode>;
  activeFilter: 'all' | 'Delivery' | 'Compliance' | 'Cost';
  selectedId: string | null;
  onSelect: (n: SubTierFullNode) => void;
  isRoot?: boolean;
}

function NetworkNode({ node, priorityMap, activeFilter, selectedId, onSelect, isRoot }: NodeProps) {
  if (node.tier === 0) {
    // Root node — simple anchor
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold shadow">
            ★
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{node.name}</p>
            <p className="text-xs text-gray-400">Your Company</p>
          </div>
        </div>
        <div className="ml-4 border-l-2 border-gray-200 pl-3 space-y-2">
          {node.children.map(child => (
            <NetworkNode
              key={child.id}
              node={child}
              priorityMap={priorityMap}
              activeFilter={activeFilter}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    );
  }

  const priorityInfo = priorityMap.get(node.id);
  const isPriority = !!priorityInfo;
  const matchesFilter = activeFilter === 'all' || node.primaryImpact === activeFilter;
  const isHighlighted = isPriority && matchesFilter;
  const isSelected = node.id === selectedId;
  const cfg = IMPACT_CONFIG[node.primaryImpact];

  const scoreColor =
    node.riskScore >= 70 ? 'bg-red-600 text-white' :
    node.riskScore >= 40 ? 'bg-yellow-500 text-white' :
    'bg-green-500 text-white';

  const tierLabel = `T${node.tier}`;

  return (
    <div>
      <button
        onClick={() => isHighlighted && onSelect(node)}
        disabled={!isHighlighted}
        className={[
          'w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150',
          isHighlighted
            ? `bg-white border-2 ${cfg.border} shadow-sm cursor-pointer hover:shadow-md ${isSelected ? `ring-2 ${cfg.ring} ring-offset-1` : ''}`
            : 'bg-gray-50 border border-gray-200 opacity-40 cursor-default',
        ].join(' ')}
      >
        {/* Risk score badge */}
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${scoreColor}`}>
          {node.riskScore}
        </span>

        {/* Name + commodity */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isHighlighted ? 'text-gray-900' : 'text-gray-500'}`}>
            {node.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{node.commodity}</p>
        </div>

        {/* Tier pill */}
        <span className="text-xs text-gray-400 font-mono flex-shrink-0">{tierLabel}</span>

        {/* Flags */}
        {node.isSPOF && (
          <AlertTriangle size={13} className={isHighlighted ? 'text-red-500 flex-shrink-0' : 'text-gray-300 flex-shrink-0'} title="SPOF" />
        )}
        {node.isChokePoint && (
          <GitMerge size={13} className={isHighlighted ? 'text-orange-500 flex-shrink-0' : 'text-gray-300 flex-shrink-0'} title="Choke Point" />
        )}

        {/* Impact badge — only on priority nodes */}
        {isHighlighted && (
          <span className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${cfg.badge}`}>
            {node.primaryImpact}
          </span>
        )}
      </button>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="ml-5 border-l-2 border-gray-100 pl-2.5 mt-1 space-y-1">
          {node.children.map(child => (
            <NetworkNode
              key={`${node.id}-${child.id}`}
              node={child}
              priorityMap={priorityMap}
              activeFilter={activeFilter}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Reason pill ----------------------------------------------------------
const REASON_LABELS: Record<string, string> = {
  'spof': 'SPOF',
  'choke': 'Choke Point',
  'critical-risk': 'Critical Risk',
  'pareto': 'Top Revenue Exposure',
};

// ---- Selection-logic popover ----------------------------------------------
function SelectionPopover({ rulesApplied, cap }: { rulesApplied: string[]; cap: number }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-0.5 text-blue-700 hover:underline focus:outline-none"
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
              A node enters the priority set if <strong>any</strong> of these rules match:
            </p>
            <ol className="space-y-1.5 text-xs text-gray-700">
              <li className="flex gap-2"><span className="font-semibold text-red-600">1.</span> Sole-source on a critical path (SPOF)</li>
              <li className="flex gap-2"><span className="font-semibold text-orange-600">2.</span> Multiple paths converge on it (Choke Point)</li>
              <li className="flex gap-2"><span className="font-semibold text-red-600">3.</span> Risk score ≥ 70 on a high-exposure finished good</li>
              <li className="flex gap-2"><span className="font-semibold text-blue-600">4.</span> In the smallest set covering 80 % of Revenue at Risk (Pareto)</li>
            </ol>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              Capped at {cap} nodes for graph legibility. All others are in the detail table.
            </p>
          </div>
        </>
      )}
    </span>
  );
}

// ---- Selected-node side panel ---------------------------------------------
function NodePanel({ priorityInfo }: { priorityInfo: PriorityNode }) {
  const { node, reasons } = priorityInfo;
  const cfg = IMPACT_CONFIG[node.primaryImpact];
  const Icon = cfg.icon;

  return (
    <div className="h-full flex flex-col">
      <div className={`border-2 ${cfg.border} rounded-xl p-4 flex-1 flex flex-col gap-4`}>
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
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

        {/* Risk factor */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Risk Factor</p>
          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
            {node.topRiskLens} — {node.topRiskLensLabel}
          </span>
        </div>

        {/* Exposure */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Exposure</p>
          <p className="text-sm font-bold text-gray-900 tabular-nums">
            {node.revenueAtRisk !== null ? formatRevenue(node.revenueAtRisk) : '—'}
          </p>
          <p className="text-xs text-gray-400">Revenue at Risk</p>
        </div>

        {/* Why selected */}
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

        {/* Recommended action */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recommended Action</p>
          <p className="text-xs text-gray-700 leading-relaxed">{node.action}</p>
        </div>
      </div>
    </div>
  );
}

// ---- Main export ----------------------------------------------------------
// supplierId is accepted for backward compatibility but this component now
// renders a self-contained PCB Assembly network mock-up for any supplier.
// In production, wire the network lookup to supplierId.
export default function SubTierNetwork({ supplierId: _ }: { supplierId: string }) {
  const [analyzed, setAnalyzed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Delivery' | 'Compliance' | 'Cost'>('all');
  const [selectedNode, setSelectedNode] = useState<SubTierFullNode | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { prioritySet, totalCount, caption, rulesApplied } = selectPrioritySuppliers(PCB_NETWORK);

  const priorityMap = new Map(prioritySet.map(p => [p.node.id, p]));
  const selectedPriority = selectedNode ? priorityMap.get(selectedNode.id) ?? null : null;

  const handleAnalyze = () => {
    setAnalyzed(true);
    setSelectedNode(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sub-Tier Network</h2>
          <p className="text-sm text-gray-400">PCB Assembly · T0 → T3 Mapping</p>
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
            onClick={() => { setAnalyzed(false); setSelectedNode(null); setActiveFilter('all'); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* ---- Selection caption + filters (post-analyze) ---- */}
      {analyzed && (
        <div className="mb-4 space-y-2">
          {/* Caption row */}
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <span className="flex-1">{caption}</span>
            <SelectionPopover rulesApplied={rulesApplied} cap={10} />
          </div>

          {/* Risk-category filter chips */}
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
          </div>
        </div>
      )}

      {/* ---- Pre-analyze hint ---- */}
      {!analyzed && (
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          <Info size={13} />
          Run ANALYZE to identify the suppliers that matter most and why.
        </div>
      )}

      {/* ---- Two-panel layout: tree + detail ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Tree (left, 60%) */}
        <div className={`${analyzed && selectedNode ? 'lg:col-span-3' : 'lg:col-span-5'} overflow-y-auto max-h-80`}>
          <NetworkNode
            node={PCB_NETWORK}
            priorityMap={analyzed ? priorityMap : new Map()}
            activeFilter={activeFilter}
            selectedId={selectedNode?.id ?? null}
            onSelect={setSelectedNode}
            isRoot
          />
        </div>

        {/* Detail panel (right, 40%) — shown when a node is selected */}
        {analyzed && selectedNode && selectedPriority && (
          <div className="lg:col-span-2">
            <NodePanel priorityInfo={selectedPriority} />
          </div>
        )}

        {/* Placeholder right panel when nothing selected */}
        {analyzed && !selectedNode && (
          <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
            <p className="text-xs text-gray-300 text-center leading-relaxed px-4">
              Click a highlighted supplier to see risk factor, exposure, and recommended action.
            </p>
          </div>
        )}
      </div>

      {/* ---- Legend ---- */}
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

        {/* See all link */}
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
        >
          See all {totalCount} suppliers
          <ExternalLink size={11} />
        </button>
      </div>

      {/* ---- Full BOM detail modal ---- */}
      {showModal && (
        <SubTierDetailModal
          root={PCB_NETWORK}
          prioritySet={prioritySet}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
