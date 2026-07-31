import { useState } from 'react';
import type { RevenueBasis } from '../../types/analysis';

/** Selection state for one row's exposure-basis dropdown, defaulting to the
 *  row's real detected basis (revenue > cost > none priority already baked
 *  into exposureBasis by the data layer). */
export function useExposureBasisSelection(exposureBasis: RevenueBasis) {
  return useState<RevenueBasis>(exposureBasis);
}
