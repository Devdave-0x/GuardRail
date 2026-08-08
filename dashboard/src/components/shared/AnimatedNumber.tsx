'use client';

import { useEffect, useState } from 'react';
import { animate, useMotionValue } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { DURATION, EASE_OUT } from '@/lib/motion-presets';
import { cn } from '@/lib/utils';

// === Types

export interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  /* Shown instead of the number before the first real value arrives. */
  placeholder?: string;
  /* Values that change without user action should announce politely. */
  live?: boolean;
}

// === Component

/*
  Counts from the previous value to the next one instead of snapping.

  The dashboard polls, so balances and daily spend change under the user without any
  interaction. A number that jumps reads as a glitch; a number that counts reads as
  telemetry. ProgressBar already eased its width, which made the snapping figure above
  it look broken by comparison.

  Uses tabular numerals so the digits do not reflow while counting.
*/
export function AnimatedNumber({
  value,
  decimals = 6,
  suffix,
  className,
  placeholder = '—',
  live = true,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue<number>(value);
  const [display, setDisplay] = useState<string>(value.toFixed(decimals));
  const [hasValue, setHasValue] = useState<boolean>(Number.isFinite(value));
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!Number.isFinite(value)) return;
    setHasValue(true);

    /*
      The motion value seeds from `value`, which is NaN until the first poll resolves.
      Animating out of NaN interpolates to NaN on every frame, so the figure showed
      "NaN" and then snapped instead of counting. Reset to a real number first.
    */
    if (!Number.isFinite(motionValue.get())) {
      motionValue.set(0);
    }

    if (prefersReduced) {
      motionValue.set(value);
      setDisplay(value.toFixed(decimals));
      return;
    }

    const controls = animate(motionValue, value, {
      duration: DURATION.slow,
      ease: EASE_OUT,
      onUpdate: (latest) => setDisplay(latest.toFixed(decimals)),
    });

    return () => controls.stop();
  }, [value, decimals, motionValue, prefersReduced]);

  return (
    <span aria-live={live ? 'polite' : undefined} className={cn('font-mono-numbers', className)}>
      {hasValue ? display : placeholder}
      {hasValue && suffix ? ` ${suffix}` : ''}
    </span>
  );
}
