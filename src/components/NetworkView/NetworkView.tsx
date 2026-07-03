import { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle, GitMerge, Truck, ShieldCheck, DollarSign,
  Info, ExternalLink, ChevronRight, ChevronDown, ZoomIn, ZoomOut,
} from 'lucide-react';
import { LARGE_NETWORK } from '../../data/largeNetworkGenerator';
import type { SubTierFullNode } from '../../data/subtierMockData';
import { flattenNetwork } from '../../data/subtierMockData';
import {
  selectPrioritySuppliers,
  COVERAGE_70, COVERAGE_80, COVERAGE_90,
  MIN_MEANINGFUL_EXPOSURE, LIVE_MIN_EXPOSURE,
} from '../../utils/selectPrioritySuppliers';
import type { PriorityNode } from '../../utils/selectPrioritySuppliers';
import { buildParentMap, pathToRoot } from '../../utils/buildParentMap';
import SubTierDetailModal from '../SupplierDetail/SubTierDetailModal';
import { formatRevenue } from '../../types';
import { TIER, CARD, GOLD_BTN, PILL_SELECT, SECTION_LABEL, severityOf, SEV, chip } from '../../theme/tokens';
import { nodeMatchesLens, LENSES } from '../../data/popLens';
import { FCoin } from '../Layout/PageTitle';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const IMPACT_CONFIG = {
  Delivery:   { icon: Truck },
  Compliance: { icon: ShieldCheck },
  Cost:       { icon: DollarSign },
} as const;

const REASON_LABELS: Record<string, string> = {
  spof: 'SPOF',
  choke: 'Choke Point',
  pareto: 'Top Exposure',
};

const COVERAGE_OPTIONS = [
  { label: '70%', value: COVERAGE_70 },
  { label: '80%', value: COVERAGE_80 },
  { label: '90%', value: COVERAGE_90 },
] as const;

type GraphFilter = 'critical' | 'high' | 'spof' | 'all';

// SVG layout constants — circular nodes with label underneath
const NODE_R = 17;
const CELL_W = 118;          // horizontal cell per node (circle + label width)
const TIER_GAP_Y = 128;
const LABEL_H = 30;
const PADDING_X = 48;
const PADDING_Y = 44;

// ---------------------------------------------------------------------------
// Layout computation
// ---------------------------------------------------------------------------
interface LayoutNode {
  id: string;
  node: SubTierFullNode | null; // null = collapsed badge
  x: number;                    // circle centre x
  y: number;                    // circle centre y
  tier: number;
  isPriority: boolean;
  priorityInfo?: PriorityNode;
  collapsed?: boolean;
  collapsedCount?: number;
  parentIds: string[];
}

