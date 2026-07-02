// ---------------------------------------------------------------------------
// Production scoring math — implemented exactly as the backend computes it.
//
//   Lens WITH events:    score = round((1 - avg(sentiment)) / 2 * 100, 1)
//   Lens WITHOUT events: score = 50.0 and has_event_data = false  (neutral
//                        fallback — never a measured value, never ranked)
//   Overall supplier:    average of the 12 lens scores
//   Event riskScore:     consumed when present (agent-internal), not recomputed
// ---------------------------------------------------------------------------
import type { AnalysisEvent, AnalysisDimension, SupplierAnalysis, SubFactorContribution } from '../types/analysis';

export const NEUTRAL_FALLBACK = 50.0;

const round1 = (n: number) => Math.round(n * 10) / 10;

export function avgSentiment(events: AnalysisEvent[]): number {
  if (events.length === 0) return 0;
  return events.reduce((s, e) => s + e.sentiment, 0) / events.length;
}

/** Lens score from events: (1 - avg(sentiment)) / 2 * 100, one decimal. */
export function lensScore(events: AnalysisEvent[]): number {
  if (events.length === 0) return NEUTRAL_FALLBACK;
  return round1(((1 - avgSentiment(events)) / 2) * 100);
}

/** Overall supplier score = average of all 12 lens scores (fallback 50s included). */
export function overallScore(dimensions: AnalysisDimension[]): number {
  if (dimensions.length === 0) return NEUTRAL_FALLBACK;
  return round1(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
}

/** Measured lenses only — the ONLY set used for ranking, top-risk, and category bars. */
export function measuredDimensions(a: SupplierAnalysis): AnalysisDimension[] {
  return a.dimensions.filter(d => d.has_event_data);
}

export function topMeasuredDimension(a: SupplierAnalysis): AnalysisDimension | null {
  const m = measuredDimensions(a);
  if (m.length === 0) return null;
  return [...m].sort((x, y) => y.score - x.score)[0];
}

export const riskLevelOf = (score: number): 'critical' | 'medium' | 'low' =>
  score >= 70 ? 'critical' : score >= 40 ? 'medium' : 'low';

// ---------------------------------------------------------------------------
// Break detection + sub-factor attribution
//
// DETECTION runs on the score: baseline = score of events older than the
// break window; current = score of all events. The score is the tripwire.
// ATTRIBUTION runs on the sub_factor: group the new events by sub_factor and
// split the delta across groups (each group's standalone pull on the baseline,
// scaled so the parts sum exactly to the delta).
// ---------------------------------------------------------------------------
export const BREAK_WINDOW_DAYS = 14;

export function splitByBreakWindow(events: AnalysisEvent[], refDate: string, windowDays = BREAK_WINDOW_DAYS) {
  const cutoff = new Date(refDate);
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const baseline = events.filter(e => !e.occurred_at || e.occurred_at < cutoffIso);
  const recent = events.filter(e => e.occurred_at !== undefined && e.occurred_at >= cutoffIso);
  return { baseline, recent };
}

/**
 * Split (currentScore - baselineScore) across the new events' sub-factors.
 * Each group's raw pull = lensScore(baseline + group) - lensScore(baseline);
 * pulls are scaled so contributions sum exactly to the delta.
 */
export function attributeDelta(baseline: AnalysisEvent[], recent: AnalysisEvent[]): SubFactorContribution[] {
  if (recent.length === 0) return [];
  const before = lensScore(baseline);
  const after = lensScore([...baseline, ...recent]);
  const delta = after - before;

  const groups = new Map<string, AnalysisEvent[]>();
  for (const e of recent) {
    const g = groups.get(e.sub_factor) ?? [];
    g.push(e);
    groups.set(e.sub_factor, g);
  }

  const raw = [...groups.entries()].map(([subFactor, events]) => ({
    subFactor,
    events,
    pull: lensScore([...baseline, ...events]) - before,
  }));
  const pullSum = raw.reduce((s, r) => s + r.pull, 0);

  return raw
    .map(({ subFactor, events, pull }) => ({
      subFactor,
      eventCount: events.length,
      avgSentiment: round1(avgSentiment(events) * 100) / 100,
      contribution: round1(pullSum !== 0 ? (pull / pullSum) * delta : delta / raw.length),
      events,
    }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

/** Daily score history for a lens: score of all events dated ≤ each day. */
export function scoreHistory(events: AnalysisEvent[], refDate: string, days = 60): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  const ref = new Date(refDate);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const upTo = events.filter(e => !e.occurred_at || e.occurred_at <= iso);
    out.push({ date: iso, value: lensScore(upTo) });
  }
  return out;
}
