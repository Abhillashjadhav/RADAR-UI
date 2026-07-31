import type { RevenueBasis } from '../../types/analysis';
import { exposureBasisLabel } from './signalUi';

interface Props {
  /** The row's one real, disclosed basis — or 'none' if no dollar data exists at all. */
  exposureBasis: RevenueBasis;
  value: RevenueBasis;
  onChange: (basis: RevenueBasis) => void;
  className?: string;
}

const DEFAULT_CLASS =
  'text-[11px] text-gray-500 border border-gray-200 rounded px-1 py-0.5 bg-white ' +
  'hover:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer';

/**
 * Visible exposure-basis dropdown. Only ever offers options the row has real
 * data for — a cost-only row can never offer "Revenue at Risk" as a pickable
 * option, since that number was never disclosed. "Risk Score Only" (hide the
 * dollar figure) is always available, on every row, including rows with no
 * dollar data at all.
 */
export default function ExposureBasisSelect({ exposureBasis, value, onChange, className }: Props) {
  const options: RevenueBasis[] = exposureBasis === 'none' ? ['none'] : [exposureBasis, 'none'];

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as RevenueBasis)}
      onClick={e => e.stopPropagation()}
      aria-label="Exposure basis"
      className={className ?? DEFAULT_CLASS}
    >
      {options.map(o => (
        <option key={o} value={o}>{exposureBasisLabel[o]}</option>
      ))}
    </select>
  );
}
