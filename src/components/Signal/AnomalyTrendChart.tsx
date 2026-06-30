import type { Anomaly } from '../../data/anomalyMockData';

interface Props {
  anomaly: Anomaly;
  width?: number;
  height?: number;
}

const PAD = { top: 16, right: 16, bottom: 32, left: 36 };

export default function AnomalyTrendChart({ anomaly, width = 600, height = 200 }: Props) {
  const { history, bandLow, bandHigh, breakDate, provisionalBaseline } = anomaly;
  if (history.length < 2) return null;

  const W = width;
  const H = height;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const min = 0, max = 100;

  const xOf = (i: number) => PAD.left + (i / (history.length - 1)) * innerW;
  const yOf = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * innerH;

  // Band polygon (y-coords for bandHigh and bandLow)
  const bandTopY = yOf(bandHigh);
  const bandBotY = yOf(bandLow);
  const bandPath =
    `M ${xOf(0)} ${bandTopY} ` +
    history.map((_, i) => `L ${xOf(i)} ${bandTopY}`).join(' ') +
    ` L ${xOf(history.length - 1)} ${bandBotY} ` +
    history.map((_, i) => `L ${xOf(history.length - 1 - i)} ${bandBotY}`).join(' ') +
    ' Z';

  // Signal line
  const linePath = history
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(p.value)}`)
    .join(' ');

  // Breakout index
  const breakIdx = history.findIndex(p => p.date === breakDate);
  const breakX = breakIdx >= 0 ? xOf(breakIdx) : null;

  // Tick dates: first, break, last
  const tickDates = [
    { i: 0, label: history[0].date.slice(5) },
    ...(breakIdx > 0 ? [{ i: breakIdx, label: `Break: ${history[breakIdx].date.slice(5)}` }] : []),
    { i: history.length - 1, label: history[history.length - 1].date.slice(5) },
  ];

  // Y-axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="relative w-full">
      {provisionalBaseline && (
        <div className="absolute top-1 left-10 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded z-10">
          Provisional baseline — &lt;30 days history
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="overflow-visible"
        style={{ minHeight: 140 }}
      >
        {/* Normal band */}
        <path d={bandPath} fill="#DBEAFE" fillOpacity={0.6} />
        <line x1={PAD.left} y1={bandTopY} x2={PAD.left + innerW} y2={bandTopY} stroke="#93C5FD" strokeWidth={1} strokeDasharray="3 2" />
        <line x1={PAD.left} y1={bandBotY} x2={PAD.left + innerW} y2={bandBotY} stroke="#93C5FD" strokeWidth={1} strokeDasharray="3 2" />

        {/* Band label */}
        <text x={PAD.left + 4} y={bandTopY - 3} fontSize={8} fill="#3B82F6">normal band</text>

        {/* Breakout vertical line */}
        {breakX !== null && (
          <>
            <line x1={breakX} y1={PAD.top} x2={breakX} y2={H - PAD.bottom} stroke="#DC2626" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={breakX + 3} y={PAD.top + 10} fontSize={8} fill="#DC2626">breakout</text>
          </>
        )}

        {/* Signal line */}
        <path d={linePath} fill="none" stroke="#1D4ED8" strokeWidth={2} strokeLinejoin="round" />

        {/* Data dots (only breakout region) */}
        {history.map((p, i) => {
          const isBreakout = breakIdx >= 0 && i >= breakIdx;
          if (!isBreakout) return null;
          return (
            <circle key={i} cx={xOf(i)} cy={yOf(p.value)} r={2.5} fill="#DC2626" />
          );
        })}

        {/* Latest score dot */}
        {(() => {
          const last = history[history.length - 1];
          return <circle cx={xOf(history.length - 1)} cy={yOf(last.value)} r={4} fill="#DC2626" stroke="#fff" strokeWidth={1.5} />;
        })()}

        {/* Y-axis */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#E5E7EB" strokeWidth={1} />
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PAD.left - 3} y1={yOf(v)} x2={PAD.left} y2={yOf(v)} stroke="#9CA3AF" strokeWidth={1} />
            <text x={PAD.left - 5} y={yOf(v)} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="#9CA3AF">{v}</text>
          </g>
        ))}

        {/* X-axis ticks */}
        <line x1={PAD.left} y1={H - PAD.bottom} x2={PAD.left + innerW} y2={H - PAD.bottom} stroke="#E5E7EB" strokeWidth={1} />
        {tickDates.map(({ i, label }) => (
          <g key={i}>
            <line x1={xOf(i)} y1={H - PAD.bottom} x2={xOf(i)} y2={H - PAD.bottom + 3} stroke="#9CA3AF" strokeWidth={1} />
            <text
              x={xOf(i)}
              y={H - PAD.bottom + 12}
              textAnchor={i === 0 ? 'start' : i === history.length - 1 ? 'end' : 'middle'}
              fontSize={8}
              fill={label.startsWith('Break') ? '#DC2626' : '#9CA3AF'}
              fontWeight={label.startsWith('Break') ? 600 : 400}
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
