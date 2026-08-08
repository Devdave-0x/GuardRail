'use client';

import { useEffect } from 'react';

/*
  Writes the pointer position to CSS custom properties on <html> so any number of
  elements can render a cursor-tracking edge glow in pure CSS.

  This exists to avoid the per-button WebGL context and per-button window listener that
  SpecularButton allocates. One delegated listener serves the whole page, and the glow
  is a radial gradient reading var(--pointer-x) / var(--pointer-y). See the WebGL budget
  section of docs/Context.md.

  Mount exactly once, in each route group's layout. Mounting it twice is harmless but
  pointless.
*/
export function usePointerGlow(): void {
  useEffect(() => {
    // Coarse pointers have no hover, so the glow would never be seen.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const root: HTMLElement = document.documentElement;
    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;

    const flush = (): void => {
      frame = 0;
      root.style.setProperty('--pointer-x', `${pendingX}px`);
      root.style.setProperty('--pointer-y', `${pendingY}px`);
    };

    // Coalesce to one style write per frame; pointermove fires far more often than that.
    const onPointerMove = (event: PointerEvent): void => {
      pendingX = event.clientX;
      pendingY = event.clientY;
      if (frame === 0) frame = requestAnimationFrame(flush);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);
}
