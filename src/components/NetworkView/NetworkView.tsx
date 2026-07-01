import { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle, GitMerge, Truck, ShieldCheck, DollarSign,
  Info, ExternalLink, ChevronRight,
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const IMPACT_CONFIG = {
  Delivery:   { icon: Truck,       badge: 'bg-red-100 text-red-700',       border: 'border-red-400'    },
  Compliance: { icon: ShieldCheck, badge: 'bg-orange-100 text-orange-700', border: 'border-orange-400' },
  Cost:       { icon: DollarSign,  badge: 'bg-blue-100 text-blue-700',     border: 'border-blue-400'   },
} as const;

const REASON_LABELS: Record<string, string> = {
  spof: 'SPOF',
  choke: 'Choke Point',
  pareto: 'Top Revenue',
};

const COVERAGE_OPTIONS = [
  { label: '70%', value: COVERAGE_70 },
  { label: '80%', value: COVERAGE_80 },
  { label: '90%', value: COVERAGE_90 },
] as const;

// SVG layout constants
const NODE_W = 160;
const NODE_H = 60;
const TIER_GAP_Y = 110;  // vertical distance between tier rows
const NODE_GAP_X = 180;  // horizontal distance between nodes in same tier
const PADDING_X = 40;
const PADDING_Y = 40;
const BADGE_W = 80;
const BADGE_H = 32;

// ---------------------------------------------------------------------------
// Layout computation
// ---------------------------------------------------------------------------
interface LayoutNode {
  id: string;
  node: SubTierFullNode | null; // null = collapsed badge
  x: number;
  y: number;
  tier: number;
  isPriority: boolean;
  priorityInfo?: PriorityNode;
  collapsed?: boolean;   // this is a "+N more" badge
  collapsedCount?: number;
  collapsedParentId?: string;
  // for edges
  parentIds: string[];
}

function computeLayout(
  root: SubTierFullNode,
  priorityIds: Set<string>,
  priorityMap: Map<string, PriorityNode>,
  expandedBadges: Set<string>,   // which collapsed badges have been expanded
): { nodes: LayoutNode[]; edges: { fromId: string; toId: string }[] } {
  // Group priority nodes by tier
  const byTier = new Map<number, SubTierFullNode[]>();
  for (const [id] of priorityMap) {
    const all = flattenNetwork(root);
    const n = all.find(x => x.id === id);
    if (!n) continue;
    const list = byTier.get(n.tier) ?? [];
    list.push(n);
    byTier.set(n.tier, list);
  }
  // Also always include root (tier 0)
  byTier.set(0, [root]);

  const maxTier = Math.max(...[...byTier.keys()]);

  // Compute x positions per tier (centre-aligned)
  const layoutNodes: LayoutNode[] = [];
  const nodePos = new Map<string, { x: number; y: number }>();
  const edges: { fromId: string; toId: string }[] = [];

  // Parent map for edge drawing
  const parentMap = buildParentMap(root);

  for (let tier = 0; tier <= maxTier; tier++) {
    const nodes = byTier.get(tier) ?? [];
    if (nodes.length === 0) continue;
    const totalW = nodes.length * NODE_W + (nodes.length - 1) * (NODE_GAP_X - NODE_W);
    const startX = PADDING_X + Math.max(0, (800 - totalW) / 2); // rough centre in 800px
    const y = PADDING_Y + tier * TIER_GAP_Y;

    nodes.forEach((n, i) => {
      const x = startX + i * NODE_GAP_X;
      nodePos.set(n.id, { x, y });
      layoutNodes.push({
        id: n.id,
        node: n,
        x,
        y,
        tier,
        isPriority: priorityIds.has(n.id) || tier === 0,
        priorityInfo: priorityMap.get(n.id),
        parentIds: parentMap.get(n.id) ?? [],
      });
    });
  }

  // Edges: connect priority nodes to their priority parents (or root)
  for (const ln of layoutNodes) {
    if (ln.tier === 0) continue;
    for (const parentId of ln.parentIds) {
      if (nodePos.has(parentId)) {
        edges.push({ fromId: parentId, toId: ln.id });
      }
    }
    // If none of the parents are in priorityIds, connect to root
    if (!ln.parentIds.some(pid => nodePos.has(pid)) && nodePos.has(root.id)) {
      edges.push({ fromId: root.id, toId: ln.id });
    }
  }

  // Add "+N more" collapse badges per priority node for their non-priority children
  const allNodes = flattenNetwork(root);
  const nodeById = new Map(allNodes.map(n => [n.id, n]));

  for (const ln of [...layoutNodes]) {
    if (!ln.node) continue;
    // Count non-priority children (direct only)
    const nonPrioChildren = ln.node.children.filter(c => !priorityIds.has(c.id));
    if (nonPrioChildren.length === 0) continue;

    const badgeKey = `badge:${ln.id}`;
    if (expandedBadges.has(badgeKey)) {
      // Show expanded list (up to 5 for readability)
      const show = nonPrioChildren.slice(0, 5);
      const pos = nodePos.get(ln.id)!;
      show.forEach((child, i) => {
        const bx = pos.x + (i - (show.length - 1) / 2) * 90;
        const by = pos.y + TIER_GAP_Y;
        const bid = `expanded:${ln.id}:${child.id}`;
        layoutNodes.push({
          id: bid,
          node: child,
          x: bx,
          y: by,
          tier: child.tier,
          isPriority: false,
          parentIds: [ln.id],
          collapsed: false,
        });
        nodePos.set(bid, { x: bx, y: by });
        edges.push({ fromId: ln.id, toId: bid });
      });
      if (nonPrioChildren.length > 5) {
        const bx = pos.x + (5 - (Math.min(nonPrioChildren.length, 5) - 1) / 2) * 90;
        const by = pos.y + TIER_GAP_Y;
        const bid = `badge:more:${ln.id}`;
        layoutNodes.push({
          id: bid,
          node: null,
          x: bx,
          y: by,
          tier: ln.tier + 1,
          isPriority: false,
          collapsed: true,
          collapsedCount: nonPrioChildren.length - 5,
          collapsedParentId: ln.id,
          parentIds: [ln.id],
        });
        nodePos.set(bid, { x: bx, y: by });
        edges.push({ fromId: ln.id, toId: bid });
      }
    } else {
      // Show single collapse badge
      const pos = nodePos.get(ln.id)!;
      const bx = pos.x;
      const by = pos.y + TIER_GAP_Y;
      const bid = badgeKey;
      if (!nodePos.has(bid)) {
        layoutNodes.push({
          id: bid,
          node: null,
          x: bx,
          y: by,
          tier: ln.tier + 1,
          isPriority: false,
          collapsed: true,
          collapsedCount: nonPrioChildren.length,
          collapsedParentId: ln.id,
          parentIds: [ln.id],
        });
        nodePos.set(bid, { x: bx, y: by });
        edges.push({ fromId: ln.id, toId: bid });
      }
    }
    // suppress unused variable warning
    void nodeById;
  }

  return { nodes: layoutNodes, edges };
}

// Compute SVG viewBox dimensions from node positions
function svgDims(nodes: LayoutNode[]) {
  if (nodes.length === 0) return { w: 900, h: 400 };
  const maxX = Math.max(...nodes.map(n => n.x + NODE_W)) + PADDING_X;
  const maxY = Math.max(...nodes.map(n => n.y + NODE_H)) + PADDING_Y;
  return { w: Math.max(maxX, 900), h: Math.max(maxY, 300) };
}

// ---------------------------------------------------------------------------
// Score color helpers
// ---------------------------------------------------------------------------
function scoreFill(score: number) {
  if (score >= 70) return '#DC2626'; // red-600
  if (score >= 40) return '#F59E0B'; // yellow-500
  return '#10B981'; // green-500
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
        className="inline-flex items-center gap-0.5 text-blue-700 hover:underline text-xs"
        aria-expanded={open}
      >
        <Info size={12} /> Why these?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-5 z-20 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Selection logic</p>
            <ol className="space-y-1.5 text-xs text-gray-700">
              <li><span className="font-semibold text-blue-600">Spine:</span> Pareto — smallest set covering selected % of total {exposureLabel}</li>
              <li><span className="font-semibold text-red-600">+SPOF:</span> sole-source nodes added if {exposureLabel} ≥ {formatRevenue(floor)} and priced</li>
              <li><span className="font-semibold text-orange-600">+Choke:</span> convergence nodes added if {exposureLabel} ≥ {formatRevenue(floor)} and priced</li>
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
  priorityInfo,
  pathNodes,
  onClose,
  exposureLabel = 'Revenue at Risk',
}: {
  priorityInfo: PriorityNode;
  pathNodes: SubTierFullNode[];
  onClose: () => void;
  exposureLabel?: string;
}) {
  const { node, reasons, revenueShare } = priorityInfo;
  const cfg = IMPACT_CONFIG[node.primaryImpact];
  const Icon = cfg.icon;

  return (
    <div className={`border-l-4 ${cfg.border.replace('border-', 'border-l-')} bg-white rounded-r-xl p-5 flex flex-col gap-4 h-full overflow-y-auto`}>
      {/* Close */}
      <button onClick={onClose} className="self-end text-gray-400 hover:text-gray-600 text-xs">✕ close</button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
            <Icon size={11} />{node.primaryImpact}
          </span>
          {node.isSPOF && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
              <AlertTriangle size={11} />SPOF
            </span>
          )}
          {node.isChokePoint && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600">
              <GitMerge size={11} />Choke Point
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-gray-900">{node.name}</h3>
        <p className="text-xs text-gray-400">{node.location.city}, {node.location.country} · T{node.tier} · {node.commodity}</p>
      </div>

      {/* Path from root */}
      {pathNodes.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Path from root</p>
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

      {/* Risk factor */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Risk Factor</p>
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
          {node.topRiskLens} — {node.topRiskLensLabel}
        </span>
      </div>

      {/* Exposure */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
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

      {/* Why surfaced */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Why surfaced</p>
        <div className="flex flex-wrap gap-1">
          {reasons.map(r => (
            <span key={r} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {REASON_LABELS[r]}
            </span>
          ))}
        </div>
      </div>

      {/* Action */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recommended Action</p>
        <p className="text-xs text-gray-700 leading-relaxed">{node.action}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG Map
// ---------------------------------------------------------------------------
function NetworkMapSVG({
  root,
  priorityIds,
  priorityMap,
  selectedId,
  onSelectNode,
  expandedBadges,
  onToggleBadge,
}: {
  root: SubTierFullNode;
  priorityIds: Set<string>;
  priorityMap: Map<string, PriorityNode>;
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  expandedBadges: Set<string>;
  onToggleBadge: (badgeId: string, parentId: string) => void;
}) {
  const { nodes, edges } = useMemo(
    () => computeLayout(root, priorityIds, priorityMap, expandedBadges),
    [root, priorityIds, priorityMap, expandedBadges],
  );

  const { w, h } = svgDims(nodes);
  const nodePos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    nodes.forEach(n => m.set(n.id, { x: n.x, y: n.y }));
    return m;
  }, [nodes]);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      style={{ minHeight: 320, maxWidth: 'none' }}
      className="overflow-visible"
    >
      {/* Tier row labels */}
      {[0, 1, 2, 3, 4, 5].map(tier => {
        const hasNodes = nodes.some(n => n.tier === tier);
        if (!hasNodes) return null;
        const y = PADDING_Y + tier * TIER_GAP_Y + NODE_H / 2;
        return (
          <text key={tier} x={8} y={y} className="text-xs" fontSize={10} fill="#9CA3AF" dominantBaseline="middle">
            T{tier}
          </text>
        );
      })}

      {/* Edges */}
      {edges.map((e, i) => {
        const from = nodePos.get(e.fromId);
        const to = nodePos.get(e.toId);
        if (!from || !to) return null;
        const x1 = from.x + NODE_W / 2;
        const y1 = from.y + NODE_H;
        const x2 = to.x + (to === nodePos.get(e.toId) ? NODE_W / 2 : BADGE_W / 2);
        const y2 = to.y;
        const midY = (y1 + y2) / 2;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(ln => {
        if (ln.collapsed) {
          // "+N more" badge
          const bId = ln.id;
          const count = ln.collapsedCount ?? 0;
          return (
            <g
              key={bId}
              transform={`translate(${ln.x}, ${ln.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => ln.collapsedParentId && onToggleBadge(bId, ln.collapsedParentId)}
            >
              <rect
                width={BADGE_W}
                height={BADGE_H}
                rx={8}
                fill="#F9FAFB"
                stroke="#E5E7EB"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <text x={BADGE_W / 2} y={BADGE_H / 2} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#6B7280" fontWeight={500}>
                +{count} more
              </text>
            </g>
          );
        }

        if (!ln.node) return null;
        const n = ln.node;
        const isSelected = ln.id === selectedId || n.id === selectedId;
        const pInfo = ln.priorityInfo ?? priorityMap.get(n.id);
        const isRoot = n.tier === 0;
        const fill = isRoot ? '#1E40AF' : '#FFFFFF';
        const stroke = isSelected ? '#2563EB' : (ln.isPriority ? '#6B7280' : '#E5E7EB');
        const strokeW = isSelected ? 2.5 : 1.5;

        return (
          <g
            key={ln.id}
            transform={`translate(${ln.x}, ${ln.y})`}
            style={{ cursor: ln.isPriority && !isRoot ? 'pointer' : 'default' }}
            onClick={() => ln.isPriority && !isRoot && onSelectNode(n.id)}
          >
            {/* Card rect */}
            <rect
              width={NODE_W}
              height={NODE_H}
              rx={8}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeW}
              filter={isSelected ? 'drop-shadow(0 2px 6px rgba(37,99,235,0.25))' : undefined}
            />

            {/* Left accent bar — impact color */}
            {!isRoot && ln.isPriority && (
              <rect
                width={4}
                height={NODE_H}
                rx={2}
                fill={
                  n.primaryImpact === 'Delivery' ? '#F87171' :
                  n.primaryImpact === 'Compliance' ? '#FB923C' :
                  '#60A5FA'
                }
              />
            )}

            {/* Score circle */}
            {!isRoot && (
              <circle cx={22} cy={NODE_H / 2} r={14} fill={scoreFill(n.riskScore)} />
            )}
            {!isRoot && (
              <text x={22} y={NODE_H / 2} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#fff" fontWeight={700}>
                {n.riskScore}
              </text>
            )}

            {/* Root star */}
            {isRoot && (
              <text x={NODE_W / 2} y={NODE_H / 2} textAnchor="middle" dominantBaseline="middle" fontSize={14} fill="#fff">
                ★
              </text>
            )}

            {/* Name */}
            <text
              x={isRoot ? NODE_W / 2 : 42}
              y={isRoot ? NODE_H / 2 - 8 : NODE_H / 2 - 8}
              fontSize={isRoot ? 10 : 9}
              fill={isRoot ? '#fff' : (ln.isPriority ? '#111827' : '#9CA3AF')}
              fontWeight={ln.isPriority ? 600 : 400}
              textAnchor={isRoot ? 'middle' : 'start'}
            >
              {n.name.length > 18 ? n.name.slice(0, 17) + '…' : n.name}
            </text>

            {/* Commodity / label row */}
            {!isRoot && (
              <text x={42} y={NODE_H / 2 + 7} fontSize={8} fill="#6B7280" textAnchor="start">
                {n.commodity.length > 20 ? n.commodity.slice(0, 19) + '…' : n.commodity}
              </text>
            )}

            {/* SPOF / choke icons */}
            {n.isSPOF && <text x={NODE_W - 18} y={14} fontSize={10} fill="#DC2626">⚠</text>}
            {n.isChokePoint && <text x={NODE_W - (n.isSPOF ? 32 : 18)} y={14} fontSize={10} fill="#EA580C">⊕</text>}

            {/* Revenue (priority only) */}
            {ln.isPriority && !isRoot && pInfo && n.revenueAtRisk !== null && (
              <text x={42} y={NODE_H - 8} fontSize={7.5} fill="#6B7280" textAnchor="start" fontWeight={600}>
                {formatRevenue(n.revenueAtRisk)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main NetworkView
// ---------------------------------------------------------------------------
interface NetworkViewProps {
  /** Root of the network tree to analyze. Defaults to the synthetic demo network. */
  root?: SubTierFullNode;
  /** Page title. */
  title?: string;
  /** Subtitle line under the title. */
  subtitle?: string;
  /** 'live' shows the derived-exposure disclaimer; 'mock' is the synthetic demo. */
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
    prioritySet,
    totalSupplierCount,
    belowFloorCount,
    insufficientDataCount,
    coverageAchieved,
    caption,
  } = result;

  const priorityMap = useMemo(
    () => new Map(prioritySet.map(p => [p.node.id, p])),
    [prioritySet],
  );

  const priorityIds = useMemo(() => new Set(priorityMap.keys()), [priorityMap]);

  // Build parent map and node index once
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

  const handleToggleBadge = useCallback((badgeId: string, _parentId: string) => {
    setExpandedBadges(prev => {
      const next = new Set(prev);
      if (next.has(badgeId)) next.delete(badgeId);
      else next.add(badgeId);
      return next;
    });
  }, []);

  const handleCoverageChange = (v: number) => {
    setCoverageTarget(v);
    setSelectedNodeId(null);
  };

  const pctCovered = Math.round(coverageAchieved * 100);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
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
        {!analyzed ? (
          <button
            onClick={() => setAnalyzed(true)}
            className="px-6 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            ANALYZE
          </button>
        ) : (
          <button
            onClick={() => { setAnalyzed(false); setSelectedNodeId(null); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Pre-analyze hint */}
      {!analyzed && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-gray-400">
          <p className="text-lg font-medium mb-2">Ready to analyze</p>
          <p className="text-sm">
            Click ANALYZE to surface the material suppliers across all {totalSupplierCount} in the network by {exposureWord}.
            <br />
            Nodes below the {formatRevenue(exposureFloor)} {exposureWord} floor are never shown on the map.
          </p>
        </div>
      )}

      {/* Post-analyze */}
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

          {/* Headline + controls */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-4">
            <p className="text-base font-semibold text-blue-900">
              {prioritySet.length} of {totalSupplierCount} suppliers need attention now
              {' — '}covering <span className="text-blue-700">{pctCovered}%</span> of {exposureWord}
            </p>
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-2 flex-wrap">
              <span>{caption}</span>
              <SelectionPopover floor={exposureFloor} exposureLabel={exposureWord} />
            </p>
          </div>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Coverage target:</span>
            {COVERAGE_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => handleCoverageChange(value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  coverageTarget === value
                    ? 'bg-blue-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
            >
              See all {totalSupplierCount} suppliers
              <ExternalLink size={11} />
            </button>
          </div>

          {/* Map + side panel */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex">
            {/* SVG map */}
            <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 560 }}>
              <NetworkMapSVG
                root={root}
                priorityIds={priorityIds}
                priorityMap={priorityMap}
                selectedId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                expandedBadges={expandedBadges}
                onToggleBadge={handleToggleBadge}
              />
            </div>

            {/* Side panel */}
            {selectedNodeId && selectedPriority && (
              <div className="w-72 border-l border-gray-200 flex-shrink-0">
                <NodeSidePanel
                  priorityInfo={selectedPriority}
                  pathNodes={selectedPath}
                  onClose={() => setSelectedNodeId(null)}
                  exposureLabel={isLive ? 'Annual Cost Exposure' : 'Revenue at Risk'}
                />
              </div>
            )}

            {!selectedNodeId && (
              <div className="hidden lg:flex w-64 flex-shrink-0 border-l border-gray-100 items-center justify-center">
                <p className="text-xs text-gray-300 text-center px-4 leading-relaxed">
                  Click a supplier node to see risk detail, revenue exposure, path from root, and recommended action.
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-600" />Critical (≥70)</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />Medium (40–69)</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" />Low (&lt;40)</div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded flex items-center justify-center text-red-400 border border-dashed border-gray-300 text-xs">+</div>
              Collapsed sub-tree (click to expand)
            </div>
            <div className="flex items-center gap-1.5"><span className="text-red-500 text-sm">⚠</span> SPOF</div>
            <div className="flex items-center gap-1.5"><span className="text-orange-500 text-sm">⊕</span> Choke Point</div>
          </div>
        </>
      )}

      {/* Full BOM modal */}
      {showModal && (
        <SubTierDetailModal
          root={root}
          prioritySet={prioritySet}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
