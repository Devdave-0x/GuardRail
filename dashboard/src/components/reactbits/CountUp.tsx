'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// === Types

export interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

// === Helpers

function getDecimalPlaces(num: number): number {
  const str = num.toString();
  if (str.includes('.')) {
    const decimals = str.split('.')[1];
    if (parseInt(decimals, 10) !== 0) return decimals.length;
  }
  return 0;
}

// === Component

export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduced: boolean = usePrefersReducedMotion();

  const motionValue = useMotionValue<number>(direction === 'down' ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });

  const isInView: boolean = useInView(ref, { once: true, margin: '0px' });

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number): string => {
      const hasDecimals = maxDecimals > 0;
      const options: Intl.NumberFormatOptions = {
        useGrouping: Boolean(separator),
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      };
      const formatted = Intl.NumberFormat('en-US', options).format(latest);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [maxDecimals, separator],
  );

  const finalValue = direction === 'down' ? from : to;
  const restingText = formatValue(finalValue);

  useEffect(() => {
    if (!ref.current) return;
    // Reduced motion renders the resolved number, not the starting one.
    ref.current.textContent = reduced ? restingText : formatValue(direction === 'down' ? to : from);
  }, [from, to, direction, formatValue, reduced, restingText]);

  useEffect(() => {
    if (reduced || !isInView || !startWhen) return;

    onStart?.();

    const timeoutId = setTimeout(() => {
      motionValue.set(finalValue);
    }, delay * 1000);

    const endTimeoutId = setTimeout(
      () => {
        onEnd?.();
      },
      delay * 1000 + duration * 1000,
    );

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(endTimeoutId);
    };
  }, [reduced, isInView, startWhen, motionValue, finalValue, delay, duration, onStart, onEnd]);

  useEffect(() => {
    if (reduced) return;

    const unsubscribe = springValue.on('change', (latest: number) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });

    return () => unsubscribe();
  }, [springValue, formatValue, reduced]);

  /* The animated span is shredded character by character by the number
     formatter as it ticks, so screen readers read the settled value instead. */
  return (
    <>
      <span className={className} ref={ref} aria-hidden="true" />
      <span className="sr-only">{restingText}</span>
    </>
  );
};

export default CountUp;
