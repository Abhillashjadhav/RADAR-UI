import type { ImpactBucket, RiskLens, Severity } from '../../types/signal';
import type { RiskLenses } from '../../types';
import type { RevenueBasis } from '../../types/analysis';

// Severity → tokens that match the existing AlertCard / RiskLensChart palette.
// Keeping these as plain strings (not a styled component) so consumers stay
// in the existing inline-Tailwind idiom used everywhere else in the app.
export interface SeverityTokens {
  label: string;
  badgeBg: string;
  surfaceBg: string;
  surfaceBorder: string;
  stripe: string;
  pill: string;
  dot: string;
}

export const severityTokens: Record<Severity, SeverityTokens> = {
  critical: {
    label: 'CRITICAL',
    badgeBg: 'bg-red-600',
    surfaceBg: 'bg-red-50',
    surfaceBorder: 'border-red-200',
    stripe: 'bg-red-600',
    pill: 'bg-red-100 text-red-700',
    dot: 'bg-red-600',
  },
  elevated: {
    label: 'ELEVATED',
    badgeBg: 'bg-yellow-500',
    surfaceBg: 'bg-yellow-50',
    surfaceBorder: 'border-yellow-200',
    stripe: 'bg-yellow-500',
    pill: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-500',
  },
  watch: {
    label: 'WATCH',
    badgeBg: 'bg-green-500',
    surfaceBg: 'bg-green-50',
    surfaceBorder: 'border-green-200',
    stripe: 'bg-green-500',
    pill: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
};

// Mirrors the impactColors map already used in ImpactAnalysis.tsx.
export const impactBucketTokens: Record<
  ImpactBucket,
  { label: string; bg: string; pill: string }
> = {
  delivery: { label: 'DELIVERY', bg: 'bg-red-600', pill: 'bg-red-100 text-red-700' },
  compliance: { label: 'COMPLIANCE', bg: 'bg-orange-500', pill: 'bg-orange-100 text-orange-700' },
  cost: { label: 'COST', bg: 'bg-blue-600', pill: 'bg-blue-100 text-blue-700' },
};

// Map Signal RiskLens spec tokens (snake_case) → existing RiskLenses keys
// (camelCase, defined in src/types/index.ts and rendered in RiskLensChart.tsx).
// Only mapped lenses participate in auto-scroll/highlight; unmapped ones no-op.
export const lensToRiskLensKey: Partial<Record<RiskLens, keyof RiskLenses>> = {
  economic_financial: 'economic',
  geopolitical: 'geopolitical',
  tech_cyber: 'cyber',
  esg_regulatory: 'esg',
  catastrophic_systemic: 'catastrophic',
  environmental_climate: 'environmental',
  multitier_viability: 'supplierViability',
  logistics_transport: 'logistics',
  infrastructure: 'infrastructure',
  labor_social: 'labor',
  market_competition: 'competition',
  digital_transformation: 'digital',
};

export const lensHumanLabel: Record<RiskLens, string> = {
  economic_financial: 'Economic / Financial',
  geopolitical: 'Geopolitical',
  tech_cyber: 'Tech / Cyber',
  esg_regulatory: 'ESG / Regulatory',
  catastrophic_systemic: 'Catastrophic / Systemic',
  environmental_climate: 'Environmental / Climate',
  multitier_viability: 'Multi-tier Viability',
  logistics_transport: 'Logistics & Transport',
  infrastructure: 'Infrastructure',
  labor_social: 'Labor & Social',
  market_competition: 'Market Competition',
  digital_transformation: 'Digital Transformation',
};

// Dollar-figure basis label — shown next to the amount wherever it renders
// (Anomaly Feed row, Ranked Exceptions row, drawer footer) so the basis is
// never ambiguous. 'none' is never rendered — callers gate on exposureUsd !== null.
export const exposureBasisLabel: Record<RevenueBasis, string> = {
  revenue: 'Revenue at Risk',
  cost: 'Cost Exposure (modeled)',
  none: 'Risk Score Only',
};

export const formatRevenueAtRisk = (usd: number): string => {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${usd}`;
};

export const formatDetectedAt = (iso: string): string => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} · ${time}`;
};
