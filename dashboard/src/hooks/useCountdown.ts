'use client';

import { useEffect, useState } from 'react';
import { formatCountdown } from '@/lib/utils';

export interface UseCountdownResult {
  display: string;
  /* 0 to 1, how much of the timelock window has elapsed. Drives the progress ring. */
  progress: number;
  ready: boolean;
}

/*
  Ticks a timelock countdown once per second. Extracted from the Countdown component so
  the guardian panel and the pending-call queue can share both the label and the
  progress value without each running its own interval.

  `startTimeMs` is optional: without it there is no window to measure against, so
  progress stays at 0 and only the label is meaningful.
*/
export function useCountdown(unlockTimeMs: number, startTimeMs?: number): UseCountdownResult {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    setNowMs(Date.now());
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [unlockTimeMs]);

  const ready = nowMs >= unlockTimeMs;

  let progress = 0;
  if (startTimeMs !== undefined && unlockTimeMs > startTimeMs) {
    const elapsed = nowMs - startTimeMs;
    progress = Math.min(1, Math.max(0, elapsed / (unlockTimeMs - startTimeMs)));
  }

  return { display: formatCountdown(unlockTimeMs), progress, ready };
}
