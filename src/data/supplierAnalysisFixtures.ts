// ---------------------------------------------------------------------------
// Fixtures in the PRODUCTION schema. Only raw events are seeded here — every
// score on screen is computed through the real formula in scoring.ts:
//   lens = (1 - avg(sentiment)) / 2 * 100 · overall = 12-lens average ·
//   no events = 50.0 + has_event_data=false (renders "No data", never ranks).
// Swap this file for a backend export and numbers change, not code.
// ---------------------------------------------------------------------------
import type { AnalysisEvent, AnalysisDimension, SupplierAnalysis } from '../types/analysis';
import { lensScore, overallScore, riskLevelOf, topMeasuredDimension } from './scoring';

export const REF_DATE = '2026-07-02'; // "today" for history/break windows

// The 12 lenses ---------------------------------------------------------------
export const LENSES: { key: string; abbr: string; label: string }[] = [
  { key: 'economic_financial',     abbr: 'EFS', label: 'Economic / Financial' },
  { key: 'geopolitical',           abbr: 'GPS', label: 'Geopolitical' },
  { key: 'tech_cyber',             abbr: 'TEC', label: 'Technology / Cyber' },
  { key: 'esg_regulatory',         abbr: 'ESG', label: 'ESG / Regulatory' },
  { key: 'catastrophic_systemic',  abbr: 'CAT', label: 'Catastrophic / Systemic' },
  { key: 'environmental_climate',  abbr: 'ENV', label: 'Environmental / Climate' },
  { key: 'multitier_viability',    abbr: 'MTV', label: 'Multi-tier Viability' },
  { key: 'logistics_transport',    abbr: 'LOG', label: 'Logistics & Transport' },
  { key: 'infrastructure',         abbr: 'INF', label: 'Infrastructure' },
  { key: 'labor_social',           abbr: 'LAB', label: 'Labor & Social' },
  { key: 'market_competition',     abbr: 'MKT', label: 'Market & Competition' },
  { key: 'digital_transformation', abbr: 'DIG', label: 'Digital Transformation' },
];

// Event shorthand ---------------------------------------------------------------
const ev = (
  occurred_at: string, sub_factor: string, sentiment: number, news: string,
  news_link: string, impactin_days = 14, recoveryin_days = 45, riskScore?: number,
): AnalysisEvent => ({ news, sub_factor, sentiment, impactin_days, recoveryin_days, news_link, occurred_at, riskScore });

// Build the 12 dimensions from a sparse map of lens-key -> events ----------------
function buildDimensions(eventsByLens: Record<string, AnalysisEvent[]>): AnalysisDimension[] {
  const dims = LENSES.map(({ key, abbr, label }) => {
    const events = eventsByLens[key] ?? [];
    return {
      key, abbr, label,
      score: lensScore(events),
      isPrimary: false,
      has_event_data: events.length > 0,
      event_count: events.length,
      events,
    };
  });
  // isPrimary = highest MEASURED lens only
  const measured = dims.filter(d => d.has_event_data);
  if (measured.length > 0) {
    const top = [...measured].sort((a, b) => b.score - a.score)[0];
    top.isPrimary = true;
  }
  return dims;
}

function buildAnalysis(
  id: string, supplierName: string, location: string, revenueImpact: number,
  eventsByLens: Record<string, AnalysisEvent[]>,
): SupplierAnalysis {
  const dimensions = buildDimensions(eventsByLens);
  const overall = overallScore(dimensions);
  const a: SupplierAnalysis = {
    id, runId: 'RUN-2026-07-02-001', supplierName, location,
    overallScore: overall,
    riskLevel: riskLevelOf(overall),
    topRisk: '—', topRiskAbbr: '—',
    revenueImpact, dimensions,
  };
  const top = topMeasuredDimension(a);
  if (top) { a.topRisk = top.label; a.topRiskAbbr = top.abbr; }
  return a;
}

