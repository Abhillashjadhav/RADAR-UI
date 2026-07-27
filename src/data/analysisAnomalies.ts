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
import { SUPPLIER_ANALYSES, REF_DATE, NO_REVENUE_BASIS } from './supplierAnalysisFixtures';
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

// ---------------------------------------------------------------------------
// P0 flat supplier x lens projection.
//
// Every field below is READ OFF the engine — nothing is stored on the fixture.
// This is the shape the lens tile (Phase 2) and the Signals row (Phases 3-5)
// render from.
// ---------------------------------------------------------------------------

/** Minimum saved runs before a baseline is usable and a reading is shown. */
export const BASELINE_MIN_RUNS = 21;

export interface LensSubFactor {
  name: string;
  eventCount: number;
  avgSentiment: number;
  contribution: number;
}

export interface LensRecord {
  supplier: string;
  lens: string;                 // display label, e.g. "ESG / Regulatory"
  lensKey: string;              // engine key, e.g. "esg_regulatory"
  lensReading: number | null;   // null while no coverage / baseline forming
  hasEventData: boolean;
  eventCount: number;
  runCount: number;             // saved daily runs = days of history
  mean30: number;
  stdDev30: number;
  delta: number | null;         // null when no anomaly fired
  ruleFired: 'band' | 'spike' | null;
  impactBucket: 'Delivery' | 'Compliance' | 'Cost';
  breakDate: string | null;
  revenueAtRisk: number | null; // null when neither revenue nor cost basis exists
  subFactors: LensSubFactor[];  // populated only on fired rows, largest first
}

const titleCase = (b: string): 'Delivery' | 'Compliance' | 'Cost' =>
  (b.charAt(0).toUpperCase() + b.slice(1)) as 'Delivery' | 'Compliance' | 'Cost';

function toLensRecord(a: SupplierAnalysis, d: AnalysisDimension): LensRecord {
  const det = detectLens(d.events, REF_DATE);
  const fired = det.status === 'fired';
  const attribution = fired ? attributeDelta(det.baselineEvents, det.newEvents) : [];

  // A reading is only meaningful with coverage AND a usable baseline.
  const readable = d.has_event_data && det.daysOfHistory >= BASELINE_MIN_RUNS;

  return {
    supplier: a.supplierName,
    lens: d.label,
    lensKey: d.key,
    lensReading: readable ? det.latest : null,
    hasEventData: d.has_event_data,
    eventCount: d.event_count,
    runCount: det.daysOfHistory,
    mean30: det.baselineMean,
    stdDev30: det.sigma,
    delta: fired ? det.delta : null,
    ruleFired: fired ? (det.firedBy === 'relative_jump' ? 'spike' : 'band') : null,
    impactBucket: titleCase(LENS_BUCKET[d.key] ?? 'delivery'),
    breakDate: fired && det.newEvents.length
      ? det.newEvents.map(e => e.occurred_at!).sort()[0]
      : null,
    revenueAtRisk: NO_REVENUE_BASIS.has(a.supplierName) ? null : a.revenueImpact,
    subFactors: attribution.map(c => ({
      name: c.subFactor,
      eventCount: c.eventCount,
      avgSentiment: c.avgSentiment,
      contribution: c.contribution,
    })),
  };
}

/** Every supplier x lens pair, in fixture order. Drives the lens tiles. */
export const LENS_RECORDS: LensRecord[] = SUPPLIER_ANALYSES.flatMap(a =>
  a.dimensions.map(d => toLensRecord(a, d)),
);

/** Fired anomalies only — one Signals row each, in natural data order. */
export const SIGNAL_ROWS: LensRecord[] = LENS_RECORDS.filter(r => r.delta !== null);
