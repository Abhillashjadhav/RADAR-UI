import type { SubTierFullNode } from '../data/subtierMockData';
import { flattenNetwork } from '../data/subtierMockData';

// ---------------------------------------------------------------------------
// Named constants — change here only
// ---------------------------------------------------------------------------
export const MIN_MEANINGFUL_EXPOSURE = 0.1;    // $M — $100K floor for the $M-scale mock network
export const LIVE_MIN_EXPOSURE = 0.0005;       // $M — $500 floor sized to the customer's cost-exposure data
export const COVERAGE_70 = 0.70;
export const COVERAGE_80 = 0.80;
export const COVERAGE_90 = 0.90;
export const DEFAULT_COVERAGE = COVERAGE_80;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type PriorityReason = 'spof' | 'choke' | 'pareto';

export interface PriorityNode {
  node: SubTierFullNode;
  reasons: PriorityReason[];
  revenueShare: number; // fraction of total network revenue this node carries
}

export interface PriorityResult {
  prioritySet: PriorityNode[];
  totalSupplierCount: number;      // all non-root nodes
  belowFloorCount: number;         // nodes with KNOWN exposure but below the floor (low-exposure)
  insufficientDataCount: number;   // nodes with UNKNOWN exposure (null) — excluded, never treated as $0
  totalNetworkRevenue: number;     // $M — sum across all eligible nodes
  coverageAchieved: number;        // fraction actually covered by prioritySet
  caption: string;
}

// ---------------------------------------------------------------------------
// selectPrioritySuppliers
//
// Spine: revenue Pareto — rank eligible nodes by revenueAtRisk desc, include
//        until cumulative revenue reaches coverageTarget.
// Gate:  revenueAtRisk >= MIN_MEANINGFUL_REVENUE (both for Pareto and for
//        SPOF/choke inclusion — a $1K SPOF is still noise).
// Risk score: used only for sort order within tier, NOT for membership.
// ---------------------------------------------------------------------------
export function selectPrioritySuppliers(
  root: SubTierFullNode,
  opts?: { coverageTarget?: number; exposureLabel?: string; exposureFloor?: number },
): PriorityResult {
  const coverageTarget = opts?.coverageTarget ?? DEFAULT_COVERAGE;
  const exposureLabel = opts?.exposureLabel ?? 'revenue at risk';
  const exposureFloor = opts?.exposureFloor ?? MIN_MEANINGFUL_EXPOSURE;

  const allNodes = flattenNetwork(root).filter(n => n.tier > 0);
  const totalSupplierCount = allNodes.length;

  // Insufficient data (null exposure) is NOT $0 — it is unknown. Exclude from the
  // Pareto/map entirely; it still appears in the full "see all" table as n/a.
  const insufficientDataCount = allNodes.filter(n => n.revenueAtRisk === null).length;

  // Eligible = KNOWN exposure at or above the floor.
  const eligible = allNodes.filter(
    n => n.revenueAtRisk !== null && n.revenueAtRisk >= exposureFloor,
  );
  // Below floor = KNOWN exposure but under the floor (distinct from unknown/insufficient).
  const belowFloorCount = allNodes.filter(
    n => n.revenueAtRisk !== null && n.revenueAtRisk < exposureFloor,
  ).length;

  const totalNetworkRevenue = eligible.reduce((s, n) => s + (n.revenueAtRisk ?? 0), 0);

  // Sort eligible by revenue descending — Pareto spine
  const byRevenue = [...eligible].sort((a, b) => (b.revenueAtRisk ?? 0) - (a.revenueAtRisk ?? 0));

  const selected = new Map<string, { node: SubTierFullNode; reasons: Set<PriorityReason> }>();

  const touch = (node: SubTierFullNode) => {
    if (!selected.has(node.id)) {
      selected.set(node.id, { node, reasons: new Set() });
    }
    return selected.get(node.id)!;
  };

  // Pareto loop — add top-revenue nodes until coverage target reached
  let cumRevenue = 0;
  for (const n of byRevenue) {
    if (totalNetworkRevenue > 0 && cumRevenue / totalNetworkRevenue >= coverageTarget) break;
    cumRevenue += n.revenueAtRisk ?? 0;
    touch(n).reasons.add('pareto');
  }

  // SPOF / choke — only if they clear the revenue floor (already in `eligible`)
  for (const n of eligible.filter(n => n.isSPOF)) {
    touch(n).reasons.add('spof');
  }
  for (const n of eligible.filter(n => n.isChokePoint)) {
    touch(n).reasons.add('choke');
  }

  // Build result, sorted by revenueAtRisk desc
  const prioritySet: PriorityNode[] = [...selected.values()]
    .sort((a, b) => (b.node.revenueAtRisk ?? 0) - (a.node.revenueAtRisk ?? 0))
    .map(({ node, reasons }) => ({
      node,
      reasons: [...reasons] as PriorityReason[],
      revenueShare: totalNetworkRevenue > 0 ? (node.revenueAtRisk ?? 0) / totalNetworkRevenue : 0,
    }));

  const coverageAchieved =
    totalNetworkRevenue > 0
      ? prioritySet.reduce((s, p) => s + (p.node.revenueAtRisk ?? 0), 0) / totalNetworkRevenue
      : 0;

  const pct = Math.round(coverageAchieved * 100);
  const tail = insufficientDataCount > 0
    ? `${insufficientDataCount} suppliers excluded for insufficient data (in full table)`
    : `${belowFloorCount} low-exposure suppliers in the full table`;
  const caption =
    `Showing ${prioritySet.length} of ${totalSupplierCount} suppliers covering ${pct}% of ${exposureLabel} — ${tail}.`;

  return {
    prioritySet,
    totalSupplierCount,
    belowFloorCount,
    insufficientDataCount,
    totalNetworkRevenue,
    coverageAchieved,
    caption,
  };
}