// ---------------------------------------------------------------------------
// 1. VTECH (DONGGUAN) — geopolitical break driven by TWO sub-factors:
//    "maritime tensions" (3 events, avg -0.80) and "export controls" (1, -0.50).
//    Baseline (older than the 14-day window) was mild (~ -0.18 → 59).
// ---------------------------------------------------------------------------
const VTECH = buildAnalysis('SUPA-001', 'VTECH (DONGGUAN)', 'Dongguan, China', 20_091, {
  geopolitical: [
    ev('2026-05-06', 'regional posture', -0.16, 'PLA drills announced near Pratas — shipping lanes unaffected', 'https://www.scmp.com/pla-drills-2026', 20, 60, 0.12),
    ev('2026-05-24', 'regional posture', -0.20, 'US-China trade talks stall; electronics tariffs unresolved', 'https://www.reuters.com/trade-talks-2026', 30, 90, 0.15),
    ev('2026-06-21', 'maritime tensions', -0.85, 'Taiwan Strait transit halted after naval standoff', 'https://www.reuters.com/strait-standoff-2026', 7, 30, 0.78),
    ev('2026-06-24', 'maritime tensions', -0.80, 'Carriers reroute South China Sea lanes; +9 days transit', 'https://www.lloydslist.com/scs-reroute-2026', 5, 21, 0.74),
    ev('2026-06-27', 'maritime tensions', -0.75, 'War-risk premiums triple for Pearl River delta calls', 'https://www.tradewinds.no/war-risk-2026', 10, 45, 0.69),
    ev('2026-06-29', 'export controls', -0.50, 'New dual-use export license rule covers RF modules', 'https://www.federalregister.gov/rf-modules-2026', 30, 120, 0.42),
  ],
  logistics_transport: [
    ev('2026-05-15', 'port congestion', -0.35, 'Yantian yard density at 92%; gate delays 2 days', 'https://www.joc.com/yantian-2026', 10, 20, 0.3),
    ev('2026-06-05', 'port congestion', -0.30, 'Feeder capacity tight into Hong Kong hub', 'https://www.joc.com/feeder-2026', 7, 14, 0.22),
  ],
  labor_social: [
    ev('2026-05-30', 'wage disputes', -0.25, 'Overtime dispute at Dongguan campus resolved in 3 days', 'https://www.sixthtone.com/dongguan-2026', 5, 10, 0.14),
  ],
});

// ---------------------------------------------------------------------------
// 2. GOLDENBAMBOO — ESG break on a single sub-factor ("forced-labor audit").
// ---------------------------------------------------------------------------
const GOLDENBAMBOO = buildAnalysis('SUPA-002', 'GOLDENBAMBOO', 'Shenzhen, China', 17_111, {
  esg_regulatory: [
    ev('2026-05-10', 'compliance filings', -0.10, 'Annual CSR report filed on schedule', 'https://www.goldenbamboo.cn/csr-2026', 0, 0, 0.05),
    ev('2026-06-23', 'forced-labor audit', -0.90, 'UFLPA detention notice on transformer shipment lot', 'https://www.cbp.gov/uflpa-detention-2026', 3, 60, 0.85),
    ev('2026-06-26', 'forced-labor audit', -0.70, 'Auditor flags labor-broker fees at supplier campus', 'https://www.business-humanrights.org/broker-fees-2026', 14, 90, 0.66),
  ],
  economic_financial: [
    ev('2026-05-20', 'credit health', -0.20, 'Working-capital ratio slips below sector median', 'https://www.dnb.com/goldenbamboo-2026', 60, 120, 0.1),
  ],
});

