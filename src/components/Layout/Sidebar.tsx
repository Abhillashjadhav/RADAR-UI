import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Rocket, ShieldAlert, Map, Activity, Network,
  Database, Bell, MessageSquare, TrendingUp, Plus, ChevronsUpDown,
} from 'lucide-react';
import { SECTION_LABEL, GOLD_BTN } from '../../theme/tokens';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'Management',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Radar',
    items: [
      { to: '/onboarding', label: 'Onboarding', icon: Rocket, disabled: true },
      { to: '/supplier/SUP-001', label: 'Supplier Risk', icon: ShieldAlert },
      { to: '/map', label: 'Supply Chain Map', icon: Map },
      { to: '/risk-monitor', label: 'Risk Monitor', icon: Activity, badge: 2 },
      { to: '/network', label: 'Subtier Network', icon: Network },
      { to: '/network-live', label: 'QSC Live', icon: Database },
      { to: '/signals', label: 'Signals', icon: Bell },
    ],
  },
  {
    title: 'Traction',
    items: [
      { to: '/traction', label: 'Engagement', icon: TrendingUp, disabled: true },
    ],
  },
  {
    title: 'Signal',
    items: [
      { to: '/preview/teams-card', label: 'Teams Card', icon: MessageSquare },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Brand + primary action */}
      <div className="px-4 pt-5 pb-4">
        <Link to="/" className="flex items-center gap-2 mb-4 px-1">
          <span className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-gray-900 font-black text-sm">S</span>
          <span className="text-lg font-extrabold text-gray-900 tracking-tight">Synchronicity</span>
        </Link>
        <button className={`${GOLD_BTN} w-full`}>
          <Plus size={16} strokeWidth={2.5} />
          New Analysis
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {SECTIONS.map(section => (
          <div key={section.title}>
            <p className={`${SECTION_LABEL} px-2 mb-1.5`}>{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, badge, disabled }) => {
                const active = isActive(to);
                const base = 'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors';
                if (disabled) {
                  return (
                    <li key={to}>
                      <span className={`${base} text-gray-300 cursor-not-allowed`}>
                        <Icon size={16} />
                        {label}
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`${base} ${
                        active
                          ? 'bg-amber-100 text-gray-900 font-semibold'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <Icon size={16} className={active ? 'text-amber-600' : ''} />
                      <span className="flex-1">{label}</span>
                      {badge !== undefined && (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-[11px] font-bold flex items-center justify-center">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Client switcher */}
      <button className="mx-3 mb-4 px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
        <span className="w-8 h-8 rounded-full bg-charcoal bg-gray-900 text-white text-xs font-bold flex items-center justify-center">B</span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-gray-900 leading-tight">boeing</span>
          <span className={SECTION_LABEL}>Client</span>
        </span>
        <ChevronsUpDown size={14} className="text-gray-300" />
      </button>
    </aside>
  );
}
