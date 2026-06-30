import type { ImpactType } from '../types';

export interface SubTierFullNode {
  id: string;
  name: string;
  tier: 0 | 1 | 2 | 3 | 4 | 5;
  location: { city: string; country: string; zip?: string };
  commodity: string;
  riskScore: number;
  primaryImpact: ImpactType;
  revenueAtRisk: number | null; // $M — null if data unavailable
  isSPOF: boolean;
  isChokePoint: boolean;
  topRiskLens: string; // short code matching lens labels (GPS, EFS, ESG…)
  topRiskLensLabel: string; // human-readable
  action: string;
  children: SubTierFullNode[];
}

/** Flatten the tree into a deduplicated list (choke points appear once despite multiple parents). */
export function flattenNetwork(root: SubTierFullNode): SubTierFullNode[] {
  const seen = new Set<string>();
  const result: SubTierFullNode[] = [];
  const traverse = (node: SubTierFullNode) => {
    if (!seen.has(node.id)) {
      seen.add(node.id);
      result.push(node);
    }
    node.children.forEach(traverse);
  };
  traverse(root);
  return result;
}

// ---------------------------------------------------------------------------
// PCB Assembly commodity network (~16 nodes, T0–T3)
// SUP-009 (Dupont Taiwan) and SUP-010 (TDK China) appear under multiple T1
// parents — that's what makes them choke points.
// ---------------------------------------------------------------------------

const DUPONT: SubTierFullNode = {
  id: 'SUP-009',
  name: 'Dupont Taiwan',
  tier: 2,
  location: { city: 'Taipei', country: 'Taiwan' },
  commodity: 'Copper Foil',
  riskScore: 58,
  primaryImpact: 'Cost',
  revenueAtRisk: 0.19,
  isSPOF: false,
  isChokePoint: true,
  topRiskLens: 'GPS',
  topRiskLensLabel: 'Geopolitical',
  action: 'Qualify mainland China alternate; monitor Taiwan Strait indicators weekly.',
  children: [],
};

const TDK: SubTierFullNode = {
  id: 'SUP-010',
  name: 'TDK China',
  tier: 2,
  location: { city: 'Suzhou', country: 'China' },
  commodity: 'Capacitors',
  riskScore: 62,
  primaryImpact: 'Delivery',
  revenueAtRisk: 0.17,
  isSPOF: false,
  isChokePoint: true,
  topRiskLens: 'LOG',
  topRiskLensLabel: 'Logistics',
  action: 'Increase safety stock to 45 days; dual-qualify Murata as alternate.',
  children: [],
};

