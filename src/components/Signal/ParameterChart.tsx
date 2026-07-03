import { useMemo } from 'react';
import type { ParameterChange } from '../../types/analysis';

// Compact 30-day parameter chart in the parameter's NATIVE unit.
// Styling is lifted verbatim from AnomalyTrendChart: #1F2430 2px signal line,
// #E5E7EB axes, #DC2626 dashed change marker + dots, gray-400 tick labels.
interface Props {
  param: ParameterChange;
  height?: number;
}

const PAD = { top: 18, right: 12, bottom: 18, left: 44 };

const fmt = (p: ParameterChange, v: number): string => {
  if (p.value_type === 'percent') return `${v}%`;
  if (p.value_type === 'binary') return v === 1 ? 'IN FORCE' : 'Not in force';
  return String(v);
};

export default function ParameterChart({ param: p, height = 130 }: Props) {
  const history = p.history ?? [];
  const W = 560;
  const H = height;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const { lo, hi } = useMemo(() => {
    if (p.value_type === 'binary') return { lo: 0, hi: 1 };
    const vals = history.map(h => h.value);
    const min = Math.min(...vals, p.before, p.after);
    const max = Math.max(...vals, p.before, p.after);
    const pad = Math.max((max - min) * 0.15, 1);
    return { lo: Math.max(0, Math.floor(min - pad)), hi: Math.ceil(max + pad) };
  }, [history, p]);

  if (history.length < 2) return null;

  const xOf = (i: number) => PAD.left + (i / (history.length - 1)) * innerW;
  const yOf = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo || 1)) * innerH;

  // change point = first index where the value departs from the starting value
  const changed = p.before !== p.after;
  const changeIdx = changed ? history.findIndex(h => h.value !== history[0].value) : -1;
  const changeX = changeIdx > 0 ? xOf(changeIdx) : null;

  // step-after path (binary/percent read as steps; index series follow points)
  const path = history.map((h, i) => {
    const x = xOf(i); const y = yOf(h.value);
    if (i === 0) return `M ${x} ${y}`;
    if (p.value_type === 'index') return `L ${x} ${y}`;
    return `L ${x} ${yOf(history[i - 1].value)} L ${x} ${y}`;
  }).join(' ');

  const annotation = p.value_type === 'binary'
    ? `TRIGGERED · ${history[changeIdx]?.date.slice(5) ?? ''}`
    : `${fmt(p, p.before)} → ${fmt(p, p.after)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: H }} className="overflow-visible">
      {/* Y-axis ticks in native units */}
      {(p.value_type === 'binary' ? [0, 1] : [lo, hi]).map(v => (
        <g key={v}>
          <line x1={PAD.left} y1={yOf(v)} x2={PAD.left + innerW} y2={yOf(v)} stroke="#E5E7EB" strokeWidth={1} strokeDasharray={v === lo || v === 0 ? undefined : '3 2'} />
          <text x={PAD.left - 4} y={yOf(v) + 3} textAnchor="end" fontSize={8} fill="#9CA3AF">
            {p.value_type === 'binary' ? (v === 1 ? 'IN FORCE' : 'Not in force') : fmt(p, v)}
          </text>
        </g>
      ))}

      {/* X-axis first/change/last dates */}
      <text x={PAD.left} y={H - 5} fontSize={8} fill="#9CA3AF">{history[0].date.slice(5)}</text>
      <text x={PAD.left + innerW} y={H - 5} textAnchor="end" fontSize={8} fill="#9CA3AF">
        {history[history.length - 1].date.slice(5)}
      </text>

      {/* Change marker + before → after annotation */}
      {changeX !== null && (
        <>
          <line x1={changeX} y1={PAD.top - 4} x2={changeX} y2={H - PAD.bottom} stroke="#DC2626" strokeWidth={1.5} strokeDasharray="4 2" />
          <text
            x={Math.min(changeX + 4, PAD.left + innerW - 90)}
            y={PAD.top + 2}
            fontSize={8.5} fontWeight={700} fill="#DC2626"
          >
            {annotation}
          </text>
        </>
      )}

      {/* Value line */}
      <path d={path} fill="none" stroke="#1F2430" strokeWidth={2} strokeLinejoin="round" />

      {/* Post-change dots + endpoint */}
      {changeIdx >= 0 && history.map((h, i) =>
        i >= changeIdx ? <circle key={i} cx={xOf(i)} cy={yOf(h.value)} r={2.5} fill="#DC2626" /> : null,
      )}
      <circle cx={xOf(history.length - 1)} cy={yOf(history[history.length - 1].value)} r={4}
        fill={changed ? '#DC2626' : '#1F2430'} stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}
