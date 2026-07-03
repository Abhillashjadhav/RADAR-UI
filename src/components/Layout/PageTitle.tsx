import type { ReactNode } from 'react';

/** ForeOptics "f" coin — gold circle, white italic f (production page-title mark). */
export function FCoin({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-amber-400 flex-shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="text-white italic font-bold font-serif" style={{ fontSize: size * 0.6, lineHeight: 1 }}>
        f
      </span>
    </span>
  );
}

/** Shared page title: f-coin left of the heading, as production shows. */
export default function PageTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <FCoin />
      {children}
    </div>
  );
}
