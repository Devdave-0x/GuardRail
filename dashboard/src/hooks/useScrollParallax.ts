'use client';

import { useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/*
  Writes the scroll offset to --scroll-y on <html> so background layers can parallax in
  pure CSS.

  Same shape as usePointerGlow and for the same reason: one delegated listener, coalesced
  to a single style write per frame, rather than a scroll subscription per layer. Nothing
  here reads layout, so it never forces a synchronous reflow.

  Mount once per route group.
*/
export function useScrollParallax(): void {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const root: HTMLElement = document.documentElement;

    // Parallax is motion tied to scrolling, so reduced motion pins it flat.
    if (prefersReduced) {
      root.style.setProperty('--scroll-y', '0');
      return;
    }

    let frame = 0;

    const flush = (): void => {
      frame = 0;
      root.style.setProperty('--scroll-y', String(window.scrollY));
    };

    const onScroll = (): void => {
      if (frame === 0) frame = requestAnimationFrame(flush);
    };

    flush();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [prefersReduced]);
}