// ---------------------------------------------------------------------------
// 3. GP ELECTRONICS (HUIZHOU) — the SABIC pattern: only ONE measured lens,
//    everything else is the neutral 50 fallback ("No data", never ranked).
// ---------------------------------------------------------------------------
const GP_ELECTRONICS = buildAnalysis('SUPA-003', 'GP ELECTRONICS (HUIZHOU) CO.', 'Huizhou, China', 12_497, {
  economic_financial: [
    ev('2026-05-02', 'credit health', -0.15, 'Modest margin compression on capacitor lines', 'https://www.dnb.com/gp-electronics-2026', 90, 180, 0.08),
  ],
});

// ---------------------------------------------------------------------------
// 4. TEXAS INSTRUMENTS — environmental break (typhoon), tech/market measured.
// ---------------------------------------------------------------------------
const TI = buildAnalysis('SUPA-004', 'TEXAS INSTRUMENTS', 'Dallas, USA', 8_828, {
  environmental_climate: [
    ev('2026-05-08', 'seasonal outlook', -0.20, 'Above-normal Pacific typhoon season forecast', 'https://www.pagasa.dost.gov.ph/outlook-2026', 60, 0, 0.1),
    ev('2026-06-20', 'typhoon landfall', -0.80, 'Typhoon Ambo landfall closes Clark assembly site', 'https://www.pagasa.dost.gov.ph/ambo-2026', 2, 21, 0.76),
    ev('2026-06-25', 'typhoon landfall', -0.60, 'Flooding delays back-end test re-start to July', 'https://www.rappler.com/clark-flooding-2026', 7, 30, 0.5),
  ],
  tech_cyber: [
    ev('2026-05-28', 'patch posture', -0.10, 'OT patch cadence verified in vendor assessment', 'https://www.ti.com/security-2026', 0, 0, 0.05),
  ],
  market_competition: [
    ev('2026-06-02', 'capacity pricing', -0.30, 'Analog allocation tightens; lead times +4 weeks', 'https://www.digitimes.com/analog-2026', 45, 90, 0.2),
  ],
});

// ---------------------------------------------------------------------------
// 5. BEL FUSE — steadily elevated logistics, no recent break (stable-high).
// ---------------------------------------------------------------------------
const BEL_FUSE = buildAnalysis('SUPA-005', 'BEL FUSE', 'Jersey City, USA', 4_040, {
  logistics_transport: [
    ev('2026-04-20', 'ocean reliability', -0.45, 'Transpacific schedule reliability drops to 51%', 'https://www.sea-intelligence.com/tp-2026', 30, 60, 0.3),
    ev('2026-05-12', 'ocean reliability', -0.40, 'Blank sailings extend into Q3 on TP eastbound', 'https://www.joc.com/blank-sailings-2026', 30, 60, 0.28),
  ],
  catastrophic_systemic: [
    ev('2026-05-01', 'insurance posture', 0.10, 'Business-interruption cover renewed at par', 'https://www.belfuse.com/insurance-2026', 0, 0, 0.02),
  ],
});

// ---------------------------------------------------------------------------
// 6. LITTELFUSE — multi-tier concentration measured (choke point), mild infra.
// ---------------------------------------------------------------------------
const LITTELFUSE = buildAnalysis('SUPA-006', 'LITTELFUSE', 'Chicago, USA', 3_700, {
  multitier_viability: [
    ev('2026-05-18', 'sub-tier concentration', -0.55, 'Three tier-1s found routing through one fuse-element plant', 'https://www.supplychaindive.com/littelfuse-2026', 60, 180, 0.35),
    ev('2026-06-10', 'sub-tier concentration', -0.45, 'Second-source qualification slips to Q4', 'https://www.supplychaindive.com/second-source-2026', 60, 120, 0.3),
  ],
  infrastructure: [
    ev('2026-05-25', 'grid reliability', -0.20, 'Plant region flagged for summer load-shedding watch', 'https://www.eia.gov/load-shed-2026', 30, 10, 0.1),
  ],
});

export const SUPPLIER_ANALYSES: SupplierAnalysis[] = [
  VTECH, GOLDENBAMBOO, GP_ELECTRONICS, TI, BEL_FUSE, LITTELFUSE,
];
