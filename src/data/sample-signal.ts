import type { Signal } from '../types/signal';

// Demo Signal — Taiwan PCB supplier hits its geopolitical alert threshold.
// Note: the brief specifies "Winn"; this repo's mockData has no Winn entry.
// Closest analog is SUP-009 (Dupont Taiwan, Taipei, tier 2), so we bind the
// Signal to that supplier so /supplier/SUP-009?signal=RDR-26-04781 resolves.
//
// Link paths are unprefixed: <Link to> automatically prepends the router
// basename ("/RADAR-UI") at runtime.
export const sampleSignal: Signal = {
  signal_id: 'RDR-26-04781',
  version: '1.0',
  type: 'STATE_CHANGE',
  severity: 'critical',
  detected_at: '2026-05-05T10:42:00Z',
  confidence: 0.87,
  trigger: {
    lens: 'geopolitical',
    event: 'pla_exercise_spike',
    event_label: 'Taiwan Strait — PLA exercise frequency crossed alert threshold',
    score_before: 78,
    score_after: 92,
    sources: ['cisa:advisory_2026_03', 'pla_tracker:q1_2026'],
    sources_human: [
      'CISA advisory TLP:WHITE — March 2026',
      'PLA air incursion tracker — 28 incursions/month Q1 2026',
    ],
  },
  entity: {
    supplier_id: 'SUP-009',
    supplier_name: 'Dupont Taiwan',
    tier: 2,
    commodity: 'PCB / Semiconductor',
  },
  exposure: {
    impact_bucket: 'delivery',
    revenue_at_risk_usd: 4_200_000,
    part_numbers: ['PN-78421', 'PN-78422', 'PN-78431'],
    programs: ['A350'],
    open_orders: 11,
  },
  recommendations: [
    {
      rank: 1,
      action: 'increase_safety_stock',
      label: 'Increase safety stock on PN-78421 to a 12-week buffer',
      detail:
        'Inventory cost ~$310K. Covers an estimated 78% of A350-line exposure for the next two quarters. Draft PO is pre-filled.',
      coverage_pct: 0.78,
      effort_hours: 2,
      target: 'PN-78421',
    },
    {
      rank: 2,
      action: 'qualify_alternate',
      label: 'Qualify Tripod Technology as alternate',
      detail:
        'Pre-screened RADAR score 81. Fastest qualification path (2–3 months) at the lowest cost delta (+6%). Reduces concentration risk on the primary supplier.',
      target: 'Tripod Technology',
    },
    {
      rank: 3,
      action: 'schedule_sbr',
      label: 'Schedule supplier business review with Dupont Taiwan in 14 days',
      detail:
        'Owner: Nishit P. Auto-drafted email is available. Agenda: BCP triggers, capacity reservation under disruption, ITAR-compliant continuity audit.',
      owner: 'nishit.p@qsc.com',
    },
  ],
  links: {
    investigate: '/supplier/SUP-009?signal=RDR-26-04781',
    acknowledge: '/supplier/SUP-009?signal=RDR-26-04781&action=ack',
  },
};
