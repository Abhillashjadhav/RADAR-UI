// ---------------------------------------------------------------------------
// Anomaly feed derived from the production fixtures.
//
// Layer 1 — DETECTION (lens level): supplier × lens score vs its own trailing
// 30-day run baseline (mean ± 2σ, or ≥15% relative jump — whichever fires
// first). No-event lenses never fire; <30 days history → baseline building.
// Layer 2 — ATTRIBUTION (parameter level): the fired delta is split across
// the new events' sub_factor groups. Never the reverse.
// ---------------------------------------------------------------------------
import type { Anomaly } from './anomalyMockData';
import type { ImpactBucket, RiskLens } from '../types/signal';
import type { SupplierAnalysis, AnalysisDimension } from '../types/analysis';
import { SUPPLIER_ANALYSES, REF_DATE } from './supplierAnalysisFixtures';
import { detectLens, attributeDelta, scoreHistory, BASELINE_DAYS } from './scoring';
import type { LensDetection } from './scoring';

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

/** Detection status for any dimension — drives the lens-grid badges. */
export function lensDetection(d: AnalysisDimension): LensDetection {
  return detectLens(d.events, REF_DATE);
}

export { BASELINE_DAYS };

function toAnomaly(a: SupplierAnalysis, d: AnalysisDimension): Anomaly | null {
  const det = detectLens(d.events, REF_DATE);
  if (det.status !== 'fired') return null;

  const attribution = attributeDelta(det.baselineEvents, det.newEvents);
  const breakDate = det.newEvents.map(e => e.occurred_at!).sort()[0];
  const verified = det.newEvents.every(e => e.news_link.trim() !== '');

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
    scoreBaseline: det.scoreBaseline,
    scoreAfter: det.latest,   // the score is the STATE; the badge is the anomaly
    breakDate,
    breakdown: {
      baselineLevel: det.scoreBaseline,
      breakLift: det.delta,
      recencyWeight: 0,
      displayedScore: det.latest,
      recencyNote: det.firedBy === 'relative_jump'
        ? `Fired by relative jump ≥15% vs 30-day baseline mean ${det.baselineMean}.`
        : `Fired by band break: outside mean ${det.baselineMean} ± 2σ (σ=${det.sigma}).`,
    },
    // Chart shows the last 30 days of stored runs — the proof of anomaly
    history: scoreHistory(d.events, REF_DATE, BASELINE_DAYS + det.newEvents.length + 2),
    bandLow: det.bandLow,
    bandHigh: det.bandHigh,
    provisionalBaseline: false, // <30d histories never fire at all now
    sources: det.newEvents.map(e => ({ label: e.news, url: e.news_link })),
    verified,
    status: 'active',
    attribution,
    dimension: d,
    analysis: a,
  };
}

/** The live anomaly feed — every entry fired by the 30-day baseline detector. */
export const ANOMALIES: Anomaly[] = SUPPLIER_ANALYSES.flatMap(a =>
  a.dimensions
    .filter(d => d.has_event_data)
    .map(d => toAnomaly(a, d))
    .filter((x): x is Anomaly => x !== null),
);
