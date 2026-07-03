// ---------------------------------------------------------------------------
// POP (period-over-period) change + top/breaking lens per supplier, derived
// from the same fixtures history that drives the Signals baseline.
// Network nodes are matched to monitored suppliers by name (with aliases);
// unmonitored nodes get null → grey dash / excluded from lens matching.
// ---------------------------------------------------------------------------
import { ANOMALIES } from './analysisAnomalies';
import { SUPPLIER_ANALYSES, LENSES } from './supplierAnalysisFixtures';
import { topMeasuredDimension } from './scoring';

export { LENSES };

export interface LensRef { key: string; abbr: string; label: string }

// Network-name → monitored-supplier aliases (site name vs legal entity)
const ALIAS: Record<string, string> = {
  'TI PHILIPPINES': 'TEXAS INSTRUMENTS',
  'SAMSUNG VIETNAM': 'SAMSUNG',
  'PANASONIC INDUSTRIAL DEVICES': 'PANASONIC',
  'LITTELFUSE, INC.': 'LITTELFUSE',
  'YAGEO CORPORATION': 'YAGEO',
  'MURATA MANUFACTURING CO., LTD.': 'MURATA',
};

const canon = (name: string) => {
  const n = name.trim().toUpperCase();
  return ALIAS[n] ?? n;
};

// Legacy short lens codes used by the network datasets → 12-lens keys
const ABBR_TO_KEY: Record<string, string> = {
  GPS: 'geopolitical', EFS: 'economic_financial', ESG: 'esg_regulatory',
  CAT: 'catastrophic_systemic', ENV: 'environmental_climate', LOG: 'logistics_transport',
  INF: 'infrastructure', LAB: 'labor_social', DIG: 'digital_transformation',
  COM: 'market_competition', MKT: 'market_competition',
  CRS: 'tech_cyber', TEC: 'tech_cyber',
  SVA: 'multitier_viability', MTV: 'multitier_viability',
};

const lensByKey = new Map(LENSES.map(l => [l.key, l]));

// --- index the fixtures once -------------------------------------------------
const popByName = new Map<string, number>();
const breakingLensByName = new Map<string, LensRef>();
for (const a of ANOMALIES) {
  const key = canon(a.supplierName);
  const delta = Math.round((a.scoreAfter - a.scoreBaseline) * 10) / 10;
  if (!popByName.has(key) || Math.abs(delta) > Math.abs(popByName.get(key)!)) {
    popByName.set(key, delta);
    const l = lensByKey.get(a.lens);
    if (l) breakingLensByName.set(key, l);
  }
}

const topLensByName = new Map<string, LensRef>();
for (const s of SUPPLIER_ANALYSES) {
  const top = topMeasuredDimension(s);
  if (top) topLensByName.set(canon(s.supplierName), { key: top.key, abbr: top.abbr, label: top.label });
}

/** Score delta vs the prior period, or null when the supplier has no monitored history. */
export function popChangeFor(name: string): number | null {
  return popByName.get(canon(name)) ?? null;
}

/** Breaking lens (if an anomaly fired) else top measured lens, else null. */
export function lensFor(name: string): LensRef | null {
  const key = canon(name);
  return breakingLensByName.get(key) ?? topLensByName.get(key) ?? null;
}

/**
 * Does this network node match a 12-lens filter? True when the monitored
 * top/breaking lens matches, or the node's own lens code maps to the key.
 */
export function nodeMatchesLens(name: string, nodeLensAbbr: string, lensKey: string): boolean {
  const mapped = lensFor(name);
  if (mapped?.key === lensKey) return true;
  return ABBR_TO_KEY[nodeLensAbbr] === lensKey;
}
