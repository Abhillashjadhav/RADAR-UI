import type { ScoreBreakdown as SB } from '../../data/anomalyMockData';

export default function ScoreBreakdown({ bd }: { bd: SB }) {
  const { baselineLevel, breakLift, recencyWeight, displayedScore, recencyNote } = bd;
  const hasBreakout = breakLift > 0 || recencyWeight > 0;

  const barMax = 100;
  const pct = (v: number) => `${Math.round((v / barMax) * 100)}%`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Score breakdown — why {displayedScore}?
      </p>

      {/* Stacked bar */}
      <div className="relative h-8 rounded-lg overflow-hidden flex mb-2">
        {/* Baseline */}
        <div
          style={{ width: pct(baselineLevel) }}
          className="bg-blue-200 flex items-center justify-center"
          title={`Baseline: ${baselineLevel}`}
        >
          {baselineLevel > 10 && (
            <span className="text-xs font-semibold text-blue-800 truncate px-1">{baselineLevel}</span>
          )}
        </div>
        {/* Lift */}
        {breakLift > 0 && (
          <div
            style={{ width: pct(breakLift) }}
            className="bg-red-400 flex items-center justify-center"
            title={`Breakout lift: +${breakLift}`}
          >
            {breakLift > 5 && (
              <span className="text-xs font-semibold text-white">+{breakLift}</span>
            )}
          </div>
        )}
        {/* Recency */}
        {recencyWeight > 0 && (
          <div
            style={{ width: pct(recencyWeight) }}
            className="bg-orange-400 flex items-center justify-center"
            title={`Recency weight: +${recencyWeight}`}
          >
            {recencyWeight > 3 && (
              <span className="text-xs font-semibold text-white">+{recencyWeight}</span>
            )}
          </div>
        )}
        {/* Remainder */}
        <div className="flex-1 bg-gray-100" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" />
          Baseline <span className="font-semibold text-gray-900 tabular-nums">{baselineLevel}</span>
        </span>
        {hasBreakout && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
              Break lift <span className="font-semibold text-gray-900 tabular-nums">+{breakLift}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" />
              Recency <span className="font-semibold text-gray-900 tabular-nums">+{recencyWeight}</span>
            </span>
          </>
        )}
        <span className="flex items-center gap-1.5 font-semibold text-gray-900">
          = {displayedScore}
        </span>
      </div>

      {/* Recency note */}
      <p className="text-xs text-gray-500 italic">{recencyNote}</p>

      {!hasBreakout && (
        <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 mt-2">
          No anomaly detected — score reflects stable baseline. No lift applied.
        </p>
      )}

      {/* Counterfactual */}
      {hasBreakout && (
        <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
          Without the breakout this would show <strong>{baselineLevel}</strong>. Without recency weighting it would show <strong>{baselineLevel + breakLift}</strong>.
        </p>
      )}
    </div>
  );
}
