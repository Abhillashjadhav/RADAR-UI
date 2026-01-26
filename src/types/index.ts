export interface RiskLenses {
  economic: number;
  geopolitical: number;
  cyber: number;
  esg: number;
  catastrophic: number;
  environmental: number;
  supplierViability: number;
  logistics: number;
  infrastructure: number;
  labor: number;
  competition: number;
  digital: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  city: string;
  country: string;
  countryCode: string;
  coordinates: Coordinates;
}

export type ImpactType = 'Delivery' | 'Compliance' | 'Cost';
export type RiskLevel = 'critical' | 'medium' | 'low';
export type TimeHorizon = 'today' | 'week' | 'quarter';

export interface Supplier {
  id: string;
  name: string;
  location: Location;
  tier: 1 | 2 | 3;
  overallRiskScore: number;
  riskLenses: RiskLenses;
  primaryImpact: ImpactType;
  revenueAtRisk: number;
  topRiskDescription: string;
  topRiskCategory: string;
  subTierSuppliers?: string[];
  lastUpdated: string;
}

export interface Alert {
  id: string;
  supplierId: string;
  supplierName: string;
  severity: RiskLevel;
  riskType: ImpactType;
  riskScore: number;
  description: string;
  timestamp: string;
  hoursAgo: number;
}

export interface SubTierNode {
  id: string;
  name: string;
  riskScore: number;
  label?: string;
  children?: SubTierNode[];
}

export interface RiskTrendDataPoint {
  day: number;
  delivery: number;
  compliance: number;
  cost: number;
}

export interface FilterState {
  timeHorizon: TimeHorizon;
  riskLevel: RiskLevel | 'all';
  impactType: ImpactType | 'all';
}

export interface MetricCard {
  title: string;
  value: number | string;
  subtitle: string;
  color: 'red' | 'yellow' | 'gray' | 'green';
}

export const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'medium';
  return 'low';
};

export const getRiskColor = (score: number): string => {
  if (score >= 70) return 'text-red-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-green-600';
};

export const getRiskBgColor = (score: number): string => {
  if (score >= 70) return 'bg-red-600';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const formatRevenue = (millions: number): string => {
  if (millions >= 1) {
    return `$${millions.toFixed(1)}M`;
  }
  return `$${Math.round(millions * 1000)}K`;
};

export const getCountryFlag = (countryCode: string): string => {
  const flags: Record<string, string> = {
    MY: '🇲🇾',
    CN: '🇨🇳',
    PH: '🇵🇭',
    JP: '🇯🇵',
    IN: '🇮🇳',
    DE: '🇩🇪',
    VN: '🇻🇳',
    TW: '🇹🇼',
    MX: '🇲🇽',
    US: '🇺🇸',
    UK: '🇬🇧',
  };
  return flags[countryCode] || '🌍';
};
