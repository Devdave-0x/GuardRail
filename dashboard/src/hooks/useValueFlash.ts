'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// === Constants

/* Matches the value-flash keyframe duration in globals.css. */
const FLASH_MS = 900;

// === Hook

/*
  True for a moment after `value` changes to a different finite number.

  The dashboard polls, so figures move without the user touching anything. Counting to the
  new value (AnimatedNumber) shows the transition but not that one occurred: a reader
  looking elsewhere has no way to know which panel just moved. This is that cue.

  The first real value is not a change. Balances arrive as NaN and resolve on the first
  poll, and flashing every readout on load would train the user to ignore the signal.
*/
export function useValueFlash(value: number): boolean {
  const [flashing, setFlashing] = useState<boolean>(false);
  const previous = useRef<number>(value);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const from = previous.current;
    previous.current = value;

    if (prefersReduced) return;
    if (!Number.isFinite(value) || !Number.isFinite(from)) return;
    if (value === from) return;

    setFlashing(true);
    const timer = window.setTimeout(() => setFlashing(false), FLASH_MS);

    return () => window.clearTimeout(timer);
  }, [value, prefersReduced]);

  return flashing;
}