export const PCB_NETWORK: SubTierFullNode = {
  id: 'QSC',
  name: 'QSC Aerospace',
  tier: 0,
  location: { city: 'El Segundo', country: 'USA' },
  commodity: 'OEM',
  riskScore: 0,
  primaryImpact: 'Delivery',
  revenueAtRisk: null,
  isSPOF: false,
  isChokePoint: false,
  topRiskLens: '—',
  topRiskLensLabel: '—',
  action: '—',
  children: [
    {
      id: 'SUP-001',
      name: 'Celestica Malaysia',
      tier: 1,
      location: { city: 'Penang', country: 'Malaysia', zip: '10050' },
      commodity: 'PCB Assembly',
      riskScore: 89,
      primaryImpact: 'Delivery',
      revenueAtRisk: 1.2,
      isSPOF: true,
      isChokePoint: false,
      topRiskLens: 'GPS',
      topRiskLensLabel: 'Geopolitical',
      action: 'Activate dual-source contingency; negotiate 30-day buffer stock immediately.',
      children: [
        {
          id: 'SUP-004',
          name: 'ABJ Substrate Japan',
          tier: 2,
          location: { city: 'Osaka', country: 'Japan' },
          commodity: 'PCB Substrates',
          riskScore: 71,
          primaryImpact: 'Cost',
          revenueAtRisk: 0.54,
          isSPOF: true,
          isChokePoint: false,
          topRiskLens: 'EFS',
          topRiskLensLabel: 'Economic',
          action: 'Negotiate 90-day price lock on substrates; qualify Ventec International as backup.',
          children: [
            {
              id: 'SUP-017',
              name: 'Air Liquide UK',
              tier: 3,
              location: { city: 'London', country: 'United Kingdom' },
              commodity: 'Argon Gas',
              riskScore: 41,
              primaryImpact: 'Cost',
              revenueAtRisk: 0.065,
              isSPOF: true,
              isChokePoint: false,
              topRiskLens: 'INF',
              topRiskLensLabel: 'Infrastructure',
              action: 'Confirm backup argon supply from Linde USA; monitor UK energy grid weekly.',
              children: [],
            },
            {
              id: 'SUP-018',
              name: 'Shin-Etsu Japan',
              tier: 3,
              location: { city: 'Tokyo', country: 'Japan' },
              commodity: 'Epoxy Resin',
              riskScore: 35,
              primaryImpact: 'Delivery',
              revenueAtRisk: 0.052,
              isSPOF: false,
              isChokePoint: false,
              topRiskLens: 'CAT',
              topRiskLensLabel: 'Catastrophic',
              action: 'Monitor seismic activity; no immediate action required.',
              children: [],
            },
          ],
        },
        DUPONT,
        TDK,
      ],
    },
    {
      id: 'SUP-002',
      name: 'Flex Shenzhen',
      tier: 1,
      location: { city: 'Shenzhen', country: 'China', zip: '518057' },
      commodity: 'PCB Assembly',
      riskScore: 82,
      primaryImpact: 'Compliance',
      revenueAtRisk: 0.89,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: 'ESG',
      topRiskLensLabel: 'ESG / Regulatory',
      action: 'Initiate UFLPA audit immediately; hold affected shipments pending clearance.',
      children: [
        {
          id: 'SUP-007',
          name: 'Samsung Vietnam',
          tier: 2,
          location: { city: 'Ho Chi Minh City', country: 'Vietnam' },
          commodity: 'Display Panels',
          riskScore: 48,
          primaryImpact: 'Delivery',
          revenueAtRisk: 0.28,
          isSPOF: false,
          isChokePoint: false,
          topRiskLens: 'DIG',
          topRiskLensLabel: 'Digital',
          action: 'Track ERP migration status; escalate if visibility gap persists > 30 days.',
          children: [],
        },
        { ...TDK },
      ],
    },
    {
      id: 'SUP-003',
      name: 'TI Philippines',
      tier: 1,
      location: { city: 'Manila', country: 'Philippines', zip: '1000' },
      commodity: 'Semiconductors',
      riskScore: 76,
      primaryImpact: 'Delivery',
      revenueAtRisk: 0.65,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: 'ENV',
      topRiskLensLabel: 'Environmental',
      action: 'Activate typhoon protocol; pre-position 3 weeks of finished goods inventory.',
      children: [
        { ...DUPONT },
        {
          id: 'SUP-012',
          name: 'Pegatron Shanghai',
          tier: 2,
          location: { city: 'Shanghai', country: 'China' },
          commodity: 'Assembly Services',
          riskScore: 61,
          primaryImpact: 'Delivery',
          revenueAtRisk: 0.14,
          isSPOF: false,
          isChokePoint: false,
          topRiskLens: 'GPS',
          topRiskLensLabel: 'Geopolitical',
          action: 'Monitor production resumption; review capacity sharing with Celestica.',
          children: [],
        },
      ],
    },
    {
      id: 'SUP-005',
      name: 'Wistron India',
      tier: 1,
      location: { city: 'Bangalore', country: 'India' },
      commodity: 'PCB Assembly',
      riskScore: 68,
      primaryImpact: 'Delivery',
      revenueAtRisk: 0.42,
      isSPOF: false,
      isChokePoint: false,
      topRiskLens: 'LAB',
      topRiskLensLabel: 'Labor',
      action: 'Engage HR to track strike timeline; plan 20% capacity shift to Benchmark Texas.',
      children: [
        {
          id: 'SUP-019',
          name: 'BASF Germany',
          tier: 2,
          location: { city: 'Ludwigshafen', country: 'Germany' },
          commodity: 'Chemical Inputs',
          riskScore: 31,
          primaryImpact: 'Cost',
          revenueAtRisk: 0.048,
          isSPOF: false,
          isChokePoint: false,
          topRiskLens: 'EFS',
          topRiskLensLabel: 'Economic',
          action: 'No action required — stable.',
          children: [],
        },
        {
          id: 'SUP-020',
          name: 'Linde USA',
          tier: 2,
          location: { city: 'Danbury', country: 'USA' },
          commodity: 'Industrial Gas',
          riskScore: 24,
          primaryImpact: 'Delivery',
          revenueAtRisk: 0.035,
          isSPOF: false,
          isChokePoint: false,
          topRiskLens: 'EFS',
          topRiskLensLabel: 'Economic',
          action: 'No action required — stable.',
          children: [],
        },
      ],
    },
  ],
};
