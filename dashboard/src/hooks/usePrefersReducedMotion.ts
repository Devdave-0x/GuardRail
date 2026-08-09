'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/*
  Synchronous read, for effect bodies and imperative setup paths that need the value
  once and cannot subscribe. Returns false during SSR, where matchMedia does not exist.
*/
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}

/*
  Single source of truth for the reduced-motion preference. Every animated component
  reads it from here rather than calling matchMedia itself, so the listener wiring and
  the SSR-safe default exist in exactly one place.

  Starts false so server and first client render agree, then syncs in an effect. It
  deliberately does not use useSyncExternalStore: a single first-frame animation is far
  less harmful than a hydration mismatch across the whole tree. Consumers must render
  the resting state once this flips to true, never a paused first animation frame.
*/
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const query: MediaQueryList = window.matchMedia(QUERY);
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
