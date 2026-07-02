import { RefreshCw, Download } from 'lucide-react';
import { WHITE_BTN, SECTION_LABEL } from '../../theme/tokens';

interface PageHeaderProps {
  /** e.g. ['RADAR', 'RISK MONITOR'] */
  breadcrumb: string[];
}

export default function PageHeader({ breadcrumb }: PageHeaderProps) {
  const now = new Date();
  const updated = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Thin charcoal strip */}
      <div className="h-2 bg-[#1F2430] w-full" />

      {/* Breadcrumb row */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
        <p className={`${SECTION_LABEL} !text-gray-500`}>
          {breadcrumb.map((seg, i) => (
            <span key={seg}>
              {i > 0 && <span className="mx-1.5 text-gray-300">/</span>}
              <span className={i === breadcrumb.length - 1 ? 'text-gray-900 font-bold' : ''}>{seg}</span>
            </span>
          ))}
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] font-bold text-green-700 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
          <span className="text-xs text-gray-400">Updated {updated}</span>
          <button className={WHITE_BTN}>
            <RefreshCw size={13} />
            Refresh
          </button>
          <button className={WHITE_BTN}>
            <Download size={13} />
            Export
          </button>
        </div>
      </div>
    </>
  );
}
