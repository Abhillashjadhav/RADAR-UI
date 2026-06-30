import type { ImpactType } from '../types';
import type { SubTierFullNode } from './subtierMockData';

// ---------------------------------------------------------------------------
// Seeded LCG PRNG — deterministic across builds (seed = 42)
// ---------------------------------------------------------------------------
function makePrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const CITIES: [string, string][] = [
  ['Shanghai', 'China'], ['Shenzhen', 'China'], ['Suzhou', 'China'], ['Beijing', 'China'],
  ['Taipei', 'Taiwan'], ['Taoyuan', 'Taiwan'], ['Kaohsiung', 'Taiwan'],
  ['Tokyo', 'Japan'], ['Osaka', 'Japan'], ['Yokohama', 'Japan'],
  ['Seoul', 'South Korea'], ['Incheon', 'South Korea'],
  ['Penang', 'Malaysia'], ['Kuala Lumpur', 'Malaysia'],
  ['Ho Chi Minh City', 'Vietnam'], ['Hanoi', 'Vietnam'],
  ['Manila', 'Philippines'], ['Cebu', 'Philippines'],
  ['Bangalore', 'India'], ['Chennai', 'India'], ['Pune', 'India'],
  ['Singapore', 'Singapore'],
  ['Munich', 'Germany'], ['Stuttgart', 'Germany'], ['Frankfurt', 'Germany'],
  ['Lyon', 'France'], ['Paris', 'France'],
  ['Milan', 'Italy'],
  ['Eindhoven', 'Netherlands'],
  ['Austin', 'USA'], ['San Jose', 'USA'], ['Phoenix', 'USA'], ['Dallas', 'USA'],
  ['Toronto', 'Canada'], ['Montreal', 'Canada'],
  ['Monterrey', 'Mexico'], ['Guadalajara', 'Mexico'],
  ['São Paulo', 'Brazil'],
  ['Tel Aviv', 'Israel'],
  ['Dublin', 'Ireland'],
  ['London', 'United Kingdom'],
];

const COMMODITIES = [
  'PCB Substrates', 'Copper Foil', 'Capacitors', 'Resistors', 'Inductors',
  'Semiconductor Wafers', 'Epoxy Resin', 'Solder Paste', 'Connector Pins',
  'Display Panels', 'Power Modules', 'Thermal Interface Material',
  'PCB Assembly', 'SMT Components', 'Mechanical Housings',
  'Cable Assemblies', 'Optical Fibers', 'RF Modules', 'Memory ICs',
  'Analog Chips', 'MEMS Sensors', 'Ferrite Cores', 'Ceramic Filters',
  'Aluminum Electrolytic', 'Tantalum Caps', 'Crystal Oscillators',
  'Heat Sinks', 'Thermal Pads', 'Conformal Coating', 'Flux Chemicals',
  'Assembly Services', 'Test Services', 'Logistics', 'Raw Laminates',
  'Chemical Inputs', 'Industrial Gas', 'Argon Gas', 'Nitrogen Gas',
  'Silicon Carbide', 'Boron Nitride',
];

const LENSES: [string, string][] = [
  ['GPS', 'Geopolitical'], ['EFS', 'Economic'], ['ESG', 'ESG / Regulatory'],
  ['ENV', 'Environmental'], ['LOG', 'Logistics'], ['LAB', 'Labor'],
  ['CAT', 'Catastrophic'], ['INF', 'Infrastructure'], ['DIG', 'Digital'],
  ['CRS', 'Cyber'], ['COM', 'Competition'], ['SVA', 'Supplier Viability'],
];

const IMPACTS: ImpactType[] = ['Delivery', 'Compliance', 'Cost'];

