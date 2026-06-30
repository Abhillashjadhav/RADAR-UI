import type { ImpactBucket, RiskLens } from '../types/signal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SignalPoint {
  date: string;   // ISO date string YYYY-MM-DD
  value: number;  // raw signal value (0–100 scale matches risk score range)
}

export interface ScoreBreakdown {
  baselineLevel: number;   // the score the signal would have been at if no breakout
  breakLift: number;       // how many points the breakout added
  recencyWeight: number;   // additional weight because the break is recent
  displayedScore: number;  // baselineLevel + breakLift + recencyWeight (should == score_after)
  recencyNote: string;     // e.g. "Break is 5 days old (full weight)"
}

export interface AnomalySource {
  label: string;
  url: string;   // empty string = dead link → unverified
}

export type AnomalyStatus = 'active' | 'acknowledged';

export interface Anomaly {
  id: string;
  supplierId: string;
  supplierName: string;
  tier: number;
  lens: RiskLens;
  lensLabel: string;
  impactBucket: ImpactBucket;
  revenueAtRiskUsd: number;

  scoreBaseline: number;    // score before breakout
  scoreAfter: number;       // displayed score (post-breakout)
  breakDate: string;        // ISO date when breakout began
  breakdown: ScoreBreakdown;

  history: SignalPoint[];   // 30–90 day signal history
  bandLow: number;          // lower bound of normal band
  bandHigh: number;         // upper bound of normal band
  provisionalBaseline: boolean; // true if history < 30 days

  sources: AnomalySource[];
  verified: boolean;        // false if any source URL is dead

