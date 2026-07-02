import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ANOMALIES } from '../../data/analysisAnomalies';
import { formatRevenueAtRisk } from '../Signal/signalUi';
import { CARD, SECTION_LABEL } from '../../theme/tokens';

type Tab = 'all' | 'unread' | 'read';

const READ_KEY = (id: string) => `radar.alert.read.${id}`;

export default function AlertFeed() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [, setTick] = useState(0);

  const isRead = (id: string) => localStorage.getItem(READ_KEY(id)) === '1';

  // Feed = active anomalies with a breakout, newest break first
  const feed = useMemo(
    () =>
      ANOMALIES
        .filter(a => a.scoreAfter > a.scoreBaseline)
        .sort((a, b) => (b.breakDate || '').localeCompare(a.breakDate || '')),
    [],
  );

  const rows = feed.filter(a => {
    if (tab === 'unread') return !isRead(a.id);
    if (tab === 'read') return isRead(a.id);
    return true;
  });

  const markAllRead = () => {
    feed.forEach(a => localStorage.setItem(READ_KEY(a.id), '1'));
    setTick(t => t + 1);
  };

  const openAlert = (id: string) => {
    localStorage.setItem(READ_KEY(id), '1');
    navigate('/signals');
  };

  return (
    <aside className="w-[300px] flex-shrink-0 border-l border-gray-100 bg-[#F7F8FA] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Recent Alerts</h2>
        <button onClick={markAllRead} className="text-[11px] font-medium text-amber-600 hover:text-amber-700 hover:underline">
          Mark all as read
        </button>
      </div>

      {/* Tab pills */}
      <div className="flex gap-1">
        {(['all', 'unread', 'read'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              tab === t
                ? 'bg-amber-400 text-gray-900 font-semibold'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-2.5 overflow-y-auto alert-feed-scroll">
        {rows.map(a => {
          const delta = a.scoreAfter - a.scoreBaseline;
          const escalated = a.scoreAfter >= 70;
          return (
            <div key={a.id} className={`${CARD} p-3`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    escalated ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-500'
                  }`}
                >
                  {escalated ? 'Escalated' : 'New'}
                </span>
                {!isRead(a.id) && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                <span className="ml-auto text-[10px] text-gray-400 tabular-nums">{a.breakDate}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-snug">{a.supplierName}</p>
              <p className="text-xs text-gray-500 mb-1.5">
                {a.lensLabel} · {a.scoreBaseline} → <span className="font-semibold text-red-600">{a.scoreAfter}</span>
                <span className="text-gray-300"> · </span>
                <span className="font-bold text-gray-700">
                  {a.costExposureUsd !== null ? formatRevenueAtRisk(a.costExposureUsd) : 'exposure n/a'}
                </span>
              </p>
              <button
                onClick={() => openAlert(a.id)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
              >
                View Details →
              </button>
              <span className="sr-only">delta {delta}</span>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className={`${SECTION_LABEL} text-center py-6`}>No alerts in this view</p>
        )}
      </div>
    </aside>
  );
}