function computeLayout(
  root: SubTierFullNode,
  priorityIds: Set<string>,
  priorityMap: Map<string, PriorityNode>,
  expandedBadges: Set<string>,
): { nodes: LayoutNode[]; edges: { fromId: string; toId: string }[] } {
  const all = flattenNetwork(root);
  const nodeById = new Map(all.map(n => [n.id, n]));

  // Group visible priority nodes by tier
  const byTier = new Map<number, SubTierFullNode[]>();
  for (const [id] of priorityMap) {
    const n = nodeById.get(id);
    if (!n) continue;
    const list = byTier.get(n.tier) ?? [];
    list.push(n);
    byTier.set(n.tier, list);
  }
  byTier.set(0, [root]);

  // Sort each tier row by exposure desc for stable, readable order
  for (const list of byTier.values()) {
    list.sort((a, b) => (b.revenueAtRisk ?? 0) - (a.revenueAtRisk ?? 0));
  }

  const maxTier = Math.max(...byTier.keys());
  const widest = Math.max(...[...byTier.values()].map(l => l.length));
  const fullWidth = Math.max(widest * CELL_W + PADDING_X * 2, 760);

  const layoutNodes: LayoutNode[] = [];
  const nodePos = new Map<string, { x: number; y: number }>();
  const edges: { fromId: string; toId: string }[] = [];

  for (let tier = 0; tier <= maxTier; tier++) {
    const list = byTier.get(tier) ?? [];
    if (list.length === 0) continue;
    const rowWidth = list.length * CELL_W;
    const startX = (fullWidth - rowWidth) / 2 + CELL_W / 2;
    const y = PADDING_Y + tier * TIER_GAP_Y;

    list.forEach((n, i) => {
      const x = startX + i * CELL_W;
      layoutNodes.push({
        id: n.id, node: n, x, y, tier: n.tier,
        isPriority: priorityIds.has(n.id) || n.tier === 0,
        priorityInfo: priorityMap.get(n.id),
        parentIds: [],
      });
      nodePos.set(n.id, { x, y });
    });
  }

  // Edges between placed nodes + collapsed badges for hidden children
  const placed = new Set(nodePos.keys());
  for (const ln of layoutNodes) {
    if (!ln.node) continue;
    const nonPrioChildren = ln.node.children.filter(c => !placed.has(c.id));
    for (const child of ln.node.children) {
      if (placed.has(child.id)) edges.push({ fromId: ln.id, toId: child.id });
    }
    if (nonPrioChildren.length > 0) {
      const bid = `badge-${ln.id}`;
      const expanded = expandedBadges.has(bid);
      if (expanded) {
        // Reveal up to 5 children as regular circles just below the parent
        nonPrioChildren.slice(0, 5).forEach((child, i) => {
          const bx = ln.x + (i - Math.min(nonPrioChildren.length, 5) / 2) * (CELL_W * 0.7) + CELL_W * 0.35;
          const by = ln.y + TIER_GAP_Y * 0.82;
          layoutNodes.push({
            id: child.id, node: child, x: bx, y: by, tier: child.tier,
            isPriority: false, parentIds: [ln.id],
          });
          nodePos.set(child.id, { x: bx, y: by });
          edges.push({ fromId: ln.id, toId: child.id });
        });
        layoutNodes.push({
          id: bid, node: null, x: ln.x, y: ln.y + TIER_GAP_Y * 0.82 + 46, tier: ln.tier + 1,
          isPriority: false, collapsed: true, collapsedCount: -1, parentIds: [ln.id],
        });
        nodePos.set(bid, { x: ln.x, y: ln.y + TIER_GAP_Y * 0.82 + 46 });
      } else {
        layoutNodes.push({
          id: bid, node: null, x: ln.x + CELL_W * 0.42, y: ln.y + TIER_GAP_Y * 0.55, tier: ln.tier + 1,
          isPriority: false, collapsed: true, collapsedCount: nonPrioChildren.length, parentIds: [ln.id],
        });
        nodePos.set(bid, { x: ln.x + CELL_W * 0.42, y: ln.y + TIER_GAP_Y * 0.55 });
        edges.push({ fromId: ln.id, toId: bid });
      }
    }
  }

  return { nodes: layoutNodes, edges };
}

function svgDims(nodes: LayoutNode[]) {
  if (nodes.length === 0) return { w: 900, h: 400 };
  const maxX = Math.max(...nodes.map(n => n.x)) + CELL_W / 2 + PADDING_X;
  const maxY = Math.max(...nodes.map(n => n.y)) + NODE_R + LABEL_H + PADDING_Y;
  return { w: Math.max(maxX, 760), h: Math.max(maxY, 300) };
}