  status: AnomalyStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isoDate(daysAgo: number): string {
  const d = new Date('2026-06-30');
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function flatHistory(days: number, base: number, noise: number): SignalPoint[] {
  return Array.from({ length: days }, (_, i) => ({
    date: isoDate(days - 1 - i),
    value: Math.round(base + (Math.random() * noise * 2 - noise)),
  }));
}

function breakoutHistory(
  totalDays: number,
  breakDaysAgo: number,
  preLevelBase: number,
  postLevel: number,
  noise: number,
): SignalPoint[] {
  return Array.from({ length: totalDays }, (_, i) => {
    const daysAgo = totalDays - 1 - i;
    const isBreakout = daysAgo < breakDaysAgo;
    const base = isBreakout ? postLevel : preLevelBase;
    return {
      date: isoDate(daysAgo),
      value: Math.round(Math.max(0, Math.min(100, base + (Math.random() * noise * 2 - noise)))),
    };
  });
}

// Spike: a single-day spike then drops back — relative jump case
function spikeHistory(totalDays: number, spikeAgo: number, base: number, spike: number): SignalPoint[] {
  return Array.from({ length: totalDays }, (_, i) => {
    const daysAgo = totalDays - 1 - i;
    const isSpike = daysAgo === spikeAgo;
    return {
      date: isoDate(daysAgo),
      value: isSpike ? spike : Math.round(base + (Math.random() * 4 - 2)),
    };
  });
}

// ---------------------------------------------------------------------------
// Seed data — 5 suppliers, 7 anomalies
// ---------------------------------------------------------------------------

// Use fixed values for reproducibility (no Math.random() at module level)
export const ANOMALIES: Anomaly[] = [
  // 1. Clear breakout — Celestica Malaysia, Geopolitical. Score 72 (was 58).
  //    Explained: baseline 52, lift 14, recency 6 = 72. Break is 8 days old.
  {
    id: 'ANO-001',
    supplierId: 'GEN-T1-0',
    supplierName: 'Celestica Malaysia',
    tier: 1,
    lens: 'geopolitical',
    lensLabel: 'Geopolitical',
    impactBucket: 'delivery',
    revenueAtRiskUsd: 25_000_000,
    scoreBaseline: 58,
    scoreAfter: 72,
    breakDate: isoDate(8),
    breakdown: {
      baselineLevel: 52,
      breakLift: 14,
      recencyWeight: 6,
      displayedScore: 72,
      recencyNote: 'Break is 8 days old — full recency weight applied.',
    },
    history: breakoutHistory(60, 8, 52, 67, 3),
    bandLow: 46,
    bandHigh: 60,
    provisionalBaseline: false,
    sources: [
      { label: 'Malaysia export controls update — June 2026', url: 'https://www.miti.gov.my/export-controls-2026' },
      { label: 'Penang industrial zone disruption report', url: 'https://www.thestar.com.my/penang-2026' },
    ],
    verified: true,
    status: 'active',
  },

  // 2. Clear breakout — Flex Shenzhen, ESG/Regulatory. Score 82 (was 64).
  //    Breakdown: baseline 58, lift 18, recency 6 = 82. Break 5 days old.
  {
    id: 'ANO-002',
    supplierId: 'GEN-T1-1',
    supplierName: 'Flex Shenzhen',
    tier: 1,
    lens: 'esg_regulatory',
    lensLabel: 'ESG / Regulatory',
    impactBucket: 'compliance',
    revenueAtRiskUsd: 15_000_000,
    scoreBaseline: 64,
    scoreAfter: 82,
    breakDate: isoDate(5),
    breakdown: {
      baselineLevel: 58,
      breakLift: 18,
      recencyWeight: 6,
      displayedScore: 82,
      recencyNote: 'Break is 5 days old — full recency weight applied.',
    },
    history: breakoutHistory(45, 5, 58, 77, 3),
    bandLow: 51,
    bandHigh: 66,
    provisionalBaseline: false,
    sources: [
      { label: 'UFLPA enforcement memo — May 2026', url: 'https://www.cbp.gov/uflpa-2026' },
      { label: 'CISA supply chain advisory TLP:WHITE', url: 'https://www.cisa.gov/advisory-2026-03' },
    ],
    verified: true,
    status: 'active',
  },

  // 3. Spike (relative jump) — TI Philippines, Environmental. Score 76 (was 61).
  //    Breakdown: baseline 55, lift 17, recency 4 = 76. Break 14 days old (partial recency).
  {
    id: 'ANO-003',
    supplierId: 'GEN-T1-2',
    supplierName: 'TI Philippines',
    tier: 1,
    lens: 'environmental_climate',
    lensLabel: 'Environmental / Climate',
    impactBucket: 'delivery',
    revenueAtRiskUsd: 10_000_000,
    scoreBaseline: 61,
    scoreAfter: 76,
    breakDate: isoDate(14),
    breakdown: {
      baselineLevel: 55,
      breakLift: 17,
      recencyWeight: 4,
      displayedScore: 76,
      recencyNote: 'Break is 14 days old — partial recency weight (4 of max 6).',
    },
    history: [
      ...Array.from({ length: 46 }, (_, i) => ({
        date: isoDate(59 - i),
        value: 55 + Math.round(Math.random() * 6 - 3),
      })),
      ...spikeHistory(14, 13, 55, 91).slice(0, 1),  // single-day typhoon spike
      ...Array.from({ length: 13 }, (_, i) => ({
        date: isoDate(12 - i),
        value: 72 + Math.round(Math.random() * 6 - 3),
      })),
    ],
    bandLow: 49,
    bandHigh: 63,
    provisionalBaseline: false,
    sources: [
      { label: 'PAGASA Typhoon Bulletin #8', url: 'https://www.pagasa.dost.gov.ph/typhoon-2026' },
    ],
    verified: true,
    status: 'active',
  },

  // 4. Short history — Dupont Taiwan, Geopolitical. Score 68 (was 54). PROVISIONAL.
  //    Only 18 days of history. Breakdown: baseline 50, lift 14, recency 4 = 68.
  {
    id: 'ANO-004',
    supplierId: 'GEN-T2-DUPONT',
    supplierName: 'Dupont Taiwan',
    tier: 2,
    lens: 'geopolitical',
    lensLabel: 'Geopolitical',
    impactBucket: 'cost',
    revenueAtRiskUsd: 2_500_000,
    scoreBaseline: 54,
    scoreAfter: 68,
    breakDate: isoDate(6),
    breakdown: {
      baselineLevel: 50,
      breakLift: 14,
      recencyWeight: 4,
      displayedScore: 68,
      recencyNote: 'Break is 6 days old — partial recency (baseline provisional, < 30 days history).',
    },
    history: breakoutHistory(18, 6, 50, 64, 4),
    bandLow: 43,
    bandHigh: 58,
    provisionalBaseline: true,
    sources: [
      { label: 'Taiwan Strait monitor — June 2026', url: 'https://www.taiwanstraitmontior.org/june-2026' },
    ],
    verified: true,
    status: 'active',
  },

  // 5. UNVERIFIED source — TDK China, Logistics. Score 74 (was 58).
  //    One source URL is dead.
  {
    id: 'ANO-005',
    supplierId: 'GEN-T2-TDK',
    supplierName: 'TDK China',
    tier: 2,
    lens: 'logistics_transport',
    lensLabel: 'Logistics & Transport',
    impactBucket: 'delivery',
    revenueAtRiskUsd: 2_000_000,
    scoreBaseline: 58,
    scoreAfter: 74,
    breakDate: isoDate(11),
    breakdown: {
      baselineLevel: 53,
      breakLift: 16,
      recencyWeight: 5,
      displayedScore: 74,
      recencyNote: 'Break is 11 days old — recency weight 5 of max 6.',
    },
    history: breakoutHistory(55, 11, 53, 70, 4),
    bandLow: 47,
    bandHigh: 60,
    provisionalBaseline: false,
    sources: [
      { label: 'Suzhou port congestion report — June 2026', url: 'https://www.suzhou-port.cn/2026-june' },
      { label: 'Yangtze River shipping delay bulletin', url: '' }, // dead link → unverified
    ],
    verified: false,
    status: 'active',
  },

  // 6. Already acknowledged — Jabil Mexico, Labor. Score 71 (was 60).
  {
    id: 'ANO-006',
    supplierId: 'GEN-T1-3',
    supplierName: 'Jabil Mexico',
    tier: 1,
    lens: 'labor_social',
    lensLabel: 'Labor & Social',
    impactBucket: 'compliance',
    revenueAtRiskUsd: 8_000_000,
    scoreBaseline: 60,
    scoreAfter: 71,
    breakDate: isoDate(22),
    breakdown: {
      baselineLevel: 55,
      breakLift: 13,
      recencyWeight: 3,
      displayedScore: 71,
      recencyNote: 'Break is 22 days old — reduced recency weight (3 of max 6).',
    },
    history: breakoutHistory(60, 22, 55, 68, 3),
    bandLow: 49,
    bandHigh: 62,
    provisionalBaseline: false,
    sources: [
      { label: 'Monterrey labor action update — June 2026', url: 'https://www.elfinanciero.com.mx/monterrey-2026' },
    ],
    verified: true,
    status: 'acknowledged',
    acknowledgedAt: isoDate(18),
    acknowledgedBy: 'Karen Wilson',
  },

  // 7. Flat (no anomaly) — Sanmina California, Economic. Score 28, no breakout.
  {
    id: 'ANO-007',
    supplierId: 'GEN-T1-6',
    supplierName: 'Sanmina California',
    tier: 1,
    lens: 'economic_financial',
    lensLabel: 'Economic / Financial',
    impactBucket: 'cost',
    revenueAtRiskUsd: 3_000_000,
    scoreBaseline: 28,
    scoreAfter: 28,
    breakDate: '',
    breakdown: {
      baselineLevel: 28,
      breakLift: 0,
      recencyWeight: 0,
      displayedScore: 28,
      recencyNote: 'No breakout detected — score reflects stable baseline.',
    },
    history: flatHistory(60, 28, 3),
    bandLow: 23,
    bandHigh: 34,
    provisionalBaseline: false,
    sources: [
      { label: 'Q2 2026 supplier financial review', url: 'https://www.sanmina.com/investors/q2-2026' },
    ],
    verified: true,
    status: 'active',
  },
];

// Anomaly strength score for ranking: (scoreDelta × revenueAtRiskUsd)
export function anomalyStrength(a: Anomaly): number {
  const delta = a.scoreAfter - a.scoreBaseline;
  return delta * (a.revenueAtRiskUsd / 1_000_000);
}
