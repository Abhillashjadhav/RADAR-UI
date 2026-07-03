import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Rocket, ShieldAlert, Map, Activity, Network,
  Database, Bell, MessageSquare, TrendingUp, ChevronsUpDown,
  ChevronDown, ChevronRight, Users, UserCog, MessagesSquare,
  Boxes, ShoppingCart,
} from 'lucide-react';
import { SECTION_LABEL, GOLD_BTN } from '../../theme/tokens';

interface NavItem {
  to?: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Production information architecture. Items not built yet link to the
// "coming soon" placeholder as normal rows — no special greyed state.
const SECTIONS: NavSection[] = [
  {
    title: 'Management',
    items: [
      { to: '/soon/roles', label: 'Roles', icon: Users },
      { to: '/soon/staff', label: 'Staff', icon: UserCog },
      { to: '/soon/view-feedback', label: 'View Feedback', icon: MessagesSquare },
    ],
  },
  {
    title: 'Radar',
    items: [
      { to: '/soon/radar-onboarding', label: 'Onboarding', icon: Rocket },
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
      {
        label: 'Forecasting', icon: TrendingUp,
        children: [
          { to: '/soon/forecasting-onboarding', label: 'Onboarding', icon: Rocket },
          { to: '/soon/forecast-utility', label: 'Forecast Utility', icon: TrendingUp },
        ],
      },
      {
        label: 'Inventory & Stock', icon: Boxes,
        children: [
          { to: '/soon/inventory-onboarding', label: 'Onboarding', icon: Rocket },
          { to: '/soon/configurations', label: 'Configurations', icon: Boxes },
          { to: '/soon/classification', label: 'Classification', icon: Boxes },
          { to: '/soon/safety-stock', label: 'Safety Stock', icon: Boxes },
        ],
      },
    ],
  },
  {
    title: 'Signal',
    items: [
      { to: '/soon/signal-onboarding', label: 'Onboarding', icon: Rocket },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/soon/buyer-dashboard', label: 'Buyer Dashboard', icon: ShoppingCart },
];

// Production mark: gold network/org glyph + two-line wordmark
function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 mb-4 px-1">
      <Network size={26} className="text-amber-400 flex-shrink-0" strokeWidth={2.25} />
      <span className="leading-tight">
        <span className="block text-[13px] font-extrabold text-gray-900 tracking-[0.14em]">SYNCHRONICITY</span>
        <span className="block text-[10px] font-bold text-amber-500 tracking-[0.22em]">FOREOPTICS</span>
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isActive = (to?: string) => {
    if (!to) return false;
    if (to === '/') return location.pathname === '/';
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const toggle = (key: string) => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const rowBase = 'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors';

  const renderItem = (item: NavItem, depth = 0) => {
    const { to, label, icon: Icon, badge, children } = item;
    const indent = depth > 0 ? 'ml-4' : '';

    if (children) {
      const open = !collapsed[label];
      return (
        <li key={label}>
          <button
            onClick={() => toggle(label)}
            className={`${rowBase} ${indent} w-full text-gray-500 hover:bg-gray-50 hover:text-gray-800`}
            aria-expanded={open}
          >
            <Icon size={16} />
            <span className="flex-1 text-left">{label}</span>
            {open ? <ChevronDown size={13} className="text-gray-300" /> : <ChevronRight size={13} className="text-gray-300" />}
          </button>
          {open && (
            <ul className="space-y-0.5 mt-0.5">
              {children.map(c => renderItem(c, depth + 1))}
            </ul>
          )}
        </li>
      );
    }

    const active = isActive(to);
    return (
      <li key={`${label}-${to}`}>
        <Link
          to={to!}
          className={`${rowBase} ${indent} ${
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
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Wordmark + primary action */}
      <div className="px-4 pt-5 pb-4">
        <Wordmark />
        <button className={`${GOLD_BTN} w-full`}>
          <MessageSquare size={16} strokeWidth={2.5} />
          New Chat
        </button>
      </div>

      {/* Nav sections with collapse chevrons */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        {SECTIONS.map(section => {
          const open = !collapsed[section.title];
          return (
            <div key={section.title}>
              <button
                onClick={() => toggle(section.title)}
                className={`${SECTION_LABEL} px-2 mb-1.5 w-full flex items-center justify-between hover:text-gray-600`}
                aria-expanded={open}
              >
                {section.title}
                {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {open && (
                <ul className="space-y-0.5">
                  {section.items.map(item => renderItem(item))}
                </ul>
              )}
            </div>
          );
        })}

        {/* Bottom-level rows: Dashboard / Buyer Dashboard */}
        <ul className="space-y-0.5 pt-2 border-t border-gray-100">
          {BOTTOM_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <li key={to}>
                <Link
                  to={to!}
                  className={`${rowBase} ${
                    active ? 'bg-amber-100 text-gray-900 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-amber-600' : ''} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={13} className="text-gray-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Client switcher */}
      <button className="mx-3 mb-4 px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
        <span className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">Q</span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-gray-900 leading-tight">QSC</span>
          <span className={SECTION_LABEL}>Client</span>
        </span>
        <ChevronsUpDown size={14} className="text-gray-300" />
      </button>
    </aside>
  );
}