// ---------------------------------------------------------------------------
// "Why these?" popover
// ---------------------------------------------------------------------------
function SelectionPopover({ floor, exposureLabel = 'revenue at risk' }: { floor: number; exposureLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-0.5 text-amber-600 hover:underline text-xs font-medium"
        aria-expanded={open}
      >
        <Info size={12} /> Why these?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute left-0 top-5 z-20 w-72 ${CARD} p-4`}>
            <p className="text-xs font-semibold text-gray-700 mb-2">Selection logic</p>
            <ol className="space-y-1.5 text-xs text-gray-700">
              <li><span className="font-semibold text-amber-600">Spine:</span> Pareto — smallest set covering selected % of total {exposureLabel}</li>
              <li><span className="font-semibold text-red-600">+SPOF:</span> sole-source nodes added if {exposureLabel} ≥ {formatRevenue(floor)} and priced</li>
              <li><span className="font-semibold text-amber-700">+Choke:</span> convergence nodes added if {exposureLabel} ≥ {formatRevenue(floor)} and priced</li>
            </ol>
            <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
              Nodes below {formatRevenue(floor)} {exposureLabel} — or with no priced parts — are never shown on the map; they live in the full table only.
            </p>
          </div>
        </>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Side panel for selected node
// ---------------------------------------------------------------------------
function NodeSidePanel({
  priorityInfo, pathNodes, onClose, exposureLabel = 'Revenue at Risk',
}: {
  priorityInfo: PriorityNode;
  pathNodes: SubTierFullNode[];
  onClose: () => void;
  exposureLabel?: string;
}) {
  const { node, reasons, revenueShare } = priorityInfo;
  const Icon = IMPACT_CONFIG[node.primaryImpact].icon;
  const sev = SEV[severityOf(node.riskScore)];

  return (
    <div className="bg-white p-5 flex flex-col gap-4 h-full overflow-y-auto">
      <button onClick={onClose} className="self-end text-gray-400 hover:text-gray-600 text-xs">✕ close</button>

      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={chip(node.primaryImpact)}>
            <Icon size={11} className="mr-1" />{node.primaryImpact}
          </span>
          {node.isSPOF && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
              <AlertTriangle size={11} />SPOF
            </span>
          )}
          {node.isChokePoint && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-dashed border-red-300">
              <GitMerge size={11} />Choke Point
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-gray-900">{node.name}</h3>
        <p className="text-xs text-gray-400">{node.location.city}, {node.location.country} · T{node.tier} · {node.commodity}</p>
      </div>

      <div>
        <p className={`${SECTION_LABEL} mb-1`}>Risk Score</p>
        <span className={`inline-flex items-center justify-center px-3 h-8 rounded-lg text-sm font-bold tabular-nums ${sev.chip}`}>
          {node.riskScore}
        </span>
      </div>

      {pathNodes.length > 1 && (
        <div>
          <p className={`${SECTION_LABEL} mb-1`}>Path from root</p>
          <div className="flex items-center flex-wrap gap-1">
            {pathNodes.map((pn, i) => (
              <span key={pn.id} className="flex items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">{pn.name}</span>
                {i < pathNodes.length - 1 && <ChevronRight size={11} className="text-gray-300" />}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className={`${SECTION_LABEL} mb-1`}>Risk Factor</p>
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700">
          {node.topRiskLens} — {node.topRiskLensLabel}
        </span>
      </div>

      <div>
        <p className={`${SECTION_LABEL} mb-1`}>
          {exposureLabel}
          {node.costEstimated && (
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 normal-case tracking-normal">
              est.
            </span>
          )}
        </p>
        <p className="text-lg font-bold text-gray-900 tabular-nums">
          {node.revenueAtRisk !== null ? formatRevenue(node.revenueAtRisk) : <span className="text-gray-400">exposure n/a</span>}
        </p>
        <p className="text-xs text-gray-400">{(revenueShare * 100).toFixed(1)}% of network total</p>
      </div>

      <div>
        <p className={`${SECTION_LABEL} mb-1`}>Why surfaced</p>
        <div className="flex flex-wrap gap-1">
          {reasons.map(r => (
            <span key={r} className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              {REASON_LABELS[r]}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className={`${SECTION_LABEL} mb-1`}>Recommended Action</p>
        <p className="text-xs text-gray-700 leading-relaxed">{node.action}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tier legend card (top-right)
// ---------------------------------------------------------------------------
function TierLegend() {
  return (
    <div className={`${CARD} p-3 w-44`}>
      <p className={`${SECTION_LABEL} mb-2`}>Legend</p>
      <ul className="space-y-1.5">
        {([0, 1, 2, 3, 4, 5] as const).map(t => (
          <li key={t} className="flex items-center gap-2 text-[11px] text-gray-600">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: TIER[t].hex }} />
            <span className="font-medium text-gray-700">T{t}</span> {TIER[t].label}
          </li>
        ))}
        <li className="flex items-center gap-2 text-[11px] text-gray-600 pt-1 border-t border-gray-100">
          <span className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-dashed border-red-500" />
          Choke point
        </li>
        <li className="flex items-center gap-2 text-[11px] text-gray-600">
          <svg width="12" height="12" viewBox="0 0 12 12" className="flex-shrink-0"><path d="M6 1 L11 10 H1 Z" fill="#DC2626" /></svg>
          SPOF
        </li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG map — circular tier-colored nodes, smooth curved edges
// ---------------------------------------------------------------------------
function NetworkMapSVG({
  root, priorityIds, priorityMap, selectedId, onSelectNode, expandedBadges, onToggleBadge, zoom,
}: {
  root: SubTierFullNode;
  priorityIds: Set<string>;
  priorityMap: Map<string, PriorityNode>;
  selectedId: string | null;
  onSelectNode: (id: string | null) => void;
  expandedBadges: Set<string>;
  onToggleBadge: (badgeId: string) => void;
  zoom: number;
}) {
  const { nodes, edges } = useMemo(
    () => computeLayout(root, priorityIds, priorityMap, expandedBadges),
    [root, priorityIds, priorityMap, expandedBadges],
  );
  const { w, h } = svgDims(nodes);
  const pos = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * zoom}
      height={h * zoom}
      style={{ minHeight: 320, maxWidth: 'none' }}
      className="overflow-visible"
    >
      {/* Tier row labels */}
      {[0, 1, 2, 3, 4, 5].map(tier => {
        const has = nodes.some(n => n.tier === tier && !n.collapsed);
        if (!has) return null;
        return (
          <text key={tier} x={10} y={PADDING_Y + tier * TIER_GAP_Y + 4}
            className="fill-gray-300" fontSize={11} fontWeight={700}>
            T{tier}
          </text>
        );
      })}

      {/* Curved edges */}
      {edges.map(({ fromId, toId }) => {
        const a = pos.get(fromId); const b = pos.get(toId);
        if (!a || !b) return null;
        const y0 = a.y + NODE_R, y1 = b.y - NODE_R;
        const my = (y0 + y1) / 2;
        return (
          <path
            key={`${fromId}-${toId}`}
            d={`M ${a.x} ${y0} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${y1}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(ln => {
        if (ln.collapsed) {
          if (ln.collapsedCount === -1) return null; // expanded marker, nothing to draw
          return (
            <g key={ln.id} onClick={() => onToggleBadge(ln.id)} className="cursor-pointer">
              <circle cx={ln.x} cy={ln.y} r={14} fill="white" stroke="#D1D5DB" strokeDasharray="3 3" strokeWidth={1.5} />
              <text x={ln.x} y={ln.y + 3.5} textAnchor="middle" fontSize={9.5} fontWeight={700} className="fill-gray-400 select-none">
                +{ln.collapsedCount}
              </text>
            </g>
          );
        }
        const n = ln.node!;
        const isRoot = n.tier === 0;
        const tierCfg = TIER[n.tier as keyof typeof TIER] ?? TIER[5];
        const selected = selectedId === n.id;
        const clickable = ln.isPriority && !isRoot && ln.priorityInfo;

        return (
          <g
            key={ln.id}
            onClick={() => clickable && onSelectNode(selected ? null : n.id)}
            className={clickable ? 'cursor-pointer' : undefined}
          >
            {/* selection halo */}
            {selected && <circle cx={ln.x} cy={ln.y} r={NODE_R + 5} fill="none" stroke="#FBBF24" strokeWidth={3} />}
            {/* choke = dashed red ring */}
            {n.isChokePoint && (
              <circle cx={ln.x} cy={ln.y} r={NODE_R + 3.5} fill="none" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 3" />
            )}
            <circle
              cx={ln.x} cy={ln.y} r={isRoot ? NODE_R + 4 : NODE_R}
              fill={tierCfg.hex}
              stroke="white" strokeWidth={2}
            />
            {/* score inside circle (root shows ★) */}
            <text x={ln.x} y={ln.y + 4} textAnchor="middle" fontSize={isRoot ? 13 : 10.5} fontWeight={800} fill="white" className="select-none">
              {isRoot ? '★' : n.riskScore}
            </text>
            {/* SPOF = red triangle marker */}
            {n.isSPOF && (
              <path d={`M ${ln.x + NODE_R - 2} ${ln.y - NODE_R - 6} l 5 9 h -10 Z`} fill="#DC2626" />
            )}
            {/* label + city underneath */}
            <text x={ln.x} y={ln.y + NODE_R + 12} textAnchor="middle" fontSize={9.5} fontWeight={700} className="fill-gray-700 select-none">
              {n.name.length > 17 ? n.name.slice(0, 16) + '…' : n.name}
            </text>
            <text x={ln.x} y={ln.y + NODE_R + 22} textAnchor="middle" fontSize={8.5} className="fill-gray-400 select-none">
              {n.location.city !== '—' ? n.location.city : n.commodity.slice(0, 14)}
              {ln.priorityInfo && n.revenueAtRisk !== null ? ` · ${formatRevenue(n.revenueAtRisk)}` : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// NetworkView page
// ---------------------------------------------------------------------------
interface NetworkViewProps {
  root?: SubTierFullNode;
  title?: string;
  subtitle?: string;
  dataSource?: 'mock' | 'live';
}

export default function NetworkView({
  root = LARGE_NETWORK,
  title = 'Sub-Tier Network',
  subtitle,
  dataSource = 'mock',
}: NetworkViewProps = {}) {
  const [analyzed, setAnalyzed] = useState(false);
  const [coverageTarget, setCoverageTarget] = useState<number>(COVERAGE_80);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedBadges, setExpandedBadges] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [graphFilter, setGraphFilter] = useState<GraphFilter>('all');
  const [lensFilter, setLensFilter] = useState<string>('all'); // 12-lens key or 'all'
  const [zoom, setZoom] = useState(1);

  const isLive = dataSource === 'live';
  const exposureWord = isLive ? 'cost exposure' : 'revenue at risk';
  const exposureFloor = isLive ? LIVE_MIN_EXPOSURE : MIN_MEANINGFUL_EXPOSURE;

  const result = useMemo(
    () => selectPrioritySuppliers(root, {
      coverageTarget,
      exposureLabel: exposureWord,
      exposureFloor,
    }),
    [root, coverageTarget, exposureWord, exposureFloor],
  );

  const {
    prioritySet, totalSupplierCount, belowFloorCount,
    insufficientDataCount, coverageAchieved, caption,
  } = result;

  // Graph filters narrow what is DRAWN — coverage selection itself is unchanged
  const visibleSet = useMemo(() => {
    let set = prioritySet;
    switch (graphFilter) {
      case 'critical': set = set.filter(p => p.node.riskScore >= 70); break;
      case 'high':     set = set.filter(p => p.node.riskScore >= 40); break;
      case 'spof':     set = set.filter(p => p.node.isSPOF); break;
    }
    if (lensFilter !== 'all') {
      set = set.filter(p => nodeMatchesLens(p.node.name, p.node.topRiskLens, lensFilter));
    }
    return set;
  }, [prioritySet, graphFilter, lensFilter]);

  const priorityMap = useMemo(() => new Map(visibleSet.map(p => [p.node.id, p])), [visibleSet]);
  const priorityIds = useMemo(() => new Set(priorityMap.keys()), [priorityMap]);

  const allNodes = useMemo(() => flattenNetwork(root), [root]);
  const nodeById = useMemo(() => new Map(allNodes.map(n => [n.id, n])), [allNodes]);
  const parentMap = useMemo(() => buildParentMap(root), [root]);

  const selectedPriority = useMemo(
    () => (selectedNodeId ? priorityMap.get(selectedNodeId) ?? null : null),
    [selectedNodeId, priorityMap],
  );
  const selectedPath = useMemo(
    () => selectedNodeId ? pathToRoot(selectedNodeId, parentMap, nodeById) : [],
    [selectedNodeId, parentMap, nodeById],
  );

  const handleToggleBadge = useCallback((badgeId: string) => {
    setExpandedBadges(prev => {
      const next = new Set(prev);
      if (next.has(badgeId)) next.delete(badgeId);
      else next.add(badgeId);
      return next;
    });
  }, []);

  const pctCovered = Math.round(coverageAchieved * 100);

  const FILTER_PILLS: { key: GraphFilter; label: string }[] = [
    { key: 'critical', label: 'Critical' },
    { key: 'high', label: 'High Risk' },
    { key: 'spof', label: 'SPOFs' },
    { key: 'all', label: 'Show All' },
  ];

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Title row: pill selectors + gold ANALYZE */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <FCoin />
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            {isLive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live data
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500">
                Demo data
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {subtitle ?? `QSC Aerospace · PCB Assembly · T0–T5 · ${totalSupplierCount} suppliers`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className={PILL_SELECT}>Product: All <ChevronDown size={12} /></button>
          <button className={PILL_SELECT}>Commodity: PCB Assembly <ChevronDown size={12} /></button>
          <button className={PILL_SELECT}>Supplier: All <ChevronDown size={12} /></button>
          {!analyzed ? (
            <button onClick={() => setAnalyzed(true)} className={GOLD_BTN}>ANALYZE</button>
          ) : (
            <button
              onClick={() => { setAnalyzed(false); setSelectedNodeId(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Pre-analyze hint */}
      {!analyzed && (
        <div className={`${CARD} p-10 text-center text-gray-400`}>
          <p className="text-lg font-semibold mb-2 text-gray-500">Ready to analyze</p>
          <p className="text-sm">
            Click ANALYZE to surface the material suppliers across all {totalSupplierCount} in the network by {exposureWord}.
            <br />
            Nodes below the {formatRevenue(exposureFloor)} {exposureWord} floor are never shown on the map.
          </p>
        </div>
      )}

      {analyzed && (
        <>
          {/* Live-data disclaimer */}
          {isLive && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-3 text-xs text-amber-800 flex items-start gap-2">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                Ranked by <strong>annual cost exposure (modeled)</strong> from the customer BOM (792 parts) —
                modeled as unit cost × usage volume. This is <strong>cost-based, not revenue</strong>; assembly/custom
                rows are estimates. Suppliers with no priced parts are excluded from the map as
                “insufficient data” and shown in the full table as <em>exposure n/a</em> — never a false $0.
              </span>
            </div>
          )}

          {/* Headline card */}
          <div className={`${CARD} px-5 py-4 mb-4 border-l-4 border-l-amber-400`}>
            <p className="text-base font-bold text-gray-900">
              {prioritySet.length} of {totalSupplierCount} suppliers need attention now
              {' — '}covering <span className="text-amber-600">{pctCovered}%</span> of {exposureWord}
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>{caption}</span>
              <SelectionPopover floor={exposureFloor} exposureLabel={exposureWord} />
            </p>
          </div>

          {/* Coverage control */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={SECTION_LABEL}>Coverage target</span>
            {COVERAGE_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => { setCoverageTarget(value); setSelectedNodeId(null); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                  coverageTarget === value
                    ? 'bg-amber-400 text-gray-900 shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-300'
                }`}
              >
                {label}
              </button>
            ))}
            <span className="text-xs text-gray-400">
              → {prioritySet.length} surfaced, {belowFloorCount} below floor
              {insufficientDataCount > 0 && `, ${insufficientDataCount} insufficient data`}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline"
            >
              See all {totalSupplierCount} suppliers
              <ExternalLink size={11} />
            </button>
          </div>

          {/* Map + side panel */}
          <div className={`${CARD} overflow-hidden flex relative`}>
            {/* SVG map */}
            <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 620 }}>
              <NetworkMapSVG
                root={root}
                priorityIds={priorityIds}
                priorityMap={priorityMap}
                selectedId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                expandedBadges={expandedBadges}
                onToggleBadge={handleToggleBadge}
                zoom={zoom}
              />
            </div>

            {/* Legend top-right */}
            <div className="absolute top-3 right-3 pointer-events-none">
              {!selectedNodeId && <TierLegend />}
            </div>

            {/* Floating filter bar bottom-left */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur border border-gray-200 rounded-full px-2 py-1.5 shadow-md">
              {FILTER_PILLS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setGraphFilter(key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    graphFilter === key
                      ? 'bg-amber-400 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="w-px h-4 bg-gray-200 mx-0.5" />
              <select
                value={lensFilter}
                onChange={e => { setLensFilter(e.target.value); setSelectedNodeId(null); }}
                aria-label="Lens filter"
                className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border-0 focus:outline-none cursor-pointer ${
                  lensFilter !== 'all' ? 'bg-amber-400 text-gray-900' : 'bg-transparent text-gray-500'
                }`}
              >
                <option value="all">All Lenses</option>
                {LENSES.map(l => (
                  <option key={l.key} value={l.key}>{l.label}</option>
                ))}
              </select>
              <span className="w-px h-4 bg-gray-200 mx-0.5" />
              <button onClick={() => setZoom(z => Math.min(1.6, z + 0.2))} className="p-1 text-gray-500 hover:text-gray-800" aria-label="Zoom in">
                <ZoomIn size={14} />
              </button>
              <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} className="p-1 text-gray-500 hover:text-gray-800" aria-label="Zoom out">
                <ZoomOut size={14} />
              </button>
            </div>

            {/* Side panel */}
            {selectedNodeId && selectedPriority && (
              <div className="w-72 border-l border-gray-100 flex-shrink-0">
                <NodeSidePanel
                  priorityInfo={selectedPriority}
                  pathNodes={selectedPath}
                  onClose={() => setSelectedNodeId(null)}
                  exposureLabel={isLive ? 'Annual Cost Exposure' : 'Revenue at Risk'}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Full BOM modal */}
      {showModal && (
        <SubTierDetailModal
          root={root}
          prioritySet={prioritySet}
          onClose={() => setShowModal(false)}
          exposureLabel={isLive ? 'Cost Exposure' : 'Rev. at Risk'}
        />
      )}
    </div>
  );
}
