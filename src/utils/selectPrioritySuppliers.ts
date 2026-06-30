import type { SubTierFullNode } from '../data/subtierMockData';
import { flattenNetwork } from '../data/subtierMockData';

// ---------------------------------------------------------------------------
// Tunable constants — change these at the top, nowhere else in the logic.
// ---------------------------------------------------------------------------
const CRITICAL_RISK_THRESHOLD = 70; // risk score that qualifies a node as critical
const PARETO_COVERAGE = 0.80;        // smallest set covering this fraction of revenue
const LEGIBILITY_CAP = 10;           // max highlighted nodes before the graph gets cluttered

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type PriorityReason = 'spof' | 'choke' | 'critical-risk' | 'pareto';

export interface PriorityNode {
  node: SubTierFullNode;
  reasons: PriorityReason[];
  priority: number; // higher = more important; used for cap-trimming
}

export interface PriorityResult {
  prioritySet: PriorityNode[];
  totalCount: number;  // excludes QSC root (tier 0)
  caption: string;
  rulesApplied: string[];
}

// ---------------------------------------------------------------------------
// selectPrioritySuppliers
//
// Returns the emphasized set: nodes a buyer should act on first.
// A node enters the set if ANY of these hold:
//   1. It is a Single Point of Failure (sole source on a critical path).
//   2. It is a Choke Point (multiple parent paths converge on it).
//   3. Its risk score ≥ CRITICAL_RISK_THRESHOLD (critical risk on an
//      exposed path to a finished good).
//   4. It is in the smallest Pareto set covering PARETO_COVERAGE % of this
//      commodity's Revenue at Risk (80/20 rule).
//
// The result is capped at LEGIBILITY_CAP for graph legibility; the rest
// remain visible but de-emphasized and are always reachable via the detail table.
// ---------------------------------------------------------------------------
export function selectPrioritySuppliers(
  root: SubTierFullNode,
  opts?: { cap?: number; criticalThreshold?: number; paretoTarget?: number }
): PriorityResult {
  const cap = opts?.cap ?? LEGIBILITY_CAP;
  const criticalThreshold = opts?.criticalThreshold ?? CRITICAL_RISK_THRESHOLD;
  const paretoTarget = opts?.paretoTarget ?? PARETO_COVERAGE;

  // Flatten tree, exclude root (your own company, tier 0)
  const allNodes = flattenNetwork(root).filter(n => n.tier > 0);
  const totalCount = allNodes.length;

  // Accumulator: per-node priority score + reason set
  const acc = new Map<string, { node: SubTierFullNode; reasons: Set<PriorityReason>; priority: number }>();

  const touch = (node: SubTierFullNode) => {
    if (!acc.has(node.id)) {
      acc.set(node.id, { node, reasons: new Set(), priority: 0 });
    }
    return acc.get(node.id)!;
  };

  // Rule 1 — SPOF: highest weight because sole-source failure blocks all paths
  for (const n of allNodes.filter(n => n.isSPOF)) {
    const e = touch(n);
    e.reasons.add('spof');
    e.priority += 50;
  }

  // Rule 2 — Choke point: multiple paths converge here; disruption multiplies
  for (const n of allNodes.filter(n => n.isChokePoint)) {
    const e = touch(n);
    e.reasons.add('choke');
    e.priority += 35;
  }

  // Rule 3 — Critical risk score on exposed path
  for (const n of allNodes.filter(n => n.riskScore >= criticalThreshold)) {
    const e = touch(n);
    e.reasons.add('critical-risk');
    // Add the actual score so higher-scoring nodes rank ahead of equal-rule peers
    e.priority += n.riskScore;
  }

  // Rule 4 — Pareto: cover PARETO_COVERAGE of total Revenue at Risk
  // TODO: plug in live revenueAtRisk from the data pipeline when available;
  //       currently falls back to risk-score ordering when revenueAtRisk is null.
  const withRevenue = allNodes
    .filter(n => n.revenueAtRisk !== null)
    .sort((a, b) => (b.revenueAtRisk ?? 0) - (a.revenueAtRisk ?? 0));

  const noRevenue = allNodes.filter(n => n.revenueAtRisk === null);

  const totalRevenue = withRevenue.reduce((s, n) => s + (n.revenueAtRisk ?? 0), 0);
  let cumRevenue = 0;
  for (const n of withRevenue) {
    if (totalRevenue > 0 && cumRevenue / totalRevenue >= paretoTarget) break;
    cumRevenue += n.revenueAtRisk ?? 0;
    const e = touch(n);
    e.reasons.add('pareto');
    e.priority += 15;
  }

  // Fallback: if no revenue data, rank by risk score (TODO: remove when data lands)
  if (withRevenue.length === 0) {
    const byScore = [...noRevenue].sort((a, b) => b.riskScore - a.riskScore);
    for (const n of byScore.slice(0, Math.ceil(noRevenue.length * paretoTarget))) {
      const e = touch(n);
      e.reasons.add('pareto');
      e.priority += 15;
    }
  }

  // Sort by priority descending; apply legibility cap
  const sorted = [...acc.values()].sort((a, b) => b.priority - a.priority).slice(0, cap);

  const prioritySet: PriorityNode[] = sorted.map(s => ({
    node: s.node,
    reasons: [...s.reasons] as PriorityReason[],
    priority: s.priority,
  }));

  // Build readable caption
  const reasonsPresent = new Set(sorted.flatMap(s => [...s.reasons]));
  const rulesApplied: string[] = [
    reasonsPresent.has('spof') && 'SPOF',
    reasonsPresent.has('choke') && 'choke point',
    reasonsPresent.has('critical-risk') && 'critical risk',
    reasonsPresent.has('pareto') && 'top revenue exposure',
  ].filter(Boolean) as string[];

  const caption =
    `Showing ${prioritySet.length} of ${totalCount} suppliers — ` +
    `selected by ${rulesApplied.join(', ')}.`;

  return { prioritySet, totalCount, caption, rulesApplied };
}
