export type ImpactBucket = 'delivery' | 'compliance' | 'cost';

export type Severity = 'critical' | 'elevated' | 'watch';

export type RiskLens =
  | 'economic_financial'
  | 'geopolitical'
  | 'tech_cyber'
  | 'esg_regulatory'
  | 'catastrophic_systemic'
  | 'environmental_climate'
  | 'multitier_viability'
  | 'logistics_transport'
  | 'infrastructure'
  | 'labor_social'
  | 'market_competition'
  | 'digital_transformation';

export interface SignalRecommendation {
  rank: number;
  action: string;
  label: string;
  detail: string;
  coverage_pct?: number;
  effort_hours?: number;
  owner?: string;
  target?: string;
}

export interface Signal {
  signal_id: string;
  version: '1.0';
  type: 'STATE_CHANGE';
  severity: Severity;
  detected_at: string;
  confidence: number;
  trigger: {
    lens: RiskLens;
    event: string;
    event_label: string;
    score_before: number;
    score_after: number;
    sources: string[];
    sources_human: string[];
  };
  entity: {
    supplier_id: string;
    supplier_name: string;
    tier: number;
    commodity: string;
  };
  exposure: {
    impact_bucket: ImpactBucket;
    revenue_at_risk_usd: number;
    part_numbers: string[];
    programs: string[];
    open_orders: number;
  };
  recommendations: SignalRecommendation[];
  links: {
    investigate: string;
    acknowledge: string;
  };
}
