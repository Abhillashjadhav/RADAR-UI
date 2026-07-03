import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import { SUPPLIER_ANALYSES } from '../../data/supplierAnalysisFixtures';
import { CARD, SECTION_LABEL, GOLD_BTN, WHITE_BTN, PILL_SELECT, scorePill } from '../../theme/tokens';
import PageTitle from '../Layout/PageTitle';

interface PreviousRun {
  id: string;
  finishedAt: string;
  commodity: string;
  suppliers: number;
}

const SEED_RUNS: PreviousRun[] = [
  { id: 'RUN-2026-07-02-001', finishedAt: '2026-07-02 06:00', commodity: 'PCB Assembly', suppliers: 14 },
  { id: 'RUN-2026-07-01-001', finishedAt: '2026-07-01 06:00', commodity: 'PCB Assembly', suppliers: 14 },
  { id: 'RUN-2026-06-30-001', finishedAt: '2026-06-30 06:00', commodity: 'Passives', suppliers: 9 },
];

type Phase = 'pre' | 'running' | 'done';

/** Supplier Risk Assessment — production run surface with the analysis flow. */
export default function SupplierRiskAssessment() {
  const [phase, setPhase] = useState<Phase>('pre');
  const [progress, setProgress] = useState(0);
  const [runs, setRuns] = useState(SEED_RUNS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const analyzingName = SUPPLIER_ANALYSES[Math.min(
    Math.floor((progress / 100) * SUPPLIER_ANALYSES.length),
    SUPPLIER_ANALYSES.length - 1,
  )]?.supplierName ?? '';

  const start = () => {
    setPhase('running');
    setProgress(0);
    timer.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (timer.current) clearInterval(timer.current);
          setPhase('done');
          setRuns(r => [{ id: 'RUN-2026-07-02-002', finishedAt: '2026-07-02 (just now)', commodity: 'PCB Assembly', suppliers: 14 }, ...r]);
          return 100;
        }
        return prev + 4;
      });
    }, 300);
  };

  const cancel = () => {
    if (timer.current) clearInterval(timer.current);
    setPhase('pre');
    setProgress(0);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-5">
      <div>
        <PageTitle>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Supplier Risk Assessment</h1>
        </PageTitle>
        <p className="text-sm text-gray-500 mt-1">
          Select a commodity and suppliers, then run the 12-lens AI analysis.
        </p>
      </div>

      {/* Controls */}
      <div className={`${CARD} p-5 flex items-center gap-2 flex-wrap`}>
        <button className={PILL_SELECT}>Commodity: PCB Assembly <ChevronDown size={12} /></button>
        <button className={PILL_SELECT}>Suppliers: All monitored (14) <ChevronDown size={12} /></button>
        <button className={PILL_SELECT}>Duration: 30 days <ChevronDown size={12} /></button>
        <div className="ml-auto">
          {phase !== 'running' ? (
            <button onClick={start} className={GOLD_BTN}>Run Analysis</button>
          ) : (
            <button onClick={cancel} className={WHITE_BTN}>Cancel</button>
          )}
        </div>
      </div>

      {/* AI ANALYSIS IN PROGRESS banner */}
      {phase === 'running' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" />
              AI Analysis in Progress
            </p>
            <button onClick={cancel} className="text-xs font-semibold text-gray-500 hover:text-gray-800">Cancel</button>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-amber-100 mb-2">
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          {/* Analyzing status row */}
          <p className="text-xs text-gray-600 tabular-nums">
            Analyzing <span className="font-semibold text-gray-900">{analyzingName}</span> · 12 lenses · {progress}%
          </p>
        </div>
      )}

      {/* Skeleton cards while running */}
      {phase === 'running' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className={`${CARD} p-4 animate-pulse`}>
              <div className="w-9 h-9 rounded-xl bg-gray-100 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Done — result summary */}
      {phase === 'done' && (
        <div className={`${CARD} p-5`}>
          <p className={`${SECTION_LABEL} mb-3`}>Run complete — supplier readings</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPLIER_ANALYSES.slice(0, 6).map(a => (
              <div key={a.id} className="rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.supplierName}</p>
                  <p className="text-xs text-gray-400">{a.topRisk}</p>
                </div>
                <span className={scorePill(a.overallScore)}>{a.overallScore}</span>
              </div>
            ))}
          </div>
          <Link to="/risk-monitor" className="inline-block mt-4 text-xs font-semibold text-amber-600 hover:underline">
            View in Risk Monitor →
          </Link>
        </div>
      )}

      {/* Previous runs stack */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Previous runs</h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {runs.map(r => (
            <li key={r.id + r.finishedAt} className="px-5 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{r.id}</p>
                <p className="text-xs text-gray-400">Commodity: {r.commodity} · Suppliers: {r.suppliers}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">Completed</span>
                <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">{r.finishedAt}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