function pickRiskScore(rand: () => number): number {
  const r = rand();
  if (r < 0.55) return Math.floor(rand() * 35) + 5;      // 5–39: low risk (55%)
  if (r < 0.80) return Math.floor(rand() * 30) + 40;     // 40–69: medium risk (25%)
  return Math.floor(rand() * 25) + 70;                    // 70–94: high risk (20%)
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function makeNode(
  id: string,
  name: string,
  tier: 0 | 1 | 2 | 3 | 4 | 5,
  city: string,
  country: string,
  commodity: string,
  riskScore: number,
  impact: ImpactType,
  revenue: number | null,
  isSPOF: boolean,
  isChokePoint: boolean,
  lensCode: string,
  lensLabel: string,
  action: string,
  children: SubTierFullNode[] = [],
): SubTierFullNode {
  return { id, name, tier, location: { city, country }, commodity, riskScore, primaryImpact: impact, revenueAtRisk: revenue, isSPOF, isChokePoint, topRiskLens: lensCode, topRiskLensLabel: lensLabel, action, children };
}

// ---------------------------------------------------------------------------
// Choke-point nodes (appear under multiple parents)
// ---------------------------------------------------------------------------
const DUPONT_TW = makeNode('GEN-T2-DUPONT', 'Dupont Taiwan', 2, 'Taipei', 'Taiwan', 'Copper Foil', 68, 'Cost', 2.50, false, true, 'GPS', 'Geopolitical', 'Qualify mainland China alternate; monitor Taiwan Strait indicators weekly.');
const TDK_CN = makeNode('GEN-T2-TDK', 'TDK China', 2, 'Suzhou', 'China', 'Capacitors', 62, 'Delivery', 2.00, false, true, 'LOG', 'Logistics', 'Increase safety stock to 45 days; dual-qualify Murata as alternate.');
const IBIDEN_JP = makeNode('GEN-T2-IBIDEN', 'Ibiden Japan', 2, 'Tokyo', 'Japan', 'PCB Substrates', 74, 'Delivery', 1.80, false, true, 'CAT', 'Catastrophic', 'Qualify Shinko Electric as backup substrate supplier; monitor seismic risk.');
const MATERION_US = makeNode('GEN-T2-MATERION', 'Materion USA', 2, 'Milwaukee', 'USA', 'Beryllium Alloys', 71, 'Compliance', 1.40, false, true, 'ESG', 'ESG / Regulatory', 'Audit REACH compliance; dual-source Materion with NGK Metals.');

// T3 choke points
const BASF_DE = makeNode('GEN-T3-BASF', 'BASF Germany', 3, 'Ludwigshafen', 'Germany', 'Chemical Inputs', 33, 'Cost', 0.12, false, true, 'EFS', 'Economic', 'No action required — stable.');
const LINDE_SG = makeNode('GEN-T3-LINDE', 'Linde Singapore', 3, 'Singapore', 'Singapore', 'Industrial Gas', 28, 'Delivery', 0.09, false, true, 'INF', 'Infrastructure', 'Confirm backup gas supply from Air Liquide; monitor regional logistics.');

// ---------------------------------------------------------------------------
// Hand-crafted T1 nodes (drive the demo story)
// ---------------------------------------------------------------------------
const T1_NODES: SubTierFullNode[] = [
  makeNode('GEN-T1-0', 'Celestica Malaysia', 1, 'Penang', 'Malaysia', 'PCB Assembly', 89, 'Delivery', 25.0, true, false, 'GPS', 'Geopolitical', 'Activate dual-source contingency; negotiate 30-day buffer stock immediately.', [
    makeNode('GEN-T2-0', 'ABJ Substrate Japan', 2, 'Osaka', 'Japan', 'PCB Substrates', 71, 'Cost', 2.80, true, false, 'EFS', 'Economic', 'Negotiate 90-day price lock; qualify Ventec International as backup.', [
      makeNode('GEN-T3-0', 'Air Liquide UK', 3, 'London', 'United Kingdom', 'Argon Gas', 41, 'Cost', 0.065, true, false, 'INF', 'Infrastructure', 'Confirm backup argon supply from Linde USA; monitor UK energy grid.', [
        makeNode('GEN-T4-0', 'BOC Group UK', 4, 'Guilford', 'United Kingdom', 'Gas Cylinders', 35, 'Delivery', 0.018, false, false, 'LOG', 'Logistics', 'Monitor UK haulage capacity; no immediate action.'),
      ]),
      makeNode('GEN-T3-1', 'Shin-Etsu Japan', 3, 'Tokyo', 'Japan', 'Epoxy Resin', 35, 'Delivery', 0.052, false, false, 'CAT', 'Catastrophic', 'Monitor seismic activity; no immediate action required.'),
    ]),
    { ...DUPONT_TW },
    { ...TDK_CN },
    { ...IBIDEN_JP },
  ]),
  makeNode('GEN-T1-1', 'Flex Shenzhen', 1, 'Shenzhen', 'China', 'PCB Assembly', 82, 'Compliance', 15.0, false, false, 'ESG', 'ESG / Regulatory', 'Initiate UFLPA audit immediately; hold affected shipments pending clearance.', [
    makeNode('GEN-T2-1', 'Samsung Vietnam', 2, 'Ho Chi Minh City', 'Vietnam', 'Display Panels', 48, 'Delivery', 1.50, false, false, 'DIG', 'Digital', 'Track ERP migration status; escalate if visibility gap > 30 days.'),
    { ...TDK_CN },
    { ...MATERION_US },
    { ...BASF_DE },
  ]),
  makeNode('GEN-T1-2', 'TI Philippines', 1, 'Manila', 'Philippines', 'Semiconductors', 76, 'Delivery', 10.0, false, false, 'ENV', 'Environmental', 'Activate typhoon protocol; pre-position 3 weeks finished goods inventory.', [
    { ...DUPONT_TW },
    makeNode('GEN-T2-2', 'Pegatron Shanghai', 2, 'Shanghai', 'China', 'Assembly Services', 61, 'Delivery', 1.00, false, false, 'GPS', 'Geopolitical', 'Monitor production resumption; review capacity sharing with Celestica.', [
      { ...LINDE_SG },
    ]),
    { ...IBIDEN_JP },
  ]),
  makeNode('GEN-T1-3', 'Jabil Mexico', 1, 'Monterrey', 'Mexico', 'PCB Assembly', 68, 'Compliance', 8.0, false, false, 'LAB', 'Labor', 'Engage HR to track strike timeline; plan 20% capacity shift to Benchmark Texas.', [
    makeNode('GEN-T2-3', 'Kyocera Japan', 2, 'Kyoto', 'Japan', 'Ceramic Filters', 55, 'Cost', 0.90, true, false, 'EFS', 'Economic', 'Negotiate long-term supply agreement; qualify TDK as alternate.'),
    makeNode('GEN-T2-4', 'Vishay Ireland', 2, 'Dublin', 'Ireland', 'Resistors', 44, 'Cost', 0.75, false, false, 'EFS', 'Economic', 'Stable; verify quarterly pricing contracts.'),
    { ...BASF_DE },
    { ...LINDE_SG },
  ]),
  makeNode('GEN-T1-4', 'Foxconn Vietnam', 1, 'Hanoi', 'Vietnam', 'PCB Assembly', 54, 'Delivery', 5.0, false, false, 'LOG', 'Logistics', 'Pre-book container space for Q4; review port congestion risk monthly.', [
    makeNode('GEN-T2-5', 'Nidec Japan', 2, 'Kyoto', 'Japan', 'Motor Drivers', 38, 'Cost', 0.60, false, false, 'EFS', 'Economic', 'Stable; no action required.'),
    { ...TDK_CN },
  ]),
  makeNode('GEN-T1-5', 'Benchmark Texas', 1, 'Austin', 'USA', 'PCB Assembly', 33, 'Delivery', 4.0, false, false, 'INF', 'Infrastructure', 'Stable; confirm grid resilience plan before summer peak.', [
    makeNode('GEN-T2-6', 'Linde USA', 2, 'Danbury', 'USA', 'Industrial Gas', 24, 'Delivery', 0.45, false, false, 'EFS', 'Economic', 'No action required — stable.'),
    { ...MATERION_US },
  ]),
  makeNode('GEN-T1-6', 'Sanmina California', 1, 'San Jose', 'USA', 'PCB Assembly', 28, 'Cost', 3.0, false, false, 'EFS', 'Economic', 'Stable; monitor component spot-price index monthly.', [
    makeNode('GEN-T2-7', 'BASF USA', 2, 'Florham Park', 'USA', 'Chemical Inputs', 27, 'Cost', 0.35, false, false, 'EFS', 'Economic', 'No action required — stable.'),
    makeNode('GEN-T2-8', 'Henkel Germany', 2, 'Düsseldorf', 'Germany', 'Conformal Coating', 31, 'Compliance', 0.30, false, false, 'ESG', 'ESG / Regulatory', 'Verify RoHS compliance; stable.'),
  ]),
];

// ---------------------------------------------------------------------------
// Procedural T2–T5 generation
// Targets: T2=40 total (8 hand-crafted + 32 generated), T3=140, T4=200, T5=115
// Choke points (DUPONT, TDK, IBIDEN, MATERION, BASF_DE, LINDE_SG) are already
// placed under multiple T1/T2 parents above.
// ---------------------------------------------------------------------------
function generateNodes(
  tier: 2 | 3 | 4 | 5,
  count: number,
  startIdx: number,
  revenueBase: number,
  revenueDecay: number,
  rand: () => number,
): SubTierFullNode[] {
  const nodes: SubTierFullNode[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startIdx + i;
    const score = pickRiskScore(rand);
    const [city, country] = pick(CITIES, rand);
    const commodity = pick(COMMODITIES, rand);
    const impact = pick(IMPACTS, rand);
    const [lensCode, lensLabel] = pick(LENSES, rand);
    const revenue = revenueBase * Math.pow(revenueDecay, i) * (0.8 + rand() * 0.4);

    const action =
      score >= 70
        ? `Critical: review ${lensLabel} exposure; escalate to procurement lead.`
        : score >= 40
        ? `Monitor ${lensLabel} indicators; re-assess in 30 days.`
        : 'Stable — no action required.';

    // Sprinkle a few SPOFs among high-risk generated nodes
    const isSPOF = score >= 75 && rand() < 0.12;

    nodes.push(
      makeNode(
        `GEN-T${tier}-${idx}`,
        `${city.split(' ')[0]} ${commodity.split(' ')[0]} Co.`,
        tier,
        city,
        country,
        commodity,
        score,
        impact,
        parseFloat(revenue.toFixed(4)),
        isSPOF,
        false,
        lensCode,
        lensLabel,
        action,
      ),
    );
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Assemble the full 500-node network
// ---------------------------------------------------------------------------
function buildLargeNetwork(): SubTierFullNode {
  const rand = makePrng(42);

  // Generate bulk nodes
  const genT2 = generateNodes(2, 32, 100, 0.80, 0.94, rand);
  const genT3 = generateNodes(3, 140, 200, 0.055, 0.97, rand);
  const genT4 = generateNodes(4, 200, 400, 0.022, 0.98, rand);
  const genT5 = generateNodes(5, 115, 700, 0.009, 0.985, rand);

  // Distribute generated T3–T5 nodes across T2 parents
  // T2 parents = hand-crafted (already have children) + generated T2 nodes
  const t2Parents = [
    ...T1_NODES.flatMap(t1 => t1.children.filter(c => c.tier === 2 && !c.id.startsWith('GEN-T2-DUPONT') && !c.id.startsWith('GEN-T2-TDK') && !c.id.startsWith('GEN-T2-IBIDEN') && !c.id.startsWith('GEN-T2-MATERION') && !c.id.startsWith('GEN-T3'))),
    ...genT2,
  ];

  // Distribute genT3 evenly among t2Parents
  genT3.forEach((node, i) => {
    const parent = t2Parents[i % t2Parents.length];
    parent.children.push(node);
  });

  // Distribute genT4 among genT3
  genT4.forEach((node, i) => {
    const parent = genT3[i % genT3.length];
    parent.children.push(node);
  });

  // Distribute genT5 among genT4
  genT5.forEach((node, i) => {
    const parent = genT4[i % genT4.length];
    parent.children.push(node);
  });

  // Attach genT2 nodes to T1 parents (round-robin)
  genT2.forEach((node, i) => {
    T1_NODES[i % T1_NODES.length].children.push(node);
  });

  return makeNode(
    'QSC-LARGE',
    'QSC Aerospace',
    0,
    'El Segundo',
    'USA',
    'OEM',
    0,
    'Delivery',
    null,
    false,
    false,
    '—',
    '—',
    '—',
    T1_NODES,
  );
}

export const LARGE_NETWORK: SubTierFullNode = buildLargeNetwork();
