// ---------------------------------------------------------------------------
// Production analysis schema — mirrors the backend export shape exactly.
// A real backend export can drop in as a fixtures-file swap with no code change.
// ---------------------------------------------------------------------------

export interface AnalysisEvent {
  /** Stable event id — referenced by parameter_changes.event_ids. */
  id?: string;
  news: string;              // headline
  sub_factor: string;        // attribution tag — the parameter that moved
  sentiment: number;         // -1..1 (negative = bad)
  impactin_days: number;
  recoveryin_days: number;
  news_link: string;
  /** Event risk score 0..1 = |sentiment| × probability-of-impact × recency.
   *  Agent-internal — consumed when present, never recomputed client-side. */
  riskScore?: number;
  /** ISO date the event landed. Used to build score history + detect breaks.
   *  Optional in backend exports; events without it count as baseline. */
  occurred_at?: string;
}

/** One tracked parameter inside a lens: what changed, from what to what. */
export interface ParameterChange {
  parameter_id: string;
  name: string;                              // e.g. "Import tariffs — semiconductors"
  value_type: 'percent' | 'binary' | 'index';
  before: number;
  after: number;
  unit: string;                              // '%', '', 'index 0–100', …
  contribution: number;                      // score points of the lens delta
  impact_bucket: 'delivery' | 'compliance' | 'cost';
  event_ids: string[];                       // evidence events backing the change
  implication: string;                       // one-line plain-language consequence
}

export interface AnalysisDimension {
  key: string;               // e.g. 'geopolitical'
  abbr: string;              // e.g. 'GPS'
  label: string;             // e.g. 'Geopolitical'
  score: number;             // (1 - avg(sentiment)) / 2 * 100, or 50.0 fallback
  isPrimary: boolean;
  has_event_data: boolean;   // false → score is the neutral 50 fallback, NOT measured
  event_count: number;
  events: AnalysisEvent[];
  /** Parameter-level attribution for this run; before===after = no change in window. */
  parameter_changes?: ParameterChange[];
}

export interface SupplierAnalysis {
  id: string;
  runId: string;
  supplierName: string;
  location: string;
  overallScore: number;      // average of the 12 lens scores
  riskLevel: 'critical' | 'medium' | 'low';
  topRisk: string;           // label of highest measured lens
  topRiskAbbr: string;
  revenueImpact: number;     // USD exposure
  dimensions: AnalysisDimension[];  // 12 lenses
}

/** One sub-factor's share of a lens-score break. */
export interface SubFactorContribution {
  subFactor: string;
  eventCount: number;
  avgSentiment: number;
  contribution: number;      // points of the score delta attributed to this sub-factor
  events: AnalysisEvent[];
}
