// ---------------------------------------------------------------------------
// Fixtures in the PRODUCTION schema. Only raw events are seeded here — every
// score on screen is computed through the real formula in scoring.ts:
//   lens = (1 - avg(sentiment)) / 2 * 100 · overall = 12-lens average ·
//   no events = 50.0 + has_event_data=false (renders "No data", never ranks).
// Swap this file for a backend export and numbers change, not code.
// ---------------------------------------------------------------------------
import type { AnalysisEvent, AnalysisDimension, SupplierAnalysis, ParameterChange } from '../types/analysis';
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
function buildDimensions(
  eventsByLens: Record<string, AnalysisEvent[]>,
  paramsByLens: Record<string, ParameterChange[]> = {},
): AnalysisDimension[] {
  const dims = LENSES.map(({ key, abbr, label }) => {
    // stable per-lens event ids (EV-GPS-1, …) referenced by parameter_changes
    const events = (eventsByLens[key] ?? []).map((e, i) => ({ ...e, id: e.id ?? `EV-${abbr}-${i + 1}` }));
    return {
      key, abbr, label,
      score: lensScore(events),
      isPrimary: false,
      has_event_data: events.length > 0,
      event_count: events.length,
      events,
      parameter_changes: paramsByLens[key],
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
  paramsByLens: Record<string, ParameterChange[]> = {},
): SupplierAnalysis {
  const dimensions = buildDimensions(eventsByLens, paramsByLens);
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
}, {
  // ---- parameter-level attribution (demo case a: tariffs + export controls) ----
  geopolitical: [
    {
      parameter_id: 'PRM-GPS-TARIFF',
      name: 'Import tariffs — semiconductors',
      value_type: 'percent', before: 10, after: 50, unit: '%',
      contribution: 8.4, impact_bucket: 'cost',
      event_ids: ['EV-GPS-2', 'EV-GPS-6'],
      implication: 'Landed cost on affected parts rises; check Cost impact bucket.',
    },
    {
      parameter_id: 'PRM-GPS-MARITIME',
      name: 'Maritime disruption index — Taiwan Strait',
      value_type: 'index', before: 38, after: 72, unit: 'index 0–100',
      contribution: 6.7, impact_bucket: 'delivery',
      event_ids: ['EV-GPS-3', 'EV-GPS-4', 'EV-GPS-5'],
      implication: 'Transit +9 days on rerouted lanes; expect delivery slips on sea freight.',
    },
    {
      parameter_id: 'PRM-GPS-EXPCTL',
      name: 'Export controls index',
      value_type: 'index', before: 44, after: 51, unit: 'index 0–100',
      contribution: 3.1, impact_bucket: 'compliance',
      event_ids: ['EV-GPS-6'],
      implication: 'New dual-use license rule covers RF modules; license lead time applies.',
    },
  ],
  // no change in window — drawer must still render current values
  logistics_transport: [
    {
      parameter_id: 'PRM-LOG-CONGESTION',
      name: 'Port congestion index — Yantian',
      value_type: 'index', before: 62, after: 62, unit: 'index 0–100',
      contribution: 0, impact_bucket: 'delivery',
      event_ids: ['EV-LOG-1', 'EV-LOG-2'],
      implication: 'Yard density elevated but steady; no new delivery impact this window.',
    },
  ],
});

// ---------------------------------------------------------------------------
// 2. GOLDENBAMBOO — the CLEAN DEMO CASE per spec.
//    ESG: four mild baseline events → 30+ days of stable runs at ~52 (±3),
//    then a breakout to ~72 driven by TWO sub-factors:
//      "labor practices"      5 events, avg sentiment −0.71
//      "emissions violations" 2 events, avg sentiment −0.55
//    Baseline avg = −0.04 → (1.04)/2×100 = 52.0. All 11 events → 71.9.
//    Also: labor_social has only ~10 days of history → "Baseline building",
//    must never fire.
// ---------------------------------------------------------------------------
const GOLDENBAMBOO = buildAnalysis('SUPA-002', 'GOLDENBAMBOO', 'Shenzhen, China', 17_111, {
  esg_regulatory: [
    // baseline period — stable ~52
    ev('2026-05-08', 'compliance filings', -0.10, 'Annual CSR report filed one week late', 'https://www.goldenbamboo.cn/csr-2026', 0, 0, 0.05),
    ev('2026-05-14', 'compliance filings',  0.04, 'ISO 14001 surveillance audit passed', 'https://www.goldenbamboo.cn/iso-2026', 0, 0, 0.02),
    ev('2026-05-20', 'permit status', -0.08, 'Wastewater discharge permit renewal pending', 'https://www.mee.gov.cn/permits-2026', 30, 60, 0.05),
    ev('2026-05-27', 'permit status', -0.02, 'Permit renewal granted with standard conditions', 'https://www.mee.gov.cn/permit-grant-2026', 0, 0, 0.02),
    // breakout — labor practices (5 events, avg −0.71)
    ev('2026-06-24', 'labor practices', -0.75, 'UFLPA detention notice on transformer shipment lot', 'https://www.cbp.gov/uflpa-detention-2026', 3, 60, 0.72),
    ev('2026-06-25', 'labor practices', -0.72, 'Auditor flags labor-broker fees at supplier campus', 'https://www.business-humanrights.org/broker-fees-2026', 14, 90, 0.66),
    ev('2026-06-27', 'labor practices', -0.70, 'Recruitment-fee reimbursement plan demanded by customer coalition', 'https://www.reuters.com/recruitment-fees-2026', 30, 120, 0.6),
    ev('2026-06-28', 'labor practices', -0.68, 'Second campus added to detention review scope', 'https://www.cbp.gov/uflpa-scope-2026', 7, 60, 0.58),
    ev('2026-06-30', 'labor practices', -0.70, 'NGO publishes worker-interview findings', 'https://www.business-humanrights.org/interviews-2026', 14, 90, 0.62),
    // breakout — emissions violations (2 events, avg −0.55)
    ev('2026-06-26', 'emissions violations', -0.55, 'Provincial regulator cites stack-emissions exceedance', 'https://www.mee.gov.cn/emissions-2026', 30, 90, 0.45),
    ev('2026-06-29', 'emissions violations', -0.55, 'Follow-up inspection confirms scrubber underperformance', 'https://www.mee.gov.cn/inspection-2026', 30, 90, 0.44),
  ],
  economic_financial: [
    ev('2026-05-20', 'credit health', -0.20, 'Working-capital ratio slips below sector median', 'https://www.dnb.com/goldenbamboo-2026', 60, 120, 0.1),
  ],
  // Baseline building — first event only ~10 days ago; never fires
  labor_social: [
    ev('2026-06-22', 'workforce availability', -0.30, 'Shift-coverage gaps reported at Shenzhen campus', 'https://www.sixthtone.com/shenzhen-shifts-2026', 14, 30, 0.15),
    ev('2026-06-28', 'workforce availability', -0.35, 'Contract-labor agency audit initiated', 'https://www.sixthtone.com/agency-audit-2026', 30, 60, 0.2),
  ],
}, {
  // ---- parameter-level attribution (demo case b: binary sanctions flip) ----
  esg_regulatory: [
    {
      parameter_id: 'PRM-ESG-WRO',
      name: 'UFLPA Withhold Release Order status',
      value_type: 'binary', before: 0, after: 1, unit: '',
      contribution: 13.7, impact_bucket: 'compliance',
      event_ids: ['EV-ESG-5', 'EV-ESG-6', 'EV-ESG-7', 'EV-ESG-8', 'EV-ESG-9'],
      implication: 'Shipments detainable at US entry; hold affected lots pending clearance.',
    },
    {
      parameter_id: 'PRM-ESG-EMISSIONS',
      name: 'Emissions exceedance index',
      value_type: 'index', before: 12, after: 38, unit: 'index 0–100',
      contribution: 6.2, impact_bucket: 'cost',
      event_ids: ['EV-ESG-10', 'EV-ESG-11'],
      implication: 'Scrubber remediation likely; expect pass-through cost on affected lines.',
    },
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

// ---------------------------------------------------------------------------
// 7–14. Wider monitored set — more breaks so the feed reads at demo scale.
// ---------------------------------------------------------------------------

// PANASONIC — logistics break, UNVERIFIED (one dead source link).
const PANASONIC = buildAnalysis('SUPA-007', 'PANASONIC', 'Osaka, Japan', 17_300, {
  logistics_transport: [
    ev('2026-05-05', 'ocean reliability', -0.25, 'Kansai export lanes stable through April', 'https://www.joc.com/kansai-2026', 14, 30, 0.12),
    ev('2026-05-22', 'ocean reliability', -0.30, 'Osaka port crane maintenance extends gate hours', 'https://www.joc.com/osaka-crane-2026', 10, 20, 0.15),
    ev('2026-06-24', 'port strike', -0.75, 'Dockworker strike ballot passes at Osaka terminal', '', 5, 30, 0.68),
    ev('2026-06-28', 'port strike', -0.65, 'Strike notice filed; 72-hour stoppage expected', 'https://www.nikkei.com/osaka-strike-2026', 3, 14, 0.6),
  ],
  economic_financial: [
    ev('2026-05-15', 'fx exposure', -0.15, 'Yen volatility hedges renewed at higher cost', 'https://www.nikkei.com/yen-2026', 60, 90, 0.08),
  ],
});

// KOA — labor break, PROVISIONAL baseline (single older event).
const KOA = buildAnalysis('SUPA-008', 'KOA', 'Nagano, Japan', 12_000, {
  labor_social: [
    ev('2026-06-01', 'workforce availability', -0.20, 'Seasonal hiring gap at Nagano resistor plant', 'https://www.asahi.com/koa-hiring-2026', 30, 60, 0.1),
    ev('2026-06-25', 'workforce availability', -0.70, 'Overtime cap ruling cuts line-3 capacity 15%', 'https://www.asahi.com/overtime-2026', 14, 60, 0.55),
  ],
});

// SAMSUNG — tech/cyber break driven by TWO sub-factors.
const SAMSUNG = buildAnalysis('SUPA-009', 'SAMSUNG', 'Suwon, South Korea', 9_500, {
  tech_cyber: [
    ev('2026-05-02', 'patch posture', -0.15, 'Quarterly OT patch audit passes with notes', 'https://www.samsungsem.com/security-2026', 0, 0, 0.06),
    ev('2026-05-20', 'patch posture', -0.20, 'Legacy MES segment flagged for slow patch cadence', 'https://www.samsungsem.com/mes-2026', 30, 60, 0.1),
    ev('2026-06-22', 'ransomware activity', -0.80, 'Ransomware crew claims MES vendor breach', 'https://www.bleepingcomputer.com/mes-breach-2026', 7, 45, 0.7),
    ev('2026-06-26', 'ransomware activity', -0.70, 'IOC overlap confirmed with plant-floor vendor', 'https://www.cisa.gov/ioc-2026', 7, 30, 0.62),
    ev('2026-06-29', 'zero-day exposure', -0.55, 'Unpatched CVE in line-controller firmware disclosed', 'https://nvd.nist.gov/cve-2026', 14, 60, 0.45),
  ],
});

// YAGEO — market/competition break (allocation pricing).
const YAGEO = buildAnalysis('SUPA-010', 'YAGEO', 'New Taipei, Taiwan', 7_800, {
  market_competition: [
    ev('2026-05-01', 'capacity pricing', -0.20, 'MLCC pricing steady on soft demand', 'https://www.digitimes.com/mlcc-2026', 30, 60, 0.08),
    ev('2026-05-25', 'capacity pricing', -0.25, 'Passive-component book-to-bill ticks above 1', 'https://www.digitimes.com/btb-2026', 30, 60, 0.1),
    ev('2026-06-23', 'allocation risk', -0.70, 'Yageo moves automotive MLCC lines to allocation', 'https://www.digitimes.com/allocation-2026', 30, 90, 0.6),
  ],
  esg_regulatory: [
    ev('2026-05-12', 'compliance filings', -0.10, 'Conflict-minerals report filed on time', 'https://www.yageo.com/cmrt-2026', 0, 0, 0.04),
  ],
});

// MURATA — environmental break (earthquake).
const MURATA = buildAnalysis('SUPA-011', 'MURATA', 'Kyoto, Japan', 6_900, {
  environmental_climate: [
    ev('2026-05-03', 'seismic watch', -0.20, 'Routine seismic monitoring — no anomalies', 'https://www.jma.go.jp/seismic-2026', 0, 0, 0.05),
    ev('2026-06-21', 'earthquake impact', -0.75, 'M6.1 quake near Fukui halts ceramic kiln lines', 'https://www.jma.go.jp/fukui-2026', 3, 30, 0.66),
    ev('2026-06-24', 'earthquake impact', -0.55, 'Kiln requalification adds 2-week restart tail', 'https://www.nikkei.com/kiln-2026', 14, 30, 0.44),
  ],
});

// ON SEMICONDUCTOR — economic break.
const ONSEMI = buildAnalysis('SUPA-012', 'ON SEMICONDUCTOR', 'Phoenix, USA', 5_600, {
  economic_financial: [
    ev('2026-05-06', 'credit health', -0.20, 'Leverage ratio stable at Q1 review', 'https://www.dnb.com/onsemi-2026', 90, 180, 0.08),
    ev('2026-06-27', 'divestiture risk', -0.65, 'Discrete-products unit put under strategic review', 'https://www.reuters.com/onsemi-review-2026', 60, 180, 0.5),
  ],
});

// GREENCONN — stable, measured but no break (control row for the demo).
const GREENCONN = buildAnalysis('SUPA-013', 'GREENCONN', 'Taoyuan, Taiwan', 2_200, {
  logistics_transport: [
    ev('2026-05-10', 'ocean reliability', -0.20, 'Taiwan-US lane reliability steady at 74%', 'https://www.sea-intelligence.com/tw-2026', 14, 30, 0.08),
  ],
});

// JST — mostly no-data, one mild measured lens (second SABIC-pattern row).
const JST = buildAnalysis('SUPA-014', 'JST', 'Osaka, Japan', 2_382, {
  infrastructure: [
    ev('2026-05-14', 'grid reliability', -0.10, 'No grid constraints flagged for Osaka works', 'https://www.eia.gov/jst-2026', 0, 0, 0.04),
  ],
});

export const SUPPLIER_ANALYSES: SupplierAnalysis[] = [
  VTECH, GOLDENBAMBOO, GP_ELECTRONICS, TI, BEL_FUSE, LITTELFUSE,
  PANASONIC, KOA, SAMSUNG, YAGEO, MURATA, ONSEMI, GREENCONN, JST,
];
