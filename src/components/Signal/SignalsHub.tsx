import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, AlertOctagon, FileCheck } from 'lucide-react';
import { sampleSignal } from '../../data/sample-signal';
import {
  formatRevenueAtRisk,
  lensHumanLabel,
  severityTokens,
} from './signalUi';

// Index page that surfaces the three Signal-model views in one place so a
// reviewer can walk through the demo end-to-end:
//   1. Teams card preview — what the alert looks like in Teams
//   2. Investigation console — drilling into the supplier with the banner
//   3. Control / regression — the same supplier without the signal param
export default function SignalsHub() {
  const sev = severityTokens[sampleSignal.severity];

  const cards = [
    {
      to: '/preview/teams-card',
      icon: MessageSquare,
      title: 'Teams Card Preview',
      subtitle: 'Deliverable A',
      description:
        'How the RADAR Signal renders when posted into a Microsoft Teams channel — sender chrome, severity stripe, score delta, recommendations, Acknowledge + Investigate CTAs.',
      ctaLabel: 'Open preview',
    },
    {
      to: sampleSignal.links.investigate,
      icon: AlertOctagon,
      title: 'Investigation Console',
      subtitle: 'Deliverable B · banner active',
      description:
        'Supplier detail screen with the Signal banner pinned at the top. The Geopolitical risk lens auto-scrolls into view and is highlighted. Recommendations expandable. Acknowledge persists in localStorage.',
      ctaLabel: 'Open investigation',
    },
    {
      to: `/supplier/${sampleSignal.entity.supplier_id}`,
      icon: FileCheck,
      title: 'Control · No Signal',
      subtitle: 'Regression check',
      description:
        'The same supplier detail screen without the ?signal query param. Demonstrates that the Signal banner is purely additive — when no signal is active, the screen behaves exactly as it did before.',
      ctaLabel: 'Open control view',
    },
  ];

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Signal Model · Demo</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">RADAR Signal — three surfaces</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          RADAR is repositioning from a destination dashboard into a background monitoring service
          that pushes alerts when action is required. The dashboard isn&apos;t the front door —
          the alert is. The three views below show the alert (Teams card), the drill-down behind
          it (investigation console), and the unaffected baseline (control).
        </p>
      </header>

      {/* Active Signal summary */}
      <section
        className={`rounded-xl border ${sev.surfaceBorder} ${sev.surfaceBg} mb-6 overflow-hidden`}
        aria-labelledby="active-signal-heading"
      >
        <div className={`h-1.5 ${sev.stripe}`} aria-hidden="true" />
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${sev.badgeBg}`}>
              {sev.label}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
              {lensHumanLabel[sampleSignal.trigger.lens]}
            </span>
            <span className="text-xs text-gray-500 tabular-nums">{sampleSignal.signal_id}</span>
          </div>
          <h2 id="active-signal-heading" className="text-base font-semibold text-gray-900 leading-snug">
            {sampleSignal.entity.supplier_name} — {sampleSignal.trigger.event_label.toLowerCase()}
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm">
            <div>
              <span className="text-gray-500">Score </span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {sampleSignal.trigger.score_before} → <span className="text-red-600">{sampleSignal.trigger.score_after}</span>
              </span>
            </div>
            <div>
              <span className="text-gray-500">Revenue at risk </span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {formatRevenueAtRisk(sampleSignal.exposure.revenue_at_risk_usd)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Confidence </span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {Math.round(sampleSignal.confidence * 100)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Tier </span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {sampleSignal.entity.tier}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Three surface entry cards */}
      <section aria-label="Signal surfaces">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map(({ to, icon: Icon, title, subtitle, description, ctaLabel }) => (
            <Link
              key={to}
              to={to}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">{subtitle}</p>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 group-hover:text-blue-800">
                {ctaLabel}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Direct URL reference */}
      <section className="mt-8" aria-label="Direct route reference">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Direct routes</h2>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">/preview/teams-card</code> — Teams card preview
          </li>
          <li>
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">
              /supplier/{sampleSignal.entity.supplier_id}?signal={sampleSignal.signal_id}
            </code>{' '}
            — investigation console (banner active)
          </li>
          <li>
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">
              /supplier/{sampleSignal.entity.supplier_id}
            </code>{' '}
            — control (no banner, regression check)
          </li>
        </ul>
      </section>
    </div>
  );
}
