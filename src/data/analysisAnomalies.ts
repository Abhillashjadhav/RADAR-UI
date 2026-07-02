// ---------------------------------------------------------------------------
// Anomaly feed derived from the production fixtures.
//
// DETECTION runs on the score: baseline = lens score of events older than the
// break window; current = score of all events; fires when the delta breaks the
// band. ATTRIBUTION runs on the sub_factor: the delta is split across the new
// events' sub-factor groups (see scoring.attributeDelta).
// ---------------------------------------------------------------------------
import type { Anomaly } from './anomalyMockData';
import type { ImpactBucket, RiskLens } from '../types/signal';
import type { SupplierAnalysis, AnalysisDimension } from '../types/analysis';
import { SUPPLIER_ANALYSES, REF_DATE } from './supplierAnalysisFixtures';
import { splitByBreakWindow, attributeDelta, lensScore, scoreHistory } from './scoring';

const MIN_BREAK_DELTA = 5; // points above baseline that trips the detector

const LENS_BUCKET: Record<string, ImpactBucket> = {
  geopolitical: 'delivery', logistics_transport: 'delivery',
  environmental_climate: 'delivery', catastrophic_systemic: 'delivery',
  multitier_viability: 'delivery', infrastructure: 'delivery',
  esg_regulatory: 'compliance', labor_social: 'compliance',
  economic_financial: 'cost', market_competition: 'cost',
  tech_cyber: 'cost', digital_transformation: 'cost',
};

const SUPPLIER_TIER: Record<string, number> = {
  'LITTELFUSE': 2, // sub-tier choke point; everyone else tier 1
};

function toAnomaly(a: SupplierAnalysis, d: AnalysisDimension): Anomaly | null {
  const { baseline, recent } = splitByBreakWindow(d.events, REF_DATE);
  if (recent.length === 0) return null;

  const before = lensScore(baseline);
  const after = d.score; // all events — already the production lens score
  if (after - before < MIN_BREAK_DELTA) return null;

  const attribution = attributeDelta(baseline, recent);
  const breakDate = [...recent].map(e => e.occurred_at!).sort()[0];
  const verified = recent.every(e => e.news_link.trim() !== '');

  return {
    id: `ANM-${a.id}-${d.abbr}`,
    supplierId: a.id,
    supplierName: a.supplierName,
    tier: SUPPLIER_TIER[a.supplierName] ?? 1,
    lens: d.key as RiskLens,
    lensLabel: d.label,
    impactBucket: LENS_BUCKET[d.key] ?? 'delivery',
    revenueAtRiskUsd: a.revenueImpact,
    costExposureUsd: a.revenueImpact,
    scoreBaseline: before,
    scoreAfter: after,
    breakDate,
    breakdown: {
      baselineLevel: before,
      breakLift: Math.round((after - before) * 10) / 10,
      recencyWeight: 0,
      displayedScore: after,
      recencyNote: `Computed from ${d.event_count} events: (1 − avg sentiment) / 2 × 100.`,
    },
    history: scoreHistory(d.events, REF_DATE, 60),
    bandLow: Math.max(0, Math.round(before - 7)),
    bandHigh: Math.min(100, Math.round(before + 7)),
    provisionalBaseline: baseline.length < 2,
    sources: recent.map(e => ({ label: e.news, url: e.news_link })),
    verified,
    status: 'active',
    attribution,
    dimension: d,
    analysis: a,
  };
}

/** The live anomaly feed — every entry traces to fixture events. */
export const ANOMALIES: Anomaly[] = SUPPLIER_ANALYSES.flatMap(a =>
  a.dimensions
    .filter(d => d.has_event_data)
    .map(d => toAnomaly(a, d))
    .filter((x): x is Anomaly => x !== null),
);
