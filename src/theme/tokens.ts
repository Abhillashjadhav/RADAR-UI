// ---------------------------------------------------------------------------
// Synchronicity design tokens — the single source of truth for the app theme.
// No per-page one-off colors: import from here.
// ---------------------------------------------------------------------------

// Brand ---------------------------------------------------------------------
export const GOLD = '#FBBF24';        // amber-400 — primary brand / money
export const GOLD_DARK = '#D97706';   // amber-600 — link text on white
export const GOLD_SOFT = '#FEF3C7';   // amber-100 — active pill bg
export const CHARCOAL = '#1F2430';    // top strip / darkest text
export const PAGE_BG = '#F7F8FA';

// Severity ------------------------------------------------------------------
export const SEV = {
  critical: { hex: '#DC2626', text: 'text-red-600',   bg: 'bg-red-50',   chip: 'bg-red-100 text-red-700' },
  medium:   { hex: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50', chip: 'bg-amber-100 text-amber-700' },
  low:      { hex: '#10B981', text: 'text-green-600', bg: 'bg-green-50', chip: 'bg-green-100 text-green-700' },
} as const;

export type SeverityKey = keyof typeof SEV;

export const severityOf = (score: number): SeverityKey =>
  score >= 70 ? 'critical' : score >= 40 ? 'medium' : 'low';

/** Soft colored score pill classes. */
export const scorePill = (score: number): string => {
  const s = severityOf(score);
  return `${SEV[s].chip} inline-flex items-center justify-center min-w-9 h-7 px-1.5 rounded-lg text-xs font-bold tabular-nums`;
};

// Impact chips (risk type) ----------------------------------------------------
export const IMPACT_CHIP: Record<string, string> = {
  Delivery:   'bg-red-50 text-red-700 border border-red-200',
  Compliance: 'bg-amber-50 text-amber-700 border border-amber-200',
  Cost:       'bg-blue-50 text-blue-700 border border-blue-200',
  delivery:   'bg-red-50 text-red-700 border border-red-200',
  compliance: 'bg-amber-50 text-amber-700 border border-amber-200',
  cost:       'bg-blue-50 text-blue-700 border border-blue-200',
};

export const chip = (kind: string): string =>
  `${IMPACT_CHIP[kind] ?? 'bg-gray-100 text-gray-600 border border-gray-200'} inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`;

// Stat-tile pastel icon chips -------------------------------------------------
export const PASTEL = {
  blue:   'bg-blue-100 text-blue-600',
  red:    'bg-red-100 text-red-600',
  amber:  'bg-amber-100 text-amber-600',
  purple: 'bg-purple-100 text-purple-600',
  green:  'bg-green-100 text-green-600',
} as const;
export type PastelKey = keyof typeof PASTEL;

// Tier colors (network graph + legend) ----------------------------------------
export const TIER = {
  0: { hex: '#8B5CF6', label: 'Customer / OEM',   chip: 'bg-purple-100 text-purple-700' },
  1: { hex: '#10B981', label: 'Direct Supplier',  chip: 'bg-green-100 text-green-700' },
  2: { hex: '#3B82F6', label: 'Tier 2',           chip: 'bg-blue-100 text-blue-700' },
  3: { hex: '#F59E0B', label: 'Tier 3',           chip: 'bg-amber-100 text-amber-700' },
  4: { hex: '#EC4899', label: 'Tier 4',           chip: 'bg-pink-100 text-pink-700' },
  5: { hex: '#EF4444', label: 'Tier 5',           chip: 'bg-red-100 text-red-700' },
} as const;

// Shared class recipes ---------------------------------------------------------
export const CARD = 'bg-white rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] border border-gray-100';
export const SECTION_LABEL = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400';
export const TH = 'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400';
export const GOLD_BTN = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 text-sm font-bold transition-colors shadow-sm';
export const WHITE_BTN = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors';
export const PILL_SELECT = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:border-amber-300 transition-colors';
export const SUPPLIER_LINK = 'text-amber-600 hover:text-amber-700 font-semibold hover:underline';
