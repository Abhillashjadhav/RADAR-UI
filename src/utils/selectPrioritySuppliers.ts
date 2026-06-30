import type { SubTierFullNode } from '../data/subtierMockData';
import { flattenNetwork } from '../data/subtierMockData';

// ---------------------------------------------------------------------------
// Tunable constants
// ---------------------------------------------------------------------------
const CRITICAL_RISK_THRESHOLD = 70;
const DEFAULT_PARETO_COVERAGE = 0.80;
const LEGIBILITY_CAP = 30; // soft cap — exceeded → switch to tabular in UI

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type PriorityReason = 'spof' | 'choke' | 'critical-risk' | 'pareto';

export interface PriorityNode {
  node: SubTierFullNode;
  reasons: PriorityReason[];
  priority: number;
}

export interface PriorityResult {
  prioritySet: PriorityNode[];
  totalCount: number;
  coverageAchieved: number;   // fraction of total revenueAtRisk covered by prioritySet
  exceedsLegibilityCap: boolean;
  caption: string;
  rulesApplied: string[];
}

// ---------------------------------------------------------------------------
// selectPrioritySuppliers
//
// Selection order:
//   1. Non-negotiable: SPOF, choke point, critical risk (score ≥ threshold)
//   2. Pareto loop: add by revenueAtRisk descending until coverageTarget reached
//
// No hard cap — returns however many coverage demands.
// exceedsLegibilityCap signals the UI to switch from card grid to tabular.
// ---------------------------------------------------------------------------
export function selectPrioritySuppliers(
  root: SubTierFullNode,
  opts?: { criticalThreshold?: number; paretoTarget?: number },
): PriorityResult {
  const criticalThreshold = opts?.criticalThreshold ?? CRITICAL_RISK_THRESHOLD;
  const paretoTarget = opts?.paretoTarget ?? DEFAULT_PARETO_COVERAGE;

  const allNodes = flattenNetwork(root).filter(n => n.tier > 0);
  const totalCount = allNodes.length;

  const acc = new Map<string, { node: SubTierFullNode; reasons: Set<PriorityReason>; priority: number }>();

  const touch = (node: SubTierFullNode) => {
    if (!acc.has(node.id)) {
      acc.set(node.id, { node, reasons: new Set(), priority: 0 });
    }
    return acc.get(node.id)!;
  };

  // Non-negotiable rules — always include regardless of Pareto
  for (const n of allNodes.filter(n => n.isSPOF)) {
    const e = touch(n);
    e.reasons.add('spof');
    e.priority += 50;
  }
  for (const n of allNodes.filter(n => n.isChokePoint)) {
    const e = touch(n);
    e.reasons.add('choke');
    e.priority += 35;
  }
  for (const n of allNodes.filter(n => n.riskScore >= criticalThreshold)) {
    const e = touch(n);
    e.reasons.add('critical-risk');
    e.priority += n.riskScore;
  }

  // Pareto coverage loop
  const totalRevenue = allNodes.reduce((s, n) => s + (n.revenueAtRisk ?? 0), 0);
  const byRevenue = [...allNodes]
    .filter(n => n.revenueAtRisk !== null && n.revenueAtRisk > 0)
    .sort((a, b) => (b.revenueAtRisk ?? 0) - (a.revenueAtRisk ?? 0));

  let cumulativeRevenue = 0;
  for (const n of byRevenue) {
    const currentCoverage = totalRevenue > 0 ? cumulativeRevenue / totalRevenue : 1;
    if (currentCoverage >= paretoTarget) break;
    cumulativeRevenue += n.revenueAtRisk ?? 0;
    const e = touch(n);
    e.reasons.add('pareto');
    e.priority += 15;
  }

  // Fallback when no revenue data
  if (byRevenue.length === 0) {
    const byScore = [...allNodes].sort((a, b) => b.riskScore - a.riskScore);
    for (const n of byScore.slice(0, Math.ceil(allNodes.length * paretoTarget))) {
      const e = touch(n);
      e.reasons.add('pareto');
      e.priority += 15;
    }
  }

  // Sort by priority descending, no hard cap
  const sorted = [...acc.values()].sort((a, b) => b.priority - a.priority);

  const prioritySet: PriorityNode[] = sorted.map(s => ({
    node: s.node,
    reasons: [...s.reasons] as PriorityReason[],
    priority: s.priority,
  }));

  // Compute coverage achieved by this prioritySet
  const coveredRevenue = prioritySet.reduce((s, p) => s + (p.node.revenueAtRisk ?? 0), 0);
  const coverageAchieved = totalRevenue > 0 ? coveredRevenue / totalRevenue : 0;

  const reasonsPresent = new Set(sorted.flatMap(s => [...s.reasons]));
  const rulesApplied: string[] = [
    reasonsPresent.has('spof') && 'SPOF',
    reasonsPresent.has('choke') && 'choke point',
    reasonsPresent.has('critical-risk') && 'critical risk',
    reasonsPresent.has('pareto') && 'top revenue exposure',
  ].filter(Boolean) as string[];

  const pct = Math.round(coverageAchieved * 100);
  const caption =
    `Showing ${prioritySet.length} of ${totalCount} suppliers — ` +
    `selected by ${rulesApplied.join(', ')} · covering ${pct}% of revenue at risk.`;

  return {
    prioritySet,
    totalCount,
    coverageAchieved,
    exceedsLegibilityCap: prioritySet.length > LEGIBILITY_CAP,
    caption,
    rulesApplied,
  };
}
